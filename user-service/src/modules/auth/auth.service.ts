import argon2 from "argon2";
import crypto from "node:crypto";

import redis from "../../db/redis.js";
import { HttpErrors } from "../../lib/error.js";
import { Otp } from "../../lib/otp.js";
import { AuthRepository } from "./auth.repository.js";
import {
  LoginInput,
  RefreshInput,
  RegisterInput,
  VerifyInput,
} from "./auth.schema.js";
import { sendMail } from "../../lib/mail.js";
import { Auth } from "../../lib/auth.js";
import { env } from "../../config/env.js";

async function register(data: RegisterInput) {
  const user = await AuthRepository.getUserByEmail(data.email);
  if (user) {
    throw new HttpErrors.ConflictError("User on this email already exists.");
  }

  const hashedPassword = await argon2.hash(data.password);
  const { otp, otpSessionId } = await Otp.createAndStoreOtp({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    hashedPassword,
  });

  await sendMail({
    to: data.email,
    subject: "Verify your account",
    html: otp,
  });

  return { otpSessionId };
}

async function verify(data: VerifyInput) {
  const user = await Otp.verifyOtp(data);
  if (!user) {
    throw new HttpErrors.UnauthorizedError("Verification failed.");
  }

  await AuthRepository.createUser({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: user.hashedPassword,
    emailVerified: true,
  });

  await sendMail({
    to: user.email,
    subject: "Account created.",
    html: "Account created successfully. Login to continue.",
  });

  return;
}

async function login(data: LoginInput) {
  const user = await AuthRepository.getUserByEmail(data.email);
  if (!user) {
    throw new HttpErrors.UnauthorizedError("Authentication failed.");
  }

  const isPasswordValid = await argon2.verify(user.password, data.password);
  if (!isPasswordValid) {
    throw new HttpErrors.UnauthorizedError("Authentication failed.");
  }

  const accessToken = Auth.generateAccessToken(user.id);
  const refreshToken = Auth.generateRefreshToken(user.id);
  const { jti } = Auth.verifyRefreshToken(refreshToken);

  await redis.set(
    `refresh:${user.id}:${data.deviceId}`,
    jti,
    "EX",
    env.REFRESH_TOKEN_EXP_SEC,
  );

  const { password, ...safeUser } = user;
  await redis.set(
    `user:${user.id}`,
    JSON.stringify(safeUser),
    "EX",
    env.REDIS_USER_TTL,
  );

  return { accessToken, refreshToken };
}

async function refresh(data: RefreshInput) {
  const payload = Auth.verifyRefreshToken(data.refreshToken);
  const storedJti = await redis.get(
    `refresh:${payload.userId}:${data.deviceId}`,
  );
  if (!storedJti) {
    throw new HttpErrors.UnauthorizedError("Session expired, login again.");
  }

  if (storedJti != payload.jti) {
    await redis.del(`refresh:${payload.userId}:${data.deviceId}`);
    throw new HttpErrors.UnauthorizedError("Session expired, login again.");
  }

  const newAccessToken = Auth.generateAccessToken(payload.userId);
  const newRefreshToken = Auth.generateRefreshToken(payload.userId);
  const { jti: newJti } = Auth.verifyRefreshToken(newRefreshToken);

  await redis.set(
    `refresh:${payload.userId}:${data.deviceId}`,
    newJti,
    "EX",
    env.REFRESH_TOKEN_EXP_SEC,
  );

  return { newAccessToken, newRefreshToken };
}

export const AuthService = {
  register,
  verify,
  login,
  refresh,
};

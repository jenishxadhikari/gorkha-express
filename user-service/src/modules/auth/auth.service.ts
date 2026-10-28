import argon from "argon2";

import redis from "../../db/redis.js";
import { Otp } from "../../lib/otp.js";
import { sendMail } from "../../lib/mail.js";
import { EmailTemplate } from "../../lib/mail-template.js";
import { Auth } from "../../lib/auth.js";
import { env } from "../../config/env.js";
import { HttpErrors } from "../../lib/error.js";
import { AuthRepository } from "./auth.repository.js";
import {
  LoginInput,
  RefreshInput,
  RegisterInput,
  VerifyInput,
} from "./auth.schema.js";

async function register(data: RegisterInput) {
  const user = await AuthRepository.getUserByEmail(data.email);
  if (user) {
    throw new HttpErrors.Conflict("User already exists on this email.");
  }

  const hashedPassword = await argon.hash(data.password);
  const { otp, otpSessionId } = await Otp.createAndStoreOtp({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    hashedPassword,
  });

  await sendMail({
    to: data.email,
    subject: "Verify your email address",
    html: EmailTemplate.verificationEmail({
      otp,
      expiresIn: env.OTP_TTL / 60,
    }),
  });

  return { otpSessionId };
}

async function verify(data: VerifyInput) {
  const user = await Otp.verifyOtp(data);
  if (!user) {
    throw new HttpErrors.Unauthorized("Authentication failed.");
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
    subject: "Account created successfully",
    html: EmailTemplate.accountCreatedEmail(),
  });

  return;
}

async function login(data: LoginInput) {
  const user = await AuthRepository.getUserByEmail(data.email);
  if (!user) {
    throw new HttpErrors.Unauthorized("Authentication failed.");
  }

  const isValidPassword = await argon.verify(user.password, data.password);
  if (!isValidPassword) {
    throw new HttpErrors.Unauthorized("Authentication failed.");
  }

  const accessToken = Auth.generateAccessToken(user.id);
  const refreshToken = Auth.generateRefreshToken(user.id);
  const { jti } = Auth.verifyRefreshToken(refreshToken);

  await redis.set(
    `refresh:${user.id}:${data.deviceId}`,
    jti,
    "EX",
    env.REFRESH_TOKEN_EXPIRE_SEC,
  );

  const { password, ...safeUser } = user;

  await redis.set(
    `user:${user.id}`,
    JSON.stringify({
      safeUser,
    }),
    "EX",
    env.REDIS_USER_TTL,
  );

  return { accessToken, refreshToken };
}

async function refresh({ refreshToken, deviceId }: RefreshInput) {
  const { userId, jti } = Auth.verifyRefreshToken(refreshToken);
  const storedJti = await redis.get(`refresh:${userId}:${deviceId}`);
  if (!storedJti) {
    throw new HttpErrors.Unauthorized("Login to continue.");
  }

  const isValidJti = storedJti === jti;
  if (!isValidJti) {
    await redis.del(`refresh:${userId}:${deviceId}`);
    throw new HttpErrors.Unauthorized("Login to continue.");
  }

  const newAccessToken = Auth.generateAccessToken(userId);
  const newRefreshToken = Auth.generateRefreshToken(userId);
  const { jti: newJti } = Auth.verifyRefreshToken(newRefreshToken);

  await redis.set(
    `refresh:${userId}:${deviceId}`,
    newJti,
    "EX",
    env.REFRESH_TOKEN_EXPIRE_SEC,
  );

  return { newAccessToken, newRefreshToken };
}

export const AuthService = {
  register,
  verify,
  login,
  refresh,
};

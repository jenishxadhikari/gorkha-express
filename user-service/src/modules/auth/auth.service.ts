import argon2 from "argon2";

import { HttpErrors } from "../../lib/error.js";
import { Otp } from "../../lib/otp.js";
import { AuthRepository } from "./auth.repository.js";
import { RegisterInput, VerifyInput } from "./auth.schema.js";
import { sendMail } from "../../lib/mail.js";

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

export const AuthService = {
  register,
  verify,
};

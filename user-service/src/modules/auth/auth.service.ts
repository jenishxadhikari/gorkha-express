import argon from "argon2";

import { HttpErrors } from "../../lib/error.js";
import { AuthRepository } from "./auth.repository.js";
import { RegisterInput, VerifyInput } from "./auth.schema.js";
import { Otp } from "../../lib/otp.js";
import { sendMail } from "../../lib/mail.js";
import { EmailTemplate } from "../../lib/mail-template.js";
import { env } from "../../config/env.js";

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
  });

  await sendMail({
    to: user.email,
    subject: "Account created successfully",
    html: EmailTemplate.accountCreatedEmail(),
  });

  return;
}

export const AuthService = {
  register,
  verify,
};

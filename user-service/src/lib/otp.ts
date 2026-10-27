import crypto from "node:crypto";
import otpGenerator from "otp-generator";

import { env } from "../config/env.js";
import redis from "../db/redis.js";
import { HttpErrors } from "./error.js";

function generateOtp() {
  return otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
}

function hashOtp(otp: string) {
  return crypto
    .createHmac("sha256", env.OTP_HMAC_SECRET)
    .update(otp)
    .digest("hex");
}

type CreateAndStoreOtp = {
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
};

async function createAndStoreOtp(data: CreateAndStoreOtp) {
  const rateKey = `otp:rate:${data.email}`;
  const otpRate = (await redis.get(rateKey)) || "0";
  if (parseInt(otpRate) >= env.OTP_RATE_MAX_PER_HOUR) {
    throw new HttpErrors.TooManyRequests("Too many requests, try again later.");
  }

  const otp = generateOtp();
  const otpSessionId = crypto.randomUUID();
  const hashedOtp = hashOtp(otp);
  const sessionData = {
    hashedOtp,
    user: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      hashedPassword: data.hashedPassword,
    },
  };

  await redis.set(
    `otp:session:${otpSessionId}`,
    JSON.stringify(sessionData),
    "EX",
    env.OTP_TTL,
  );
  await redis.incr(rateKey);
  await redis.expire(rateKey, 3600);

  return { otp, otpSessionId };
}

type SessionData = {
  hashedOtp: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    hashedPassword: string;
  };
};

type VerifyOtp = {
  otp: string;
  otpSessionId: string;
};

async function verifyOtp(data: VerifyOtp) {
  const hashedOtp = hashOtp(data.otp);
  const res = await redis.get(`otp:session:${data.otpSessionId}`);
  if (!res) {
    throw new HttpErrors.Unauthorized("Authentication failed.");
  }
  const sessionData: SessionData = JSON.parse(res);

  const attemptsKey = `otp:attempts:${sessionData.user.email}`;
  const otpAttempts = (await redis.get(attemptsKey)) || "0";
  if (parseInt(otpAttempts) >= env.ATTEMPT_RATE_MAX_PER_HOUR) {
    throw new HttpErrors.TooManyRequests("Too many requests, try again later.");
  }

  if (
    crypto.timingSafeEqual(
      Buffer.from(hashedOtp, "hex"),
      Buffer.from(sessionData.hashedOtp, "hex"),
    )
  ) {
    await redis.del(attemptsKey);
    await redis.del(`otp:session:${data.otpSessionId}`);
    await redis.del(`otp:rate:${sessionData.user.email}`);
    return sessionData.user;
  } else {
    await redis.incr(attemptsKey);
    await redis.expire(attemptsKey, 3600);
    return null;
  }
}

export const Otp = {
  createAndStoreOtp,
  verifyOtp,
};

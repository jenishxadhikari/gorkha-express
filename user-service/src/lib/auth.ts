import jwt, { SignOptions } from "jsonwebtoken";
import { z } from "zod";

import { env } from "../config/env.js";

function generateAccessToken(userId: string) {
  const payload = {
    userId,
  };

  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXP as SignOptions["expiresIn"],
  });
}

const accessTokenPayload = z.object({
  userId: z.uuid(),
});

function verifyAccessToken(accessToken: string) {
  const payload = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);

  return accessTokenPayload.parse(payload);
}

function generateRefreshToken(userId: string) {
  const payload = {
    userId,
    jti: crypto.randomUUID(),
  };

  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXP as SignOptions["expiresIn"],
  });
}

const refreshTokenPayload = z.object({
  userId: z.uuid(),
  jti: z.uuid(),
});

function verifyRefreshToken(refreshToken: string) {
  const payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);

  return refreshTokenPayload.parse(payload);
}

export const Auth = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};

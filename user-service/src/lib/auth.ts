import { z } from "zod";
import jwt, { SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";

function generateAccessToken(userId: string) {
  const payload = {
    userId,
  };
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRE as SignOptions["expiresIn"],
  });
}

function verifyAccessToken(accessToken: string) {
  return jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET);
}

function generateRefreshToken(userId: string) {
  const payload = {
    userId,
    jti: crypto.randomUUID(),
  };
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXPIRE as SignOptions["expiresIn"],
  });
}

const refreshTokenSchema = z.object({
  userId: z.string(),
  jti: z.uuid(),
});


function verifyRefreshToken(refreshToken: string) {
  const payload = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);
  return refreshTokenSchema.parse(payload);
}

export const Auth = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
};

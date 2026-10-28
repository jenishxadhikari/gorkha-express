import type { CookieOptions, Request, Response } from "express";

import { asyncHandler } from "../../lib/async-handler.js";
import { HttpErrors } from "../../lib/error.js";
import { deviceFingerprint } from "../../lib/device-fingerprint.js";
import { StatusCodes } from "../../config/http-status-codes.js";
import { env } from "../../config/env.js";
import { AuthSchema } from "./auth.schema.js";
import { AuthService } from "./auth.service.js";

function cookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge,
  };
}

const register = asyncHandler(async (req: Request, res: Response) => {
  const validation = AuthSchema.registerSchema.safeParse(req.body);
  if (!validation.success) {
    throw new HttpErrors.BadRequest();
  }

  const { otpSessionId } = await AuthService.register(validation.data);

  return res
    .status(StatusCodes.OK)
    .cookie("otp_session", otpSessionId, cookieOptions(env.OTP_TTL * 1000))
    .json({
      success: true,
      message: "Verification mail sent.",
    });
});

const verify = asyncHandler(async (req: Request, res: Response) => {
  const otpSessionId = req.cookies.otp_session;
  const validation = AuthSchema.verifySchema.safeParse(req.body);
  if (!otpSessionId || !validation.success) {
    throw new HttpErrors.BadRequest();
  }

  await AuthService.verify({
    otpSessionId,
    otp: validation.data.otp,
  });

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: "Account created successfully.",
  });
});

const login = asyncHandler(async (req: Request, res: Response) => {
  const validation = AuthSchema.loginSchema.safeParse(req.body);
  if (!validation.success) {
    throw new HttpErrors.BadRequest();
  }

  const deviceId = await deviceFingerprint(req);

  const { accessToken, refreshToken } = await AuthService.login({
    ...validation.data,
    deviceId,
  });

  return res
    .status(StatusCodes.OK)
    .cookie(
      "access_token",
      accessToken,
      cookieOptions(env.ACCESS_TOKEN_EXPIRE_SEC * 1000),
    )
    .cookie(
      "refresh_token",
      refreshToken,
      cookieOptions(env.REFRESH_TOKEN_EXPIRE_SEC * 1000),
    )
    .json({
      success: true,
      message: "Logged in successfully.",
    });
});

const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) {
    throw new HttpErrors.Unauthorized("Login to continue.");
  }

  const deviceId = await deviceFingerprint(req)

  const { newAccessToken, newRefreshToken } =
    await AuthService.refresh({refreshToken, deviceId});

  return res
    .status(StatusCodes.OK)
    .cookie(
      "access_token",   
      newAccessToken,
      cookieOptions(env.ACCESS_TOKEN_EXPIRE_SEC * 1000),
    )
    .cookie(
      "refresh_token",
      newRefreshToken,
      cookieOptions(env.REFRESH_TOKEN_EXPIRE_SEC * 1000),
    )
    .json({
      success: true,
      message: "Token refreshed successfully.",
    });
});

export const AuthController = {
  register,
  verify,
  login,
  refresh,
};

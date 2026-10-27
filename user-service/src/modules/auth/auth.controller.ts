import type { CookieOptions, Request, Response } from "express";

import { asyncHandler } from "../../lib/async-handler.js";
import { HttpErrors } from "../../lib/error.js";
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

export const AuthController = {
  register,
  verify,
};

import type { Request, Response, NextFunction } from "express";

import { logger } from "../lib/logger.js";
import { ApiError, HttpErrors } from "../lib/error.js";

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  logger.error({ err });

  if (err instanceof ApiError) {
    return ApiError.handler(err, res);
  }

  return ApiError.handler(new HttpErrors.InternalServerError(err.message), res);
}

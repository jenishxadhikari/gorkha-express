import type { Request, Response } from "express";

import { logger } from "../lib/logger.js";
import { ApiError, HttpErrors } from "../lib/error.js";

export function errorMiddleware(error: Error, req: Request, res: Response) {
  logger.info({ error });

  if (error instanceof ApiError) {
    return ApiError.handler(error, res);
  }

  return ApiError.handler(
    new HttpErrors.InternalServerError(error.message),
    res,
  );
}

import type { Response } from "express";

import { StatusCodes, StatusMessages } from "../config/http-status-codes.js";

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }

  static handler(error: ApiError, res: Response) {
    return res.status(error.statusCode).json({
      success: true,
      message: error.message,
    });
  }
}

class BadRequest extends ApiError {
  constructor(
    message = StatusMessages.BAD_REQUEST,
    statusCode = StatusCodes.BAD_REQUEST,
  ) {
    super(message, statusCode);
  }
}

class Unauthorized extends ApiError {
  constructor(
    message = StatusMessages.UNAUTHORIZED,
    statusCode = StatusCodes.UNAUTHORIZED,
  ) {
    super(message, statusCode);
  }
}
class Forbidden extends ApiError {
  constructor(
    message = StatusMessages.FORBIDDEN,
    statusCode = StatusCodes.FORBIDDEN,
  ) {
    super(message, statusCode);
  }
}

class NotFound extends ApiError {
  constructor(
    message = StatusMessages.NOT_FOUND,
    statusCode = StatusCodes.NOT_FOUND,
  ) {
    super(message, statusCode);
  }
}

class Conflict extends ApiError {
  constructor(
    message = StatusMessages.CONFLICT,
    statusCode = StatusCodes.CONFLICT,
  ) {
    super(message, statusCode);
  }
}

class TooManyRequests extends ApiError {
  constructor(
    message = StatusMessages.TOO_MANY_REQUESTS,
    statusCode = StatusCodes.TOO_MANY_REQUESTS,
  ) {
    super(message, statusCode);
  }
}

class InternalServerError extends ApiError {
  constructor(
    message = StatusMessages.INTERNAL_SERVER_ERROR,
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR,
  ) {
    super(message, statusCode);
  }
}

export const HttpErrors = {
  BadRequest,
  Unauthorized,
  Forbidden,
  NotFound,
  Conflict,
  TooManyRequests,
  InternalServerError,
};

import type { Response } from "express";

import { StatusCodes, StatusMessages } from "../config/http-status-codes.js";

export class ApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }

  static handler(err: ApiError, res: Response) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
}

class BadRequestError extends ApiError {
  constructor(
    message = StatusMessages.BAD_REQUEST,
    statusCode = StatusCodes.BAD_REQUEST,
  ) {
    super(message, statusCode);
  }
}

class UnauthorizedError extends ApiError {
  constructor(
    message = StatusMessages.UNAUTHORIZED,
    statusCode = StatusCodes.UNAUTHORIZED,
  ) {
    super(message, statusCode);
  }
}

class ForbiddenError extends ApiError {
  constructor(
    message = StatusMessages.FORBIDDEN,
    statusCode = StatusCodes.FORBIDDEN,
  ) {
    super(message, statusCode);
  }
}

class NotFoundError extends ApiError {
  constructor(
    message = StatusMessages.NOT_FOUND,
    statusCode = StatusCodes.NOT_FOUND,
  ) {
    super(message, statusCode);
  }
}

class ConflictError extends ApiError {
  constructor(
    message = StatusMessages.CONFLICT,
    statusCode = StatusCodes.CONFLICT,
  ) {
    super(message, statusCode);
  }
}

class TooManyRequestsError extends ApiError {
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
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  TooManyRequestsError,
  InternalServerError
}
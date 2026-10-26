import type { Request, Response, NextFunction } from "express";

export function asyncHandler(func: Function) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res);
    } catch (error) {
      next(error);
    }
  };
}

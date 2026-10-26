import type { Request, Response, NextFunction } from "express"

import { logger } from "../lib/logger.js";

export function reqLogger(req: Request, res: Response, next: NextFunction){
  const start = Date.now()

  res.on("finish", () => {
    const delay = Date.now() - start
    
    logger.info({
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      delay: `${delay} ms`
    })
  })

  next()
}
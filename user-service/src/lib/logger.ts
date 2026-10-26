import pino from "pino";

import { env } from "../config/env.js";

export const logger = pino({
  level: env.LOG_ENV,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    service: env.SERVICE,
    pid: process.pid,
  },
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});

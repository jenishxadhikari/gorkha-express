import "dotenv/config";
import { z } from "zod";

import pkg from "../../package.json" with { type: "json" };

const envSchema = z.object({
  SERVICE: z.string().default(pkg.name),
  PORT: z.coerce.number().default(4001),
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  LOG_LEVEL: z.enum(["info", "warn", "error", "fatal"]).default("info"),

  ALLOWED_ORIGINS: z.string().transform((v) => v.split(",")),

  DATABASE_URL: z.url({ error: "Database url is required." }),
  REDIS_URL: z.url({ error: "Redis url is required." }),

  OTP_HMAC_SECRET: z
    .string()
    .length(64, { error: "OTP hmac secret is required." }),
  OTP_RATE_MAX_PER_HOUR: z.coerce.number().default(5),
  OTP_ATTEMPTS_MAX_PER_HOUR: z.coerce.number().default(5),
  OTP_TTL: z.coerce.number().default(300),

  RESEND_API_KEY: z.string().nonempty({ error: "Resend api key is required." }),

  ACCESS_TOKEN_SECRET: z.string().length(64, {error: "Access token secret is required."}),
  REFRESH_TOKEN_SECRET: z.string().length(128, {error: "Refresh token secret is required."}),
  ACCESS_TOKEN_EXP: z.string().default('15m'),
  REFRESH_TOKEN_EXP: z.string().default('7d'),
  ACCESS_TOKEN_EXP_SEC: z.coerce.number().default(900),
  REFRESH_TOKEN_EXP_SEC: z.coerce.number().default(604800),

  REDIS_USER_TTL: z.coerce.number().default(86400)
});

export const env = envSchema.parse(process.env);

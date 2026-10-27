import "dotenv/config";
import { z } from "zod";

import pkg from "../../package.json" with { type: "json" };

const envSchema = z.object({
  SERVICE: z.string().default(pkg.name),
  PORT: z.coerce.number().default(4001),
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  LOG_ENV: z.enum(["info", "warn", "error", "fatal"]).default("info"),

  ALLOWED_ORIGINS: z.string().transform((v) => v.split(",")),

  DATABASE_URL: z.url({ error: "Database url is required." }),
  REDIS_URL: z.url({ error: "Redis url is required." }),

  OTP_TTL: z.coerce.number().default(300),
  OTP_RATE_MAX_PER_HOUR: z.coerce.number().default(5),
  ATTEMPT_RATE_MAX_PER_HOUR: z.coerce.number().default(5),
  OTP_HMAC_SECRET: z.string().length(64, { error: "HMAC Secret is required." }),

  RESEND_API_KEY: z.string().nonempty({error: "Resend Api Key is required."})
});

export const env = envSchema.parse(process.env);

import { Redis } from "ioredis";

import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

const redis = new Redis(env.REDIS_URL, {
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on("ready", () => {
  logger.info("redis is ready");
});

export default redis;

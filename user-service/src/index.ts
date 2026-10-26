import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

async function startServer() {
  try {
    const server = app.listen(env.PORT, () => {
      logger.info("server started");
    });

    function shutdown() {
      server.close(() => {
        logger.info("server closed");
        process.exit(0);
      });
    }

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error({ error });
    process.exit(1);
  }
}

startServer();

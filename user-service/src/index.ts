import app from "./app.js";
import { env } from "./config/env.js";
import { logger } from "./lib/logger.js";

function startServer() {
  try {
    const server = app.listen(env.PORT, () => {
      logger.info("server started");
    });

    function shutdown() {
      logger.info("server closed");
      server.close();
      process.exit(0);
    }

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    logger.error("server failed to start");
    process.exit(1);
  }
}

startServer()
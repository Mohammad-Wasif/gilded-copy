import { app } from "./app";
import { env } from "./config/env";
import { gracefulDisconnect } from "./config/db";
import { logger } from "./lib/logger";

const server = app.listen(env.PORT, () => {
  logger.info(
    {
      env: env.NODE_ENV,
      port: env.PORT
    },
    "Backend server started"
  );
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, "Shutdown signal received");
  server.close(async () => {
    logger.info("HTTP server closed");
    await gracefulDisconnect();
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

process.on("uncaughtException", (error) => {
  logger.fatal({ err: error }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled promise rejection");
  process.exit(1);
});

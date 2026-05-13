import pino from "pino";
import { env } from "../config/env";

const isDevelopment = env.NODE_ENV !== "production";

export const logger = pino({
  level: env.LOG_LEVEL ?? (isDevelopment ? "debug" : "info"),
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard"
        }
      }
    : undefined
});

// Dedicated audit logger for sensitive events like payments, logins, and status changes
export const auditLogger = logger.child({ type: "audit" });

export function logAudit(action: string, actor: { id: string; role?: string }, details: Record<string, any>) {
  auditLogger.info({
    action,
    actor,
    details,
    timestamp: new Date().toISOString()
  }, `Audit Event: ${action}`);
}

import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "./env";
import { logger } from "../lib/logger";

declare global {
  var __prisma__: PrismaClient | undefined;
}

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,                      // Maximum clients in pool 
  idleTimeoutMillis: 30_000,    // Close idle connections after 30s
  connectionTimeoutMillis: 5_000 // Fail if no connection acquired within 5s
});

const adapter = new PrismaPg(pool);

export const db =
  global.__prisma__ ??
  new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (env.NODE_ENV !== "production") {
  global.__prisma__ = db;
}

// Graceful shutdown: disconnect Prisma and drain the pool when the process exits
let isDisconnecting = false;
export async function gracefulDisconnect() {
  if (isDisconnecting) return;
  isDisconnecting = true;
  logger.info("Disconnecting Prisma client and draining pool...");
  await db.$disconnect();
  await pool.end();
}

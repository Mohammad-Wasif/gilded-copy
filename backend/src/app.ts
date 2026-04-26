import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";
import { toNodeHandler } from "better-auth/node";
import { env } from "./config/env";
import { auth } from "./config/auth";
import { logger } from "./lib/logger";
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";
import { apiRouter } from "./routes";

export const app = express();

// CORS must come first so preflight requests are handled for all routes
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true
  })
);
app.use(cookieParser());
app.use(
  pinoHttp({
    logger
  })
);

// Better Auth handler — MUST be mounted BEFORE express.json()
// because Better Auth reads the raw request body itself.
app.all("/api/auth/*splat", toNodeHandler(auth));

// JSON body parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", apiRouter);
app.use(notFound);
app.use(errorHandler);

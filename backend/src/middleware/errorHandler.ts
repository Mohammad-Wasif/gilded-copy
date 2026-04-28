import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";
import type { ErrorResponse } from "../types/api";

interface HttpError extends Error {
  statusCode?: number;
}

export function errorHandler(
  err: HttpError,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void {
  const statusCode = Number.isInteger(err.statusCode) ? Number(err.statusCode) : 500;
  const isServerError = statusCode >= 500;

  logger.error(
    {
      err,
      statusCode
    },
    "Request failed"
  );

  res.status(statusCode).json({
    success: false,
    error: {
      message: (isServerError && process.env.NODE_ENV === "production") ? "Internal server error" : err.message,
      statusCode
    },
    timestamp: new Date().toISOString()
  });
}

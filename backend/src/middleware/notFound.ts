import type { Request, Response, NextFunction } from "express";

export function notFound(req: Request, res: Response, _next: NextFunction): void {
  res.status(404).json({
    success: false,
    error: {
      message: `Route not found: ${req.method} ${req.originalUrl}`,
      statusCode: 404
    },
    timestamp: new Date().toISOString()
  });
}

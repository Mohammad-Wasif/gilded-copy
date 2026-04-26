import { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth";
import { fromNodeHeaders } from "better-auth/node";
import { env } from "../config/env";
import { logger } from "../lib/logger";

export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session || !session.user) {
      logger.warn("Admin access denied: No valid Better Auth session found");
      return res.status(401).json({
        message: "Unauthorized: Please sign in via the storefront login first",
        success: false
      });
    }

    // Strict RBAC: only users with role="admin" in the database are allowed.
    if ((session.user as any).role !== "admin") {
      logger.warn(
        { email: session.user.email, role: (session.user as any).role },
        "Admin access denied: Insufficient privileges"
      );
      return res.status(403).json({
        message: "Forbidden: Admin access required",
        success: false
      });
    }

    (req as any).user = session.user;
    next();
  } catch (error) {
    logger.error(error, "Error in requireAdmin middleware");
    next(error);
  }
};

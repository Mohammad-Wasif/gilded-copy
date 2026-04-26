import { Request, Response, NextFunction } from "express";
import { auth } from "../config/auth";
import { fromNodeHeaders } from "better-auth/node";

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Better Auth can extract session from standard headers
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session || !session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Attach user to req
    (req as any).user = session.user;
    next();
  } catch (error) {
    next(error);
  }
};

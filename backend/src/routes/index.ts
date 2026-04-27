import { catalogRouter } from "./catalog.routes";
import { Router } from "express";
import { healthRouter } from "./health.routes";
import { testRouter } from "./test.routes";
import { cartRouter } from "../modules/cart/cart.routes";
import orderRouter from "../modules/orders/orders.routes";
import { uploadRouter } from "../modules/upload/upload.routes";
import { adminRouter } from "../modules/admin/admin.routes";
import { env } from "../config/env";
import { AdminSettingsController } from "../modules/admin/admin-settings.controller";

const settingsController = new AdminSettingsController();

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/catalog", catalogRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/upload", uploadRouter);
apiRouter.use("/admin", adminRouter);

// Public settings route
apiRouter.get("/settings/:key", settingsController.getSetting);

// Only expose test routes in non-production environments
if (env.NODE_ENV !== "production") {
  apiRouter.use("/test", testRouter);
}

import { catalogRouter } from "./catalog.routes";
import { Router } from "express";
import { healthRouter } from "./health.routes";
import { testRouter } from "./test.routes";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/catalog", catalogRouter);
apiRouter.use("/test", testRouter);

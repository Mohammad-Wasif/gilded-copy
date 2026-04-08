import { Router } from "express";

export const testRouter = Router();

testRouter.get("/internal-error", (_req, _res, next) => {
  next(new Error("Simulated internal error"));
});

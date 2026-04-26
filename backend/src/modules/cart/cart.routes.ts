import { Router } from "express";
import { CartController } from "./cart.controller";
import { requireAuth } from "../../middleware/requireAuth";

export const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.get("/", CartController.getCart);
cartRouter.post("/sync", CartController.syncCart);
cartRouter.post("/items", CartController.addItem);
cartRouter.patch("/items/:id", CartController.updateItem);
cartRouter.delete("/items/:id", CartController.removeItem);

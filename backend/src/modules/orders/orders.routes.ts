import { Router } from "express";
import { placeOrder, getOrders } from "./orders.controller";
import { requireAuth } from "../../middleware/requireAuth";

const router = Router();

router.use(requireAuth); // All order routes require authentication

router.post("/", placeOrder);
router.get("/", getOrders);

export default router;

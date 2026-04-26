import { Request, Response } from "express";
import { OrderService } from "./orders.service";
import { logger } from "../../lib/logger";
import { z } from "zod";

const placeOrderSchema = z.object({
  shippingName: z.string().min(1, "Name is required").max(160),
  shippingPhone: z.string().min(1, "Phone is required").max(32),
  shippingAddress: z.string().min(1, "Address is required").max(500),
  shippingCity: z.string().min(1, "City is required").max(120),
  shippingState: z.string().min(1, "State is required").max(120),
  shippingZip: z.string().min(1, "ZIP code is required").max(32),
  shippingMethod: z.enum(['standard', 'express']).optional(),
  shippingFee: z.number().optional()
});

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const parsed = placeOrderSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid shipping details", 
        errors: parsed.error.format() 
      });
    }

    const order = await OrderService.placeOrder(userId, parsed.data);

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to place order");
    if (error.message === "Cart is empty") {
      return res.status(400).json({ success: false, message: "Your cart is empty" });
    }
    res.status(500).json({ success: false, message: "Failed to place order" });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const orders = await OrderService.getUserOrders(userId);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error: any) {
    logger.error({ err: error }, "Failed to get orders");
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

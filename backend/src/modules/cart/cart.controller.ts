import { Request, Response, NextFunction } from "express";
import { CartService } from "./cart.service";
import { z } from "zod";

const syncCartSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().nullable().optional(),
      quantity: z.number().int().positive(),
    })
  ),
});

const addItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().nullable().optional(),
  quantity: z.number().int().positive().default(1),
});

const updateItemSchema = z.object({
  quantity: z.number().int().min(0),
});

export class CartController {
  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const cart = await CartService.getCart(userId);
      res.json(cart);
    } catch (e) {
      next(e);
    }
  }

  static async syncCart(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const parsed = syncCartSchema.safeParse(req.body);
      
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid payload", errors: parsed.error.format() });
      }

      const cart = await CartService.syncCart(userId, parsed.data.items);
      res.json(cart);
    } catch (e) {
      next(e);
    }
  }

  static async addItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const parsed = addItemSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid payload", errors: parsed.error.format() });
      }

      await CartService.addItem(userId, parsed.data);
      const cart = await CartService.getCart(userId);
      res.status(201).json(cart);
    } catch (e) {
      next(e);
    }
  }

  static async updateItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const itemId = req.params.id as string;
      const parsed = updateItemSchema.safeParse(req.body);

      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid payload", errors: parsed.error.format() });
      }

      await CartService.updateItemQuantity(userId, itemId, parsed.data.quantity);
      const cart = await CartService.getCart(userId);
      res.json(cart);
    } catch (e) {
      next(e);
    }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const itemId = req.params.id as string;
      await CartService.removeItem(userId, itemId);
      const cart = await CartService.getCart(userId);
      res.json(cart);
    } catch (e) {
      next(e);
    }
  }
}

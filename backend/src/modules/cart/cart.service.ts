import { db } from "../../config/db";

export class CartService {
  static async getCart(userId: string) {
    let cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  where: { isPrimary: true },
                  take: 1
                }
              }
            },
            variant: true,
          },
          orderBy: { createdAt: 'asc' }
        },
      },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    where: { isPrimary: true },
                    take: 1
                  }
                }
              },
              variant: true,
            },
          },
        },
      });
    }

    return cart;
  }

  static async syncCart(userId: string, localItems: any[]) {
    // Basic sync: batching logic using transaction
    const cart = await this.getCart(userId);

    await db.$transaction(async (tx) => {
      for (const item of localItems) {
        if (!item.productId) continue;
        const vId = item.variantId || null;

        const existingItem = await tx.cartItem.findFirst({
          where: { cartId: cart.id, productId: item.productId, variantId: vId }
        });

        if (existingItem) {
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + item.quantity },
          });
        } else {
          await tx.cartItem.create({
            data: {
              cartId: cart.id,
              productId: item.productId,
              variantId: vId,
              quantity: item.quantity,
            },
          });
        }
      }
    });
    
    return this.getCart(userId);
  }

  static async addItem(userId: string, data: { productId: string; variantId?: string | null; quantity: number }) {
    const cart = await this.getCart(userId);
    const vId = data.variantId || null;
    
    return db.$transaction(async (tx) => {
      const existingItem = await tx.cartItem.findFirst({
        where: { cartId: cart.id, productId: data.productId, variantId: vId }
      });

      if (existingItem) {
        return tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + data.quantity },
        });
      } else {
        return tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: data.productId,
            variantId: vId,
            quantity: data.quantity,
          },
        });
      }
    });
  }

  static async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i: any) => i.id === itemId);
    if (!item) throw new Error("Item not found in cart");

    if (quantity <= 0) {
      return db.cartItem.delete({ where: { id: itemId } });
    }

    return db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  static async removeItem(userId: string, itemId: string) {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i: any) => i.id === itemId);
    if (!item) throw new Error("Item not found in cart");

    return db.cartItem.delete({ where: { id: itemId } });
  }

  static async clearCart(userId: string) {
    const cart = await db.cart.findUnique({ where: { userId } });
    if (cart) {
      return db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { count: 0 };
  }
}

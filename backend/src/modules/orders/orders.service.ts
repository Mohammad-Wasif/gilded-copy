import { db } from "../../config/db";

export class OrderService {
  static async placeOrder(userId: string, shippingDetails: any) {
    // 1. Fetch the user's active cart
    const cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    // 2. Calculate totals on the backend
    let subtotal = 0;
    const orderItemsData = cart.items.map((item: any) => {
      const priceAtPurchase = item.variant?.priceOverride 
        ? parseFloat(item.variant.priceOverride.toString()) 
        : parseFloat(item.product.basePrice.toString());
      
      subtotal += priceAtPurchase * item.quantity;
      
      return {
        productId: item.productId,
        variantId: item.variantId,
        productName: item.product.name,
        variantName: item.variant?.title || null,
        priceAtPurchase,
        quantity: item.quantity,
      };
    });

    // For now, fixed shipping fee logic as requested (e.g. standard 80, express 250)
    // We will trust the frontend's boolean or method identifier, but here we enforce standard or express
    let shippingFee = 80;
    if (shippingDetails.shippingMethod === 'express' || shippingDetails.shippingFee === 250) {
        shippingFee = 250;
    }

    const totalAmount = subtotal + shippingFee;

    // 3. Perform a database transaction to create the Order and clear the Cart
    const result = await db.$transaction(async (tx) => {
      // Create the Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          totalAmount,
          shippingFee,
          shippingName: shippingDetails.shippingName,
          shippingPhone: shippingDetails.shippingPhone,
          shippingAddress: shippingDetails.shippingAddress,
          shippingCity: shippingDetails.shippingCity,
          shippingState: shippingDetails.shippingState,
          shippingZip: shippingDetails.shippingZip,
          items: {
            create: orderItemsData,
          },
        },
        include: {
          items: true,
        },
      });

      // Clear the user's cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    return result;
  }

  static async getUserOrders(userId: string) {
    return db.order.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

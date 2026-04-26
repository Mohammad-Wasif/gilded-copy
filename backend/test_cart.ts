import { db } from './src/config/db';
import { CartService } from './src/modules/cart/cart.service';

async function test() {
  const userId = '1';
  try {
    console.log("Getting cart...");
    const cart = await CartService.getCart(userId);
    console.log("Cart items:", cart.items.map(i => i.id));
    
    if (cart.items.length > 0) {
      console.log("Attempting to delete item:", cart.items[0].id);
      await CartService.removeItem(userId, cart.items[0].id);
      console.log("Deleted successfully.");
    } else {
      console.log("No items to delete. Syncing fake item.");
      await CartService.syncCart(userId, [{
         productId: 'cm8abclpq0001jz0cwl01asdf', // we need a valid product id or fake
      }]);
    }
  } catch(e) {
    console.error("Error:", e);
  }
}
test();

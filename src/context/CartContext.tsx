import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { authClient } from '../lib/auth-client';

export interface CartItem {
  id: string;      
  productId?: string;
  variantId?: string | null;
  name: string;
  variant: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
}

const CART_STORAGE_KEY = 'gilded_heirloom_cart';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  addToCart: (item?: Partial<CartItem>) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, delta: number) => Promise<void>;
  isLoading: boolean;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, isPending: sessionLoading } = authClient.useSession();
  const isAuthed = !!session?.user;

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Sync to local storage only if NOT authenticated
  useEffect(() => {
    if (!isAuthed && !sessionLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } else if (isAuthed && hasSynced) {
      // Once synced, we can wipe local storage cart
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [items, isAuthed, sessionLoading, hasSynced]);

  // Handle Server Fetch & Sync
  useEffect(() => {
    const fetchAndSync = async () => {
      if (isAuthed && !sessionLoading) {
        setIsLoading(true);
        try {
          if (items.length > 0 && !hasSynced) {
             const syncItems = items.map(item => ({
               productId: item.productId || item.id.split('-')[0], // Fallback parsing
               variantId: item.variantId !== undefined ? item.variantId : (item.id.includes('-') && !item.id.includes('novariant') ? item.id.split('-')[1] : null),
               quantity: item.quantity
             }));
             const serverCart = await api.cart.sync(syncItems);
             mapServerCartToState(serverCart);
             setHasSynced(true);
          } else if (!hasSynced) {
             const serverCart = await api.cart.get();
             mapServerCartToState(serverCart);
             setHasSynced(true);
          }
        } catch (err) {
          console.error("Failed to fetch server cart", err);
        } finally {
          setIsLoading(false);
        }
      } else if (!sessionLoading && !isAuthed) {
        setHasSynced(false);
      }
    };
    fetchAndSync();
  }, [isAuthed, sessionLoading, items.length, hasSynced]);

  const mapServerCartToState = (serverCart: any) => {
    if (!serverCart || !serverCart.items) {
      setItems([]);
      return;
    }
    const newItems: CartItem[] = serverCart.items.map((cartItem: any) => ({
      id: cartItem.id, // The db cartItem ID
      productId: cartItem.productId,
      variantId: cartItem.variantId,
      name: cartItem.product.name,
      variant: cartItem.variant?.title || 'Standard',
      price: Number(cartItem.variant?.priceOverride || cartItem.product.basePrice),
      originalPrice: cartItem.product.compareAtPrice ? Number(cartItem.product.compareAtPrice) : undefined,
      quantity: cartItem.quantity,
      image: cartItem.product.images?.[0]?.imageUrl || ''
    }));
    setItems(newItems);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = async (item?: Partial<CartItem>) => {
    setIsCartOpen(true);
    
    if (!item) {
      if (items.length > 0) {
        await updateQuantity(items[0].id, 1);
      }
      return;
    }
    
    // Attempt parse id if missing
    const parsedProductId = item.productId || (item.id ? item.id.split('-')[0] : '');
    const parsedVariantId = item.variantId !== undefined 
      ? item.variantId 
      : (item.id && item.id.includes('-') && !item.id.includes('novariant') ? item.id.split('-')[1] : null);

    if (isAuthed) {
      setIsLoading(true);
      try {
        const serverCart = await api.cart.addItem(parsedProductId, parsedVariantId, item.quantity || 1);
        mapServerCartToState(serverCart);
      } catch (err) {
        console.error("Failed to add to server cart", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id || (i.productId === parsedProductId && i.variantId === parsedVariantId));
        if (existing) {
          return prev.map((i) => i.id === existing.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i);
        }
        const newItem: CartItem = {
          id: item.id || `local-${Date.now()}`,
          productId: parsedProductId,
          variantId: parsedVariantId,
          name: item.name || 'Unknown Item',
          variant: item.variant || 'Standard',
          price: item.price || 0,
          originalPrice: item.originalPrice,
          quantity: item.quantity || 1,
          image: item.image || ''
        };
        return [...prev, newItem];
      });
    }
  };

  const removeFromCart = async (id: string) => {
    if (isAuthed) {
      setIsLoading(true);
      try {
        const serverCart = await api.cart.removeItem(id);
        mapServerCartToState(serverCart);
      } catch (err) {
        console.error("Failed to remove from server cart", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const updateQuantity = async (id: string, delta: number) => {
    if (isAuthed) {
      const item = items.find((i) => i.id === id);
      if (!item) return;
      const newQuantity = Math.max(1, item.quantity + delta);
      setIsLoading(true);
      try {
        const serverCart = await api.cart.updateItem(id, newQuantity);
        mapServerCartToState(serverCart);
      } catch (err) {
        console.error("Failed to update item quantity", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      setItems((prev) => 
        prev.map((item) => {
          if (item.id === id) {
            const newQuantity = item.quantity + delta;
            return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 };
          }
          return item;
        })
      );
    }
  };

  const clearCart = () => {
    setItems([]);
  }

  return (
    <CartContext.Provider value={{ items, itemCount, addToCart, removeFromCart, updateQuantity, isLoading, isCartOpen, setIsCartOpen, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

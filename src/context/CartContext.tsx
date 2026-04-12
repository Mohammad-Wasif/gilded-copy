import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
  id: string;
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
  addToCart: (item?: Partial<CartItem>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
    return [];
  });

  React.useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const addToCart = (item?: Partial<CartItem>) => {
    if (!item) {
      if (items.length > 0) {
        updateQuantity(items[0].id, 1);
      }
      return;
    }
    
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + (item.quantity || 1) } : i);
      }
      
      const newItem: CartItem = {
        id: item.id || `item-${Date.now()}`,
        name: item.name || 'Unknown Item',
        variant: item.variant || 'Standard',
        price: item.price || 0,
        originalPrice: item.originalPrice,
        quantity: item.quantity || 1,
        image: item.image || ''
      };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) => 
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 1 }; // Don't let it go below 1
        }
        return item;
      })
    );
  };

  return (
    <CartContext.Provider value={{ items, itemCount, addToCart, removeFromCart, updateQuantity }}>
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

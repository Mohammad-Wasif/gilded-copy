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

const defaultItems: CartItem[] = [
  {
    id: 'gold-zari',
    name: 'Pure 24K Gold Zari',
    variant: 'Fine Grade - 500m Spool',
    price: 2400,
    originalPrice: 2800,
    quantity: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCtCdFxfj8TzWujgsg5esPu4wz2z1OLSKdkla-h__h1gWYJQ-tPzFGcdfUqO7gAcx5M5ViGSBAUhDAoFbKTFzd8dYmi-AiLu1lLgmtbraoMr0h-K40wCm4_VdnaqYFUDVs56odxJnmeWvCbkv7YO_QrMm1SFSs_1L43L4jQReUHk-1pg4MRWQvtfiUw4D-DWsyBvytwklqHBbMbGbKJZ3I5dYz4x4XlLMkGnOwjtx0USjV24pZG21MZvdinl3-6QlDZlp3BvG0x9qY'
  },
  {
    id: 'silver-wire',
    name: 'Victorian Silver Wire',
    variant: 'Antique Finish - 100g Coil',
    price: 1250,
    quantity: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHV1Lx2RLcM0uKnH52L2Hy1vrrxkXW65K3WJS1dXlwn8JSTpSLEvMLeIs_yTjKP20D9NFNK5AKnss69zfyJCIyIw49DTJ8yfyk3wZJu68yAIRjpQfNENUgOdmV2zRqep63T64mI80nLnfNmgWYKpTWBM-GCpMR-XAidoVM2cxFhHfcjmBNkQp_8IVQGk8IVr4tX51TDh8U0H9sIV0b0FKVnZwIQqZ4K_5JidlZpspZWxhX7Rl8rwlZGX4WjyLyGmqBgla7du8lPd8'
  },
  {
    id: 'bronze-silk',
    name: 'Aged Bronze Silk Blend',
    variant: 'Hand-dyed - 250m Hank',
    price: 850,
    quantity: 1,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAiOkAr8Qq5sfRjxs3vO1l4H6aKR0HJKgX2vtVDJezxM0ylW6ARx-RqVffLtI7gWk31zjaUuEHQ_LOtGj_s41A4Z3dNk1pVabrqla2dz6dGHOad3f91SKy-pvo0mL0Pd-DJZuTtEqFhT9-3avIp-WEw4WryTsNnA8h6-9RxMjllrJk-UFL_L08ZOKtdYpBlE7GutN_SW43LJzzVhPnK_y0SJCxmr8meG425fns0MkUBGvvtP5GsVr6hJWppWX0s2RJ_S3ugZcMxpWI'
  }
];

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  addToCart: (item?: Partial<CartItem>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(defaultItems);

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

import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, ShoppingCart, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer = () => {
  const { items, removeFromCart, updateQuantity, isCartOpen, setIsCartOpen } = useCart();
  const location = useLocation();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Close when router navigates
  useEffect(() => {
    setIsCartOpen(false);
  }, [location.pathname]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isCartOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen]);

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsCartOpen(false)}
      />
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface z-[90] transform transition-transform duration-300 ease-out flex flex-col shadow-2xl ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-primary" />
            <h2 className="text-xl font-headline font-bold text-primary tracking-tight">Your Cart</h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full ml-2">
              {items.length}
            </span>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-1 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container-low rounded-full">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
              <ShoppingCart size={48} className="mb-4 text-on-surface-variant/40" />
              <p className="font-headline text-lg text-primary mb-2">Your cart is empty.</p>
              <p className="text-sm font-body text-on-surface-variant">Continue exploring our artisanal collection.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-6 border border-primary text-primary px-6 py-2 rounded-full font-bold text-sm tracking-wide hover:bg-primary hover:text-on-primary transition-colors"
              >
                Return to Shop
              </button>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} className="flex gap-4 p-3 bg-surface-container-lowest border border-outline-variant/10 rounded-lg shadow-sm">
                <div className="w-20 h-24 overflow-hidden rounded-md flex-shrink-0 bg-surface-container-low">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-headline font-bold text-primary text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-on-surface-variant">{item.variant}</p>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-on-surface-variant/60 hover:text-error transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center bg-surface-container-low rounded-full px-1 border border-outline-variant/20">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-full text-primary hover:bg-white transition-all text-xs">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold w-6 text-center text-on-surface">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-full text-primary hover:bg-white transition-all text-xs">
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-bold text-primary font-body">₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-outline-variant/10 p-6 bg-surface-container-lowest">
            <div className="flex justify-between items-center mb-6">
              <span className="font-headline uppercase tracking-widest text-sm text-on-surface-variant/80">Subtotal</span>
              <span className="text-2xl font-bold text-primary">₹{subtotal.toLocaleString()}</span>
            </div>
            
            <Link 
              to="/cart"
              className="w-full bg-[#570013] text-on-primary py-4 rounded-lg font-bold text-sm tracking-[0.1em] uppercase shadow-lg shadow-black/10 hover:shadow-xl hover:translate-y-[-2px] hover:bg-primary transition-all flex items-center justify-center gap-2 mb-3"
            >
              View Full Cart <ArrowRight size={18} />
            </Link>
            
            <button 
              onClick={() => setIsCartOpen(false)}
              className="w-full py-3 text-primary font-bold text-sm uppercase tracking-widest hover:bg-surface-container-low rounded-lg transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

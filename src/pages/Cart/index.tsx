import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Cart() {
  useDocumentTitle('Your Cart');
  const { items, removeFromCart, updateQuantity } = useCart();
  
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const amountToFreeShipping = 4920 - subtotal;
  const isFreeShipping = amountToFreeShipping <= 0;
  const shipping = items.length === 0 ? 0 : (isFreeShipping ? 0 : 80);
  const total = subtotal + shipping;
  const progressPercent = Math.min(100, Math.max(0, (subtotal / 4920) * 100));

  return (
    <div className="flex-grow max-w-screen-2xl mx-auto w-full px-4 md:px-8 py-8 pb-32 md:pb-12">
      {/* Checkout Progress Indicator */}
      <div className="max-w-md mx-auto py-3 px-8 mb-8">
        <div className="flex items-center justify-between text-[11px] font-headline uppercase tracking-[0.2em] w-full">
          <div className="flex items-center text-primary font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2"></span>
            Cart
          </div>
          <div className="h-[1px] flex-grow mx-4 bg-outline-variant/30"></div>
          <div className="text-on-surface-variant/40">Checkout</div>
          <div className="h-[1px] flex-grow mx-4 bg-outline-variant/30"></div>
          <div className="text-on-surface-variant/40">Payment</div>
        </div>
      </div>

      {/* Navigation: Continue Shopping */}
      <div className="mb-8">
        <Link className="inline-flex items-center text-primary font-bold text-sm hover:translate-x-[-4px] transition-transform duration-300" to="/shop">
          <span className="material-symbols-outlined text-lg mr-2">arrow_back</span>
          Continue Shopping
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl text-primary font-headline mb-2">Your Cart</h1>
        <p className="text-on-surface-variant font-medium">Review your curated selection of artisanal threads and materials.</p>
      </div>

      {/* Cart Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Section: Cart Items */}
        <div className="lg:col-span-8">
          <div className="space-y-10">
            {items.length === 0 ? (
              <div className="p-12 text-center bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="w-20 h-20 mx-auto bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">shopping_cart</span>
                </div>
                <h3 className="text-2xl font-bold font-headline text-primary mb-2">Your cart is currently empty.</h3>
                <p className="text-on-surface-variant mb-8">Explore our artisanal collection to start adding items.</p>
                <Link to="/shop" className="inline-block bg-primary text-on-primary px-8 py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-primary/90 transition-colors">Start Shopping</Link>
              </div>
            ) : items.map((item) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-8 p-6 bg-surface-container-lowest rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] group border border-outline-variant/10">
                <div className="w-full md:w-40 h-48 flex-shrink-0 overflow-hidden rounded-lg bg-surface-container-low">
                  <img alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={item.image} />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-2xl font-bold text-primary font-headline mb-2">{item.name}</h3>
                      <p className="text-sm text-on-surface-variant/70 font-normal">{item.variant}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-outline-variant hover:text-error hover:bg-error/5 rounded-full transition-all duration-300">
                      <span className="material-symbols-outlined text-2xl">delete</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between mt-8 gap-4">
                    <div className="flex items-center bg-surface-container-high rounded-full px-1 py-1 border border-outline-variant/20">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-white transition-all active:scale-90">
                        <span className="material-symbols-outlined text-lg">remove</span>
                      </button>
                      <span className="text-base font-bold w-12 text-center text-on-surface">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="w-10 h-10 flex items-center justify-center rounded-full text-primary hover:bg-white transition-all active:scale-90">
                        <span className="material-symbols-outlined text-lg">add</span>
                      </button>
                    </div>
                    <div className="text-right">
                      {item.originalPrice && <span className="block text-xs text-on-surface-variant/50 line-through mb-1">₹{(item.originalPrice * item.quantity).toLocaleString()}</span>}
                      <span className="text-2xl font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Free Shipping Progress */}
            {items.length > 0 && (
              <div className="bg-surface-container-low/50 p-8 rounded-xl border border-outline-variant/10">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shrink-0">
                    <span className="material-symbols-outlined text-3xl">local_shipping</span>
                  </div>
                  <div className="flex-grow">
                    {isFreeShipping ? (
                      <p className="text-base font-bold text-on-surface mb-1">You have unlocked <span className="text-secondary underline underline-offset-4 decoration-2">FREE shipping</span>!</p>
                    ) : (
                      <p className="text-base font-bold text-on-surface mb-1">Add ₹{amountToFreeShipping.toLocaleString()} more to get <span className="text-secondary underline underline-offset-4 decoration-2">FREE shipping</span></p>
                    )}
                    <div className="mt-4 relative w-full bg-surface-container-highest h-2 rounded-full overflow-hidden shadow-inner">
                      <div className="bg-gradient-to-r from-secondary/80 to-secondary h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Section: Order Summary */}
        <aside className="lg:col-span-4 sticky top-36">
          <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <h2 className="text-2xl font-bold font-headline text-primary mb-8 pb-4 border-b border-outline-variant/20">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-on-surface-variant">Subtotal ({items.reduce((a, c) => a + c.quantity, 0)} items)</span>
                <span className="text-on-surface font-bold">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-on-surface-variant">Shipping Estimate</span>
                <span className="text-on-surface font-bold">{shipping > 0 ? `₹${shipping.toLocaleString()}` : (items.length > 0 ? 'Free' : '₹0')}</span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-on-surface-variant">Estimated Taxes</span>
                <span className="text-on-surface font-normal italic opacity-60">Calculated at next step</span>
              </div>
            </div>
            
            <div className="border-t-2 border-primary/10 pt-8 mb-10">
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold text-primary uppercase tracking-tight">Order Total</span>
                <div className="text-right">
                  <span className="text-4xl font-bold text-primary block leading-none">₹{total.toLocaleString()}</span>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-on-surface-variant/60 mt-2">Inclusive of all duties</p>
                </div>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="flex items-center gap-3 text-xs text-on-surface-variant/80 font-medium">
                <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <span>Secure Checkout Guaranteed</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant/80 font-medium">
                <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                <span>Trusted Payments Systems</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-on-surface-variant/80 font-medium">
                <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>speed</span>
                <span>Fast Delivery Across India</span>
              </div>
            </div>

            {items.length > 0 ? (
              <Link to="/checkout" className="w-full bg-[#570013] text-on-primary py-5 rounded-lg font-bold text-sm tracking-[0.2em] uppercase hover:bg-primary-container hover:shadow-2xl transition-all duration-300 active:scale-[0.98] shadow-lg mb-8 flex items-center justify-center gap-3">
                Proceed to Checkout
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </Link>
            ) : (
              <button disabled className="w-full bg-surface-container text-on-surface-variant/40 py-5 rounded-lg font-bold text-sm tracking-[0.2em] uppercase cursor-not-allowed mb-8 flex items-center justify-center gap-3 border border-outline-variant/10">
                Proceed to Checkout
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            )}

            {/* Payment Icons */}
            <div className="pt-8 border-t border-outline-variant/20">
              <p className="text-[10px] font-bold text-on-surface-variant/40 mb-4 tracking-widest uppercase text-center">Accepted Currencies &amp; Methods</p>
              <div className="flex justify-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 cursor-default">
                <span className="material-symbols-outlined text-2xl">payments</span>
                <span className="material-symbols-outlined text-2xl">credit_card</span>
                <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
              </div>
            </div>
          </div>

          {/* Member Promo */}
          <div className="mt-6 p-6 bg-tertiary-container/10 rounded-xl border border-tertiary/20 group hover:bg-tertiary-container/20 transition-colors duration-300 cursor-pointer">
            <p className="text-xs font-bold text-tertiary mb-1 uppercase tracking-widest">Member Exclusive</p>
            <p className="text-sm text-on-tertiary-container/80 mb-4 font-medium">Sign in to apply your 'Legacy Circle' discount of 15%.</p>
            <Link className="text-xs font-bold text-primary underline underline-offset-4 hover:text-primary-container transition-colors inline-block" to="/login">Sign in now</Link>
          </div>
        </aside>

      </div>

      {/* Sticky Mobile Footer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl p-4 shadow-[0_-15px_40px_rgba(0,0,0,0.12)] z-[60] border-t border-outline-variant/30 transition-transform duration-500">
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest">Total Amount</span>
              <span className="text-2xl font-bold text-primary">₹{total.toLocaleString()}</span>
            </div>
            {items.length > 0 && (
              <div className="bg-secondary/10 px-3 py-1 rounded-full">
                {isFreeShipping ? (
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-tight">Free shipping</span>
                ) : (
                  <span className="text-[10px] text-secondary font-bold uppercase tracking-tight">Free shipping in ₹{amountToFreeShipping.toLocaleString()}</span>
                )}
              </div>
            )}
          </div>
          {items.length > 0 ? (
            <Link to="/checkout" className="block text-center w-full bg-[#570013] text-on-primary py-4 rounded-lg font-bold text-sm tracking-[0.15em] uppercase active:scale-95 shadow-xl">
              Checkout Now
            </Link>
          ) : (
            <button disabled className="block w-full bg-surface-container text-on-surface-variant/40 py-4 rounded-lg font-bold text-sm tracking-[0.15em] uppercase cursor-not-allowed">
              Checkout Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

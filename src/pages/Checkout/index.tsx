import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Footer } from '../../components/Footer/Footer';
import { useCart } from '../../context/CartContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export default function Checkout() {
  useDocumentTitle('Checkout');
  const { items } = useCart();
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const [shippingFee, setShippingFee] = useState<number>(80);
  const total = subtotal + shippingFee;
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/10 min-h-screen flex flex-col">
      {/* TopAppBar: Center-aligned, Distraction-free */}
      <header className="bg-surface-bright flex justify-between items-center px-8 h-20 w-full max-w-7xl mx-auto sticky top-0 z-50">
        <div className="flex-1">
          <Link className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 font-headline text-sm uppercase tracking-widest" to="/cart">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Cart
          </Link>
        </div>
        <div className="flex-none hidden md:block">
          <Link to="/" className="font-headline italic text-2xl text-primary">Hindustan Embroidery</Link>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
            <span className="font-headline text-sm uppercase tracking-widest">Secure</span>
          </div>
        </div>
      </header>

      {/* SideNavBar Logic: Left Column Fixed Shell */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen z-40 bg-surface-bright border-r border-transparent w-64 p-8">
        <div className="mb-12 mt-20">
          <h2 className="font-headline text-primary text-lg tracking-tight">Secure Checkout</h2>
          <p className="text-on-surface-variant text-xs font-body mt-1">Modern Heritage Craft</p>
        </div>
        <nav className="flex flex-col gap-4">
          <Link to="/cart" className="flex items-center gap-3 text-on-surface-variant p-3 hover:text-primary transition-colors">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="font-headline text-lg tracking-tight">Cart</span>
          </Link>
          
          {/* ACTIVE STEP: Checkout */}
          <div className="flex items-center gap-3 text-primary font-bold bg-surface-container-lowest shadow-sm rounded-md p-3">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>local_shipping</span>
            <span className="font-headline text-lg tracking-tight">Checkout</span>
          </div>
          
          <div className="flex items-center gap-3 text-on-surface-variant p-3 opacity-50 cursor-not-allowed">
            <span className="material-symbols-outlined">payments</span>
            <span className="font-headline text-lg tracking-tight">Payment</span>
          </div>
        </nav>
      </aside>

      <main className="grow max-w-7xl mx-auto px-6 py-12 lg:pl-72 lg:pr-8 w-full">
        {/* Progress Metaphor: Thread & Needle */}
        <div className="flex items-center justify-center mb-16 gap-4">
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-tertiary"></div>
            <span className="text-[10px] font-body uppercase tracking-tighter mt-2 text-on-surface-variant">Review</span>
          </div>
          <div className="h-px w-24 bg-tertiary"></div>
          <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full border-4 border-primary bg-surface ring-2 ring-primary/20"></div>
            <span className="text-[10px] font-body uppercase tracking-widest mt-2 text-primary font-bold">Shipping</span>
          </div>
          <div className="h-px w-24 bg-outline-variant"></div>
          <div className="flex flex-col items-center">
            <div className="w-3 h-3 rounded-full bg-outline-variant"></div>
            <span className="text-[10px] font-body uppercase tracking-tighter mt-2 text-on-surface-variant">Payment</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left Column: Shipping Form */}
          <div className="lg:col-span-7">
            <section className="mb-12">
              <h2 className="font-headline text-3xl text-primary mb-8">Shipping &amp; Delivery</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-6">Shipping Address</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Full name</label>
                      <input className="w-full bg-surface-container-low border-none border-b border-outline-variant focus:ring-0 focus:bg-surface-container-high focus:border-primary transition-all p-3 font-body text-on-surface placeholder:text-outline-variant/50" placeholder="Aditi Sharma" type="text"/>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Phone Number</label>
                      <input className="w-full bg-surface-container-low border-none border-b border-outline-variant focus:ring-0 focus:bg-surface-container-high focus:border-primary transition-all p-3 font-body text-on-surface placeholder:text-outline-variant/50" placeholder="+91 98765 43210" type="tel"/>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 ml-1">Address line 1</label>
                      <input className="w-full bg-surface-container-low border-none border-b border-outline-variant focus:ring-0 focus:bg-surface-container-high focus:border-primary transition-all p-3 font-body text-on-surface placeholder:text-outline-variant/50" placeholder="Suite 402, Heritage Enclave" type="text"/>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 ml-1">City</label>
                      <input className="w-full bg-surface-container-low border-none border-b border-outline-variant focus:ring-0 focus:bg-surface-container-high focus:border-primary transition-all p-3 font-body text-on-surface placeholder:text-outline-variant/50" placeholder="Jaipur" type="text"/>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 ml-1">State</label>
                      <input className="w-full bg-surface-container-low border-none border-b border-outline-variant focus:ring-0 focus:bg-surface-container-high focus:border-primary transition-all p-3 font-body text-on-surface placeholder:text-outline-variant/50" placeholder="Rajasthan" type="text"/>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant mb-1 ml-1">ZIP Code</label>
                      <input className="w-full bg-surface-container-low border-none border-b border-outline-variant focus:ring-0 focus:bg-surface-container-high focus:border-primary transition-all p-3 font-body text-on-surface placeholder:text-outline-variant/50" placeholder="302001" type="text"/>
                    </div>
                  </div>
                </div>
                
                <div className="pt-8">
                  <h3 className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant mb-6">Shipping Method</h3>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-md cursor-pointer hover:border-primary transition-all group">
                      <div className="flex items-center gap-4">
                        <input checked={shippingFee === 80} onChange={() => setShippingFee(80)} className="text-primary focus:ring-primary w-4 h-4" name="shipping" type="radio"/>
                        <div>
                          <p className="font-body text-sm font-semibold text-on-surface">Standard Delivery</p>
                          <p className="text-xs text-on-surface-variant">3-5 business days</p>
                        </div>
                      </div>
                      <span className="font-body text-sm font-bold text-primary">₹80</span>
                    </label>
                    <label className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant/20 rounded-md cursor-pointer hover:border-primary transition-all group">
                      <div className="flex items-center gap-4">
                        <input checked={shippingFee === 250} onChange={() => setShippingFee(250)} className="text-primary focus:ring-primary w-4 h-4" name="shipping" type="radio"/>
                        <div>
                          <p className="font-body text-sm font-semibold text-on-surface">Express Courier</p>
                          <p className="text-xs text-on-surface-variant">1-2 business days</p>
                        </div>
                      </div>
                      <span className="font-body text-sm font-bold text-primary">₹250</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex justify-start">
                <Link to="/payment" className="bg-primary text-on-primary px-10 py-4 font-body font-semibold uppercase tracking-widest rounded-md hover:bg-primary/90 transition-all flex items-center gap-3 group">
                  Continue to Payment
                  <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-surface-container-low p-8 rounded-md sticky top-28">
              <h3 className="font-headline text-xl text-primary mb-8 border-b border-outline-variant/30 pb-4">Order Summary</h3>
              {/* Items */}
              <div className="space-y-6 mb-8">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-20 h-24 bg-surface-container-lowest overflow-hidden shrink-0">
                      <img alt={item.name} className="w-full h-full object-cover" src={item.image || "https://placehold.co/80x96"}/>
                    </div>
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <h4 className="font-headline text-sm font-bold text-on-surface">{item.name}</h4>
                        <p className="font-body text-xs text-on-surface-variant">{item.variant}</p>
                        {item.quantity > 1 && <p className="font-body text-xs text-on-surface-variant mt-1">Qty: {item.quantity}</p>}
                      </div>
                      <p className="font-body text-sm font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
                {items.length === 0 && (
                  <p className="text-sm text-on-surface-variant italic">Your cart is empty.</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t border-outline-variant/30">
                <div className="flex justify-between font-body text-sm">
                  <span className="text-on-surface-variant">Subtotal</span>
                  <span className="text-on-surface">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-body text-sm">
                  <span className="text-on-surface-variant">Shipping</span>
                  <span className="text-on-surface">{shippingFee === 0 ? 'Complimentary' : `₹${shippingFee}`}</span>
                </div>
                <div className="flex justify-between font-body text-lg font-bold pt-4 text-on-surface">
                  <span>Total</span>
                  <span className="text-primary">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="mt-8 flex items-center justify-center gap-2 py-3 bg-secondary-container/30 rounded-md">
                <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="font-body text-[10px] uppercase tracking-widest text-on-secondary-container font-bold">Secure Checkout</span>
              </div>

              {/* Discount code field */}
              <div className="mt-8 flex gap-2">
                <input className="grow bg-surface-container-lowest border-none border-b border-outline-variant focus:ring-0 p-2 text-xs font-body placeholder:text-outline-variant/50" placeholder="Promo Code" type="text"/>
                <button className="text-primary font-body text-xs font-bold uppercase tracking-widest hover:underline transition-all">Apply</button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

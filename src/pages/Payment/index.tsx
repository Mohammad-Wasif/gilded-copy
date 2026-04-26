import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ShoppingCart, Truck, CreditCard, Landmark, Wallet, Banknote, Info, ShieldCheck, Shield, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Footer } from '../../components/Footer/Footer';
import { useCart } from '../../context/CartContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { api } from '../../lib/api';

type PaymentMethod = 'card' | 'upi' | 'cod';

export default function Payment() {
  useDocumentTitle('Payment');
  const { items, clearCart } = useCart();
  const navigate = useNavigate();

  const [shippingData, setShippingData] = useState<any>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorVisible, setErrorVisible] = useState('');
  const [orderPlacedId, setOrderPlacedId] = useState<string | null>(null);

  // Load shipping data from sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('checkout_shipping');
    if (saved) {
      setShippingData(JSON.parse(saved));
    } else {
      // No shipping data — redirect back to checkout
      navigate('/checkout');
    }
  }, [navigate]);

  const shippingFee = shippingData?.shippingFee ?? 80;
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const gst = Math.round(subtotal * 0.12);
  const total = subtotal + shippingFee + gst;

  const handleCompleteOrder = async () => {
    if (!shippingData) {
      setErrorVisible('Shipping information is missing. Please go back to checkout.');
      return;
    }
    if (items.length === 0) {
      setErrorVisible('Your cart is empty.');
      return;
    }

    setErrorVisible('');
    setIsSubmitting(true);

    try {
      const response = await api.orders.createOrder(shippingData);

      if (response.success) {
        setOrderPlacedId(response.data.id);
        clearCart();
        sessionStorage.removeItem('checkout_shipping');
      } else {
        setErrorVisible(response.message || 'Failed to place order.');
      }
    } catch (error: any) {
      setErrorVisible(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success Screen ───────────────────────────────────────────────
  if (orderPlacedId) {
    return (
      <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-surface-container-low p-10 rounded-2xl shadow-xl flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 animate-[scale-in_0.4s_ease-out]">
            <CheckCircle2 size={40} className="text-primary" />
          </div>
          <h2 className="font-headline text-3xl text-primary mb-2">Order Confirmed!</h2>
          <p className="text-on-surface-variant font-body mb-8">
            Thank you for your purchase. Your order <span className="font-bold text-on-surface">#{orderPlacedId.slice(-6).toUpperCase()}</span> has been placed successfully.
          </p>
          <Link to="/dashboard/orders" className="bg-primary text-on-primary w-full py-4 font-bold tracking-widest uppercase rounded-md hover:bg-primary/90 transition-all text-center block">
            View My Orders
          </Link>
          <Link to="/shop" className="mt-4 text-primary font-bold text-sm tracking-wide hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/10 min-h-screen flex flex-col">
      {/* TopAppBar: Center-aligned, Distraction-free */}
      <header className="bg-surface-bright flex justify-between items-center px-8 h-20 w-full max-w-7xl mx-auto sticky top-0 z-50 border-b border-outline-variant/10">
        <div className="flex-1">
          <Link className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 font-headline text-sm uppercase tracking-widest" to="/checkout">
            <ArrowLeft size={14} />
            Back to Checkout
          </Link>
        </div>
        <div className="flex-none hidden md:block">
          <Link to="/" className="font-headline italic text-2xl text-primary">Hindustan Embroidery</Link>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="flex items-center gap-2 text-primary">
            <Lock size={18} className="text-primary" />
            <span className="font-headline text-sm uppercase tracking-widest">Secure</span>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-8 py-12 lg:py-20 flex flex-col lg:flex-row gap-16 w-full">
        {/* SideNavBar (Contextual Navigation for Checkout Steps) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-8">
          <div className="space-y-1">
            <h2 className="font-headline text-2xl text-primary tracking-tight">Secure Checkout</h2>
            <p className="font-body text-xs text-on-surface-variant uppercase tracking-widest">Modern Heritage Craft</p>
          </div>
          <nav className="flex flex-col gap-2">
            <Link to="/cart" className="flex items-center gap-3 text-on-surface-variant p-3 opacity-60 hover:opacity-100 transition-opacity">
              <ShoppingCart size={20} />
              <span className="font-headline text-lg tracking-tight">Cart</span>
            </Link>
            <Link to="/checkout" className="flex items-center gap-3 text-on-surface-variant p-3 opacity-60 hover:opacity-100 transition-opacity">
              <Truck size={20} />
              <span className="font-headline text-lg tracking-tight">Checkout</span>
            </Link>
            <div className="flex items-center gap-3 text-primary font-bold bg-surface-container-lowest rounded-md p-3 shadow-sm shadow-black/5">
              <CreditCard size={20} />
              <span className="font-headline text-lg tracking-tight">Payment</span>
            </div>
          </nav>
          
          {/* Checkout Metaphor */}
          <div className="mt-8 pt-8 border-t border-outline-variant/20">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                <div className="h-px flex-1 bg-outline-variant/30"></div>
                <div className="w-2 h-2 rounded-full bg-tertiary"></div>
                <div className="h-px flex-1 bg-outline-variant/30"></div>
                <div className="w-3 h-3 rounded-full bg-primary outline outline-offset-2 outline-primary/20"></div>
              </div>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-widest text-center">Final Thread: Payment</p>
            </div>
          </div>
        </aside>

        {/* Main Content (Left Column) */}
        <section className="flex-1 space-y-12">
          <div>
            <h2 className="font-headline text-4xl text-primary mb-2">Secure Payment</h2>
            <p className="text-on-surface-variant">Step 3 of 3 — Complete your bespoke heirloom acquisition.</p>
          </div>

          {errorVisible && (
            <div className="p-4 bg-error-container text-on-error-container rounded-md font-body text-sm font-semibold border border-error/50">
              {errorVisible}
            </div>
          )}

          {/* Payment Methods */}
          <div className="space-y-6">
            <h3 className="font-headline text-xl text-on-surface">Choose Payment Method</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Credit/Debit Card Option */}
              <div
                onClick={() => setSelectedMethod('card')}
                className={`bg-surface-container-lowest p-8 rounded-lg border cursor-pointer transition-all ${selectedMethod === 'card' ? 'border-primary/40 shadow-sm' : 'border-outline-variant/10 hover:border-primary/20'}`}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <input type="radio" checked={selectedMethod === 'card'} onChange={() => setSelectedMethod('card')} className="text-primary focus:ring-primary w-4 h-4" />
                    <CreditCard size={22} className="text-primary" />
                    <span className="font-headline text-lg">Credit / Debit Card</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-surface-container rounded-sm flex items-center justify-center text-[8px] font-bold text-on-surface-variant">VISA</div>
                    <div className="w-8 h-5 bg-surface-container rounded-sm flex items-center justify-center text-[8px] font-bold text-on-surface-variant">MC</div>
                  </div>
                </div>
                
                {selectedMethod === 'card' && (
                  <form className="grid grid-cols-2 gap-6" onSubmit={e => e.preventDefault()} onClick={e => e.stopPropagation()}>
                    <div className="col-span-2">
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Card Number</label>
                      <input className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 font-body tracking-[0.2em]" placeholder="XXXX XXXX XXXX XXXX" type="text"/>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Expiry Date</label>
                      <input className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 font-body" placeholder="MM / YY" type="text"/>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">CVV</label>
                      <input className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 font-body" placeholder="***" type="password"/>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-2">Name on Card</label>
                      <input className="w-full bg-transparent border-0 border-b border-outline-variant focus:border-primary focus:ring-0 px-0 py-3 font-body" placeholder="As it appears on your card" type="text"/>
                    </div>
                  </form>
                )}
              </div>

              {/* UPI / Net Banking */}
              <div
                onClick={() => setSelectedMethod('upi')}
                className={`bg-surface-container-low p-6 rounded-lg flex items-center justify-between cursor-pointer transition-all ${selectedMethod === 'upi' ? 'border border-primary/40 shadow-sm bg-surface-container-lowest' : 'border border-transparent hover:bg-surface-container'}`}
              >
                <div className="flex items-center gap-4">
                  <input type="radio" checked={selectedMethod === 'upi'} onChange={() => setSelectedMethod('upi')} className="text-primary focus:ring-primary w-4 h-4" />
                  <Landmark size={22} className="text-on-surface-variant" />
                  <span className="font-headline text-lg text-on-surface-variant">UPI / Net Banking</span>
                </div>
                <div className="flex gap-3 opacity-60">
                  <Wallet size={12} />
                  <Banknote size={12} />
                </div>
              </div>

              {/* Cash on Delivery */}
              <div
                onClick={() => setSelectedMethod('cod')}
                className={`bg-surface-container-low p-6 rounded-lg flex items-center justify-between cursor-pointer transition-all ${selectedMethod === 'cod' ? 'border border-primary/40 shadow-sm bg-surface-container-lowest' : 'border border-transparent hover:bg-surface-container'}`}
              >
                <div className="flex items-center gap-4">
                  <input type="radio" checked={selectedMethod === 'cod'} onChange={() => setSelectedMethod('cod')} className="text-primary focus:ring-primary w-4 h-4" />
                  <CreditCard size={22} className="text-on-surface-variant" />
                  <div className="flex flex-col">
                    <span className="font-headline text-lg text-on-surface-variant">Cash on Delivery</span>
                    <span className="text-[10px] text-on-surface-variant/70 uppercase">Available for retail orders</span>
                  </div>
                </div>
                <Info size={18} className="text-on-surface-variant" />
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="pt-8 border-t border-outline-variant/10">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative w-10 h-5 bg-surface-container rounded-full transition-colors group-hover:bg-surface-container-high">
                <div className="absolute left-1 top-1 w-3 h-3 bg-primary rounded-full transition-transform translate-x-5"></div>
              </div>
              <span className="text-on-surface font-body text-sm">Billing address same as shipping address</span>
            </label>
            {shippingData && (
              <div className="mt-4 p-6 bg-surface-container-low/50 rounded-lg text-xs text-on-surface-variant leading-relaxed">
                {shippingData.shippingName}, {shippingData.shippingAddress}, {shippingData.shippingCity}, {shippingData.shippingState} {shippingData.shippingZip}
              </div>
            )}
          </div>

          {/* Action Area */}
          <div className="flex flex-col gap-4">
            <button
              onClick={handleCompleteOrder}
              disabled={isSubmitting || items.length === 0}
              className="w-full bg-primary text-on-primary py-5 rounded-md font-headline text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Lock size={18} />
              {isSubmitting ? 'Processing Order...' : 'Complete Order'}
            </button>
            <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-[0.2em]">Your data is encrypted and secure</p>
          </div>
        </section>

        {/* Order Summary (Right Column) */}
        <aside className="w-full lg:w-96 space-y-8">
          <div className="bg-surface-container-low p-8 rounded-lg space-y-8">
            <h3 className="font-headline text-xl text-primary border-b border-outline-variant/20 pb-4">Order Summary</h3>
            {/* Items */}
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-24 bg-surface-container-highest rounded-sm overflow-hidden shrink-0">
                    <img className="w-full h-full object-cover" src={item.image || "https://placehold.co/80x96"} alt={item.name} />
                  </div>
                  <div className="flex flex-col justify-between py-1">
                    <div>
                      <h4 className="font-headline text-sm text-on-surface">{item.name}</h4>
                      <p className="text-xs text-on-surface-variant">{item.variant}</p>
                      {item.quantity > 1 && <p className="text-xs text-on-surface-variant mt-1">Qty: {item.quantity}</p>}
                    </div>
                    <span className="font-body text-sm font-semibold">₹ {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-sm text-on-surface-variant italic">Your cart is empty.</p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="pt-6 border-t border-outline-variant/20 space-y-3">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>₹ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Artisan Shipping</span>
                <span className={shippingFee === 0 ? "text-secondary font-medium uppercase text-xs tracking-wider" : ""}>
                  {shippingFee === 0 ? "Complimentary" : `₹ ${shippingFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>GST (Estimated 12%)</span>
                <span>₹ {gst.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-4 text-lg font-headline text-primary border-t border-outline-variant/10">
                <span>Total Due</span>
                <span>₹ {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Promo Code */}
            <div className="relative pt-4">
              <input className="w-full bg-surface-container-lowest border-0 rounded p-3 text-xs uppercase tracking-widest placeholder:text-on-surface-variant/40" placeholder="Promo Code" type="text"/>
              <button className="absolute right-3 top-[1.5rem] text-primary text-xs font-bold uppercase tracking-widest">Apply</button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-col items-center gap-6 pt-4">
            <div className="flex items-center justify-center flex-wrap gap-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-label font-bold uppercase tracking-widest">PCI DSS</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield size={14} />
                <span className="text-[10px] font-label font-bold uppercase tracking-widest">SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCcw size={14} />
                <span className="text-[10px] font-label font-bold uppercase tracking-widest">14 Day Return</span>
              </div>
            </div>
            <p className="text-[10px] text-on-surface-variant/60 text-center leading-relaxed max-w-[240px]">
              By completing this order, you agree to our <Link className="underline" to="/terms-of-service">Terms of Service</Link> and <Link className="underline" to="/privacy-policy">Privacy Policy</Link> regarding high-value heritage goods.
            </p>
          </div>
        </aside>
      </main>

      <Footer />
    </div>
  );
}

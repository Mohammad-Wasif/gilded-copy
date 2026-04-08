import { Link } from 'react-router-dom';
import { Footer } from '../../components/Footer/Footer';

export default function Payment() {
  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/10 min-h-screen flex flex-col">
      {/* TopAppBar: Center-aligned, Distraction-free */}
      <header className="bg-surface-bright flex justify-between items-center px-8 h-20 w-full max-w-7xl mx-auto sticky top-0 z-50 border-b border-outline-variant/10">
        <div className="flex-1">
          <Link className="text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2 font-headline text-sm uppercase tracking-widest" to="/checkout">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Checkout
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

      <main className="flex-grow max-w-7xl mx-auto px-8 py-12 lg:py-20 flex flex-col lg:flex-row gap-16 w-full">
        {/* SideNavBar (Contextual Navigation for Checkout Steps) */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-8">
          <div className="space-y-1">
            <h2 className="font-headline text-2xl text-primary tracking-tight">Secure Checkout</h2>
            <p className="font-body text-xs text-on-surface-variant uppercase tracking-widest">Modern Heritage Craft</p>
          </div>
          <nav className="flex flex-col gap-2">
            <Link to="/cart" className="flex items-center gap-3 text-on-surface-variant p-3 opacity-60 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="font-headline text-lg tracking-tight">Cart</span>
            </Link>
            <Link to="/checkout" className="flex items-center gap-3 text-on-surface-variant p-3 opacity-60 hover:opacity-100 transition-opacity">
              <span className="material-symbols-outlined">local_shipping</span>
              <span className="font-headline text-lg tracking-tight">Checkout</span>
            </Link>
            <div className="flex items-center gap-3 text-primary font-bold bg-surface-container-lowest rounded-md p-3 shadow-sm shadow-black/5">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
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

          {/* Payment Methods */}
          <div className="space-y-6">
            <h3 className="font-headline text-xl text-on-surface">Choose Payment Method</h3>
            <div className="grid grid-cols-1 gap-4">
              {/* Credit/Debit Card Option (Active State) */}
              <div className="bg-surface-container-lowest p-8 rounded-lg border border-primary/10 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">credit_card</span>
                    <span className="font-headline text-lg">Credit / Debit Card</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-8 h-5 bg-surface-container rounded-sm flex items-center justify-center text-[8px] font-bold text-on-surface-variant">VISA</div>
                    <div className="w-8 h-5 bg-surface-container rounded-sm flex items-center justify-center text-[8px] font-bold text-on-surface-variant">MC</div>
                  </div>
                </div>
                
                <form className="grid grid-cols-2 gap-6">
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
              </div>

              {/* UPI / Net Banking */}
              <div className="bg-surface-container-low p-6 rounded-lg flex items-center justify-between group cursor-pointer hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
                  <span className="font-headline text-lg text-on-surface-variant group-hover:text-on-surface">UPI / Net Banking</span>
                </div>
                <div className="flex gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-xs">account_balance_wallet</span>
                  <span className="material-symbols-outlined text-xs">universal_currency</span>
                </div>
              </div>

              {/* Cash on Delivery */}
              <div className="bg-surface-container-low p-6 rounded-lg flex items-center justify-between group cursor-pointer hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-on-surface-variant">payments</span>
                  <div className="flex flex-col">
                    <span className="font-headline text-lg text-on-surface-variant group-hover:text-on-surface">Cash on Delivery</span>
                    <span className="text-[10px] text-on-surface-variant/70 uppercase">Available for retail orders</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">info</span>
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
            <div className="mt-4 p-6 bg-surface-container-low/50 rounded-lg text-xs text-on-surface-variant leading-relaxed">
              124 Artisan Row, Textile District, Mumbai, MH 400012, India
            </div>
          </div>

          {/* Action Area */}
          <div className="flex flex-col gap-4">
            <button className="w-full bg-primary text-on-primary py-5 rounded-md font-headline text-lg flex items-center justify-center gap-3 hover:opacity-90 active:scale-[0.98] transition-all">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
              Complete Order
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
              <div className="flex gap-4">
                <div className="w-20 h-24 bg-surface-container-highest rounded-sm overflow-hidden shrink-0">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA2qDfRQwyuenfuMPfrbZOQPGr5sgXN2RFo07AEehIzDHIQxqXS4UkI1M6GNIsxOxUV5JMsAlTjQCQv7ey_RrSeI77X6iwdhSzfoEByQdHvST9Qak7ofEN1TeGHkKOwI0aIJsZgOzDMgx09v74p1gwanW1ljm7RW66EsbYGaDe5fGfuDUWWVdk3nd70TpLeNJnkCY4D3o1PzWpG43UPtCr0xzsH859Kh2CBdj6fMoexRzGlrqFtjGqZfk4Ruh4Rb-CCiN3QkZyUOz8"/>
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-headline text-sm text-on-surface">The Empress Stole</h4>
                    <p className="text-xs text-on-surface-variant">Hand-woven Zari, Deep Crimson</p>
                  </div>
                  <span className="font-body text-sm font-semibold">₹ 42,500</span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-20 h-24 bg-surface-container-highest rounded-sm overflow-hidden shrink-0">
                  <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRTmOAiCmm9dkCMOhy3f0SHImCY0BTHIprfpzKGFXY7IiHC190Lzn-hT1eId-Sw7j-VTTo7rqZeGxxHLWS7wWcU-hmHdN3khYVRg5KQnerkNaj8lvi9mf55stLi5r3nFRVB8C_63E8zDacFYZ325GL3kJ9S3PcwIkcP2FipWYiSNXCvc5kGBrGLuc0eWiggnoC_fJzHeYRAg6rWs0Y2TVIf7nuQ2_BopkFVLBwzx0hk9wLX2rR66N6VwFSQ_Xi80k1VNrCf84X49g"/>
                </div>
                <div className="flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-headline text-sm text-on-surface">Royal Gilded Pouch</h4>
                    <p className="text-xs text-on-surface-variant">Pearl &amp; Gold Beadwork</p>
                  </div>
                  <span className="font-body text-sm font-semibold">₹ 18,200</span>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="pt-6 border-t border-outline-variant/20 space-y-3">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal</span>
                <span>₹ 60,700</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Artisan Shipping</span>
                <span className="text-secondary font-medium uppercase text-xs tracking-wider">Complimentary</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>GST (Estimated)</span>
                <span>₹ 7,284</span>
              </div>
              <div className="flex justify-between pt-4 text-lg font-headline text-primary border-t border-outline-variant/10">
                <span>Total Due</span>
                <span>₹ 67,984</span>
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
                <span className="material-symbols-outlined text-sm">verified_user</span>
                <span className="text-[10px] font-label font-bold uppercase tracking-widest">PCI DSS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">shield</span>
                <span className="text-[10px] font-label font-bold uppercase tracking-widest">SSL Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">published_with_changes</span>
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

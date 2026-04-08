import { Instagram, LayoutGrid, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => (
  <footer className="bg-surface-container-low w-full pt-20 pb-10 border-t border-outline-variant/30">
    <div className="max-w-screen-2xl mx-auto px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
        <div className="space-y-6">
          <div className="text-2xl font-headline italic text-primary tracking-tight">
            Hindustan Embroidery
          </div>
          <p className="text-sm font-body text-on-surface-variant leading-relaxed max-w-xs">
            Dedicated to the preservation and supply of high-end traditional embroidery materials for artisans worldwide. We believe every stitch tells a story.
          </p>
          <div className="flex gap-5 text-primary">
            <Link to="/" className="hover:opacity-70 transition-opacity"><Instagram size={20} /></Link>
            <Link to="/" className="hover:opacity-70 transition-opacity"><LayoutGrid size={20} /></Link>
            <Link to="/" className="hover:opacity-70 transition-opacity"><Mail size={20} /></Link>
          </div>
        </div>

        <div>
          <h5 className="font-headline font-bold text-primary mb-6 text-sm uppercase tracking-widest">Shopping</h5>
          <ul className="space-y-4 font-body text-sm text-on-surface-variant">
            <li><Link to="/shop" className="hover:text-primary transition-colors">Wholesale</Link></li>
            <li><Link to="/shipping-returns" className="hover:text-primary transition-colors">Shipping</Link></li>
            <li><Link to="/shipping-returns" className="hover:text-primary transition-colors">Returns</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Custom Orders</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-headline font-bold text-primary mb-6 text-sm uppercase tracking-widest">Company</h5>
          <ul className="space-y-4 font-body text-sm text-on-surface-variant">
            <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
            <li><Link to="/shipping-returns" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="font-headline font-bold text-primary mb-6 text-sm uppercase tracking-widest">Stay Connected</h5>
          <p className="text-sm font-body text-on-surface-variant mb-6">
            Subscribe for early access to new collections and artisanal tutorials.
          </p>
          <form className="flex flex-col gap-3">
            <div className="relative">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full bg-white border border-outline-variant/30 px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm"
              />
              <button type="button" className="absolute right-2 top-1.5 bg-primary text-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-primary/90 transition-colors rounded-sm">
                Join
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="border-t border-outline-variant/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-label uppercase tracking-[0.2em] text-on-surface-variant/60">
          © 2024 Hindustan Embroidery. Crafting Heritage Excellence.
        </p>
        <div className="flex gap-8 text-[10px] font-label uppercase tracking-widest text-on-surface-variant/40">
          <Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
        </div>
      </div>
    </div>
  </footer>
);

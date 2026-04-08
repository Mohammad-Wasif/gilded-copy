import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Search, User, Heart, ShoppingCart, Instagram, Mail, Globe, MapPin, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

// ── Standalone Navbar matching the Stitch design ─────────────────────────────
const ContactNavbar = () => {
  const { itemCount } = useCart();

  return (
    <header className="bg-surface/95 backdrop-blur-md shadow-sm shadow-on-surface/5 sticky top-0 z-50">
    <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
      <div className="flex items-center gap-12">
        <Link to="/" className="text-2xl font-headline italic text-primary tracking-tight">
          Hindustan Embroidery
        </Link>
        <nav className="hidden md:flex items-center gap-8 font-headline text-sm tracking-wide">
          <Link to="/shop" className="text-on-surface-variant hover:text-primary transition-colors">Collections</Link>
          <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors">Wholesale</Link>
          <Link to="/contact" className="text-primary border-b border-primary pb-0.5">Contact</Link>
        </nav>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center border-b border-outline-variant/30 py-1 gap-2">
          <Search size={16} className="text-on-surface-variant" />
          <input
            type="text"
            placeholder="Search artisanal threads..."
            className="bg-transparent border-none focus:ring-0 text-sm w-48 font-body placeholder:text-on-surface-variant/60 outline-none"
          />
        </div>
        <div className="flex items-center gap-4 text-primary">
          <Link to="/login" className="hover:opacity-80 transition-opacity"><User size={20} /></Link>
          <button className="hover:opacity-80 transition-opacity"><Heart size={20} /></button>
          <Link to="/cart" className="hover:opacity-80 transition-opacity relative">
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-on-primary text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{itemCount}</span>
            )}
          </Link>
        </div>
      </div>
    </div>
  </header>
  );
};

// ── Standalone Footer matching the Stitch design ──────────────────────────────
const ContactFooter = () => (
  <footer className="w-full pt-16 pb-8 bg-surface-container-low border-t border-outline-variant/20">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-8 max-w-screen-2xl mx-auto">
      <div className="space-y-6">
        <h3 className="text-xl font-headline italic text-primary">Hindustan Embroidery</h3>
        <p className="font-body text-sm text-on-surface-variant leading-relaxed">
          Preserving the sanctity of traditional Indian metal embroidery through sustainable supply chains and artisan support.
        </p>
        <div className="flex gap-4 text-primary">
          <a href="#" className="hover:opacity-70 transition-opacity"><Globe size={20} /></a>
          <a href="mailto:concierge@hindustandembroidery.com" className="hover:opacity-70 transition-opacity"><Mail size={20} /></a>
          <a href="#" className="hover:opacity-70 transition-opacity"><MapPin size={20} /></a>
        </div>
      </div>

      <div className="space-y-6">
        <h4 className="text-primary font-bold text-xs uppercase tracking-widest">Shop &amp; Service</h4>
        <ul className="space-y-4 font-body text-sm text-on-surface-variant">
          <li><Link to="/" className="hover:text-primary transition-colors">About</Link></li>
          <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
          <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
        </ul>
      </div>

      <div className="space-y-6">
        <h4 className="text-primary font-bold text-xs uppercase tracking-widest">Policies</h4>
        <ul className="space-y-4 font-body text-sm text-on-surface-variant">
          <li><Link to="/shipping-returns" className="hover:text-primary transition-colors">Shipping</Link></li>
          <li><Link to="/shipping-returns" className="hover:text-primary transition-colors">Returns</Link></li>
          <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link></li>
          <li><Link to="/terms-of-service" className="hover:text-primary transition-colors">Terms</Link></li>
        </ul>
      </div>

      <div className="space-y-6">
        <h4 className="text-primary font-bold text-xs uppercase tracking-widest">Journal</h4>
        <p className="font-body text-sm text-on-surface-variant">Subscribe to receive heritage insights and new collection previews.</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="Email address"
            className="bg-transparent border-b border-primary/30 focus:border-primary focus:ring-0 text-sm py-2 w-full font-body outline-none"
          />
          <button className="text-primary hover:translate-x-1 transition-transform">
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>

    <div className="mt-16 pt-8 border-t border-outline-variant/10 text-center max-w-screen-2xl mx-auto px-8">
      <p className="font-body text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/60">
        © 2024 Hindustan Embroidery. Handcrafted Excellence.
      </p>
    </div>
  </footer>
);

// ── Main Contact Page ─────────────────────────────────────────────────────────
export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'Bespoke Commission',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
      <ContactNavbar />

      <main className="flex-1">
        {/* ── Hero / Intro ──────────────────────────────────────── */}
        <section className="max-w-screen-2xl mx-auto px-8 pt-20 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
            {/* Left: info panel */}
            <div className="space-y-16">
              <div className="space-y-6">
                <span className="text-[10px] font-label uppercase tracking-[0.4em] text-on-surface-variant/60 block">
                  Get in Touch
                </span>
                <h1 className="font-headline text-5xl lg:text-6xl text-primary leading-[1.1] italic">
                  Inquiries &amp; Private<br />Appointments
                </h1>
                <div className="h-px w-16 bg-primary/20" />
                <p className="text-lg text-on-surface-variant leading-relaxed max-w-lg">
                  Whether you are seeking a bespoke commission or have questions about our seasonal collections, our artisans are here to assist you in preserving heritage.
                </p>
              </div>

              {/* Studio details */}
              <div className="space-y-10">
                <div className="space-y-3">
                  <h3 className="font-headline text-xl text-primary italic">The New Delhi Studio</h3>
                  <p className="text-sm text-on-surface-variant leading-loose font-body">
                    B-42, First Floor, Okhla Phase III<br />
                    Industrial Estate, New Delhi 110020<br />
                    India
                  </p>
                  <a
                    href="mailto:concierge@hindstanembroidery.com"
                    className="text-sm text-primary hover:opacity-70 transition-opacity border-b border-primary/30 pb-0.5 inline-block font-headline italic"
                  >
                    concierge@hindstanembroidery.com
                  </a>
                </div>

                <div className="space-y-3 pt-8 border-t border-outline-variant/10">
                  <h4 className="font-headline text-lg text-primary italic">Partner with us</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed font-body max-w-sm">
                    For luxury boutiques and global retail partnerships, explore our curated wholesale catalog.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-xs font-label font-bold uppercase tracking-widest text-primary group mt-2"
                  >
                    Wholesale Inquiry
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Right: contact form */}
            <div className="bg-surface-bright border border-outline-variant/10 shadow-sm p-10 lg:p-14 rounded-sm">
              {submitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="text-primary" size={28} />
                  </div>
                  <h3 className="font-headline text-3xl text-primary italic">Message Sent</h3>
                  <p className="text-on-surface-variant text-sm max-w-xs leading-relaxed">
                    Thank you for reaching out. Our artisans will respond within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-7">
                  <div>
                    <h3 className="font-headline text-3xl text-primary italic mb-2">Atelier Inquiry</h3>
                    <p className="text-xs text-on-surface-variant uppercase tracking-widest font-label">
                      All fields are required
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant block">
                        First Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Aditi"
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant block">
                        Last Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Sharma"
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant block">
                      Subject of Inquiry
                    </label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm appearance-none cursor-pointer"
                    >
                      <option>Bespoke Commission</option>
                      <option>Wholesale Partnership</option>
                      <option>Collection Availability</option>
                      <option>Restoration Services</option>
                      <option>General Inquiry</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant block">
                      Your Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Describe your vision or inquiry..."
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all font-body rounded-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary text-on-primary py-4 font-label font-bold uppercase tracking-[0.25em] text-sm hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-3 group rounded-sm"
                  >
                    Send Message
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* ── Quote Banner ──────────────────────────────────────── */}
        <section className="mt-24 bg-primary py-24 px-8 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <blockquote className="font-headline text-3xl lg:text-5xl text-on-primary italic leading-tight">
              "True luxury is found in the patience of the hand."
            </blockquote>
            <p className="text-on-primary/70 text-sm font-body max-w-xl mx-auto leading-relaxed">
              Our atelier is open for private consultations by appointment only. We welcome you to experience the tactile beauty of our heritage crafts first-hand.
            </p>
          </div>
        </section>
      </main>

      <ContactFooter />
    </div>
  );
}

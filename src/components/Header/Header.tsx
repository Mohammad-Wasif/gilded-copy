import { ChevronDown, Search, User, Heart, ShoppingCart, Menu, X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { api } from '../../lib/api';
import { Category } from '../../lib/types';

export const AnnouncementBar = () => (
  <div className="bg-primary text-tertiary-fixed py-2 overflow-hidden border-b border-primary-container/20">
    <div className="flex whitespace-nowrap">
      <div className="animate-marquee flex items-center shrink-0">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center">
            <span className="mx-8 text-[10px] font-semibold uppercase tracking-widest">Limited Time: Get 20% Off on Starter Kits!</span>
            <span className="mx-8 text-[10px] font-semibold uppercase tracking-widest">Buy 5+ Zari Spools and Save 15%</span>
            <span className="mx-8 text-[10px] font-semibold uppercase tracking-widest">Free Global Shipping on Wholesale Orders over $500</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const Navbar = () => {
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  useEffect(() => {
    api.catalog.getCategoryTree().then(res => {
      if (res.success) setCategories(res.data);
    }).catch(() => {});
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header className="bg-surface/95 backdrop-blur-md shadow-sm shadow-on-surface/5 sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-6 md:px-8 py-4 max-w-screen-2xl mx-auto">
        {/* Hamburger — mobile only */}
        <button
          onClick={() => setMobileOpen(true)}
          className="md:hidden p-1 text-primary hover:opacity-70 transition-opacity"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        <Link to="/" className="text-2xl font-headline italic text-primary tracking-tight">
          Hindustan Embroidery
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-8 text-sm tracking-wide">
          <div className="relative group">
            <button className="text-primary border-b-2 border-primary pb-1 flex items-center gap-1 transition-opacity duration-300 font-headline">
              Categories
              <ChevronDown size={14} />
            </button>
            <div className="hidden group-hover:block absolute top-full left-0 w-56 bg-white editorial-shadow mt-2 py-4 z-50 border border-outline-variant/10">
              {categories.length > 0 ? categories.map((cat) => (
                <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="block px-6 py-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors text-sm">
                  {cat.name}
                </Link>
              )) : (
                <span className="block px-6 py-2 text-on-surface-variant/50 text-sm italic">Loading...</span>
              )}
              <div className="border-t border-outline-variant/10 mt-2 pt-2">
                <Link to="/shop" className="block px-6 py-2 text-primary font-semibold hover:bg-surface-container-low transition-colors text-sm">
                  View All &rarr;
                </Link>
              </div>
            </div>
          </div>
          <Link to="/shop" className="text-on-surface-variant hover:text-primary transition-colors font-headline">Collections</Link>
          <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors font-headline">Wholesale</Link>
          <Link to="/contact" className="text-on-surface-variant hover:text-primary transition-colors font-headline">Contact</Link>
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          {/* Desktop search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get('q');
              if (q) navigate(`/shop?q=${encodeURIComponent(q as string)}`);
            }}
            className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/20 focus-within:border-primary/40 transition-all"
          >
            <Search size={18} className="text-on-surface-variant" />
            <input
              name="q"
              type="text"
              placeholder="Search Zari, Beads, Lace..."
              className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:text-on-surface-variant/60 font-body ml-2"
            />
          </form>
          <div className="flex items-center gap-4 md:gap-5">
            <Link to="/login" className="hidden sm:block group hover:opacity-80 transition-opacity">
              <User size={20} className="text-primary" />
            </Link>
            <button className="hidden sm:block group hover:opacity-80 transition-opacity">
              <Heart size={20} className="text-primary" />
            </button>
            <Link to="/cart" className="group hover:opacity-80 transition-opacity relative">
              <ShoppingCart size={20} className="text-primary" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{itemCount}</span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ──────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[60] transition-opacity duration-300 md:hidden ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileOpen(false)}
      />
      {/* Drawer panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[85vw] max-w-sm bg-surface z-[70] transform transition-transform duration-300 ease-out md:hidden flex flex-col ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/10">
          <Link to="/" className="text-xl font-headline italic text-primary tracking-tight">
            Hindustan Embroidery
          </Link>
          <button onClick={() => setMobileOpen(false)} className="p-1 text-on-surface-variant hover:text-primary transition-colors" aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        {/* Drawer search */}
        <div className="px-6 py-4 border-b border-outline-variant/10">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get('mq');
              if (q) {
                navigate(`/shop?q=${encodeURIComponent(q as string)}`);
                setMobileOpen(false);
              }
            }}
            className="flex items-center bg-surface-container-low px-4 py-3 rounded-full border border-outline-variant/20 focus-within:border-primary/40 transition-all"
          >
            <Search size={18} className="text-on-surface-variant shrink-0" />
            <input
              name="mq"
              type="text"
              placeholder="Search products..."
              className="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-on-surface-variant/60 font-body ml-2"
            />
          </form>
        </div>

        {/* Drawer nav links */}
        <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
          <Link to="/" className="block py-3 text-on-surface font-headline text-lg border-b border-outline-variant/10">Home</Link>
          <Link to="/shop" className="block py-3 text-on-surface font-headline text-lg border-b border-outline-variant/10">Collections</Link>

          {/* Collapsible Categories */}
          <button
            onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
            className="w-full flex items-center justify-between py-3 text-on-surface font-headline text-lg border-b border-outline-variant/10"
          >
            Categories
            <ChevronDown size={16} className={`text-on-surface-variant transition-transform duration-200 ${mobileCategoriesOpen ? 'rotate-180' : ''}`} />
          </button>
          {mobileCategoriesOpen && (
            <div className="pl-4 space-y-0.5 pb-2">
              {categories.map(cat => (
                <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="block py-2.5 text-on-surface-variant hover:text-primary transition-colors text-sm font-body">
                  {cat.name}
                </Link>
              ))}
              {categories.length === 0 && <span className="block py-2 text-on-surface-variant/50 text-sm italic">Loading...</span>}
            </div>
          )}

          <Link to="/contact" className="block py-3 text-on-surface font-headline text-lg border-b border-outline-variant/10">Contact</Link>
          <Link to="/faq" className="block py-3 text-on-surface font-headline text-lg border-b border-outline-variant/10">FAQ</Link>
        </nav>

        {/* Drawer footer actions */}
        <div className="px-6 py-5 border-t border-outline-variant/10 flex items-center gap-6">
          <Link to="/login" className="flex items-center gap-2 text-sm font-headline text-primary">
            <User size={18} /> Account
          </Link>
          <button className="flex items-center gap-2 text-sm font-headline text-on-surface-variant">
            <Heart size={18} /> Wishlist
          </button>
        </div>
      </div>
    </header>
  );
};

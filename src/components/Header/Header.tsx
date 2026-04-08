import { ChevronDown, Search, User, Heart, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

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

  return (
    <header className="bg-surface/95 backdrop-blur-md shadow-sm shadow-on-surface/5 sticky top-0 z-50">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
      <Link to="/" className="text-2xl font-headline italic text-primary tracking-tight">
        Hindustan Embroidery
      </Link>

      <nav className="hidden md:flex items-center space-x-8 text-sm tracking-wide">
        <div className="relative group">
          <button className="text-primary border-b-2 border-primary pb-1 flex items-center gap-1 transition-opacity duration-300 font-headline">
            Categories
            <ChevronDown size={14} />
          </button>
          <div className="hidden group-hover:block absolute top-full left-0 w-48 bg-white editorial-shadow mt-2 py-4 z-50 border border-outline-variant/10">
            {["Zari Threads", "Sequins", "Beads", "Laces", "Tools"].map((cat) => (
              <Link key={cat} to="/shop" className="block px-6 py-2 text-on-surface-variant hover:text-primary transition-colors">
                {cat}
              </Link>
            ))}
          </div>
        </div>
        <Link to="/shop" className="text-on-surface-variant hover:text-primary transition-colors font-headline">Collections</Link>
        <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors font-headline">Wholesale</Link>
        <Link to="/contact" className="text-on-surface-variant hover:text-primary transition-colors font-headline">Contact</Link>
      </nav>

      <div className="flex items-center gap-6">
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
        <div className="flex items-center gap-5">
          <Link to="/login" className="group flex flex-col items-center gap-0.5 hover:opacity-80 transition-opacity">
            <User size={20} className="text-primary" />
          </Link>
          <button className="group flex flex-col items-center gap-0.5 hover:opacity-80 transition-opacity">
            <Heart size={20} className="text-primary" />
          </button>
          <Link to="/cart" className="group flex flex-col items-center gap-0.5 hover:opacity-80 transition-opacity relative">
            <ShoppingCart size={20} className="text-primary" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{itemCount}</span>
            )}
          </Link>
        </div>
      </div>
    </div>
  </header>
  );
};

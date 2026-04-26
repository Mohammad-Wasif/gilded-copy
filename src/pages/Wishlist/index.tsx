import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ShoppingCart, Share2, Send, LinkIcon, Heart, Sparkles } from 'lucide-react';

interface WishlistItem {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  image: string;
}

const initialWishlistItems: WishlistItem[] = [
  {
    id: '1',
    name: 'Vintage Gold Zari',
    subtitle: 'Authentic 24k Plating',
    price: '₹420.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVBSKrUHiSc_ifSNYdrY_SycJQeMdzY4G1kOLOSzoHoR9CjIpwdElwtt6oE6J6LxrWvL3pT54iiQtXBemR2C02g3MPyebK_ZZscka48eXaHRLIofOEbeHmAGvbkCwZtfjn-ggTYnDznEps0dtXFCt-HkEQw_jX_z2GYAb338w7mhasfRvHCkIat6CkTFANBAiVq2USqNSg6rSpBRgBa2UTxMhgmVgJRbiIh4vnj7bqZChxnuG9rvvPcMsmF_jXN-uisNh-SBwILgA',
  },
  {
    id: '2',
    name: 'Hand-Carved Silk Beads',
    subtitle: 'Collection of 50',
    price: '₹185.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaKxVrsAbnHlR2kRGBChEm3XkNdW_iDL87XEZjIOQswhkwfRvvSjn45i9MLmKZTr5DQ7xzSGKw-z5xpiV8WifxK3uUe0JkTnbuRt1WyJYNKQSHYzG38PiPtfU6tRy-UQMMpVyImyoQivfLkCyQ9pPDOD-zPhKaO9WRcxG8c_6VDavxdeuglOTRnTborShzHZCl3r7gpUhz49cWMOMVhI6f6OHPxml8SCTiounPAwwIqSIa0_-Z6wCbJjc9OesFvGv8ZC4I9JLHKak',
  },
  {
    id: '3',
    name: 'Mahogany Atelier Hoop',
    subtitle: '12-inch Diameter',
    price: '₹95.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiLV4n1KyFAA8udpj8DhbmTv9HV_MULoa-HiY2SOho9rLD6e9YGpN1hsDoATzgSX5O_esPCE0GzFw0oX-sRmyxkEwQNdNgEi3YIANg1YyKVKPlGL3tPMaT_u-qY12Nq3eEhsNZNoyt0_lGzEUhrprH8qvFja52_gtV65tpNujP3A_Q-ar2I6WsR_y2QJehIaBFJLkUi5U8kJtOLNXcDJB1TFiji_vLQ__hvmqkI1WXtCQv8p3avmh-jebX7IfeFs9z915h4XstMQA',
  },
  {
    id: '4',
    name: 'Pure Silver Bullion',
    subtitle: 'Sterling Grade Wire',
    price: '₹140.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBVBSKrUHiSc_ifSNYdrY_SycJQeMdzY4G1kOLOSzoHoR9CjIpwdElwtt6oE6J6LxrWvL3pT54iiQtXBemR2C02g3MPyebK_ZZscka48eXaHRLIofOEbeHmAGvbkCwZtfjn-ggTYnDznEps0dtXFCt-HkEQw_jX_z2GYAb338w7mhasfRvHCkIat6CkTFANBAiVq2USqNSg6rSpBRgBa2UTxMhgmVgJRbiIh4vnj7bqZChxnuG9rvvPcMsmF_jXN-uisNh-SBwILgA',
  },
  {
    id: '5',
    name: 'Uncut Ruby Seed Pack',
    subtitle: '25 Ethical Stones',
    price: '₹1,250.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaKxVrsAbnHlR2kRGBChEm3XkNdW_iDL87XEZjIOQswhkwfRvvSjn45i9MLmKZTr5DQ7xzSGKw-z5xpiV8WifxK3uUe0JkTnbuRt1WyJYNKQSHYzG38PiPtfU6tRy-UQMMpVyImyoQivfLkCyQ9pPDOD-zPhKaO9WRcxG8c_6VDavxdeuglOTRnTborShzHZCl3r7gpUhz49cWMOMVhI6f6OHPxml8SCTiounPAwwIqSIa0_-Z6wCbJjc9OesFvGv8ZC4I9JLHKak',
  },
  {
    id: '6',
    name: 'Ivory Chantilly Lace',
    subtitle: 'Hand-loomed in Lyon',
    price: '₹210.00',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiLV4n1KyFAA8udpj8DhbmTv9HV_MULoa-HiY2SOho9rLD6e9YGpN1hsDoATzgSX5O_esPCE0GzFw0oX-sRmyxkEwQNdNgEi3YIANg1YyKVKPlGL3tPMaT_u-qY12Nq3eEhsNZNoyt0_lGzEUhrprH8qvFja52_gtV65tpNujP3A_Q-ar2I6WsR_y2QJehIaBFJLkUi5U8kJtOLNXcDJB1TFiji_vLQ__hvmqkI1WXtCQv8p3avmh-jebX7IfeFs9z915h4XstMQA',
  },
];

const Wishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>(initialWishlistItems);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      setRemovingId(null);
    }, 400);
  };

  return (
    <>
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-tertiary-container/20 text-tertiary rounded-full text-[10px] font-bold uppercase tracking-[0.2em]">
            <Heart size={12} /> Curation
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-primary tracking-tight">Your Wishlist</h1>
          <p className="text-on-surface-variant font-body max-w-lg text-sm leading-relaxed">
            A collection of your selected heritage pieces, awaiting their place in your next masterpiece.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
            {items.length} {items.length === 1 ? 'piece' : 'pieces'}
          </span>
          <button className="inline-flex items-center gap-2 bg-white border border-stone-200 text-stone-700 px-5 py-2.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-stone-50 transition-all active:scale-95 shadow-sm">
            <Share2 size={14} /> Share Wishlist
          </button>
        </div>
      </header>

      {/* Wishlist Grid */}
      {items.length > 0 ? (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16">
          {items.map((item) => (
            <div
              key={item.id}
              className={`group bg-surface-container-lowest rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 ${
                removingId === item.id ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
              }`}
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] overflow-hidden bg-stone-100">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                />
                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-stone-500 hover:text-red-600 hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 active:scale-90"
                  aria-label={`Remove ${item.name} from wishlist`}
                >
                  <X size={16} />
                </button>
                {/* Wishlist Heart Indicator */}
                <div className="absolute top-3 left-3 w-8 h-8 bg-primary/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
                  <Heart size={14} className="text-white fill-white" />
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                <div>
                  <h3 className="font-serif text-lg text-on-surface group-hover:text-primary transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mt-1 font-medium">
                    {item.subtitle}
                  </p>
                </div>
                <div className="flex items-end justify-between">
                  <span className="font-serif text-xl font-bold text-primary">{item.price}</span>
                  <button className="inline-flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-stone-700 transition-colors active:scale-95">
                    <ShoppingCart size={14} /> Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      ) : (
        /* Empty State */
        <section className="flex flex-col items-center justify-center py-24 text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mb-4">
            <Heart size={40} className="text-stone-300" />
          </div>
          <h2 className="text-2xl font-serif text-on-surface">Your wishlist is empty</h2>
          <p className="text-on-surface-variant font-body text-sm max-w-md leading-relaxed">
            Begin curating your collection of heritage pieces. Each item you save here becomes part of your personal atelier archive.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-8 py-3.5 rounded-md text-[11px] font-bold uppercase tracking-[0.2em] hover:shadow-lg transition-all active:scale-95"
          >
            <Sparkles size={16} /> Explore Collections
          </Link>
        </section>
      )}

      {/* Gift a Vision — CTA Section */}
      <section className="bg-primary rounded-sm overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-container to-primary opacity-90" />
        <div className="relative z-10 p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-lg">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Share Your Taste</span>
            <h2 className="text-3xl md:text-4xl font-serif text-white leading-tight">
              Gift a Vision
            </h2>
            <p className="text-white/70 font-body text-sm leading-relaxed">
              Share this curated selection with a collaborator or loved one for a special custom commission.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full md:w-auto">
            <button className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-3.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-50 transition-all active:scale-95 shadow-lg">
              <LinkIcon size={14} /> Share Link
            </button>
            <button className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-8 py-3.5 rounded-sm text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/20 transition-all active:scale-95">
              <Send size={14} /> Send Gift
            </button>
          </div>
        </div>
        {/* Decorative flourish */}
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-tertiary-container/10 rounded-full blur-3xl" />
        <div className="absolute -top-12 -left-8 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
      </section>
    </>
  );
};

export default Wishlist;

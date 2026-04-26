import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, MapPin, Truck, Factory } from 'lucide-react';
import { authClient } from '../../lib/auth-client';
import { api } from '../../lib/api';
import { Product } from '../../lib/types';
import { ProductGridSkeleton } from '../../components/Skeletons';

const fallbackImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuAnqUSLjbRrKKwODC1aB1REM9ewPNxz0JbbIA5IhSdPcXNd06NbPrVsl8lQF9PNmy0SqKQloVKryaE-pt4sWqHP7zwBNxMfzaFJ8QhfT7DWuCVa15HdRYmrPKAuT09_TQ8iz9xjG7eV72-UYNrzEGLnOuTmjbyCsEHZhoqz8W2nECQ0hOeqVVQ-uwjy9QHcKzwrcqOruOxg3_gXR0f3hwcvzTM27dCIFJJCzpxjFduE9ctsypi-zGRvOhxmKTTF64vYjS1VSqq7hJs";

const Dashboard = () => {
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || 'Guest';

  const [archiveProducts, setArchiveProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.catalog.getFeaturedProducts(3).then(res => {
      if (res.success) setArchiveProducts(res.data);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <>
      {/* Compact Header & Top Summary */}
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-primary tracking-tight">Welcome back, {userName}</h1>
          <p className="text-on-surface-variant font-body text-sm mt-1">Curating your heritage collection since 2021.</p>
        </div>
        <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex-shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1">Active Orders</span>
            <span className="text-xl font-serif text-primary">0</span>
          </div>
          <div className="w-px h-8 bg-stone-200 self-end hidden md:block"></div>
          <div className="flex-shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1">Wishlist Items</span>
            <span className="text-xl font-serif text-primary">0</span>
          </div>
          <div className="w-px h-8 bg-stone-200 self-end hidden md:block"></div>
          <div className="flex-shrink-0">
            <span className="text-[10px] uppercase tracking-widest text-stone-400 block mb-1">Lifetime Spend</span>
            <span className="text-xl font-serif text-primary">₹0</span>
          </div>
        </div>
      </header>

      {/* Summary Row */}
      <section className="flex overflow-x-auto no-scrollbar gap-6 mb-12 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth">
        {/* Current Order */}
        <div className="flex-shrink-0 w-[280px] md:flex-1 bg-surface-container-lowest p-6 rounded-sm border border-stone-200 flex flex-col justify-between h-48 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">Current Order</span>
              <h3 className="text-lg font-serif">No Active Orders</h3>
            </div>
            <Truck className="text-stone-300" size={24} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-300"></span>
              <span className="text-xs font-medium text-stone-600 uppercase tracking-wide">None</span>
            </div>
            <Link to="/shop" className="block text-center w-full py-2 bg-stone-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-stone-700 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Wishlist */}
        <div className="flex-shrink-0 w-[280px] md:flex-1 bg-surface-container-lowest p-6 rounded-sm border border-stone-200 flex flex-col justify-between h-48 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">Curation</span>
              <h3 className="text-lg font-serif">Your Wishlist</h3>
            </div>
            <Heart className="text-stone-300" size={24} />
          </div>
          <div className="space-y-3">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-serif text-stone-800">0</span>
              <span className="text-[10px] text-stone-400 uppercase">Items</span>
            </div>
            <Link to="/dashboard/wishlist" className="block text-center w-full py-2 bg-white border border-stone-900 text-stone-900 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-stone-50 transition-colors">
              View Wishlist
            </Link>
          </div>
        </div>

        {/* Member Tier */}
        <div className="flex-shrink-0 w-[280px] md:flex-1 bg-surface-container-lowest p-6 rounded-sm border border-stone-200 flex flex-col justify-between h-48 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1 block">Wholesale Status</span>
              <h3 className="text-lg font-serif">Member</h3>
            </div>
            <Factory className="text-stone-300" size={24} />
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs font-medium text-stone-600 uppercase tracking-wide">Account Active</span>
            </div>
            <button className="w-full py-2 bg-stone-900 text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-stone-700 transition-colors">
              Wholesale Portal
            </button>
          </div>
        </div>
      </section>

      {/* Recommended */}
      <section className="pt-4">
        <div className="mb-8">
          <h2 className="text-2xl font-serif text-on-surface mb-1">Personal Archive</h2>
          <p className="text-stone-500 text-xs font-body">Selected materials based on your design history.</p>
        </div>
        
        {loading ? (
          <ProductGridSkeleton />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
            {archiveProducts.map((prod) => {
              const primaryImage = prod.images?.find(img => img.isPrimary)?.imageUrl || prod.images?.[0]?.imageUrl || fallbackImage;
              return (
                <Link to={`/product/${prod.slug}`} key={prod.id} className="group cursor-pointer">
                  <div className="aspect-[4/5] bg-stone-100 mb-4 overflow-hidden rounded-sm relative">
                    <img 
                      alt={prod.name} 
                      className="w-full h-full object-cover grayscale-[0.3] group-hover:scale-105 transition-transform duration-700" 
                      src={primaryImage}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h4 className="font-serif text-sm group-hover:underline">{prod.name}</h4>
                  <p className="font-bold text-primary text-xs mt-1">₹{prod.basePrice}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
};

export default Dashboard;

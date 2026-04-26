import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Heart, Settings, HelpCircle, LogOut } from 'lucide-react';
import { authClient } from '../../lib/auth-client';

export const DashboardLayout = () => {
  const { data: session } = authClient.useSession();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleSignOut = async () => {
    await authClient.signOut();
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Orders', path: '/dashboard/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Wishlist', path: '/dashboard/wishlist', icon: <Heart size={20} /> },
    { name: 'Profile', path: '/dashboard/profile', icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex flex-1 relative max-w-[1600px] w-full mx-auto">
      {/* Sidebar Navigation */}
      <aside className="hidden md:flex h-[calc(100vh-5rem)] w-64 sticky top-20 bg-stone-100 flex-col pt-10 pb-6 border-r border-stone-200 z-10 shrink-0">
        <div className="px-8 mb-12">
          <h2 className="text-xl font-serif text-rose-900 mb-1 truncate">{session?.user?.name || 'Guest'}</h2>
          <p className="font-sans uppercase tracking-[0.2em] text-[10px] text-stone-500 font-semibold">Master Craftsman</p>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-4 py-4 px-6 transition-all border-l-4 ${
                  isActive 
                    ? 'bg-white text-rose-900 border-rose-900 shadow-sm font-bold' 
                    : 'text-stone-600 border-transparent hover:bg-stone-200'
                }`}
              >
                <div className={isActive ? 'scale-110' : ''}>{item.icon}</div>
                <span className="font-sans uppercase tracking-widest text-xs">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-4 space-y-1">
          <Link to="/contact" className="flex items-center gap-3 text-stone-500 py-3 px-4 hover:text-stone-800 transition-all">
            <HelpCircle size={16} />
            <span className="font-sans uppercase tracking-widest text-[10px]">Support</span>
          </Link>
          <button onClick={handleSignOut} className="w-full flex items-center gap-3 text-stone-500 py-3 px-4 hover:text-stone-800 transition-all">
            <LogOut size={16} />
            <span className="font-sans uppercase tracking-widest text-[10px]">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 px-4 md:px-12 py-10 pb-20 flex flex-col lg:flex-row gap-12">
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
        
        {/* Sticky Right Quick Actions */}
        <aside className="hidden lg:block w-72 h-fit sticky top-32 shrink-0">
          <div className="bg-stone-100 border border-stone-200 rounded-sm p-8 space-y-8">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between group hover:text-primary transition-colors">
                  <span className="text-sm font-medium">Reorder Items</span>
                  <ShoppingBag size={18} className="text-stone-300 group-hover:text-primary transition-colors" />
                </button>
                <Link to="/shop" className="w-full flex items-center justify-between group hover:text-primary transition-colors">
                  <span className="text-sm font-medium">Wholesale Pricing</span>
                  <Settings size={18} className="text-stone-300 group-hover:text-primary transition-colors" />
                </Link>
                <Link to="/contact" className="w-full flex items-center justify-between group hover:text-primary transition-colors">
                  <span className="text-sm font-medium">Contact Support</span>
                  <HelpCircle size={18} className="text-stone-300 group-hover:text-primary transition-colors" />
                </Link>
              </div>
            </div>
            
            <div className="pt-8 border-t border-stone-200">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-4">Account Utility</h3>
              <div className="space-y-4">
                <Link to="/dashboard/profile" className="flex items-center gap-3 text-stone-600 hover:text-primary">
                  <Settings size={18} />
                  <span className="text-xs font-medium uppercase tracking-widest">Profile Settings</span>
                </Link>
              </div>
            </div>

            <div className="bg-rose-900/5 p-6 rounded-sm border border-rose-900/10">
              <p className="text-xs text-rose-900 leading-relaxed font-medium italic">"The details are not the details. They make the design."</p>
              <p className="text-[10px] uppercase text-rose-900/50 mt-2 font-bold">— Atelier Philosophy</p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

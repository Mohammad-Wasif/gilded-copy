import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client';

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const adminIdentifier = session?.user?.email ?? 'Authorized User';

  const navLinks = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Products', path: '/admin/products', icon: 'inventory_2' },
    { name: 'Categories', path: '/admin/categories', icon: 'category' },
    { name: 'Orders', path: '/admin/orders', icon: 'shopping_bag' },
    { name: 'Wholesale Inquiries', path: '/admin/wholesale', icon: 'contract_edit' },
    { name: 'Customers', path: '/admin/customers', icon: 'group' },
    { name: 'Misc', path: '/admin/misc', icon: 'tune' },
    { name: 'Settings', path: '/admin/settings', icon: 'settings' },
  ];

  const handleLogout = async () => {
    await authClient.signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f1e4_0%,#f9f6ef_100%)] text-on-surface md:grid md:grid-cols-[clamp(15rem,22vw,18.5rem)_minmax(0,1fr)]">
      {/* SideNavBar */}
      <nav aria-label="Sidebar" className="hidden min-h-screen flex-col border-r border-primary/10 bg-[linear-gradient(180deg,#5f1b17_0%,#7d261f_100%)] px-[clamp(1.1rem,1.8vw,1.75rem)] pt-[clamp(1.25rem,2vw,2rem)] pb-0 text-white md:flex">
        <div className="mb-8 flex flex-col gap-2 border-b border-white/10 pb-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/70">Hindustan Embroidery</p>
          <h1 className="font-headline text-2xl tracking-tight text-white">Admin Portal</h1>
          <p className="text-sm font-medium text-white/70">Operations for orders, inventory, and artisan workflows</p>
        </div>
        
        <div className="flex flex-col gap-2 font-body text-sm tracking-wide">
          {navLinks.map((link) => {
             const isActive = link.path === '/admin' 
                ? location.pathname === '/admin' || location.pathname === '/admin/'
                : location.pathname.startsWith(link.path);
             
             return (
              <Link 
                key={link.path}
                to={link.path} 
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 font-medium transition-all duration-200 ${isActive ? 'border-white/20 bg-white/12 text-white shadow-[0_12px_30px_-18px_rgba(0,0,0,0.55)]' : 'border-transparent text-white/74 hover:border-white/10 hover:bg-white/8 hover:text-white'}`}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                {link.name}
              </Link>
             );
          })}
        </div>
        
        <div className="mt-6 rounded-t-2xl border border-b-0 border-white/10 bg-white/6 p-4">
          <p className="mb-3 text-xs uppercase tracking-[0.24em] text-white/60">Storefront</p>
          <Link to="/" className="block w-full rounded-xl bg-[#d7a43e] py-3 text-center text-sm font-semibold text-[#4a180f] transition-opacity hover:opacity-90">
            View Boutique
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="min-h-screen min-w-0">
        <header className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-primary/10 bg-[#fbf8f2]/90 px-[clamp(1rem,2vw,2.5rem)] py-[clamp(0.9rem,1.4vw,1.1rem)] backdrop-blur-md">
          <button className="md:hidden text-primary p-2">
            <span className="material-symbols-outlined">menu</span>
          </button>
          
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50 group-focus-within:text-primary transition-colors">search</span>
              <input className="w-full rounded-xl border border-primary/10 bg-white/80 py-2.5 pl-10 pr-4 text-sm text-on-surface outline-none transition-all placeholder:text-on-surface-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="Search admin records..." type="text" />
            </div>
          </div>
          
          <div className="flex items-center gap-4 justify-end ml-auto">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">Admin Session</span>
              <span className="text-sm font-medium text-on-surface">{adminIdentifier || 'Authorized User'}</span>
            </div>
            <button className="text-on-surface-variant hover:text-primary transition-colors p-2 relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors p-2">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-outline-variant/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant transition hover:border-primary hover:text-primary"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 px-[clamp(1rem,2vw,2.5rem)] py-[clamp(1rem,2vw,2rem)]">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}

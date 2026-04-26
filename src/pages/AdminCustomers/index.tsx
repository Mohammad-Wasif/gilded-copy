import { useState, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { Search, Filter, Download, UserPlus, Users, Store, Gem, Clock, ArrowUpRight, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminCustomers() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  
  // Filters & State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'RETAIL' | 'WHOLESALE' | 'ARTISAN' | 'INACTIVE'>('ALL');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'lifetimeSpend' | 'name' | 'lastOrderDate'>('createdAt');
  
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        api.admin.customers.getStats(),
        api.admin.customers.list({
          page,
          limit: 20,
          search: search || undefined,
          type: activeTab === 'ALL' || activeTab === 'INACTIVE' ? undefined : activeTab,
          status: activeTab === 'INACTIVE' ? 'INACTIVE' : (statusFilter || undefined),
          sortBy
        })
      ]);
      
      setStats(statsRes.data);
      setCustomers(listRes.data.items);
      setTotalPages(listRes.data.pagination.totalPages);
      setTotalItems(listRes.data.pagination.total);
    } catch (error) {
      console.error("Failed to load CRM data", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, activeTab, statusFilter, sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // Format currency
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };
  
  const getWhatsAppLink = (phone?: string | null) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    return `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.replace('+','') : cleanPhone}`;
  };

  const exportCSV = () => {
    if (!customers.length) return;
    const headers = ['ID', 'Name', 'Business Name', 'Email', 'Phone', 'Type', 'Status', 'Orders', 'Lifetime Spend', 'Joined'];
    const rows = customers.map(c => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.businessName || '').replace(/"/g, '""')}"`,
      c.email,
      c.phone || '',
      c.type,
      c.status,
      c.ordersCount,
      c.lifetimeSpend,
      new Date(c.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-label font-medium text-on-surface-variant tracking-widest uppercase mb-2">Directory</p>
          <h2 className="text-2xl md:text-4xl font-headline text-primary">Clientele & Artisans</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-lowest text-on-surface font-semibold border border-outline-variant/30 rounded-2xl hover:bg-surface-container-low transition"
          >
            <Download size={18} /> Export CSV
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary font-semibold rounded-2xl hover:opacity-90 transition shadow-lg shadow-primary/20">
            <UserPlus size={18} /> Add Client
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-1">Total Clientele</p>
              <h4 className="text-2xl font-headline text-primary">{stats.totalCustomers}</h4>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Store size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-1">Wholesale Partners</p>
              <h4 className="text-2xl font-headline text-primary">{stats.wholesaleCount}</h4>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-1">New This Month</p>
              <h4 className="text-2xl font-headline text-primary">{stats.newCustomersThisMonth}</h4>
            </div>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant/15 p-5 rounded-3xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-error/10 flex items-center justify-center text-error">
              <Gem size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-1">Lifetime Revenue</p>
              <h4 className="text-2xl font-headline text-primary">{formatMoney(stats.totalLifetimeRevenue)}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <div className="flex overflow-x-auto pb-2 -mb-2 gap-2 scrollbar-hide">
          {['ALL', 'RETAIL', 'WHOLESALE', 'ARTISAN', 'INACTIVE'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab as any); setPage(1); }}
              className={`px-5 py-2 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-primary text-on-primary shadow-md' 
                  : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low border border-outline-variant/20'
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input
              type="text"
              placeholder="Search name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadData()}
              className="pl-10 pr-4 py-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-sm focus:outline-none focus:border-primary w-full sm:w-64 transition-colors"
            />
          </div>
          <button className="p-2.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:text-primary transition">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* CRM Grid */}
      <div className="bg-surface-container-lowest rounded-3xl shadow-sm border border-outline-variant/15 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            {/* Header */}
            <div className="grid grid-cols-12 gap-4 p-4 lg:p-6 bg-surface-container-low/30 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant border-b border-outline-variant/10">
              <div className="col-span-3">Customer</div>
              <div className="col-span-2">Contact</div>
              <div className="col-span-2">Status & Type</div>
              <div className="col-span-1 text-right">Orders</div>
              <div className="col-span-2 text-right">Lifetime Spend</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>

            {/* Body */}
            <div className="divide-y divide-outline-variant/10">
              {loading ? (
                <div className="p-12 text-center text-on-surface-variant animate-pulse">Loading directory...</div>
              ) : customers.length === 0 ? (
                <div className="p-12 text-center text-on-surface-variant">No customers found matching the criteria.</div>
              ) : (
                customers.map((c) => {
                  const waLink = getWhatsAppLink(c.phone);
                  return (
                    <div key={c.id} className="grid grid-cols-12 gap-4 p-4 lg:p-6 items-center hover:bg-surface-container-low/50 transition-colors group">
                      
                      {/* Name & ID */}
                      <div className="col-span-3 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-headline font-semibold text-lg shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-semibold text-base text-on-surface truncate group-hover:text-primary transition-colors">{c.businessName || c.name}</p>
                          <p className="text-[11px] font-mono text-on-surface-variant truncate">ID: {c.id.slice(-6).toUpperCase()}</p>
                          {c.businessName && <p className="text-[11px] text-on-surface-variant truncate">Contact: {c.name}</p>}
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="col-span-2 overflow-hidden">
                        <p className="text-xs text-on-surface truncate mb-0.5">{c.email}</p>
                        {c.phone ? (
                          <p className="text-[11px] font-mono text-on-surface-variant">{c.phone}</p>
                        ) : (
                          <p className="text-[11px] italic text-on-surface-variant/50">No phone</p>
                        )}
                      </div>

                      {/* Tags/Status */}
                      <div className="col-span-2 flex flex-col items-start gap-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          c.type === 'WHOLESALE' ? 'bg-secondary-container/40 text-secondary' :
                          c.type === 'ARTISAN' ? 'bg-tertiary-container/40 text-tertiary' :
                          'bg-surface-variant/50 text-on-surface-variant'
                        }`}>
                          {c.type}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                          c.status === 'BLACKLISTED' ? 'bg-error-container/40 text-error' :
                          c.status === 'NEW' ? 'bg-primary-container/40 text-primary' :
                          c.status === 'INACTIVE' ? 'bg-outline-variant/20 text-on-surface-variant' :
                          'bg-[#E6F4EA] text-[#137333]'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      {/* Orders */}
                      <div className="col-span-1 text-right font-semibold text-sm text-on-surface">
                        {c.ordersCount}
                      </div>

                      {/* Spend */}
                      <div className="col-span-2 text-right">
                        <p className="font-semibold text-base text-on-surface">{formatMoney(c.lifetimeSpend)}</p>
                        {c.lastOrderDate && (
                          <p className="text-[10px] text-on-surface-variant mt-0.5">Last: {new Date(c.lastOrderDate).toLocaleDateString()}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="col-span-2 flex items-center justify-end gap-2">
                        {waLink && (
                          <a 
                            href={waLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full flex items-center justify-center text-[#25D366] hover:bg-[#25D366]/10 transition tooltip-trigger relative"
                            title="WhatsApp"
                          >
                            <MessageCircle size={16} />
                          </a>
                        )}
                        <Link 
                          to={`/admin/customers/${c.id}`}
                          className="px-3 py-1.5 rounded-lg bg-surface text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider hover:bg-primary hover:text-on-primary transition flex items-center gap-1"
                        >
                          Profile <ArrowUpRight size={14} />
                        </Link>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-outline-variant/10 bg-surface-container-low/30 flex justify-between items-center bg-surface-container-lowest">
          <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
            {totalItems > 0 ? `Showing ${(page - 1) * 20 + 1} to ${Math.min(page * 20, totalItems)} of ${totalItems}` : '0 results'}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/20 text-xs font-semibold hover:bg-surface-container-low transition disabled:opacity-50"
            >
              Prev
            </button>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/20 text-xs font-semibold hover:bg-surface-container-low transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { api } from '../../lib/api';
import { Search, X, Package, Plus, Trash2, GripVertical, Star } from 'lucide-react';

interface SimpleProduct {
  id: string; name: string; slug: string; sku: string;
  status: string; basePrice: string; stockQuantity: number;
  isFeatured: boolean;
  images: { imageUrl: string }[];
}

export default function BestSellersTab() {
  const [products, setProducts] = useState<SimpleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Search to add
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SimpleProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadBestSellers(); }, []);

  async function loadBestSellers() {
    setLoading(true);
    try {
      // Fetch featured products — these are the "best sellers"
      const res = await api.catalog.getBestSellers(20);
      if (res.success) {
        setProducts(res.data.map((p: any) => ({
          id: p.id, name: p.name, slug: p.slug, sku: p.sku,
          status: p.status, basePrice: p.basePrice,
          stockQuantity: p.stockQuantity, isFeatured: p.isFeatured,
          images: p.images || []
        })));
      }
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.admin.misc.searchProductsForApp(q.trim());
        if (res.success) {
          const existingIds = new Set(products.map(p => p.id));
          setSearchResults(res.data.filter((p: any) => !existingIds.has(p.id)));
        }
      } catch { /* silent */ }
      finally { setSearching(false); }
    }, 300);
  };

  const toggleFeatured = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    try {
      // Get full product data, toggle isFeatured, update
      const fullRes = await api.admin.products.getById(productId);
      if (fullRes.success) {
        const data = fullRes.data;
        const newFeatured = !data.isFeatured;
        await api.admin.products.update(productId, {
          ...data,
          basePrice: parseFloat(data.basePrice as any),
          compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice as any) : null,
          discountPrice: data.discountPrice ? parseFloat(data.discountPrice as any) : null,
          purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice as any) : null,
          isFeatured: newFeatured,
          applicationIds: data.applications?.map((a: any) => a.id) || [],
        });
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, isFeatured: newFeatured } : p));
      }
    } catch (err: any) {
      alert('Failed to update: ' + err.message);
    }
  };

  const addToBestSellers = async (product: SimpleProduct) => {
    try {
      const fullRes = await api.admin.products.getById(product.id);
      if (fullRes.success) {
        const data = fullRes.data;
        await api.admin.products.update(product.id, {
          ...data,
          basePrice: parseFloat(data.basePrice as any),
          compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice as any) : null,
          discountPrice: data.discountPrice ? parseFloat(data.discountPrice as any) : null,
          purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice as any) : null,
          isFeatured: true,
          applicationIds: data.applications?.map((a: any) => a.id) || [],
        });
        setProducts(prev => [...prev, { ...product, isFeatured: true }]);
        setSearchResults(prev => prev.filter(p => p.id !== product.id));
      }
    } catch (err: any) {
      alert('Failed to add: ' + err.message);
    }
  };

  const removeFromBestSellers = async (productId: string) => {
    try {
      const fullRes = await api.admin.products.getById(productId);
      if (fullRes.success) {
        const data = fullRes.data;
        await api.admin.products.update(productId, {
          ...data,
          basePrice: parseFloat(data.basePrice as any),
          compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice as any) : null,
          discountPrice: data.discountPrice ? parseFloat(data.discountPrice as any) : null,
          purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice as any) : null,
          isFeatured: false,
          applicationIds: data.applications?.map((a: any) => a.id) || [],
        });
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (err: any) {
      alert('Failed to remove: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
        <div className="mb-1 flex items-center gap-2">
          <Star size={20} className="text-primary" />
          <h2 className="font-headline text-xl">Best Sellers Management</h2>
        </div>
        <p className="mb-6 text-sm text-on-surface-variant">
          Products marked as "Featured" appear in the Best Sellers section on the homepage. Search and add products below, or remove existing ones.
        </p>

        {/* Search to Add */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-3 top-3 text-on-surface-variant/50" />
          <input type="text" value={searchQuery} onChange={e => handleSearchChange(e.target.value)} placeholder="Search products to add as best seller..." className="w-full rounded-lg border border-outline-variant pl-10 pr-10 py-2.5 focus:border-primary focus:outline-none" />
          {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-3 top-3 text-on-surface-variant/50 hover:text-on-surface"><X size={18} /></button>}
        </div>

        {searching && <p className="mb-4 text-sm text-on-surface-variant animate-pulse">Searching...</p>}

        {searchResults.length > 0 && (
          <div className="mb-6 max-h-64 overflow-y-auto space-y-2 border border-outline-variant/20 rounded-xl p-4 bg-surface-container-low">
            <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">Search Results</p>
            {searchResults.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-outline-variant/20 p-3 hover:border-primary/30 bg-surface">
                <div className="h-10 w-10 shrink-0 rounded bg-surface-container-low overflow-hidden">
                  {p.images?.[0]?.imageUrl ? <img src={p.images[0].imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-on-surface-variant/30"><Package size={16} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-on-surface-variant">₹{parseFloat(p.basePrice).toFixed(2)}</p>
                </div>
                <button onClick={() => addToBestSellers(p)} className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary hover:text-white transition-colors" title="Add to Best Sellers"><Plus size={16} /></button>
              </div>
            ))}
          </div>
        )}

        {searchQuery.length >= 2 && !searching && searchResults.length === 0 && <p className="mb-6 text-sm text-on-surface-variant">No matching products found.</p>}
      </div>

      {/* Current Best Sellers */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
        <h3 className="mb-4 font-headline text-lg">Current Best Sellers <span className="text-on-surface-variant font-normal text-sm">({products.length})</span></h3>

        {loading ? <div className="py-12 text-center text-on-surface-variant animate-pulse">Loading...</div>
         : error ? <div className="py-8 text-center text-error">{error}</div>
         : products.length === 0 ? <div className="py-12 text-center text-on-surface-variant"><Star size={32} className="mx-auto mb-3 opacity-40" /><p>No best sellers yet. Search and add products above.</p></div>
         : (
          <div className="space-y-2">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-lg border border-outline-variant/20 p-3 group hover:border-error/30 transition-colors">
                <div className="h-10 w-10 shrink-0 rounded bg-surface-container-low overflow-hidden">
                  {p.images?.[0]?.imageUrl ? <img src={p.images[0].imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-on-surface-variant/30"><Package size={16} /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-on-surface-variant">₹{parseFloat(p.basePrice).toFixed(2)} · Stock: {p.stockQuantity}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${p.isFeatured ? 'bg-secondary/10 text-secondary' : 'bg-outline-variant/20 text-on-surface-variant'}`}>
                  {p.isFeatured ? 'Featured' : 'Standard'}
                </span>
                <button onClick={() => removeFromBestSellers(p.id)} className="shrink-0 rounded-lg p-2 text-on-surface-variant/50 hover:bg-error/10 hover:text-error transition-colors" title="Remove from Best Sellers"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

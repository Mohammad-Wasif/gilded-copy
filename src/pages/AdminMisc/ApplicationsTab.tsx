import { useEffect, useState, useRef } from 'react';
import { api } from '../../lib/api';
import { ShopApplication, CategoryStatus } from '../../lib/types';
import { Search, X, Package, Plus, Trash2, ChevronLeft } from 'lucide-react';

interface AppProduct {
  id: string; name: string; slug: string; sku: string;
  status: string; basePrice: string; stockQuantity: number;
  images: { imageUrl: string }[];
}

export default function ApplicationsTab() {
  const [applications, setApplications] = useState<ShopApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState<CategoryStatus>('ACTIVE');
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Product management
  const [managingAppId, setManagingAppId] = useState<string | null>(null);
  const [managingAppName, setManagingAppName] = useState('');
  const [appProducts, setAppProducts] = useState<AppProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<AppProduct[]>([]);
  const [searching, setSearching] = useState(false);
  const [savingProducts, setSavingProducts] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadApplications(); }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await api.admin.misc.getApplications();
      if (res.success) setApplications(res.data);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  }

  const resetForm = () => { setEditingId(null); setName(''); setSlug(''); setDescription(''); setImageUrl(''); setStatus('ACTIVE'); setSortOrder(0); setError(null); };

  const handleEdit = (app: ShopApplication) => {
    setEditingId(app.id); setName(app.name); setSlug(app.slug);
    setDescription(app.description || ''); setImageUrl(app.imageUrl || '');
    setStatus(app.status); setSortOrder(app.sortOrder);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this application?')) return;
    try { await api.admin.misc.deleteApplication(id); setApplications(p => p.filter(a => a.id !== id)); if (editingId === id) resetForm(); }
    catch (err: any) { alert(err.message); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;
    setSaving(true); setError(null);
    const payload = { name, slug, description, imageUrl, status, sortOrder };
    try {
      if (editingId) {
        const res = await api.admin.misc.updateApplication(editingId, payload);
        if (res.success) { setApplications(p => p.map(a => a.id === editingId ? res.data : a)); resetForm(); }
      } else {
        const res = await api.admin.misc.createApplication(payload);
        if (res.success) { setApplications([res.data, ...applications]); resetForm(); }
      }
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setError(null);
    try { const res = await api.upload.media(file); setImageUrl(res.data?.secure_url as string); }
    catch { setError('Failed to upload image.'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; setName(val);
    if (!editingId) setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  // ─── Product Manager ─────────────────────────────────────────────────
  const openProductManager = async (appId: string, appName: string) => {
    setManagingAppId(appId); setManagingAppName(appName); setLoadingProducts(true);
    setSearchQuery(''); setSearchResults([]);
    try {
      const res = await api.admin.misc.getApplicationProducts(appId);
      if (res.success && res.data) setAppProducts(res.data.products || []);
    } catch (err: any) { alert('Failed to load products: ' + err.message); }
    finally { setLoadingProducts(false); }
  };

  const closeProductManager = () => { setManagingAppId(null); setManagingAppName(''); setAppProducts([]); setSearchQuery(''); setSearchResults([]); };

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (q.trim().length < 2) { setSearchResults([]); return; }
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await api.admin.misc.searchProductsForApp(q.trim());
        if (res.success) {
          const existingIds = new Set(appProducts.map(p => p.id));
          setSearchResults(res.data.filter(p => !existingIds.has(p.id)));
        }
      } catch { /* silent */ }
      finally { setSearching(false); }
    }, 300);
  };

  const addProduct = (product: AppProduct) => { setAppProducts(p => [...p, product]); setSearchResults(p => p.filter(x => x.id !== product.id)); };
  const removeProduct = (id: string) => { setAppProducts(p => p.filter(x => x.id !== id)); };

  const saveProducts = async () => {
    if (!managingAppId) return;
    setSavingProducts(true);
    try { await api.admin.misc.updateApplicationProducts(managingAppId, appProducts.map(p => p.id)); loadApplications(); closeProductManager(); }
    catch (err: any) { alert('Failed to save: ' + err.message); }
    finally { setSavingProducts(false); }
  };

  // ─── Product Manager View ────────────────────────────────────────────
  if (managingAppId) {
    return (
      <div className="space-y-6">
        <button onClick={closeProductManager} className="flex items-center gap-1.5 text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">
          <ChevronLeft size={18} /> Back to Applications
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline text-2xl text-on-surface">Products — <span className="text-primary">{managingAppName}</span></h2>
            <p className="mt-1 text-sm text-on-surface-variant">Add or remove products for this application.</p>
          </div>
          <button onClick={saveProducts} disabled={savingProducts} className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white disabled:opacity-50">
            {savingProducts ? 'Saving...' : `Save (${appProducts.length} products)`}
          </button>
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
          <h3 className="mb-3 font-headline text-lg">Add Products</h3>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-3 text-on-surface-variant/50" />
            <input type="text" value={searchQuery} onChange={e => handleSearchChange(e.target.value)} placeholder="Search by name or SKU..." className="w-full rounded-lg border border-outline-variant pl-10 pr-10 py-2.5 focus:border-primary focus:outline-none" />
            {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="absolute right-3 top-3 text-on-surface-variant/50 hover:text-on-surface"><X size={18} /></button>}
          </div>
          {searching && <p className="mt-3 text-sm text-on-surface-variant animate-pulse">Searching...</p>}
          {searchResults.length > 0 && (
            <div className="mt-4 max-h-64 overflow-y-auto space-y-2 border-t border-outline-variant/20 pt-4">
              {searchResults.map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-outline-variant/20 p-3 hover:border-primary/30">
                  <div className="h-10 w-10 shrink-0 rounded bg-surface-container-low overflow-hidden">
                    {p.images?.[0]?.imageUrl ? <img src={p.images[0].imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-on-surface-variant/30"><Package size={16} /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-on-surface-variant">SKU: {p.sku} · ₹{parseFloat(p.basePrice).toFixed(2)}</p>
                  </div>
                  <button onClick={() => addProduct(p)} className="shrink-0 rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary hover:text-white transition-colors"><Plus size={16} /></button>
                </div>
              ))}
            </div>
          )}
          {searchQuery.length >= 2 && !searching && searchResults.length === 0 && <p className="mt-3 text-sm text-on-surface-variant">No products found.</p>}
        </div>

        {/* Assigned */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
          <h3 className="mb-4 font-headline text-lg">Assigned Products <span className="text-on-surface-variant font-normal text-sm">({appProducts.length})</span></h3>
          {loadingProducts ? <div className="py-12 text-center text-on-surface-variant animate-pulse">Loading...</div>
           : appProducts.length === 0 ? <div className="py-12 text-center text-on-surface-variant"><Package size={32} className="mx-auto mb-3 opacity-40" /><p>No products assigned yet.</p></div>
           : (
            <div className="space-y-2">
              {appProducts.map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-outline-variant/20 p-3 group hover:border-error/30">
                  <div className="h-10 w-10 shrink-0 rounded bg-surface-container-low overflow-hidden">
                    {p.images?.[0]?.imageUrl ? <img src={p.images[0].imageUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-on-surface-variant/30"><Package size={16} /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-on-surface-variant">SKU: {p.sku} · ₹{parseFloat(p.basePrice).toFixed(2)} · Stock: {p.stockQuantity}</p>
                  </div>
                  <button onClick={() => removeProduct(p.id)} className="shrink-0 rounded-lg p-2 text-on-surface-variant/50 hover:bg-error/10 hover:text-error transition-colors"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Main View ───────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Form */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm lg:col-span-1">
        <h2 className="mb-6 font-headline text-xl">{editingId ? 'Edit Application' : 'New Application'}</h2>
        {error && <div className="mb-4 rounded p-3 text-sm bg-error/10 text-error">{error}</div>}
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="mb-1 block text-sm font-medium">Name</label><input required value={name} onChange={handleNameChange} className="w-full rounded-lg border border-outline-variant p-2.5" /></div>
          <div><label className="mb-1 block text-sm font-medium">Slug</label><input required value={slug} onChange={e => setSlug(e.target.value)} className="w-full rounded-lg border border-outline-variant p-2.5" /></div>
          <div><label className="mb-1 block text-sm font-medium">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant p-2.5" /></div>
          <div>
            <label className="mb-1 block text-sm font-medium">Image</label>
            <div className="flex items-center gap-4">
              {imageUrl && <div className="h-16 w-16 shrink-0 overflow-hidden rounded border"><img src={imageUrl} alt="" className="h-full w-full object-cover" /></div>}
              <div className="flex-1"><input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm" disabled={uploading} />{uploading && <p className="mt-1 text-xs text-primary">Uploading...</p>}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="mb-1 block text-sm font-medium">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full rounded-lg border border-outline-variant p-2.5">
                <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option><option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div><label className="mb-1 block text-sm font-medium">Sort Order</label><input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value))} className="w-full rounded-lg border border-outline-variant p-2.5" /></div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="submit" disabled={saving || uploading} className="flex-1 rounded-lg bg-primary py-2.5 font-medium text-white disabled:opacity-50">{saving ? 'Saving...' : editingId ? 'Update' : 'Create'}</button>
            {editingId && <button type="button" onClick={resetForm} className="rounded-lg border border-outline-variant px-4 py-2.5 font-medium hover:bg-surface-variant">Cancel</button>}
          </div>
        </form>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm lg:col-span-2">
        <h2 className="mb-6 font-headline text-xl">Existing Applications</h2>
        {loading ? <div className="py-12 text-center text-on-surface-variant">Loading...</div>
         : applications.length === 0 ? <div className="py-12 text-center text-on-surface-variant">No applications found.</div>
         : (
          <div className="grid gap-4 sm:grid-cols-2">
            {applications.map(app => (
              <div key={app.id} className="group flex overflow-hidden rounded-xl border border-outline-variant/30 transition hover:border-primary/50">
                <div className="h-28 w-28 shrink-0 bg-surface-container-low">
                  {app.imageUrl ? <img src={app.imageUrl} alt={app.name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-on-surface-variant/50"><Package size={24} /></div>}
                </div>
                <div className="flex flex-1 flex-col justify-center p-4">
                  <div className="flex items-start justify-between">
                    <div><h3 className="font-medium leading-tight">{app.name}</h3><p className="mt-0.5 text-xs text-on-surface-variant">/{app.slug}</p></div>
                    <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${app.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-outline-variant/20 text-on-surface-variant'}`}>{app.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-on-surface-variant">{(app as any)._count?.products ?? 0} products</p>
                  <div className="mt-2 flex gap-3">
                    <button onClick={() => openProductManager(app.id, app.name)} className="text-sm font-medium text-primary hover:underline flex items-center gap-1"><Package size={14} /> Products</button>
                    <button onClick={() => handleEdit(app)} className="text-sm font-medium text-on-surface-variant hover:text-primary hover:underline">Edit</button>
                    <button onClick={() => handleDelete(app.id)} className="text-sm font-medium text-error hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

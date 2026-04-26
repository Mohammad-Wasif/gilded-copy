import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../../lib/api';
import StockOverview from './StockOverview';
import ProductHistory from './ProductHistory';
import ImportModal from './ImportModal';
import type {
  AdminProduct,
  AdminProductInput,
  AdminProductStats,
  AdminProductVariantInput,
  AdminCategory,
  ShopApplication,
  ProductStatus,
  ProductVariantStatus,
} from '../../lib/types';

// ─── Status Config ────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ProductStatus, { label: string; color: string; bg: string }> = {
  ACTIVE:   { label: 'Active',   color: 'text-secondary',              bg: 'bg-secondary-container/70' },
  DRAFT:    { label: 'Draft',    color: 'text-on-surface-variant',     bg: 'bg-surface-container-highest' },
  HIDDEN:   { label: 'Hidden',   color: 'text-tertiary',               bg: 'bg-tertiary-fixed/30' },
  ARCHIVED: { label: 'Archived', color: 'text-error',                  bg: 'bg-error-container/50' },
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

// ─── Empty form ───────────────────────────────────────────────────────

const emptyVariant = (): AdminProductVariantInput => ({
  title: '', sku: '', size: '', color: '', material: '', finish: '',
  imageUrl: '', status: 'ACTIVE', priceOverride: null, stockQuantity: 0, sortOrder: 0,
});

const emptyForm = (): AdminProductInput => ({
  name: '', slug: '', shortDescription: '', description: '',
  status: 'DRAFT', basePrice: 0, compareAtPrice: null, discountPrice: null,
  purchasePrice: null, sku: '', stockQuantity: 0, lowStockThreshold: 5,
  isFeatured: false, sortOrder: 0, tags: [], supplier: '', categoryId: '', applicationIds: [],
  images: [], variants: [],
});

// ─── Stock Badge ──────────────────────────────────────────────────────

function StockBadge({ qty, threshold }: { qty: number; threshold: number }) {
  if (qty === 0)   return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-error-container text-on-error-container"><span className="w-1.5 h-1.5 rounded-full bg-error" />Out of Stock</span>;
  if (qty <= threshold) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-tertiary-fixed/40 text-tertiary"><span className="w-1.5 h-1.5 rounded-full bg-tertiary" />Low ({qty})</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-secondary-container text-on-secondary-container"><span className="w-1.5 h-1.5 rounded-full bg-secondary" />In Stock ({qty})</span>;
}

// ─── Main Component ───────────────────────────────────────────────────

export default function AdminProducts() {
  // ── Data state ──────────────────────────────────────────────────────
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [stats, setStats] = useState<AdminProductStats | null>(null);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [applications, setApplications] = useState<ShopApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [viewMode, setViewMode] = useState<'list' | 'stock'>('list');

  // ── Filter/search state ─────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProductStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<'in_stock' | 'low_stock' | 'out_of_stock' | ''>('');
  const [sortBy, setSortBy] = useState('recently_updated');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // ── Selection state ─────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Editor state ────────────────────────────────────────────────────
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminProductInput>(emptyForm());
  const [autoSlug, setAutoSlug] = useState(true);
  const [tagInput, setTagInput] = useState('');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editorTab, setEditorTab] = useState<'details' | 'history'>('details');
  const [importModalOpen, setImportModalOpen] = useState(false);

  // ── Stock adjust modal ──────────────────────────────────────────────
  const [stockModalId, setStockModalId] = useState<string | null>(null);
  const [stockDelta, setStockDelta] = useState(0);

  // ── Load data ───────────────────────────────────────────────────────
  const loadProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const [res, statsRes] = await Promise.all([
        api.admin.products.list({
          page, limit: pagination.limit, search: search || undefined,
          categoryId: categoryFilter || undefined, status: statusFilter || undefined,
          stockStatus: stockFilter || undefined, sort: sortBy,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          supplier: supplierFilter || undefined,
        }),
        api.admin.products.getStats(),
      ]);
      setProducts(res.data);
      setPagination(res.meta.pagination);
      setStats(statsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter, stockFilter, sortBy, minPrice, maxPrice, supplierFilter, pagination.limit]);

  useEffect(() => {
    api.admin.getCategoryTree().then(r => setCategories(r.data)).catch(() => {});
    api.admin.misc.getApplications().then((r: any) => setApplications(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    loadProducts(1);
  }, [search, statusFilter, categoryFilter, stockFilter, sortBy, minPrice, maxPrice, supplierFilter]);

  // ── Category helpers ────────────────────────────────────────────────

  function flattenCategories(cats: AdminCategory[], depth = 0): Array<{ cat: AdminCategory; depth: number }> {
    return cats.flatMap(c => [{ cat: c, depth }, ...flattenCategories(c.children ?? [], depth + 1)]);
  }

  const flatCategories = useMemo(() => flattenCategories(categories), [categories]);

  // ── Editor helpers ──────────────────────────────────────────────────

  function openCreate() {
    setForm(emptyForm());
    setEditorMode('create');
    setEditingId(null);
    setAutoSlug(true);
    setTagInput('');
    setImageUrlInput('');
    setNotice(null);
    setError(null);
    setEditorTab('details');
    setEditorOpen(true);
  }

  function openEdit(product: AdminProduct) {
    setForm({
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      status: product.status,
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      discountPrice: product.discountPrice,
      purchasePrice: product.purchasePrice,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      isFeatured: product.isFeatured,
      sortOrder: product.sortOrder,
      tags: product.tags,
      supplier: product.supplier ?? '',
      categoryId: product.categoryId,
      applicationIds: product.applications?.map(a => a.id) ?? [],
      images: product.images.map(i => ({ imageUrl: i.imageUrl, altText: i.altText, isPrimary: i.isPrimary, sortOrder: i.sortOrder })),
      variants: product.variants.map(v => ({
        id: v.id, title: v.title, sku: v.sku, size: v.size ?? '', color: v.color ?? '',
        material: v.material ?? '', finish: v.finish ?? '', imageUrl: v.imageUrl ?? '',
        status: v.status, priceOverride: v.priceOverride, stockQuantity: v.stockQuantity, sortOrder: v.sortOrder,
      })),
    });
    setEditorMode('edit');
    setEditingId(product.id);
    setAutoSlug(false);
    setTagInput('');
    setImageUrlInput('');
    setNotice(null);
    setError(null);
    setEditorTab('details');
    setEditorOpen(true);
  }

  function updateField<K extends keyof AdminProductInput>(key: K, value: AdminProductInput[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && autoSlug) {
        next.slug = slugify(String(value));
        next.sku = String(value).toUpperCase().slice(0, 8).replace(/\s+/g, '-') + '-001';
      }
      return next;
    });
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !(form.tags ?? []).includes(t)) {
      updateField('tags', [...(form.tags ?? []), t]);
    }
    setTagInput('');
  }

  function removeTag(tag: string) {
    updateField('tags', (form.tags ?? []).filter(t => t !== tag));
  }

  function addImageUrl() {
    const url = imageUrlInput.trim();
    if (!url) return;
    updateField('images', [...(form.images ?? []), { imageUrl: url, altText: null, isPrimary: (form.images ?? []).length === 0, sortOrder: (form.images ?? []).length }]);
    setImageUrlInput('');
  }

  async function handleImageUpload(file: File) {
    try {
      setUploadingImage(true);
      const res = await api.upload.media(file);
      const url = res.data?.secure_url as string;
      updateField('images', [...(form.images ?? []), { imageUrl: url, altText: null, isPrimary: (form.images ?? []).length === 0, sortOrder: (form.images ?? []).length }]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingImage(false);
    }
  }

  function removeImage(idx: number) {
    const imgs = [...(form.images ?? [])];
    imgs.splice(idx, 1);
    if (imgs.length > 0 && !imgs.some(i => i.isPrimary)) imgs[0].isPrimary = true;
    updateField('images', imgs);
  }

  function setPrimaryImage(idx: number) {
    updateField('images', (form.images ?? []).map((img, i) => ({ ...img, isPrimary: i === idx })));
  }

  // ── Variant helpers ─────────────────────────────────────────────────

  function addVariant() {
    updateField('variants', [...(form.variants ?? []), emptyVariant()]);
  }

  function updateVariant(idx: number, key: keyof AdminProductVariantInput, value: unknown) {
    const variants = [...(form.variants ?? [])];
    variants[idx] = { ...variants[idx], [key]: value };
    updateField('variants', variants);
  }

  function removeVariant(idx: number) {
    const variants = [...(form.variants ?? [])];
    variants.splice(idx, 1);
    updateField('variants', variants);
  }

  // ── Form submission ─────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (editorMode === 'edit' && editingId) {
        await api.admin.products.update(editingId, form);
        setNotice('Product updated successfully.');
      } else {
        await api.admin.products.create(form);
        setNotice('Product created successfully.');
        setForm(emptyForm());
        setAutoSlug(true);
      }
      await loadProducts(pagination.page);
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ──────────────────────────────────────────────────────────

  async function handleDelete(product: AdminProduct) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      setError(null);
      setNotice(null);
      const res = await api.admin.products.delete(product.id);
      setNotice(res.data.archived ? `"${product.name}" archived (has orders).` : `"${product.name}" deleted.`);
      setSelectedIds(prev => { const next = new Set(prev); next.delete(product.id); return next; });
      if (editingId === product.id) { setEditorOpen(false); setEditingId(null); }
      await loadProducts(pagination.page);
    } catch (err: any) {
      setError(err.message);
    }
  }

  // ── Duplicate ───────────────────────────────────────────────────────

  async function handleDuplicate(id: string) {
    try {
      setError(null);
      setNotice(null);
      await api.admin.products.duplicate(id);
      setNotice('Product duplicated as a draft.');
      await loadProducts(1);
    } catch (err: any) {
      setError(err.message);
    }
  }

  // ── Quick stock adjust ──────────────────────────────────────────────

  async function applyStockAdjust() {
    if (!stockModalId || stockDelta === 0) return;
    try {
      setError(null);
      await api.admin.products.adjustStock(stockModalId, stockDelta);
      setNotice(`Stock adjusted by ${stockDelta > 0 ? '+' : ''}${stockDelta}.`);
      setStockModalId(null); setStockDelta(0);
      await loadProducts(pagination.page);
    } catch (err: any) {
      setError(err.message);
    }
  }

  // ── Bulk ────────────────────────────────────────────────────────────

  async function handleBulk(action: string) {
    if (selectedIds.size === 0) return;
    if (action === 'delete' && !confirm(`Delete ${selectedIds.size} selected products?`)) return;
    try {
      setError(null);
      setNotice(null);
      const res = await api.admin.products.bulk(Array.from(selectedIds), action);
      setNotice(`${res.data.updatedIds.length} products updated.${res.data.errors.length > 0 ? ` ${res.data.errors.length} errors.` : ''}`);
      setSelectedIds(new Set());
      await loadProducts(1);
    } catch (err: any) {
      setError(err.message);
    }
  }

  // ── Selection helpers ───────────────────────────────────────────────

  function toggleSelect(id: string) {
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function toggleSelectAll() {
    if (products.every(p => selectedIds.has(p.id))) {
      setSelectedIds(prev => { const next = new Set(prev); products.forEach(p => next.delete(p.id)); return next; });
    } else {
      setSelectedIds(prev => { const next = new Set(prev); products.forEach(p => next.add(p.id)); return next; });
    }
  }

  const allSelected = products.length > 0 && products.every(p => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0;

  // ── Export ──────────────────────────────────────────────────────────
  // This version handles CSV generation for the current data in the table
  function exportCSV() {
    const headers = ['ID', 'Name', 'SKU', 'Status', 'Price', 'Stock', 'Category', 'Supplier', 'Tags', 'Updated'];
    const rows = products.map(p => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      p.status,
      p.basePrice,
      p.stockQuantity,
      `"${p.category.name.replace(/"/g, '""')}"`,
      `"${(p.supplier || '').replace(/"/g, '""')}"`,
      `"${p.tags.join(';')}"`,
      new Date(p.updatedAt).toLocaleDateString()
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-primary/70">Product Catalogue</p>
          <h2 className="text-4xl font-headline text-primary mt-1">Curated Inventory</h2>
          <p className="text-sm text-on-surface-variant mt-1 max-w-lg">
            Manage embroidery pieces, raw materials, and heirloom collections with full variant and stock control.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-surface-container-lowest rounded-xl p-1 border border-outline-variant/15 mr-2 shadow-sm">
            <button onClick={() => setViewMode('list')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Catalogue</button>
            <button onClick={() => setViewMode('stock')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${viewMode === 'stock' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Stock View</button>
          </div>
          <div className="flex items-center gap-3">
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl border border-outline-variant/30 text-on-surface font-semibold hover:bg-surface-container-low transition"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
                Export CSV
              </button>
              <button
                onClick={() => setImportModalOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-secondary-container text-on-secondary-container font-semibold hover:opacity-90 transition"
              >
                <span className="material-symbols-outlined text-[20px]">upload_file</span>
                Import
              </button>
              <button
                onClick={openCreate}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-primary text-on-primary font-semibold hover:opacity-90 transition shadow-lg shadow-primary/20"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Add Product
              </button>
            </div>
        </div>
      </div>

      {/* ── Stats Summary ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Products', value: stats?.totalProducts ?? '—', icon: 'inventory_2', color: 'text-primary' },
          { label: 'Inventory Value', value: stats ? `$${stats.totalInventoryValue.toLocaleString()}` : '—', icon: 'paid', color: 'text-secondary' },
          { label: 'Low Stock', value: stats?.lowStockCount ?? '—', icon: 'warning', color: 'text-tertiary' },
          { label: 'Out of Stock', value: stats?.outOfStockCount ?? '—', icon: 'do_not_disturb_on', color: 'text-error' },
          { label: 'Added This Week', value: stats?.recentlyAddedCount ?? '—', icon: 'fiber_new', color: 'text-primary' },
        ].map(stat => (
          <div key={stat.label} className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-4 shadow-[0_8px_24px_-12px_rgba(26,28,26,0.12)]">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-symbols-outlined text-[20px] ${stat.color}`}>{stat.icon}</span>
              <p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">{stat.label}</p>
            </div>
            <p className={`text-2xl font-headline ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* ── Notices ──────────────────────────────────────────────────── */}
      {(error || notice) && (
        <div className="space-y-2">
          {error && <div className="rounded-2xl border border-error/25 bg-error-container/70 px-4 py-3 text-sm text-on-error-container">{error}</div>}
          {notice && <div className="rounded-2xl border border-secondary/20 bg-secondary-container/50 px-4 py-3 text-sm text-on-surface">{notice}</div>}
        </div>
      )}

      {/* ── Search & Filter Bar ───────────────────────────────────────── */}
      {viewMode === 'list' ? (
        <>
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-4 shadow-[0_8px_24px_-12px_rgba(26,28,26,0.08)]">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, SKU, tag, supplier..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant/25 bg-surface text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ProductStatus | '')}
            className="px-3 py-2.5 rounded-xl border border-outline-variant/25 bg-surface text-sm outline-none focus:border-primary transition"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="HIDDEN">Hidden</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-outline-variant/25 bg-surface text-sm outline-none focus:border-primary transition"
          >
            <option value="">All Categories</option>
            {flatCategories.map(({ cat, depth }) => (
              <option key={cat.id} value={cat.id}>{'  '.repeat(depth)}{cat.name}</option>
            ))}
          </select>

          {/* Stock */}
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as typeof stockFilter)}
            className="px-3 py-2.5 rounded-xl border border-outline-variant/25 bg-surface text-sm outline-none focus:border-primary transition"
          >
            <option value="">All Stock</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-outline-variant/25 bg-surface text-sm outline-none focus:border-primary transition"
          >
            <option value="recently_updated">Recently Updated</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name_asc">Name A–Z</option>
            <option value="name_desc">Name Z–A</option>
            <option value="price_asc">Price Low–High</option>
            <option value="price_desc">Price High–Low</option>
            <option value="stock_asc">Stock Low–High</option>
            <option value="stock_desc">Stock High–Low</option>
          </select>

          {/* Advanced Filters Toggle */}
          <button
            type="button"
            onClick={() => setShowFilters(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition ${showFilters ? 'bg-primary text-on-primary border-primary' : 'border-outline-variant/25 text-on-surface-variant hover:text-primary hover:border-primary'}`}
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>More
          </button>

          {/* Clear */}
          {(search || statusFilter || categoryFilter || stockFilter || sortBy !== 'recently_updated' || minPrice || maxPrice || supplierFilter) && (
            <button
              type="button"
              onClick={() => { setSearch(''); setStatusFilter(''); setCategoryFilter(''); setStockFilter(''); setSortBy('recently_updated'); setMinPrice(''); setMaxPrice(''); setSupplierFilter(''); }}
              className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm text-error hover:bg-error-container/50 transition"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>Clear
            </button>
          )}
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-outline-variant/15 flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Price</label>
              <input value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" type="number" min="0" className="w-24 px-3 py-2 rounded-xl border border-outline-variant/25 bg-surface text-sm outline-none focus:border-primary transition" />
              <span className="text-on-surface-variant text-sm">–</span>
              <input value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" type="number" min="0" className="w-24 px-3 py-2 rounded-xl border border-outline-variant/25 bg-surface text-sm outline-none focus:border-primary transition" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Supplier</label>
              <input value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} placeholder="Filter by supplier" className="w-48 px-3 py-2 rounded-xl border border-outline-variant/25 bg-surface text-sm outline-none focus:border-primary transition" />
            </div>
          </div>
        )}
      </div>

      {/* ── Bulk Action Bar ───────────────────────────────────────────── */}
      {someSelected && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3 flex flex-wrap gap-3 items-center">
          <span className="text-sm font-semibold text-primary">{selectedIds.size} selected</span>
          <button onClick={() => handleBulk('activate')} className="px-3 py-1.5 rounded-xl bg-secondary text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition">Activate</button>
          <button onClick={() => handleBulk('draft')} className="px-3 py-1.5 rounded-xl bg-surface-container-highest text-on-surface text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition">Set Draft</button>
          <button onClick={() => handleBulk('hidden')} className="px-3 py-1.5 rounded-xl bg-tertiary text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition">Hide</button>
          <button onClick={() => handleBulk('archive')} className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface-variant text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition">Archive</button>
          <button onClick={() => handleBulk('duplicate')} className="px-3 py-1.5 rounded-xl border border-outline-variant/30 text-on-surface text-xs font-semibold uppercase tracking-wider hover:bg-surface-container-low transition">Duplicate</button>
          <button onClick={() => handleBulk('delete')} className="px-3 py-1.5 rounded-xl bg-error text-white text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition">Delete</button>
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-on-surface-variant hover:text-primary transition">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      {/* ── Product Table ─────────────────────────────────────────────── */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-[0_20px_50px_-30px_rgba(26,28,26,0.15)] overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1100px]">
            {/* Header */}
            <div className="grid grid-cols-[2.5rem_minmax(0,2.5fr)_1.2fr_7rem_6.5rem_1fr_6rem_6rem_7rem] gap-2 px-5 py-3.5 bg-surface-container-low border-b border-outline-variant/15 text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
              <div>
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-outline-variant/40 accent-primary"
                />
              </div>
              <div>Product</div>
              <div>Category</div>
              <div>Stock</div>
              <div>Price</div>
              <div>Supplier</div>
              <div>Updated</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            {/* Rows */}
            {loading ? (
              <div className="space-y-2 p-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-surface-container-low animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-5xl mb-3 block opacity-40">inventory_2</span>
                <p className="text-sm">No products found. Adjust your filters or add a new product.</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/10">
                {products.map(product => {
                  const thumbnail = product.images.find(i => i.isPrimary) ?? product.images[0];
                  const statusCfg = STATUS_CONFIG[product.status];
                  const category = product.category.parent
                    ? `${product.category.parent.name} › ${product.category.name}`
                    : product.category.name;

                  return (
                    <div
                      key={product.id}
                      className={`grid grid-cols-[2.5rem_minmax(0,2.5fr)_1.2fr_7rem_6.5rem_1fr_6rem_6rem_7rem] gap-2 px-5 py-3.5 items-center transition hover:bg-surface-container-low/60 ${selectedIds.has(product.id) ? 'bg-primary/4' : ''}`}
                    >
                      {/* Checkbox */}
                      <div>
                        <input
                          type="checkbox"
                          aria-label={`Select ${product.name}`}
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="h-4 w-4 rounded border-outline-variant/40 accent-primary"
                        />
                      </div>

                      {/* Product */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface-container-low shrink-0 border border-outline-variant/10">
                          {thumbnail
                            ? <img src={thumbnail.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-outline-variant text-[22px]">image</span></div>
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-primary text-sm truncate">{product.name}</p>
                          <p className="text-[11px] text-on-surface-variant mt-0.5">SKU: {product.sku}</p>
                          {product.variantCount > 0 && (
                            <p className="text-[11px] text-tertiary mt-0.5">{product.variantCount} variant{product.variantCount !== 1 ? 's' : ''}</p>
                          )}
                        </div>
                      </div>

                      {/* Category */}
                      <div className="text-xs text-on-surface truncate" title={category}>{category}</div>

                      {/* Stock */}
                      <div><StockBadge qty={product.stockQuantity} threshold={product.lowStockThreshold} /></div>

                      {/* Price */}
                      <div>
                        <p className="text-sm font-semibold text-primary">${product.basePrice.toFixed(2)}</p>
                        {product.discountPrice && (
                          <p className="text-[11px] text-secondary line-through text-outline">${product.discountPrice.toFixed(2)}</p>
                        )}
                      </div>

                      {/* Supplier */}
                      <div className="text-xs text-on-surface-variant truncate">{product.supplier || '—'}</div>

                      {/* Updated */}
                      <div className="text-[11px] text-on-surface-variant">{new Date(product.updatedAt).toLocaleDateString()}</div>

                      {/* Status */}
                      <div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${statusCfg.bg} ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          title="Edit"
                          className="p-1.5 rounded-xl text-outline hover:text-primary hover:bg-primary/8 transition"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => { setStockModalId(product.id); setStockDelta(0); }}
                          title="Adjust Stock"
                          className="p-1.5 rounded-xl text-outline hover:text-secondary hover:bg-secondary/8 transition"
                        >
                          <span className="material-symbols-outlined text-[18px]">add_box</span>
                        </button>
                        <button
                          onClick={() => handleDuplicate(product.id)}
                          title="Duplicate"
                          className="p-1.5 rounded-xl text-outline hover:text-tertiary hover:bg-tertiary/8 transition"
                        >
                          <span className="material-symbols-outlined text-[18px]">content_copy</span>
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          title="Delete"
                          className="p-1.5 rounded-xl text-outline hover:text-error hover:bg-error/8 transition"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-outline-variant/15 bg-surface">
            <p className="text-xs text-on-surface-variant">
              {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page === 1}
                onClick={() => loadProducts(pagination.page - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant disabled:opacity-40 hover:bg-primary hover:text-on-primary transition"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1)
                .reduce((acc: (number | '…')[], p, idx, arr) => {
                  if (idx > 0 && (arr[idx - 1] as number) + 1 < p) acc.push('…');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === '…'
                    ? <span key={idx} className="w-8 h-8 flex items-center justify-center text-on-surface-variant text-sm">…</span>
                    : <button
                        key={p}
                        onClick={() => loadProducts(p as number)}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-sm font-semibold transition ${pagination.page === p ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface hover:bg-surface-container-highest'}`}
                      >{p}</button>
                )
              }
              <button
                disabled={pagination.page === pagination.totalPages}
                onClick={() => loadProducts(pagination.page + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant disabled:opacity-40 hover:bg-primary hover:text-on-primary transition"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
      </>
      ) : (
        <StockOverview />
      )}

      {/* ── Stock Adjust Modal ────────────────────────────────────────── */}
      {stockModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setStockModalId(null)}>
          <div className="bg-surface rounded-3xl border border-outline-variant/20 p-8 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-headline text-primary mb-2">Adjust Stock</h3>
            <p className="text-sm text-on-surface-variant mb-6">Enter a positive number to add stock, or a negative number to reduce it.</p>
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStockDelta(d => d - 1)} className="w-10 h-10 rounded-xl bg-surface-container-low text-on-surface flex items-center justify-center hover:bg-error/10 hover:text-error transition text-xl font-bold">−</button>
              <input
                type="number"
                value={stockDelta}
                onChange={e => setStockDelta(parseInt(e.target.value) || 0)}
                className="flex-1 text-center text-2xl font-headline py-2 rounded-xl border border-outline-variant/25 bg-surface outline-none focus:border-primary"
              />
              <button onClick={() => setStockDelta(d => d + 1)} className="w-10 h-10 rounded-xl bg-surface-container-low text-on-surface flex items-center justify-center hover:bg-secondary/10 hover:text-secondary transition text-xl font-bold">+</button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStockModalId(null)} className="flex-1 py-2 rounded-xl border border-outline-variant/25 text-on-surface-variant font-semibold hover:bg-surface-container-low transition">Cancel</button>
              <button onClick={applyStockAdjust} className="flex-1 py-2 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 transition">Apply ({stockDelta > 0 ? '+' : ''}{stockDelta})</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Product Editor Side Panel ─────────────────────────────────── */}
      {editorOpen && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={() => { if (!saving) setEditorOpen(false); }} />
          {/* Panel */}
          <div className="w-full max-w-2xl bg-surface overflow-y-auto shadow-2xl border-l border-outline-variant/20">
            <div className="sticky top-0 z-10 bg-surface border-b border-outline-variant/15 px-6 pt-4 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-primary/70 font-semibold">Product Details</p>
                  <h3 className="text-2xl font-headline text-primary mt-0.5">{editorMode === 'edit' ? 'Edit Product' : 'New Product'}</h3>
                </div>
                <button onClick={() => setEditorOpen(false)} className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {editorMode === 'edit' && (
                <div className="flex gap-1 bg-surface-container-low/50 p-1 rounded-xl w-fit mb-3">
                  <button
                    type="button"
                    onClick={() => setEditorTab('details')}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${editorTab === 'details' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    Information
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('history')}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${editorTab === 'history' ? 'bg-surface text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    Change History
                  </button>
                </div>
              )}
            </div>

            {editorTab === 'details' ? (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {(error || notice) && (
                <div>
                  {error && <div className="rounded-2xl bg-error-container/70 border border-error/20 px-4 py-3 text-sm text-on-error-container mb-2">{error}</div>}
                  {notice && <div className="rounded-2xl bg-secondary-container/50 border border-secondary/20 px-4 py-3 text-sm text-on-surface mb-2">{notice}</div>}
                </div>
              )}

              {/* ── Basic Info ──────────────────────────────────────── */}
              <section className="space-y-4">
                <h4 className="text-[11px] uppercase tracking-[0.28em] text-on-surface-variant font-semibold border-b border-outline-variant/15 pb-2">Basic Information</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">Product Name *</span>
                    <input
                      required
                      value={form.name}
                      onChange={e => updateField('name', e.target.value)}
                      className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">Slug *</span>
                    <div className="relative">
                      <input
                        required
                        value={form.slug}
                        onChange={e => { setAutoSlug(false); updateField('slug', e.target.value); }}
                        className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                      />
                      {autoSlug && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">Auto</span>}
                    </div>
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">SKU *</span>
                    <input
                      required
                      value={form.sku}
                      onChange={e => updateField('sku', e.target.value)}
                      className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </label>
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">Short Description</span>
                    <input
                      value={form.shortDescription ?? ''}
                      onChange={e => updateField('shortDescription', e.target.value)}
                      maxLength={280}
                      className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </label>
                  <label className="space-y-1.5 sm:col-span-2">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">Full Description</span>
                    <textarea
                      value={form.description ?? ''}
                      onChange={e => updateField('description', e.target.value)}
                      rows={4}
                      className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition resize-none"
                    />
                  </label>
                </div>
              </section>

              {/* ── Category & Status ────────────────────────────────── */}
              <section className="space-y-4">
                <h4 className="text-[11px] uppercase tracking-[0.28em] text-on-surface-variant font-semibold border-b border-outline-variant/15 pb-2">Classification</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">Category *</span>
                    <select
                      required
                      value={form.categoryId}
                      onChange={e => updateField('categoryId', e.target.value)}
                      className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    >
                      <option value="">Select category...</option>
                      {flatCategories.map(({ cat, depth }) => (
                        <option key={cat.id} value={cat.id}>{'  '.repeat(depth)}{cat.name}</option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">Status *</span>
                    <select
                      required
                      value={form.status}
                      onChange={e => updateField('status', e.target.value as ProductStatus)}
                      className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="ACTIVE">Active</option>
                      <option value="HIDDEN">Hidden</option>
                      <option value="ARCHIVED">Archived</option>
                    </select>
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">Supplier</span>
                    <input
                      value={form.supplier ?? ''}
                      onChange={e => updateField('supplier', e.target.value)}
                      placeholder="e.g. Hindustan Emb. Co."
                      className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </label>
                  <div className="flex items-center gap-3 pt-5">
                    <button
                      type="button"
                      onClick={() => updateField('isFeatured', !form.isFeatured)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${form.isFeatured ? 'bg-secondary' : 'bg-outline/40'}`}
                    >
                      <span className={`inline-block h-5 w-5 rounded-full bg-white transform transition ${form.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm text-on-surface">Featured Product</span>
                  </div>
                </div>

                {/* Applications */}
                <label className="space-y-1.5 block">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">Applications (Cross-category tags)</span>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 mt-2">
                    {applications.map(app => {
                      const isSelected = (form.applicationIds ?? []).includes(app.id);
                      return (
                        <label key={app.id} className={`flex items-center gap-2 rounded-xl border p-2 cursor-pointer transition ${isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant/30 text-on-surface-variant hover:border-primary/50'}`}>
                          <input 
                            type="checkbox" 
                            className="h-4 w-4 rounded border-outline-variant/40 accent-primary" 
                            checked={isSelected}
                            onChange={(e) => {
                              const curr = form.applicationIds ?? [];
                              if (e.target.checked) updateField('applicationIds', [...curr, app.id]);
                              else updateField('applicationIds', curr.filter(id => id !== app.id));
                            }}
                          />
                          <span className="text-xs font-medium truncate">{app.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </label>

                {/* Tags */}
                <label className="space-y-1.5 block">
                  <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">Tags</span>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {(form.tags ?? []).map(tag => (
                      <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-error transition"><span className="material-symbols-outlined text-[14px]">close</span></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                      placeholder="Type a tag and press Enter"
                      className="flex-1 rounded-2xl border border-outline-variant/25 bg-surface px-4 py-2 text-sm outline-none focus:border-primary transition"
                    />
                    <button type="button" onClick={addTag} className="px-4 py-2 rounded-2xl bg-surface-container-low text-on-surface text-sm font-semibold hover:bg-primary hover:text-on-primary transition">Add</button>
                  </div>
                </label>
              </section>

              {/* ── Pricing ──────────────────────────────────────────── */}
              <section className="space-y-4">
                <h4 className="text-[11px] uppercase tracking-[0.28em] text-on-surface-variant font-semibold border-b border-outline-variant/15 pb-2">Pricing</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Selling Price *', key: 'basePrice' as const, required: true },
                    { label: 'Compare At Price', key: 'compareAtPrice' as const, required: false },
                    { label: 'Discount Price', key: 'discountPrice' as const, required: false },
                    { label: 'Purchase / Cost Price', key: 'purchasePrice' as const, required: false },
                  ].map(({ label, key, required }) => (
                    <label key={key} className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">{label}</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm font-semibold">$</span>
                        <input
                          type="number"
                          required={required}
                          min="0"
                          step="0.01"
                          value={(form[key] as number | null) ?? ''}
                          onChange={e => updateField(key, e.target.value ? parseFloat(e.target.value) : null)}
                          className="w-full pl-7 pr-4 py-2.5 rounded-2xl border border-outline-variant/25 bg-surface text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                        />
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* ── Stock ──────────────────────────────────────────────── */}
              <section className="space-y-4">
                <h4 className="text-[11px] uppercase tracking-[0.28em] text-on-surface-variant font-semibold border-b border-outline-variant/15 pb-2">Inventory</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">Total Stock *</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.stockQuantity}
                      onChange={e => updateField('stockQuantity', parseInt(e.target.value) || 0)}
                      className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant font-semibold">Low Stock Threshold</span>
                    <input
                      type="number"
                      min="0"
                      value={form.lowStockThreshold ?? 5}
                      onChange={e => updateField('lowStockThreshold', parseInt(e.target.value) || 5)}
                      className="w-full rounded-2xl border border-outline-variant/25 bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                    />
                  </label>
                </div>
              </section>

              {/* ── Images ─────────────────────────────────────────────── */}
              <section className="space-y-4">
                <h4 className="text-[11px] uppercase tracking-[0.28em] text-on-surface-variant font-semibold border-b border-outline-variant/15 pb-2">Product Images</h4>
                {/* Upload */}
                <div className="flex gap-2">
                  <input
                    value={imageUrlInput}
                    onChange={e => setImageUrlInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImageUrl(); } }}
                    placeholder="Paste image URL..."
                    className="flex-1 rounded-2xl border border-outline-variant/25 bg-surface px-4 py-2 text-sm outline-none focus:border-primary transition"
                  />
                  <button type="button" onClick={addImageUrl} className="px-4 py-2 rounded-2xl bg-surface-container-low text-on-surface text-sm font-semibold hover:bg-primary hover:text-on-primary transition">Add</button>
                </div>
                <label className="flex items-center gap-3 cursor-pointer bg-surface-container-low rounded-2xl border-2 border-dashed border-outline-variant/30 px-4 py-3 hover:border-primary transition">
                  <span className="material-symbols-outlined text-on-surface-variant">upload</span>
                  <span className="text-sm text-on-surface-variant">{uploadingImage ? 'Uploading...' : 'Upload image from device'}</span>
                  <input type="file" accept="image/*" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} disabled={uploadingImage} />
                </label>

                {/* Image Grid */}
                {(form.images ?? []).length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    {(form.images ?? []).map((img, idx) => (
                      <div key={idx} className={`relative rounded-2xl overflow-hidden border-2 ${img.isPrimary ? 'border-primary' : 'border-outline-variant/20'}`}>
                        <img src={img.imageUrl} alt="" className="w-full aspect-square object-cover" />
                        <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition flex items-center justify-center gap-1 opacity-0 hover:opacity-100">
                          <button type="button" onClick={() => setPrimaryImage(idx)} title="Set primary" className="p-1 bg-white/90 rounded-full text-primary">
                            <span className="material-symbols-outlined text-[16px]">{img.isPrimary ? 'star' : 'star_border'}</span>
                          </button>
                          <button type="button" onClick={() => removeImage(idx)} title="Remove" className="p-1 bg-white/90 rounded-full text-error">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                        {img.isPrimary && <span className="absolute top-1 left-1 text-[9px] bg-primary text-on-primary px-1.5 py-0.5 rounded-full font-bold">Primary</span>}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Variants ──────────────────────────────────────────── */}
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2">
                  <h4 className="text-[11px] uppercase tracking-[0.28em] text-on-surface-variant font-semibold">Variants</h4>
                  <button type="button" onClick={addVariant} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-semibold hover:opacity-90 transition">
                    <span className="material-symbols-outlined text-[16px]">add</span>Add Variant
                  </button>
                </div>
                {(form.variants ?? []).map((v, idx) => (
                  <div key={idx} className="rounded-2xl border border-outline-variant/20 bg-surface-container-low/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Variant {idx + 1}</p>
                      <button type="button" onClick={() => removeVariant(idx)} className="text-error hover:bg-error/10 rounded-xl p-1 transition">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { label: 'Title *', key: 'title' as const, required: true },
                        { label: 'SKU *', key: 'sku' as const, required: true },
                        { label: 'Size', key: 'size' as const, required: false },
                        { label: 'Color', key: 'color' as const, required: false },
                        { label: 'Material', key: 'material' as const, required: false },
                        { label: 'Finish', key: 'finish' as const, required: false },
                      ].map(({ label, key, required }) => (
                        <label key={key} className="space-y-1">
                          <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">{label}</span>
                          <input
                            required={required}
                            value={(v[key] as string) ?? ''}
                            onChange={e => updateVariant(idx, key, e.target.value)}
                            className="w-full rounded-xl border border-outline-variant/25 bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition"
                          />
                        </label>
                      ))}
                      <label className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Price Override</span>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={v.priceOverride ?? ''}
                            onChange={e => updateVariant(idx, 'priceOverride', e.target.value ? parseFloat(e.target.value) : null)}
                            className="w-full pl-7 pr-3 py-2 rounded-xl border border-outline-variant/25 bg-surface text-sm outline-none focus:border-primary transition"
                          />
                        </div>
                      </label>
                      <label className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Stock</span>
                        <input
                          type="number"
                          min="0"
                          value={v.stockQuantity ?? 0}
                          onChange={e => updateVariant(idx, 'stockQuantity', parseInt(e.target.value) || 0)}
                          className="w-full rounded-xl border border-outline-variant/25 bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Status</span>
                        <select
                          value={v.status ?? 'ACTIVE'}
                          onChange={e => updateVariant(idx, 'status', e.target.value as ProductVariantStatus)}
                          className="w-full rounded-xl border border-outline-variant/25 bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition"
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </label>
                      <label className="space-y-1 sm:col-span-2">
                        <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Variant Image URL</span>
                        <input
                          value={v.imageUrl ?? ''}
                          onChange={e => updateVariant(idx, 'imageUrl', e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded-xl border border-outline-variant/25 bg-surface px-3 py-2 text-sm outline-none focus:border-primary transition"
                        />
                      </label>
                    </div>
                  </div>
                ))}
                {(form.variants ?? []).length === 0 && (
                  <p className="text-sm text-on-surface-variant text-center py-4 italic">No variants. Click "Add Variant" to create size/color/material options.</p>
                )}
              </section>

              {/* ── Submit ─────────────────────────────────────────────── */}
              <div className="flex gap-3 sticky bottom-0 bg-surface pb-2 pt-4 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  disabled={saving}
                  className="flex-1 py-3 rounded-2xl border border-outline-variant/25 text-on-surface-variant font-semibold hover:bg-surface-container-low transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-semibold hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>}
                  {editorMode === 'edit' ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
            ) : (
              <div className="p-6">
                <ProductHistory productId={editingId!} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Import Modal ─────────────────────────────────────────────── */}
      {importModalOpen && (
        <ImportModal
          onClose={() => setImportModalOpen(false)}
          onSuccess={() => {
            loadProducts(1);
            setNotice('Bulk import completed successfully.');
          }}
        />
      )}
    </div>
  );
}

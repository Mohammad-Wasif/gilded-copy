import { useState, useCallback, useEffect } from 'react';
import { api } from '../../lib/api';
import type { AdminStockOverview, AdminProduct } from '../../lib/types';

export default function StockOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [data, setData] = useState<AdminStockOverview | null>(null);

  // Modal
  const [stockModalId, setStockModalId] = useState<string | null>(null);
  const [stockDelta, setStockDelta] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.admin.products.getStockOverview();
      setData(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load stock overview');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function applyStockAdjust() {
    if (!stockModalId || stockDelta === 0) return;
    try {
      setError(null);
      await api.admin.products.adjustStock(stockModalId, stockDelta);
      setNotice(`Stock adjusted by ${stockDelta > 0 ? '+' : ''}${stockDelta}.`);
      setStockModalId(null); setStockDelta(0);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  }

  if (loading && !data) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-surface-container-lowest animate-pulse" />
        ))}
      </div>
    );
  }

  function renderTable(title: string, products: AdminProduct[], emptyMsg: string, colorClass: string) {
    if (products.length === 0) {
      return null;
    }
    
    return (
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 shadow-[0_8px_24px_-12px_rgba(26,28,26,0.08)] overflow-hidden mb-6">
        <div className={`px-5 py-3 border-b border-outline-variant/15 ${colorClass}`}>
          <h3 className="text-sm font-semibold uppercase tracking-wider">{title} ({products.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
             <div className="grid grid-cols-[3fr_1fr_1fr_1fr_100px] gap-4 px-5 py-3 bg-surface-container-low border-b border-outline-variant/15 text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
               <div>Product</div>
               <div className="text-right">Reserved Stock</div>
               <div className="text-right">Available Stock</div>
               <div className="text-right">Total Stock</div>
               <div className="text-right">Action</div>
             </div>
             <div className="divide-y divide-outline-variant/10">
               {products.map(p => (
                 <div key={p.id} className="grid grid-cols-[3fr_1fr_1fr_1fr_100px] gap-4 px-5 py-3 items-center hover:bg-surface-container-low/50 transition">
                   <div className="min-w-0">
                     <p className="font-semibold text-primary text-sm truncate">{p.name}</p>
                     <p className="text-[11px] text-on-surface-variant mt-0.5">SKU: {p.sku}</p>
                   </div>
                   <div className="text-right text-sm">
                     {p.reservedStock > 0 ? (
                       <span className="inline-flex items-center gap-1 text-tertiary font-semibold bg-tertiary-fixed/30 px-2 py-0.5 rounded-full text-xs">
                         {p.reservedStock} reserved
                       </span>
                     ) : (
                       <span className="text-on-surface-variant">0</span>
                     )}
                   </div>
                   <div className={`text-right text-sm font-semibold ${p.availableStock <= p.lowStockThreshold ? 'text-error' : 'text-secondary'}`}>
                     {p.availableStock}
                   </div>
                   <div className="text-right text-sm font-headline text-primary">{p.stockQuantity}</div>
                   <div className="text-right">
                     <button
                       onClick={() => { setStockModalId(p.id); setStockDelta(0); }}
                       className="px-3 py-1.5 bg-surface-container-low hover:bg-secondary/10 hover:text-secondary rounded-lg text-xs font-semibold transition"
                     >
                       Adjust
                     </button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(error || notice) && (
        <div className="space-y-2">
          {error && <div className="rounded-2xl border border-error/25 bg-error-container/70 px-4 py-3 text-sm text-on-error-container">{error}</div>}
          {notice && <div className="rounded-2xl border border-secondary/20 bg-secondary-container/50 px-4 py-3 text-sm text-on-surface">{notice}</div>}
        </div>
      )}

      {data && (
        <>
          {renderTable('Out of Stock', data.outOfStock, 'No products are currently out of stock.', 'bg-error-container/20 text-error')}
          {renderTable('Low Stock', data.lowStock, 'No products are running low on stock.', 'bg-tertiary-fixed/20 text-tertiary')}
          {renderTable('Healthy Stock', data.healthy, 'No products have healthy stock levels.', 'bg-secondary-container/20 text-secondary')}
          
          {data.products.length === 0 && (
             <div className="py-24 text-center text-on-surface-variant">
               <span className="material-symbols-outlined text-5xl mb-3 block opacity-40">inventory_2</span>
               <p className="text-sm">No products found in the catalog.</p>
             </div>
          )}
        </>
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
    </div>
  );
}

import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { ProductLog } from '../../lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Clock, Tag, Package, AlertCircle, CheckCircle2, Copy, Trash2, FileUp } from 'lucide-react';

interface Props {
  productId: string;
}

const ACTION_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  created: { icon: Package, color: 'text-secondary', label: 'Created' },
  updated: { icon: Tag, color: 'text-primary', label: 'Updated' },
  status_changed: { icon: CheckCircle2, color: 'text-tertiary', label: 'Status' },
  stock_adjusted: { icon: AlertCircle, color: 'text-secondary', label: 'Stock' },
  duplicated: { icon: Copy, color: 'text-primary', label: 'Duplicated' },
  deleted: { icon: Trash2, color: 'text-error', label: 'Deleted' },
  archived: { icon: Trash2, color: 'text-error', label: 'Archived' },
  imported_create: { icon: FileUp, color: 'text-secondary', label: 'Imported (New)' },
  imported_update: { icon: FileUp, color: 'text-primary', label: 'Imported (Update)' },
};

export default function ProductHistory({ productId }: Props) {
  const [logs, setLogs] = useState<ProductLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        setLoading(true);
        const res = await api.admin.products.getLogs(productId);
        setLogs(res.data);
      } catch (err) {
        console.error('Failed to load logs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [productId]);

  if (loading) {
    return (
      <div className="space-y-4 py-4 px-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant/15" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-2 bg-surface-container-lowest rounded-full w-1/4" />
              <div className="h-2 bg-surface-container-lowest rounded-full w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-12 text-center text-on-surface-variant flex flex-col items-center">
        <Clock className="w-8 h-8 mb-3 opacity-20" />
        <p className="text-xs font-semibold uppercase tracking-wider">No history found</p>
        <p className="text-[11px] mt-1">Changes to this product will appear here.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 py-4 px-1">
      {/* Vertical line connector */}
      <div className="absolute left-[15px] top-6 bottom-6 w-0.5 bg-outline-variant/15" />

      {logs.map((log) => {
        const config = ACTION_CONFIG[log.action] || { icon: Clock, color: 'text-on-surface-variant', label: log.action };
        const Icon = config.icon;
        let details = null;
        try {
          details = log.details ? JSON.parse(log.details) : null;
        } catch {
          details = log.details;
        }

        return (
          <div key={log.id} className="relative flex gap-4 pr-2">
            <div className={`relative z-10 w-8 h-8 rounded-full border border-outline-variant/20 bg-surface flex items-center justify-center shadow-sm ${config.color}`}>
              <Icon size={14} />
            </div>
            
            <div className="flex-1 min-w-0 pt-0.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <p className="text-xs font-bold text-on-surface uppercase tracking-wider">{config.label}</p>
                <time className="text-[10px] text-on-surface-variant/70 font-semibold uppercase tracking-widest whitespace-nowrap">
                  {formatDistanceToNow(new Date(log.createdAt))} ago
                </time>
              </div>
              
              <div className="mt-1.5 rounded-xl bg-surface-container-low/40 border border-outline-variant/10 p-2 text-[11px] leading-relaxed text-on-surface-variant">
                {log.action === 'status_changed' && details && (
                  <span>Status set to <span className="font-bold text-primary">{details.to}</span></span>
                )}
                {log.action === 'stock_adjusted' && details && (
                  <span>Stock changed by <span className={`font-bold ${details.delta > 0 ? 'text-secondary' : 'text-error'}`}>{details.delta > 0 ? '+' : ''}{details.delta}</span> (New total: {details.newTotal})</span>
                )}
                {log.action === 'updated' && details && (
                  <span>Generic updates applied</span>
                )}
                {log.action === 'created' && (
                  <span>Initial product creation</span>
                )}
                {log.action.startsWith('imported') && (
                  <span>Records synchronized via spreadsheet import</span>
                )}
                {!['status_changed', 'stock_adjusted', 'updated', 'created'].some(a => log.action.includes(a)) && (
                  <span>{log.action.replace(/_/g, ' ')}</span>
                )}
                {log.adminName && (
                  <p className="mt-1 text-[9px] text-on-surface-variant/60 font-bold uppercase tracking-widest">Modified by {log.adminName}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

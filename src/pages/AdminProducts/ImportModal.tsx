import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { api } from '../../lib/api';
import { FileUp, X, CheckCircle2, AlertCircle, Loader2, Table, FileSpreadsheet } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

interface RawRow {
  [key: string]: any;
}

export default function ImportModal({ onClose, onSuccess }: Props) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{ created: number; updated: number; errors: string[] } | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          setData(results.data);
          setLoading(false);
        },
        error: (err) => {
          setError(`CSV Parse Error: ${err.message}`);
          setLoading(false);
        }
      });
    } else {
      reader.onload = (e) => {
        try {
          const ab = e.target?.result;
          const workbook = XLSX.read(ab, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          setData(jsonData);
          setLoading(false);
        } catch (err: any) {
          setError(`Excel Parse Error: ${err.message}`);
          setLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleImport = async () => {
    if (!data) return;
    try {
      setImporting(true);
      setError(null);

      // Simple transformation/validation mapping
      // We expect the CSV columns to match our backend payload keys
      // id, name, sku, categoryName, subCategoryName, basePrice, stockQuantity, status, supplier, tags
      const payload = data.map(row => ({
        name: String(row.name || row.Name || ''),
        sku: String(row.sku || row.SKU || ''),
        categoryName: String(row.category || row.Category || row.categoryName || ''),
        subCategoryName: row.subCategory || row.Subcategory || row.subCategoryName || null,
        basePrice: parseFloat(row.price || row.Price || row.basePrice || '0'),
        stockQuantity: parseInt(row.stock || row.Stock || row.stockQuantity || '0'),
        status: row.status || row.Status || 'ACTIVE',
        supplier: row.supplier || row.Supplier || null,
        tags: typeof row.tags === 'string' ? row.tags.split(';').map((t: string) => t.trim()) : (Array.isArray(row.tags) ? row.tags : []),
        description: row.description || row.Description || null
      })).filter(row => row.name && row.sku);

      if (payload.length === 0) {
        throw new Error('No valid products found in file. Ensure "name" and "sku" columns exist.');
      }

      const res = await api.admin.products.import(payload);
      setResults(res.data);
      if (res.data.created > 0 || res.data.updated > 0) {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-surface rounded-4xl border border-outline-variant/20 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_32px_80px_rgba(0,0,0,0.15)] overflow-hidden">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-outline-variant/15 flex items-center justify-between bg-surface-container-lowest">
          <div>
            <h3 className="text-2xl font-headline text-primary">Import Products</h3>
            <p className="text-sm text-on-surface-variant">Bulk upload products via CSV or Excel (.xlsx)</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-container-low transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl bg-error-container/70 border border-error/20 p-4 text-sm text-on-error-container">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {!results ? (
            <>
              {!data && (
                <div 
                  {...getRootProps()} 
                  className={`border-3 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
                    isDragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary/50'
                  }`}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                    <FileUp size={32} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-lg font-bold text-on-surface">
                      {isDragActive ? 'Drop it here!' : 'Drop your spreadsheet here'}
                    </p>
                    <p className="text-sm text-on-surface-variant">or click to browse from device</p>
                  </div>
                  <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">
                    <span className="flex items-center gap-1.5"><FileSpreadsheet size={14} className="text-secondary" /> Excel (.xlsx)</span>
                    <span className="flex items-center gap-1.5"><Table size={14} className="text-tertiary" /> CSV (.csv)</span>
                  </div>
                </div>
              )}

              {loading && (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-sm font-semibold text-primary animate-pulse uppercase tracking-[0.2em]">Analyzing Data...</p>
                </div>
              )}

              {data && !loading && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between border-b border-outline-variant/15 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <CheckCircle2 size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface">{data.length} items parsed</p>
                        <p className="text-[11px] text-on-surface-variant font-bold uppercase tracking-wider">Ready for validation</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setData(null)} 
                      className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
                    >
                      Choose different file
                    </button>
                  </div>

                  <div className="rounded-2xl border border-outline-variant/20 overflow-hidden bg-surface-container-lowest">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-surface-container-low/50">
                          {['SKU', 'Name', 'Category', 'Price', 'Stock'].map(h => (
                            <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant/10">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant/10">
                        {data.slice(0, 5).map((row, i) => (
                          <tr key={i} className="hover:bg-primary/5 transition">
                            <td className="px-4 py-3 font-mono text-[11px] text-primary">{row.sku || row.SKU || '—'}</td>
                            <td className="px-4 py-3 font-semibold text-on-surface">{row.name || row.Name || '—'}</td>
                            <td className="px-4 py-3 text-on-surface-variant">{row.category || row.Category || '—'}</td>
                            <td className="px-4 py-3 font-bold">${row.price || row.Price || row.basePrice || '0'}</td>
                            <td className="px-4 py-3 text-on-surface-variant">{row.stock || row.Stock || row.stockQuantity || '0'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.length > 5 && (
                      <div className="px-4 py-2 bg-surface-container-low/30 text-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 border-t border-outline-variant/10">
                        And {data.length - 5} more items...
                      </div>
                    )}
                  </div>

                  <div className="bg-secondary-container/30 rounded-2xl p-6 border border-secondary/20">
                    <h4 className="text-xs font-bold text-secondary uppercase tracking-[0.2em] mb-2">Import Policy</h4>
                    <ul className="text-xs text-on-surface-variant space-y-2 list-disc pl-4 leading-relaxed">
                      <li>Products with existing <span className="font-bold text-on-surface">SKUs</span> will be updated.</li>
                      <li>New <span className="font-bold text-on-surface">Categories</span> will be created automatically.</li>
                      <li>Prices and stock must be <span className="font-bold text-on-surface">positive numbers</span>.</li>
                    </ul>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl ${results.errors.length === 0 ? 'bg-secondary text-on-secondary' : 'bg-primary text-on-primary'}`}>
                <CheckCircle2 size={40} />
              </div>
              <h4 className="text-3xl font-headline text-primary mb-2">Import Complete</h4>
              <p className="text-on-surface-variant max-w-sm mb-8">Process finished with the following results:</p>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                <div className="bg-secondary/10 rounded-2xl p-4 border border-secondary/20">
                  <p className="text-3xl font-headline text-secondary">{results.created}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/70">New Added</p>
                </div>
                <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20">
                  <p className="text-3xl font-headline text-primary">{results.updated}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">Updated</p>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="w-full max-w-md bg-error-container/40 border border-error/20 rounded-2xl p-4 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-error mb-2 border-b border-error/10 pb-1">Technical Issues ({results.errors.length})</p>
                  <div className="max-h-32 overflow-y-auto text-[11px] font-mono text-on-error-container/80 space-y-1">
                    {results.errors.map((err, i) => <div key={i}>• {err}</div>)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {!results && data && (
          <div className="px-8 py-6 border-t border-outline-variant/15 bg-surface-container-lowest flex justify-end gap-4">
            <button 
              onClick={onClose} 
              className="px-6 py-2.5 rounded-2xl border border-outline-variant/30 text-sm font-semibold hover:bg-surface-container-low transition"
            >
              Cancel
            </button>
            <button 
              onClick={handleImport}
              disabled={importing}
              className="px-8 py-2.5 rounded-2xl bg-primary text-on-primary text-sm font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition"
            >
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileUp size={18} />}
              {importing ? 'Importing...' : 'Confirm Import'}
            </button>
          </div>
        )}
        
        {results && (
          <div className="px-8 py-6 border-t border-outline-variant/15 bg-surface-container-lowest flex justify-center">
            <button 
              onClick={onClose} 
              className="px-12 py-3 rounded-2xl bg-secondary text-on-secondary font-bold uppercase tracking-[0.2em] hover:opacity-90 transition shadow-lg"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api';
import type { AdminOrderListItem, OrderStatus } from '../../lib/types';

type PaymentStatus = 'PAID' | 'PENDING' | 'FAILED';
type OrderType = 'RETAIL' | 'WHOLESALE';
type RegionFilter = 'ALL' | 'INDIA' | 'INTERNATIONAL';
type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

interface DecoratedOrder extends AdminOrderListItem {
  paymentStatus: PaymentStatus;
  fulfillmentStatus: OrderStatus;
  shippingStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED';
  orderType: OrderType;
  priority: Priority;
  businessName: string | null;
  requestedDeliveryDate: string | null;
  assignedSalesPerson: string | null;
  productionNotes: string | null;
  moq: number | null;
  trackingNumber: string | null;
  paymentMethod: string;
  internalNotes: string;
  activityText: string;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function deriveOrder(order: AdminOrderListItem): DecoratedOrder {
  const isWholesale = order.itemCount >= 10 || order.totalAmount >= 10000;
  const fulfillmentStatus = order.status;
  const paymentStatus: PaymentStatus =
    order.status === 'CANCELLED' ? 'FAILED' : order.status === 'PENDING' ? 'PENDING' : 'PAID';
  const shippingStatus =
    order.status === 'DELIVERED'
      ? 'DELIVERED'
      : order.status === 'SHIPPED'
        ? 'SHIPPED'
        : order.status === 'PROCESSING'
          ? 'PROCESSING'
          : 'PENDING';

  const priority: Priority =
    order.totalAmount >= 50000 || order.itemCount >= 25 ? 'HIGH' : order.totalAmount >= 10000 ? 'MEDIUM' : 'LOW';

  const initials = order.user.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return {
    ...order,
    paymentStatus,
    fulfillmentStatus,
    shippingStatus,
    orderType: isWholesale ? 'WHOLESALE' : 'RETAIL',
    priority,
    businessName: isWholesale ? `${order.user.name} Studio ${initials}` : null,
    requestedDeliveryDate: isWholesale
      ? new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null,
    assignedSalesPerson: isWholesale ? 'Admin 1' : null,
    productionNotes:
      order.status === 'PROCESSING'
        ? 'Dyeing complete, finishing scheduled.'
        : order.status === 'SHIPPED'
          ? 'Packed and dispatched from warehouse.'
          : isWholesale
            ? 'Sampling approved and queued for production.'
            : 'Ready for review.',
    moq: isWholesale ? Math.max(50, order.itemCount * 2) : null,
    trackingNumber: order.status === 'SHIPPED' || order.status === 'DELIVERED' ? `HE${order.id.slice(-8).toUpperCase()}` : null,
    paymentMethod: isWholesale ? 'Bank Transfer' : 'Card',
    internalNotes: isWholesale
      ? 'Coordinate shipment with assigned sales contact before dispatch.'
      : 'Customer requested standard delivery updates.',
    activityText:
      order.status === 'SHIPPED'
        ? `Admin marked #${order.id.slice(-8).toUpperCase()} as shipped`
        : order.status === 'PROCESSING'
          ? `Production started for #${order.id.slice(-8).toUpperCase()}`
          : `Invoice generated for #${order.id.slice(-8).toUpperCase()}`,
  };
}

function getPaymentPill(status: PaymentStatus) {
  const styles: Record<PaymentStatus, string> = {
    PAID: 'bg-secondary-container text-secondary border-secondary/20',
    PENDING: 'bg-tertiary-fixed/55 text-tertiary border-tertiary/20',
    FAILED: 'bg-error-container text-error border-error/20',
  };
  return `inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${styles[status]}`;
}

function getFulfillmentPill(status: OrderStatus) {
  const styles: Record<OrderStatus, string> = {
    PENDING: 'bg-tertiary-fixed/55 text-tertiary border-tertiary/20',
    PROCESSING: 'bg-sky-100 text-sky-700 border-sky-200',
    SHIPPED: 'bg-violet-100 text-violet-700 border-violet-200',
    DELIVERED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    CANCELLED: 'bg-slate-200 text-slate-600 border-slate-300',
  };
  return `inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${styles[status]}`;
}

function getRowBorder(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    PENDING: 'border-l-[#c89b00]',
    PROCESSING: 'border-l-[#2563eb]',
    SHIPPED: 'border-l-[#7c3aed]',
    DELIVERED: 'border-l-[#166534]',
    CANCELLED: 'border-l-[#64748b]',
  };
  return map[status];
}

function getPrimaryActionClass() {
  return 'rounded-lg bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:opacity-90';
}

function getSecondaryActionClass() {
  return 'rounded-lg border border-outline-variant/20 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant transition hover:border-primary/25 hover:bg-surface hover:text-primary';
}

function getAccentActionClass(color: 'sky' | 'violet' | 'error') {
  const map = {
    sky: 'rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700 transition hover:bg-sky-100',
    violet: 'rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-violet-700 transition hover:bg-violet-100',
    error: 'rounded-lg border border-error/20 bg-error-container/40 px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-error transition hover:bg-error-container',
  } as const;
  return map[color];
}

function buildInvoiceHtml(order: DecoratedOrder) {
  const itemsMarkup = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;">${item.productName}${item.variantName ? ` (${item.variantName})` : ''}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e5e7eb;text-align:right;">${formatCurrency(item.priceAtPurchase * item.quantity)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <html><head><title>Invoice ${order.id}</title></head><body style="font-family:Arial,sans-serif;padding:32px;color:#1f2937;">
      <h1 style="margin-bottom:8px;">Invoice #${order.id.slice(-8).toUpperCase()}</h1>
      <p style="margin:0 0 24px;">${order.user.name} · ${order.user.email}</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <thead><tr><th style="text-align:left;padding-bottom:10px;border-bottom:2px solid #d1d5db;">Item</th><th style="text-align:center;padding-bottom:10px;border-bottom:2px solid #d1d5db;">Qty</th><th style="text-align:right;padding-bottom:10px;border-bottom:2px solid #d1d5db;">Amount</th></tr></thead>
        <tbody>${itemsMarkup}</tbody>
      </table>
      <p><strong>Shipping:</strong> ${order.shippingAddress}, ${order.shippingCity}, ${order.shippingState} ${order.shippingZip}</p>
      <p><strong>Total:</strong> ${formatCurrency(order.totalAmount)}</p>
    </body></html>
  `;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<DecoratedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<'ALL' | OrderType>('ALL');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [regionFilter, setRegionFilter] = useState<RegionFilter>('ALL');
  const [highValueOnly, setHighValueOnly] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  async function loadOrders() {
    try {
      setLoading(true);
      setError(null);
      const response = await api.admin.getAllOrders({ page: 1, limit: 50 });
      setOrders(response.data.map(deriveOrder));
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      const fromDate = dateFrom ? startOfDay(new Date(dateFrom)) : null;
      const toDate = dateTo ? new Date(new Date(dateTo).setHours(23, 59, 59, 999)) : null;
      const inQuery =
        query.length === 0 ||
        order.id.toLowerCase().includes(query) ||
        order.user.name.toLowerCase().includes(query) ||
        order.user.email.toLowerCase().includes(query);
      const inType = orderTypeFilter === 'ALL' || order.orderType === orderTypeFilter;
      const inFulfillment = fulfillmentFilter === 'ALL' || order.fulfillmentStatus === fulfillmentFilter;
      const inPayment = paymentFilter === 'ALL' || order.paymentStatus === paymentFilter;
      const inRegion =
        regionFilter === 'ALL' ||
        (regionFilter === 'INDIA' ? order.shippingState.toLowerCase().includes('india') || order.shippingState.length > 0 : true) &&
          (regionFilter !== 'INTERNATIONAL' || !order.shippingState.toLowerCase().includes('india'));
      const inHighValue = !highValueOnly || order.totalAmount >= 25000;
      const inDateRange = (!fromDate || orderDate >= fromDate) && (!toDate || orderDate <= toDate);

      return inQuery && inType && inFulfillment && inPayment && inRegion && inHighValue && inDateRange;
    });
  }, [orders, search, orderTypeFilter, fulfillmentFilter, paymentFilter, regionFilter, highValueOnly, dateFrom, dateTo]);

  const selectedOrder = useMemo(
    () => filteredOrders.find((order) => order.id === selectedOrderId) ?? orders.find((order) => order.id === selectedOrderId) ?? null,
    [filteredOrders, orders, selectedOrderId]
  );

  const summary = useMemo(() => {
    const completedRevenue = filteredOrders
      .filter((order) => order.fulfillmentStatus === 'DELIVERED')
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const today = startOfDay(new Date());
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);

    return {
      totalOrders: filteredOrders.length,
      pending: filteredOrders.filter((order) => order.fulfillmentStatus === 'PENDING').length,
      processing: filteredOrders.filter((order) => order.fulfillmentStatus === 'PROCESSING').length,
      shipped: filteredOrders.filter((order) => order.fulfillmentStatus === 'SHIPPED').length,
      completedRevenue,
      todayRevenue: filteredOrders
        .filter((order) => new Date(order.createdAt) >= today && order.paymentStatus === 'PAID')
        .reduce((sum, order) => sum + order.totalAmount, 0),
      ordersThisWeek: filteredOrders.filter((order) => new Date(order.createdAt) >= weekAgo).length,
      recentActivities: [...filteredOrders]
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
        .slice(0, 5)
        .map((order) => ({
          id: order.id,
          text: order.activityText,
          timestamp: order.updatedAt,
        })),
    };
  }, [filteredOrders]);

  async function updateOrder(orderId: string, status: OrderStatus) {
    setUpdatingIds((current) => new Set(current).add(orderId));
    setError(null);
    try {
      await api.admin.updateOrderStatus(orderId, status);
      setOrders((current) => current.map((order) => (order.id === orderId ? deriveOrder({ ...order, status }) : order)));
      setNotice(`Order ${orderId.slice(-8).toUpperCase()} updated to ${status.toLowerCase()}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to update order');
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current);
        next.delete(orderId);
        return next;
      });
    }
  }

  async function handleBulkShip() {
    const selected = orders.filter((order) => selectedIds.has(order.id) && order.fulfillmentStatus !== 'SHIPPED');
    for (const order of selected) {
      await updateOrder(order.id, 'SHIPPED');
    }
    setSelectedIds(new Set());
  }

  function exportCsv(targetOrders: DecoratedOrder[]) {
    const rows = [
      ['Order ID', 'Customer', 'Email', 'Payment Status', 'Fulfillment Status', 'Order Type', 'Total'],
      ...targetOrders.map((order) => [order.id, order.user.name, order.user.email, order.paymentStatus, order.fulfillmentStatus, order.orderType, order.totalAmount.toString()]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  function openPrintWindow(title: string, body: string) {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>${title}</title></head><body style="font-family:Arial,sans-serif;padding:24px;">${body}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  function printLabels(targetOrders: DecoratedOrder[]) {
    const content = targetOrders
      .map((order) => `<div style="border:1px solid #d4d4d8;border-radius:12px;padding:16px;margin-bottom:12px;"><h3 style="margin:0 0 8px;">#${order.id.slice(-8).toUpperCase()}</h3><p style="margin:0 0 4px;"><strong>${order.shippingName}</strong></p><p style="margin:0;">${order.shippingAddress}, ${order.shippingCity}, ${order.shippingState} ${order.shippingZip}</p></div>`)
      .join('');
    openPrintWindow('Shipping Labels', content);
  }

  function sendEmail(targetOrders: DecoratedOrder[]) {
    const emails = targetOrders.map((order) => order.user.email).join(',');
    window.location.href = `mailto:${emails}?subject=Order%20Update`;
  }

  function generateInvoice(order: DecoratedOrder) {
    const invoiceHtml = buildInvoiceHtml(order);
    const blob = new Blob([invoiceHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${order.id.slice(-8).toUpperCase()}.html`;
    link.click();
    URL.revokeObjectURL(url);
    setNotice(`Invoice generated for ${order.id.slice(-8).toUpperCase()}.`);
  }

  function downloadPdf(order: DecoratedOrder) {
    openPrintWindow(`Invoice ${order.id}`, buildInvoiceHtml(order));
  }

  function renderPrimaryActions(order: DecoratedOrder) {
    if (order.fulfillmentStatus === 'PENDING') {
      return (
        <>
          <button onClick={() => setSelectedOrderId(order.id)} className={getPrimaryActionClass()}>View</button>
          <button onClick={() => updateOrder(order.id, 'PROCESSING')} className={getAccentActionClass('sky')}>Approve</button>
          <button onClick={() => updateOrder(order.id, 'PROCESSING')} className={getSecondaryActionClass()}>Mark Processing</button>
        </>
      );
    }

    if (order.fulfillmentStatus === 'SHIPPED' || order.fulfillmentStatus === 'DELIVERED') {
      return (
        <>
          <button onClick={() => setSelectedOrderId(order.id)} className={getPrimaryActionClass()}>View</button>
          <button onClick={() => navigator.clipboard?.writeText(order.trackingNumber ?? '')} className={getAccentActionClass('violet')}>Tracking</button>
          <button onClick={() => generateInvoice(order)} className={getSecondaryActionClass()}>Invoice</button>
        </>
      );
    }

    return (
      <>
        <button onClick={() => setSelectedOrderId(order.id)} className={getPrimaryActionClass()}>View</button>
        <button onClick={() => updateOrder(order.id, 'SHIPPED')} className={getAccentActionClass('violet')}>Mark Shipped</button>
        <button onClick={() => generateInvoice(order)} className={getSecondaryActionClass()}>Invoice</button>
      </>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.8fr)]">
        <div className="rounded-[28px] border border-primary/10 bg-[linear-gradient(135deg,#fffaf3_0%,#f7f0e5_56%,#f0e4d0_100%)] p-4 md:p-7 shadow-[0_24px_70px_-40px_rgba(87,0,19,0.42)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary/70">Orders Command Center</p>
          <h2 className="mt-2 text-2xl md:text-4xl leading-tight text-primary">Orders Ledger</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant">
            Track payment, fulfillment, wholesale complexity, and daily activity from a single operations table.
          </p>
          <div className="mt-6 grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
            <div className="rounded-2xl border border-white/70 bg-white/80 p-3 md:p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.35)]"><p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">Total Orders</p><p className="mt-2 text-2xl font-headline text-primary">{summary.totalOrders}</p></div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-3 md:p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.35)]"><p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">Pending</p><p className="mt-2 text-2xl font-headline text-[#c89b00]">{summary.pending}</p></div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-3 md:p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.35)]"><p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">In Production</p><p className="mt-2 text-2xl font-headline text-sky-700">{summary.processing}</p></div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-3 md:p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.35)]"><p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">Shipped</p><p className="mt-2 text-2xl font-headline text-violet-700">{summary.shipped}</p></div>
            <div className="rounded-2xl border border-white/70 bg-white/80 p-3 md:p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.35)]"><p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">Completed Revenue</p><p className="mt-2 text-2xl font-headline text-emerald-700">{formatCurrency(summary.completedRevenue)}</p></div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[0_18px_42px_-30px_rgba(26,28,26,0.3)]">
            <p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">Today Revenue</p>
            <p className="mt-2 text-3xl font-headline text-primary">{formatCurrency(summary.todayRevenue)}</p>
            <p className="mt-2 text-sm text-on-surface-variant">Orders This Week: {summary.ordersThisWeek}</p>
          </div>
          <div className="rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-[0_18px_42px_-30px_rgba(26,28,26,0.3)]">
            <p className="text-[10px] uppercase tracking-[0.24em] text-on-surface-variant">Recent 5 Activities</p>
            <div className="mt-3 space-y-3">
              {summary.recentActivities.map((activity) => (
                <div key={activity.id} className="rounded-xl border border-outline-variant/10 bg-surface-container-low px-3 py-2.5">
                  <p className="text-sm text-on-surface">{activity.text}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{formatDateTime(activity.timestamp)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(error || notice) && (
        <div className="space-y-3">
          {error ? <div className="rounded-2xl border border-error/20 bg-error-container/70 px-4 py-3 text-sm text-on-error-container">{error}</div> : null}
          {notice ? <div className="rounded-2xl border border-secondary/20 bg-secondary-container/45 px-4 py-3 text-sm text-on-surface">{notice}</div> : null}
        </div>
      )}

      <div className="overflow-hidden rounded-[28px] border border-outline-variant/20 bg-surface-container-lowest shadow-[0_28px_70px_-42px_rgba(26,28,26,0.34)]">
        <div className="sticky top-[76px] z-20 border-b border-outline-variant/20 bg-surface-container-lowest/95 px-4 py-4 backdrop-blur md:px-5">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search Orders..." className="rounded-xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm outline-none transition placeholder:text-on-surface-variant/55 focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <select value={orderTypeFilter} onChange={(e) => setOrderTypeFilter(e.target.value as 'ALL' | OrderType)} className="rounded-xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"><option value="ALL">Retail / Wholesale</option><option value="RETAIL">Retail</option><option value="WHOLESALE">Wholesale</option></select>
              <select value={fulfillmentFilter} onChange={(e) => setFulfillmentFilter(e.target.value as 'ALL' | OrderStatus)} className="rounded-xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"><option value="ALL">Shipping Status</option><option value="PENDING">Pending</option><option value="PROCESSING">Processing</option><option value="SHIPPED">Shipped</option><option value="DELIVERED">Delivered</option><option value="CANCELLED">Cancelled</option></select>
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value as 'ALL' | PaymentStatus)} className="rounded-xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"><option value="ALL">Payment Status</option><option value="PAID">Paid</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option></select>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value as RegionFilter)} className="rounded-xl border border-outline-variant/25 bg-surface px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"><option value="ALL">Country / Region</option><option value="INDIA">India</option><option value="INTERNATIONAL">International</option></select>
              <label className="flex items-center gap-2 rounded-xl border border-outline-variant/25 bg-white px-4 py-3 text-sm"><input type="checkbox" checked={highValueOnly} onChange={(e) => setHighValueOnly(e.target.checked)} />High Value</label>
              <button onClick={() => exportCsv(filteredOrders)} className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90">Export</button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-outline-variant/10 pt-3">
            <button disabled={selectedIds.size === 0} onClick={handleBulkShip} className={`${getAccentActionClass('violet')} disabled:opacity-40`}>Mark as Shipped</button>
            <button disabled={selectedIds.size === 0} onClick={() => exportCsv(orders.filter((order) => selectedIds.has(order.id)))} className={`${getSecondaryActionClass()} disabled:opacity-40`}>Export CSV</button>
            <button disabled={selectedIds.size === 0} onClick={() => printLabels(orders.filter((order) => selectedIds.has(order.id)))} className={`${getSecondaryActionClass()} disabled:opacity-40`}>Print Labels</button>
            <button disabled={selectedIds.size === 0} onClick={() => sendEmail(orders.filter((order) => selectedIds.has(order.id)))} className={`${getSecondaryActionClass()} disabled:opacity-40`}>Send Email</button>
          </div>
        </div>
        <div className="max-h-[650px] overflow-auto rounded-b-[28px] border-t border-outline-variant/10">
          <table className="min-w-[1100px] w-full border-collapse bg-surface-container-lowest">
            <thead className="sticky top-0 z-30 bg-surface/95 shadow-sm backdrop-blur">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
                <th className="px-4 py-4"><input type="checkbox" checked={filteredOrders.length > 0 && filteredOrders.every((order) => selectedIds.has(order.id))} onChange={(e) => setSelectedIds(e.target.checked ? new Set(filteredOrders.map((order) => order.id)) : new Set())} /></th>
                <th className="px-4 py-4">Order ID</th>
                <th className="px-4 py-4">Customer</th>
                <th className="px-4 py-4">Items</th>
                <th className="px-4 py-4">Order Date</th>
                <th className="px-4 py-4 w-[110px]">Payment</th>
                <th className="px-4 py-4 w-[120px]">Fulfillment</th>
                <th className="px-4 py-4 w-[110px]">Order Type</th>
                <th className="px-4 py-4 text-right">Total</th>
                <th className="px-4 py-4 text-center">Priority</th>
                <th className="px-4 py-4 w-[140px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={11} className="px-4 py-4"><div className="h-16 animate-pulse rounded-2xl bg-surface-container-low" /></td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-16 text-center text-on-surface-variant">No orders matched these filters.</td></tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className={`border-l-4 ${getRowBorder(order.fulfillmentStatus)} transition hover:bg-surface-container-low/55`}>
                    <td className="px-4 py-4 align-middle"><input type="checkbox" checked={selectedIds.has(order.id)} onChange={(e) => setSelectedIds((current) => { const next = new Set(current); e.target.checked ? next.add(order.id) : next.delete(order.id); return next; })} /></td>
                    <td className="px-4 py-4 align-middle"><button onClick={() => setSelectedOrderId(order.id)} className="text-left transition hover:opacity-85"><span className="block font-semibold text-primary">#{order.id.slice(-8).toUpperCase()}</span><span className="mt-1 block text-[11px] text-on-surface-variant">{order.trackingNumber ?? 'Tracking pending'}</span></button></td>
                    <td className="px-4 py-4 align-middle"><p className="text-sm font-medium text-on-surface">{order.user.name}</p><p className="mt-0.5 text-xs text-on-surface-variant">{order.user.email}</p><p className="mt-0.5 text-[11px] text-on-surface-variant">{order.shippingCity}, {order.shippingState}</p>{order.businessName ? <p className="mt-2 inline-flex rounded-md bg-primary/8 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-primary">{order.businessName}</p> : null}</td>
                    <td className="px-4 py-4 align-middle"><p className="text-sm font-medium text-on-surface">{order.itemCount} Items</p>{order.orderType === 'WHOLESALE' ? <div className="mt-1 space-y-0.5 text-[11px] leading-relaxed text-on-surface-variant"><p>MOQ: {order.moq}</p><p>Assigned: {order.assignedSalesPerson}</p><p>Production: {order.productionNotes}</p></div> : <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">{order.items[0]?.productName ?? 'Order item'}</p>}</td>
                    <td className="px-4 py-4 align-middle"><p className="text-sm font-medium text-on-surface">{formatDate(order.createdAt)}</p><p className="mt-0.5 text-[11px] text-on-surface-variant">{formatDateTime(order.createdAt)}</p>{order.requestedDeliveryDate ? <p className="mt-1.5 text-[10px] text-on-surface-variant">Req: {formatDate(order.requestedDeliveryDate)}</p> : null}</td>
                    <td className="px-4 py-4 align-middle"><span className={getPaymentPill(order.paymentStatus)}>{order.paymentStatus}</span></td>
                    <td className="px-4 py-4 align-middle"><span className={getFulfillmentPill(order.fulfillmentStatus)}>{order.fulfillmentStatus === 'DELIVERED' ? 'Delivered' : order.fulfillmentStatus}</span></td>
                    <td className="px-4 py-4 align-middle"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${order.orderType === 'WHOLESALE' ? 'bg-tertiary-fixed/60 text-tertiary' : 'bg-surface-container-low text-on-surface-variant'}`}>{order.orderType}</span></td>
                    <td className="px-4 py-4 align-middle text-right text-sm font-semibold text-on-surface">{formatCurrency(order.totalAmount)}</td>
                    <td className="px-4 py-4 align-middle text-center"><span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${order.priority === 'HIGH' ? 'bg-error-container text-error' : order.priority === 'MEDIUM' ? 'bg-tertiary-fixed/55 text-tertiary' : 'bg-surface-container-low text-on-surface-variant'}`}>{order.priority}</span></td>
                    <td className="px-4 py-4 align-middle">
                      <div className="flex flex-col gap-1.5 min-w-[120px]">
                        {renderPrimaryActions(order)}
                        <button onClick={() => setSelectedOrderId(order.id)} className={getSecondaryActionClass()}>Edit</button>
                        <button disabled={updatingIds.has(order.id)} onClick={() => updateOrder(order.id, 'CANCELLED')} className={`${getSecondaryActionClass()} !text-error hover:!border-error/30 hover:!bg-error-container/20 disabled:opacity-40`}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/35 backdrop-blur-[2px]" onClick={() => setSelectedOrderId(null)}>
          <div className="h-full w-full max-w-full md:max-w-2xl overflow-y-auto border-l border-outline-variant/20 bg-surface-container-lowest p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 -mx-6 -mt-6 flex items-start justify-between gap-4 border-b border-outline-variant/20 bg-surface-container-lowest/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-primary/70">Order Detail Drawer</p>
                <h3 className="mt-2 text-xl md:text-3xl text-primary">#{selectedOrder.id.slice(-8).toUpperCase()}</h3>
                <p className="mt-2 text-sm text-on-surface-variant">{selectedOrder.user.name} · {selectedOrder.user.email}</p>
              </div>
              <button onClick={() => setSelectedOrderId(null)} className={getSecondaryActionClass()}>Close</button>
            </div>

            <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2">
              <div className="rounded-2xl border border-outline-variant/12 bg-surface p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.25)]"><p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">Customer Details</p><p className="mt-3 font-semibold text-on-surface">{selectedOrder.shippingName}</p><p className="mt-1 text-sm text-on-surface-variant">{selectedOrder.user.email}</p><p className="mt-1 text-sm text-on-surface-variant">{selectedOrder.shippingPhone ?? 'Phone not provided'}</p>{selectedOrder.businessName ? <p className="mt-2 text-sm text-on-surface">Business: {selectedOrder.businessName}</p> : null}</div>
              <div className="rounded-2xl border border-outline-variant/12 bg-surface p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.25)]"><p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">Shipping Address</p><p className="mt-3 text-sm leading-6 text-on-surface">{selectedOrder.shippingAddress}</p><p className="mt-1 text-sm text-on-surface">{selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingZip}</p></div>
              <div className="rounded-2xl border border-outline-variant/12 bg-surface p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.25)]"><p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">Payment Method</p><p className="mt-3 text-sm text-on-surface">{selectedOrder.paymentMethod}</p><p className="mt-1 text-sm text-on-surface-variant">Payment Status: {selectedOrder.paymentStatus}</p></div>
              <div className="rounded-2xl border border-outline-variant/12 bg-surface p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.25)]"><p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">Tracking Number</p><p className="mt-3 text-sm text-on-surface">{selectedOrder.trackingNumber ?? 'Pending allocation'}</p><p className="mt-1 text-sm text-on-surface-variant">Fulfillment: {selectedOrder.fulfillmentStatus}</p></div>
            </div>

            <div className="mt-6 rounded-2xl border border-outline-variant/12 bg-surface p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.25)]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">Ordered Products</p>
              <div className="mt-4 space-y-3">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-xl border border-outline-variant/10 bg-surface-container-low px-4 py-3">
                    <div><p className="font-medium text-on-surface">{item.productName}</p><p className="text-xs text-on-surface-variant">{item.variantName ?? 'Base item'} · Qty {item.quantity}</p></div>
                    <p className="font-semibold text-on-surface">{formatCurrency(item.priceAtPurchase * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.orderType === 'WHOLESALE' ? <div className="mt-6 rounded-2xl border border-outline-variant/12 bg-surface p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.25)]"><p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">Wholesale Notes</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><p className="text-sm text-on-surface">MOQ: {selectedOrder.moq}</p><p className="text-sm text-on-surface">Requested Delivery: {selectedOrder.requestedDeliveryDate ? formatDate(selectedOrder.requestedDeliveryDate) : 'TBD'}</p><p className="text-sm text-on-surface">Assigned Sales Person: {selectedOrder.assignedSalesPerson}</p><p className="text-sm text-on-surface">Production Notes: {selectedOrder.productionNotes}</p></div></div> : null}

            <div className="mt-6 rounded-2xl border border-outline-variant/12 bg-surface p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.25)]">
              <p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">Order Timeline</p>
              <div className="mt-4 space-y-3">
                <div className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-primary" /><p className="text-sm text-on-surface">{formatDate(selectedOrder.createdAt)} - Order placed</p></div>
                <div className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-secondary" /><p className="text-sm text-on-surface">{formatDate(selectedOrder.createdAt)} - Payment {selectedOrder.paymentStatus === 'PAID' ? 'confirmed' : selectedOrder.paymentStatus.toLowerCase()}</p></div>
                <div className="flex gap-3"><span className="mt-1 h-2 w-2 rounded-full bg-sky-600" /><p className="text-sm text-on-surface">{formatDate(selectedOrder.updatedAt)} - {selectedOrder.fulfillmentStatus === 'PROCESSING' ? 'Production started' : selectedOrder.fulfillmentStatus === 'SHIPPED' ? 'Shipped' : selectedOrder.fulfillmentStatus === 'DELIVERED' ? 'Delivered' : 'Awaiting processing'}</p></div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-outline-variant/12 bg-surface p-4 shadow-[0_10px_30px_-24px_rgba(26,28,26,0.25)]"><p className="text-[10px] uppercase tracking-[0.22em] text-on-surface-variant">Internal Notes</p><p className="mt-3 text-sm leading-7 text-on-surface">{selectedOrder.internalNotes}</p></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

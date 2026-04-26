import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import type { DashboardStats, AdminOrder, OrderStatus } from '../../lib/types';

// ─── Helpers ─────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: 'bg-tertiary-fixed', text: 'text-on-tertiary-fixed-variant', label: 'Pending' },
    PROCESSING: { bg: 'bg-secondary-container', text: 'text-on-secondary-container', label: 'Processing' },
    SHIPPED: { bg: 'bg-surface-variant', text: 'text-on-surface-variant', label: 'Shipped' },
    DELIVERED: { bg: 'bg-secondary-fixed', text: 'text-on-secondary-fixed-variant', label: 'Completed' },
    CANCELLED: { bg: 'bg-error-container', text: 'text-on-error-container', label: 'Cancelled' },
  };
  const style = map[status] ?? map.PENDING;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}

function getStatusLabel(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Completed',
    CANCELLED: 'Cancelled',
  };

  return map[status];
}

function getStatusOptions(currentStatus: OrderStatus): OrderStatus[] {
  return Array.from(new Set([currentStatus, 'PENDING', 'DELIVERED']));
}

// ─── Skeleton Loaders ────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden shadow-[0_8px_30px_-12px_rgba(26,28,26,0.08)] flex flex-col justify-between h-40 animate-pulse">
      <div className="flex justify-between items-start">
        <div className="h-4 w-24 bg-surface-container-high rounded" />
        <div className="h-10 w-10 bg-surface-container-high rounded-md" />
      </div>
      <div>
        <div className="h-10 w-20 bg-surface-container-high rounded mb-2" />
        <div className="h-3 w-32 bg-surface-container-high rounded" />
      </div>
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="border-b border-outline-variant/10 animate-pulse">
      <td className="py-4 pl-2"><div className="h-4 w-20 bg-surface-container-high rounded" /></td>
      <td className="py-4"><div className="h-4 w-28 bg-surface-container-high rounded" /></td>
      <td className="py-4"><div className="h-4 w-24 bg-surface-container-high rounded" /></td>
      <td className="py-4"><div className="h-4 w-16 bg-surface-container-high rounded" /></td>
      <td className="py-4"><div className="h-5 w-20 bg-surface-container-high rounded-full" /></td>
      <td className="py-4 text-right pr-2"><div className="h-5 w-5 bg-surface-container-high rounded ml-auto" /></td>
    </tr>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  async function fetchDashboard() {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, ordersRes] = await Promise.all([
        api.admin.getDashboardStats(),
        api.admin.getRecentOrders(5),
      ]);

      setStats(statsRes.data);
      setRecentOrders(ordersRes.data);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function handleStatusChange(orderId: string, nextStatus: OrderStatus) {
    const previousOrders = recentOrders;
    const previousStats = stats;
    const currentOrder = recentOrders.find((order) => order.id === orderId);

    if (!currentOrder || currentOrder.status === nextStatus) {
      return;
    }

    setUpdatingOrderId(orderId);
    setError(null);

    setRecentOrders((orders) =>
      orders.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order))
    );

    if (previousStats) {
      const pendingDelta =
        (currentOrder.status === 'PENDING' ? -1 : 0) + (nextStatus === 'PENDING' ? 1 : 0);

      setStats({
        ...previousStats,
        pendingOrders: Math.max(0, previousStats.pendingOrders + pendingDelta),
      });
    }

    try {
      await api.admin.updateOrderStatus(orderId, nextStatus);
    } catch (err: any) {
      console.error('Order status update error:', err);
      setRecentOrders(previousOrders);
      setStats(previousStats);
      setError(err.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  }

  // ── Error State ──────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-8">
        <div className="bg-error-container/30 border border-error/30 rounded-xl p-8 text-center">
          <span className="material-symbols-outlined text-error text-4xl mb-4 block">error</span>
          <h3 className="font-headline text-xl text-error mb-2">Failed to load dashboard</h3>
          <p className="font-body text-sm text-on-error-container mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-on-primary px-6 py-2 rounded-md font-body text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl md:text-3xl font-headline text-primary mb-2">Hindustan Embroidery Overview</h2>
          <p className="text-on-surface-variant text-sm font-body">
            Track studio operations, active orders, and inventory signals across the Hindustan Embroidery admin desk.
          </p>
        </div>
        {/* Quick Actions Desktop */}
        <div className="hidden lg:flex gap-3">
          <Link
            to="/admin/products"
            className="bg-surface-container-lowest text-primary text-sm font-bold py-2 px-4 rounded-md shadow-[0_4px_20px_-4px_rgba(26,28,26,0.06)] hover:bg-surface-container-low transition-colors flex items-center gap-2 border border-outline-variant/10"
          >
            <span className="material-symbols-outlined text-sm">add</span> Add Product
          </Link>
          <Link
            to="/admin/categories"
            className="bg-surface-container-lowest text-primary text-sm font-bold py-2 px-4 rounded-md shadow-[0_4px_20px_-4px_rgba(26,28,26,0.06)] hover:bg-surface-container-low transition-colors flex items-center gap-2 border border-outline-variant/10"
          >
            <span className="material-symbols-outlined text-sm">category</span> Add Category
          </Link>
        </div>
      </div>

      {/* Summary Cards Grid (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : stats ? (
          <>
            {/* Total Orders */}
            <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden shadow-[0_8px_30px_-12px_rgba(26,28,26,0.08)] flex flex-col justify-between h-40">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-fixed/30 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start z-10">
                <p className="text-on-surface-variant font-medium text-sm font-body">Total Orders</p>
                <span className="material-symbols-outlined text-primary bg-primary-fixed/50 p-2 rounded-md">shopping_bag</span>
              </div>
              <div className="z-10">
                <h3 className="text-3xl md:text-4xl font-headline text-primary">{stats.totalOrders}</h3>
                <p className="text-xs text-on-surface-variant mt-2 font-body">All time orders placed</p>
              </div>
            </div>
            {/* Revenue */}
            <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden shadow-[0_8px_30px_-12px_rgba(26,28,26,0.08)] flex flex-col justify-between h-40">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-tertiary-fixed/30 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start z-10">
                <p className="text-on-surface-variant font-medium text-sm font-body">Revenue</p>
                <span className="material-symbols-outlined text-tertiary bg-tertiary-fixed/50 p-2 rounded-md">payments</span>
              </div>
              <div className="z-10">
                <h3 className="text-2xl md:text-3xl font-headline text-on-surface">{formatCurrency(stats.totalRevenue)}</h3>
                <p className="text-xs text-on-surface-variant mt-2 font-body">Total revenue earned</p>
              </div>
            </div>
            {/* Pending Orders */}
            <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden shadow-[0_8px_30px_-12px_rgba(26,28,26,0.08)] flex flex-col justify-between h-40">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-error-container/50 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start z-10">
                <p className="text-on-surface-variant font-medium text-sm font-body">Pending Orders</p>
                <span className="material-symbols-outlined text-error bg-error-container/50 p-2 rounded-md">schedule</span>
              </div>
              <div className="z-10">
                <h3 className="text-3xl md:text-4xl font-headline text-error">{stats.pendingOrders}</h3>
                <p className="text-xs text-on-surface-variant mt-2 font-body">
                  {stats.pendingOrders > 0 ? 'Requires immediate action' : 'All caught up!'}
                </p>
              </div>
            </div>
            {/* Total Products */}
            <div className="bg-surface-container-lowest p-6 rounded-lg relative overflow-hidden shadow-[0_8px_30px_-12px_rgba(26,28,26,0.08)] flex flex-col justify-between h-40">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary-container/50 rounded-full blur-2xl pointer-events-none" />
              <div className="flex justify-between items-start z-10">
                <p className="text-on-surface-variant font-medium text-sm font-body">Total Products</p>
                <span className="material-symbols-outlined text-secondary bg-secondary-container/50 p-2 rounded-md">inventory_2</span>
              </div>
              <div className="z-10">
                <h3 className="text-3xl md:text-4xl font-headline text-on-surface">{stats.totalProducts}</h3>
                <p className="text-xs text-on-surface-variant mt-2 font-body">
                  {stats.totalCustomers} registered customers
                </p>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Main Dashboard Area (Asymmetric Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table (Takes up 2/3 width) */}
        <div className="lg:col-span-2 bg-surface-container-low rounded-xl p-8 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-headline text-primary">Recent Orders</h3>
            <Link to="/admin/orders" className="text-sm font-bold text-primary hover:text-primary-container transition-colors">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-outline-variant/20 text-on-surface-variant text-sm font-bold font-body">
                  <th className="pb-4 font-medium pl-2">Order ID</th>
                  <th className="pb-4 font-medium">Customer</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium">Amount</th>
                  <th className="pb-4 font-medium">Status</th>
                  <th className="pb-4 font-medium text-right pr-2">Items</th>
                </tr>
              </thead>
              <tbody className="text-sm font-body">
                {loading ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-4xl mb-2 block opacity-40">inbox</span>
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={`${idx < recentOrders.length - 1 ? 'border-b border-outline-variant/10' : ''} hover:bg-surface-container-lowest/50 transition-colors`}
                    >
                      <td className="py-4 pl-2 font-mono text-on-surface-variant">
                        #{order.id.slice(-8).toUpperCase()}
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-on-surface">{order.user.name}</span>
                      </td>
                      <td className="py-4 text-on-surface-variant">{formatDate(order.createdAt)}</td>
                      <td className="py-4 font-medium">{formatCurrency(order.totalAmount)}</td>
                      <td className="py-4">
                        <div className="flex flex-col items-start gap-2">
                          {getStatusBadge(order.status)}
                          <label className="sr-only" htmlFor={`recent-order-status-${order.id}`}>
                            Update order status
                          </label>
                          <select
                            id={`recent-order-status-${order.id}`}
                            value={order.status}
                            onChange={(event) => handleStatusChange(order.id, event.target.value as OrderStatus)}
                            disabled={updatingOrderId === order.id}
                            className="min-w-32 rounded-md border border-outline-variant/30 bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-on-surface outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {getStatusOptions(order.status).map((status) => (
                              <option key={status} value={status}>
                                {getStatusLabel(status)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="py-4 text-right pr-2 text-on-surface-variant">
                        {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (Widgets) */}
        <div className="flex flex-col gap-8">
          {/* Low Stock Products */}
          <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_30px_-12px_rgba(26,28,26,0.06)] border border-outline-variant/10">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-error">warning</span>
              <h3 className="text-lg font-headline text-on-surface">Low Stock Alert</h3>
            </div>
            {loading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-surface-container-low rounded-md">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-container-high rounded" />
                      <div>
                        <div className="h-4 w-24 bg-surface-container-high rounded mb-1" />
                        <div className="h-3 w-16 bg-surface-container-high rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats && stats.lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.lowStockProducts.map((product) => (
                  <div key={product.id} className="flex justify-between items-center p-3 bg-error-container/20 rounded-md">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 bg-surface-container-low rounded bg-cover bg-center"
                        style={product.imageUrl ? { backgroundImage: `url('${product.imageUrl}')` } : undefined}
                      >
                        {!product.imageUrl && (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-outline text-sm">image</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-surface font-body">{product.name}</p>
                        <p className="text-xs text-error font-medium">{product.stockQuantity} units left</p>
                      </div>
                    </div>
                    <Link
                      to="/admin/products"
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Restock
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-on-surface-variant">
                <span className="material-symbols-outlined text-3xl mb-2 block text-secondary">check_circle</span>
                <p className="text-sm font-body">All products are well stocked!</p>
              </div>
            )}
          </div>

          {/* Quick Actions Mobile (Visible only on smaller screens) */}
          <div className="lg:hidden bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_30px_-12px_rgba(26,28,26,0.06)] border border-outline-variant/10">
            <h3 className="text-lg font-headline text-on-surface mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/products" className="bg-surface-container-low text-primary text-xs font-bold py-3 rounded-md hover:bg-surface-variant transition-colors flex flex-col items-center gap-1">
                <span className="material-symbols-outlined">add</span> Add Product
              </Link>
              <Link to="/admin/categories" className="bg-surface-container-low text-primary text-xs font-bold py-3 rounded-md hover:bg-surface-variant transition-colors flex flex-col items-center gap-1">
                <span className="material-symbols-outlined">category</span> Add Category
              </Link>
              <Link to="/admin/orders" className="bg-surface-container-low text-primary text-xs font-bold py-3 rounded-md hover:bg-surface-variant transition-colors flex flex-col items-center gap-1">
                <span className="material-symbols-outlined">list_alt</span> View Orders
              </Link>
              <Link to="/admin/customers" className="bg-surface-container-low text-primary text-xs font-bold py-3 rounded-md hover:bg-surface-variant transition-colors flex flex-col items-center gap-1">
                <span className="material-symbols-outlined">group</span> Customers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

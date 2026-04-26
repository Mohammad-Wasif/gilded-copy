import React, { useEffect, useMemo, useState } from 'react';
import { Search, Wallet, Package, ShieldCheck, Award } from 'lucide-react';
import { api } from '../../lib/api';
import { Order } from '../../lib/types';

const formatCurrency = (value: string | number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const statusStyles: Record<string, string> = {
  DELIVERED: 'bg-secondary-container text-on-secondary-container',
  SHIPPED: 'bg-tertiary-container text-on-tertiary-container',
  PROCESSING: 'bg-surface-variant text-on-surface-variant',
  PENDING: 'bg-surface-variant text-on-surface-variant',
  CANCELLED: 'bg-error-container text-on-error-container',
};

const statusLabels: Record<string, string> = {
  DELIVERED: 'Delivered',
  SHIPPED: 'In Transit',
  PROCESSING: 'Processing',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
};

const getOrderTitle = (order: Order) => {
  if (order.items.length === 0) return 'No items';
  if (order.items.length === 1) return order.items[0].productName;
  return `${order.items[0].productName} +${order.items.length - 1} more`;
};

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setLoading(true);
      setErrorMessage('');

      try {
        const response = await api.orders.getOrders();
        if (!isMounted) return;

        if (response.success) {
          setOrders(response.data ?? []);
        } else {
          setErrorMessage(response.message || 'Failed to fetch orders.');
        }
      } catch (error: any) {
        if (!isMounted) return;
        setErrorMessage(error.message || 'Failed to fetch orders.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) => {
      const orderId = order.id.toLowerCase();
      const status = order.status.toLowerCase();
      const names = order.items
        .map((item) => `${item.productName} ${item.variantName ?? ''}`.toLowerCase())
        .join(' ');

      return orderId.includes(query) || status.includes(query) || names.includes(query);
    });
  }, [orders, searchQuery]);

  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const totalItems = orders.reduce(
    (sum, order) => sum + order.items.reduce((count, item) => count + item.quantity, 0),
    0
  );
  const deliveredOrders = orders.filter((order) => order.status === 'DELIVERED').length;
  const latestOrder = orders[0];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <h1 className="text-5xl font-serif font-bold text-primary tracking-tight mb-4">Order Archive</h1>
          <p className="text-on-surface-variant font-body max-w-lg">
            Review your curated acquisitions of heritage embroidery and bespoke commissions. Each piece tells a story of generations.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              className="bg-surface-container-low border-none border-b border-outline-variant focus:ring-0 focus:border-primary font-body text-sm py-3 pl-4 pr-10 min-w-[280px]"
              placeholder="Search orders..."
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" size={18} />
          </div>
        </div>
      </header>

      <div className="bg-surface-container-low overflow-hidden rounded-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-outline-variant/10">
                <th className="px-8 py-6 font-sans uppercase tracking-widest text-[11px] text-on-surface-variant">Order ID</th>
                <th className="px-8 py-6 font-sans uppercase tracking-widest text-[11px] text-on-surface-variant">Date Placed</th>
                <th className="px-8 py-6 font-sans uppercase tracking-widest text-[11px] text-on-surface-variant">Status</th>
                <th className="px-8 py-6 font-sans uppercase tracking-widest text-[11px] text-on-surface-variant text-right">Total Amount</th>
                <th className="px-8 py-6 font-sans uppercase tracking-widest text-[11px] text-on-surface-variant text-center">Items</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/5">
              {loading && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant font-body">
                    Loading your orders...
                  </td>
                </tr>
              )}

              {!loading && errorMessage && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-error font-body font-semibold">
                    {errorMessage}
                  </td>
                </tr>
              )}

              {!loading && !errorMessage && filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-on-surface-variant font-body">
                    {orders.length === 0
                      ? 'No orders yet. Your confirmed purchases will appear here.'
                      : 'No orders matched your search.'}
                  </td>
                </tr>
              )}

              {!loading && !errorMessage && filteredOrders.map((order) => (
                <tr key={order.id} className="bg-surface-container-lowest hover:bg-surface transition-colors">
                  <td className="px-8 py-8">
                    <span className="font-body font-bold text-primary">#{order.id.slice(-8).toUpperCase()}</span>
                    <div className="text-[10px] uppercase tracking-tighter text-on-surface-variant mt-1">
                      {getOrderTitle(order)}
                    </div>
                  </td>
                  <td className="px-8 py-8 font-body text-on-surface">{formatDate(order.createdAt)}</td>
                  <td className="px-8 py-8">
                    <span
                      className={`inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                        statusStyles[order.status] || statusStyles.PENDING
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-8 py-8 font-serif font-bold text-right text-on-surface">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-8 py-8 text-center font-body text-sm text-on-surface-variant">
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        <div className="md:col-span-7 bg-surface-container-lowest p-12 relative overflow-hidden">
          <h2 className="text-3xl font-serif font-bold text-primary mb-6">Need assistance with an heirloom?</h2>
          <p className="text-on-surface-variant font-body mb-8 leading-relaxed">
            Our master artisans are available for consultation regarding the care, preservation, or restoration of your heritage pieces. Contact our concierge service for bespoke support.
          </p>
          <button className="bg-primary text-on-primary px-8 py-4 rounded-md font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity">
            Connect with Concierge
          </button>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-tertiary-container/10 rounded-full blur-3xl"></div>
        </div>
        <div className="md:col-span-5 aspect-[4/5] relative">
          <img
            alt="Heritage Crafts"
            className="w-full h-full object-cover rounded-sm shadow-xl grayscale hover:grayscale-0 transition-all duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiLV4n1KyFAA8udpj8DhbmTv9HV_MULoa-HiY2SOho9rLD6e9YGpN1hsDoATzgSX5O_esPCE0GzFw0oX-sRmyxkEwQNdNgEi3YIANg1YyKVKPlGL3tPMaT_u-qY12Nq3eEhsNZNoyt0_lGzEUhrprH8qvFja52_gtV65tpNujP3A_Q-ar2I6WsR_y2QJehIaBFJLkUi5U8kJtOLNXcDJB1TFiji_vLQ__hvmqkI1WXtCQv8p3avmh-jebX7IfeFs9z915h4XstMQA"
          />
          <div className="absolute -top-4 -left-4 bg-tertiary-container p-6 w-32 h-32 flex items-center justify-center text-center shadow-lg">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-tertiary-container">Artisan Certified</span>
          </div>
        </div>
      </div>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-surface-container p-8 rounded-sm">
          <div style={{ color: 'rgb(204 167 48)' }} className="mb-4">
            <Wallet size={32} />
          </div>
          <p className="font-sans uppercase text-[10px] tracking-widest text-on-surface-variant mb-1">Total Spent</p>
          <h4 className="text-2xl font-serif font-bold text-on-surface">{formatCurrency(totalSpent)}</h4>
        </div>
        <div className="bg-surface-container p-8 rounded-sm">
          <div style={{ color: 'rgb(204 167 48)' }} className="mb-4">
            <Package size={32} />
          </div>
          <p className="font-sans uppercase text-[10px] tracking-widest text-on-surface-variant mb-1">Items Collected</p>
          <h4 className="text-2xl font-serif font-bold text-on-surface">{totalItems} Pieces</h4>
        </div>
        <div className="bg-surface-container p-8 rounded-sm">
          <div style={{ color: 'rgb(204 167 48)' }} className="mb-4">
            <ShieldCheck size={32} />
          </div>
          <p className="font-sans uppercase text-[10px] tracking-widest text-on-surface-variant mb-1">Orders Completed</p>
          <h4 className="text-2xl font-serif font-bold text-on-surface">{deliveredOrders}</h4>
        </div>
        <div className="bg-surface-container p-8 rounded-sm">
          <div style={{ color: 'rgb(204 167 48)' }} className="mb-4">
            <Award size={32} />
          </div>
          <p className="font-sans uppercase text-[10px] tracking-widest text-on-surface-variant mb-1">Latest Status</p>
          <h4 className="text-2xl font-serif font-bold text-on-surface">
            {latestOrder ? statusLabels[latestOrder.status] || latestOrder.status : 'No Orders'}
          </h4>
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;

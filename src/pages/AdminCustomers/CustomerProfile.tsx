import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ArrowLeft, User, Mail, Phone, MapPin, Building, Activity, ShoppingBag, Plus, Save, Clock, MessageCircle } from 'lucide-react';

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'ORDERS' | 'CRM'>('DETAILS');

  // Form states for CRM editing
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Comms logging
  const [logContent, setLogContent] = useState('');
  const [logType, setLogType] = useState('EMAIL');

  const loadProfile = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.admin.customers.getProfile(id);
      setProfile(res.data);
      setStatus(res.data.status);
      setType(res.data.type);
      setNotes(res.data.notes || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveDetails = async () => {
    try {
      setSaving(true);
      await api.admin.customers.update(id!, { status, type, notes });
      setEditing(false);
      loadProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logContent.trim()) return;
    try {
      setSaving(true);
      await api.admin.customers.logCommunication(id!, { type: logType, content: logContent });
      setLogContent('');
      loadProfile();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse">Loading profile...</div>;
  if (!profile) return <div className="p-12 text-center text-error">Customer not found.</div>;

  const formatMoney = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  
  const getWhatsAppLink = (phone?: string | null) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    return `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone.replace('+','') : cleanPhone}`;
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/customers" className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low hover:bg-surface-container-highest transition">
          <ArrowLeft size={20} className="text-on-surface" />
        </Link>
        <div>
          <h2 className="text-3xl font-headline text-primary">{profile.businessName || profile.name}</h2>
          <p className="text-sm text-on-surface-variant font-mono mt-1">ID: {profile.id}</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Lifetime Value</p>
          <p className="text-2xl font-headline text-primary">{formatMoney(profile.stats.lifetimeSpend)}</p>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Total Orders</p>
          <p className="text-2xl font-headline text-primary">{profile.stats.totalOrders}</p>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Average Order Value</p>
          <p className="text-2xl font-headline text-primary">{formatMoney(profile.stats.averageOrderValue)}</p>
        </div>
        <div className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant/15">
          <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1">Top Category</p>
          <p className="text-lg font-headline text-primary truncate" title={profile.stats.mostPurchasedProduct || 'N/A'}>
            {profile.stats.mostPurchasedProduct || 'None yet'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Contact & Details */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/15">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface mb-6 border-b border-outline-variant/10 pb-4">Contact Info</h3>
            
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <User size={18} className="text-on-surface-variant mt-0.5" />
                <div>
                  <p className="text-sm text-on-surface font-semibold">{profile.name}</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mt-0.5">Primary Contact</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-center">
                <Mail size={18} className="text-on-surface-variant" />
                <a href={`mailto:${profile.email}`} className="text-sm text-primary hover:underline">{profile.email}</a>
              </div>
              
              <div className="flex gap-4 items-center">
                <Phone size={18} className="text-on-surface-variant" />
                {profile.phone ? (
                  <p className="text-sm text-on-surface">{profile.phone}</p>
                ) : (
                  <p className="text-sm italic text-on-surface-variant/50">Unknown</p>
                )}
              </div>
              
              {(profile.country || profile.city) && (
                <div className="flex gap-4 items-start">
                  <MapPin size={18} className="text-on-surface-variant mt-0.5" />
                  <p className="text-sm text-on-surface">{profile.city}{profile.city && profile.country ? ', ' : ''}{profile.country}</p>
                </div>
              )}

              {profile.businessName && (
                <div className="flex gap-4 items-start">
                  <Building size={18} className="text-on-surface-variant mt-0.5" />
                  <div>
                    <p className="text-sm text-on-surface">{profile.businessName}</p>
                    {profile.gstVat && <p className="text-[11px] font-mono text-on-surface-variant mt-0.5">GST/VAT: {profile.gstVat}</p>}
                  </div>
                </div>
              )}
            </div>

            {getWhatsAppLink(profile.phone) && (
              <a 
                href={getWhatsAppLink(profile.phone)!} 
                target="_blank" rel="noopener noreferrer"
                className="mt-6 w-full py-2.5 rounded-xl bg-[#25D366]/10 text-[#128C7E] font-bold text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-[#25D366]/20 transition"
              >
                <MessageCircle size={18} /> Send WhatsApp
              </a>
            )}
          </div>

          {/* Status & Type Editor */}
          <div className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/15">
            <div className="flex items-center justify-between border-b border-outline-variant/10 pb-4 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface">CRM Settings</h3>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="text-xs font-bold text-primary uppercase tracking-wider hover:underline">Edit</button>
              ) : (
                <button onClick={handleSaveDetails} disabled={saving} className="text-xs font-bold text-secondary uppercase tracking-wider hover:underline flex items-center gap-1">
                  <Save size={14} /> Save
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Customer Type</label>
                  <select 
                    value={type} onChange={(e) => setType(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale Partner</option>
                    <option value="ARTISAN">Artisan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">Status</label>
                  <select 
                    value={status} onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="NEW">New</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="BLACKLISTED">Blacklisted</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Type</span>
                  <span className="px-3 py-1 bg-surface-container-high rounded-md text-xs font-bold tracking-wider">{profile.type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-on-surface-variant">Status</span>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold tracking-wider ${profile.status === 'ACTIVE' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-on-surface'}`}>{profile.status}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-2 p-1 bg-surface-container-lowest rounded-2xl border border-outline-variant/15 w-fit">
            <button 
              onClick={() => setActiveTab('DETAILS')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${activeTab === 'DETAILS' ? 'bg-surface shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              CRM Notes
            </button>
            <button 
              onClick={() => setActiveTab('ORDERS')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${activeTab === 'ORDERS' ? 'bg-surface shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              Order History
            </button>
            <button 
              onClick={() => setActiveTab('CRM')}
              className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${activeTab === 'CRM' ? 'bg-surface shadow-[0_2px_10px_rgba(0,0,0,0.05)] text-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              Interactions
            </button>
          </div>

          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant/15 overflow-hidden min-h-[500px]">
            {activeTab === 'DETAILS' && (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-headline text-primary">Internal Notes</h3>
                </div>
                {editing ? (
                  <textarea 
                    value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add private notes about this client's preferences, special arrangements... (Not visible to customer)"
                    className="w-full h-64 bg-surface-container-low border border-outline-variant/20 rounded-2xl p-4 text-sm focus:border-primary focus:outline-none"
                  />
                ) : (
                  <div className="bg-surface-container-low/30 rounded-2xl p-6 min-h-[200px] border border-outline-variant/10 text-sm text-on-surface whitespace-pre-wrap">
                    {profile.notes || <span className="italic text-on-surface-variant/50">No notes available. Click Edit in the CRM Settings panel to add notes.</span>}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ORDERS' && (
              <div className="divide-y divide-outline-variant/10">
                {profile.orders.length === 0 ? (
                  <div className="p-12 text-center text-on-surface-variant">No orders found for this customer.</div>
                ) : (
                  profile.orders.map((order: any) => (
                    <div key={order.id} className="p-6 flex items-center justify-between hover:bg-surface-container-low/30 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                          <ShoppingBag size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">Order #{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-[11px] text-on-surface-variant mt-1.5 flex gap-2">
                            <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className="font-bold uppercase tracking-wider">{order.status}</span>
                            <span>•</span>
                            <span>{order.items.length} items</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-on-surface">{formatMoney(parseFloat(order.totalAmount))}</p>
                        <Link to="/admin/orders" className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1 hover:underline block">View Order</Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'CRM' && (
              <div className="p-6 lg:p-8">
                {/* Add Log Form */}
                <form onSubmit={handleAddLog} className="mb-10 bg-surface-container-low/50 rounded-2xl p-4 border border-outline-variant/10">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-4">Log New Interaction</h4>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <select 
                      value={logType} onChange={(e) => setLogType(e.target.value)}
                      className="bg-surface border border-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:border-primary focus:outline-none sm:w-48"
                    >
                      <option value="EMAIL">Email</option>
                      <option value="WHATSAPP">WhatsApp</option>
                      <option value="CALL">Phone Call</option>
                      <option value="MEETING">Meeting</option>
                    </select>
                    <input 
                      type="text" 
                      placeholder="Brief summary of interaction..." 
                      value={logContent} onChange={(e) => setLogContent(e.target.value)}
                      className="flex-1 bg-surface border border-outline-variant/20 rounded-xl px-4 py-2 text-sm focus:border-primary focus:outline-none"
                    />
                    <button 
                      type="submit" disabled={saving || !logContent.trim()}
                      className="px-6 py-2 bg-secondary text-on-secondary font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-90 transition disabled:opacity-50 shrink-0"
                    >
                      Save Log
                    </button>
                  </div>
                </form>

                {/* Timeline */}
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-outline-variant/10 before:via-outline-variant/30 before:to-transparent">
                  {profile.communicationLogs.length === 0 ? (
                    <div className="text-center text-sm text-on-surface-variant py-8 relative z-10">No interactions logged yet.</div>
                  ) : (
                    profile.communicationLogs.map((log: any) => (
                      <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-container-lowest bg-surface-container-high text-on-surface-variant shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm relative z-10">
                          {log.type === 'EMAIL' ? <Mail size={16} /> :
                           log.type === 'WHATSAPP' ? <MessageCircle size={16} /> :
                           log.type === 'CALL' ? <Phone size={16} /> : <Activity size={16} />}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-outline-variant/15 bg-surface shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{log.type}</span>
                            <span className="text-[10px] text-on-surface-variant">{new Date(log.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-on-surface">{log.content}</p>
                          <p className="text-[10px] text-on-surface-variant/70 mt-3 pt-2 border-t border-outline-variant/10">Logged by {log.admin.name}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

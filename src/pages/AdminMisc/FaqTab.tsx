import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2, Save, X, HelpCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqGroup {
  id: string;
  title: string;
  items: FaqItem[];
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Default FAQ data matching the storefront
const defaultFaqGroups: FaqGroup[] = [
  {
    id: 'orders', title: 'Orders & Availability',
    items: [
      { id: generateId(), question: 'Are all products available year-round?', answer: 'Our core materials such as zari, dabka, beads, sequins, and trims are generally available throughout the year. Limited heritage and deadstock collections are released in small batches and may not be restocked.' },
      { id: generateId(), question: 'How can I check if a product is in stock?', answer: 'Each product page displays its availability status: In Stock, Low Stock, Made to Order, or Sold Out.' },
      { id: generateId(), question: 'Can I reserve items before placing a bulk order?', answer: 'Yes. We can temporarily reserve materials for confirmed projects while you finalize quantities. Reservation requests are reviewed based on availability.' },
      { id: generateId(), question: 'Do you restock sold-out items?', answer: 'Some standard materials are restocked regularly, but limited or heritage collections may not return once sold out.' },
      { id: generateId(), question: 'Is there a minimum order quantity?', answer: 'Retail orders have no minimum. Wholesale or bulk orders may have minimum quantity requirements depending on the product type.' },
      { id: generateId(), question: 'Can I request large quantities for production?', answer: 'Yes. For studio or production requirements, we recommend contacting us in advance to confirm availability and timelines.' },
      { id: generateId(), question: 'Can I mix different products in one order?', answer: 'Yes. You can combine multiple products in a single retail order. Bulk orders may be processed separately.' },
      { id: generateId(), question: 'How accurate are product colors and finishes shown online?', answer: 'We aim for high accuracy, but slight variations may occur due to lighting and screen differences. For critical projects, we recommend confirming before ordering.' },
    ]
  },
  {
    id: 'shipping', title: 'Shipping & Delivery',
    items: [
      { id: generateId(), question: 'How long does dispatch take?', answer: 'Retail orders are typically dispatched within 2–4 business days. Bulk or custom orders may take longer depending on preparation.' },
      { id: generateId(), question: 'Do you ship internationally?', answer: 'Yes. We ship worldwide to artisans, boutiques, costume houses, and production studios.' },
      { id: generateId(), question: 'How long does delivery take?', answer: 'Domestic delivery usually takes 3–7 days. International shipping timelines vary based on destination and customs processing.' },
      { id: generateId(), question: 'Will I receive tracking details?', answer: 'Yes. Tracking information is shared via email or WhatsApp once your order is dispatched.' },
      { id: generateId(), question: 'Are there any customs charges for international orders?', answer: 'Custom duties and taxes (if applicable) are the responsibility of the customer and vary by country.' },
      { id: generateId(), question: 'Can I request urgent or priority shipping?', answer: 'Yes. If you need expedited shipping, contact us before placing the order to check availability.' },
      { id: generateId(), question: 'What happens if my order is delayed?', answer: 'If your order is delayed, contact us with your order number and we will provide an update and support.' },
      { id: generateId(), question: 'Do you ship fragile or high-value materials securely?', answer: 'Yes. All orders are carefully packed to protect delicate embroidery materials during transit.' },
    ]
  },
  {
    id: 'wholesale', title: 'Wholesale & Bulk Orders',
    items: [
      { id: generateId(), question: 'Do you offer wholesale pricing?', answer: 'Yes. We provide wholesale pricing for boutiques, studios, export houses, and production units.' },
      { id: generateId(), question: 'How can I apply for wholesale access?', answer: 'Submit your business details through our contact or wholesale inquiry form. Our team will review and respond.' },
      { id: generateId(), question: 'What information is required for wholesale approval?', answer: 'Business name, location, product requirements, estimated quantities, and type of business.' },
      { id: generateId(), question: 'Can I place recurring bulk orders?', answer: 'Yes. We support ongoing supply for studios and production teams.' },
      { id: generateId(), question: 'Do you provide custom sourcing for bulk projects?', answer: 'Yes. We can source specific materials based on finish, texture, size, or reference samples.' },
      { id: generateId(), question: 'Can you match materials from a reference image?', answer: 'In many cases, yes. Share a clear image or sample, and we will suggest the closest match or source it.' },
      { id: generateId(), question: 'What is the lead time for bulk or custom orders?', answer: 'Lead times vary depending on quantity and sourcing complexity. Most requests are reviewed within 3–5 working days.' },
      { id: generateId(), question: 'Do you offer special pricing for large-volume orders?', answer: 'Yes. Pricing is adjusted based on quantity and product category.' },
    ]
  },
  {
    id: 'product', title: 'Product & Care',
    items: [
      { id: generateId(), question: 'How should embroidery materials be stored?', answer: 'Store in a cool, dry place away from sunlight, humidity, and corrosive surfaces.' },
      { id: generateId(), question: 'How do I prevent tarnishing of metallic materials?', answer: 'Use acid-free wrapping and keep materials sealed in protective packaging.' },
      { id: generateId(), question: 'Are your materials suitable for bridal and couture work?', answer: 'Yes. Our materials are widely used in bridal, couture, costume, and high-end design applications.' },
      { id: generateId(), question: 'Do you offer material recommendations for specific use cases?', answer: 'Yes. You can contact us for suggestions based on your project requirements.' },
      { id: generateId(), question: 'Can I use these materials for machine embroidery?', answer: 'Some materials are suitable, but we recommend checking compatibility based on the technique.' },
      { id: generateId(), question: 'Do you provide samples before bulk purchase?', answer: 'For large orders, sample requests can be reviewed based on availability.' },
      { id: generateId(), question: 'Are product measurements and specifications accurate?', answer: 'Yes. We maintain high accuracy, but slight variations may occur in handmade or heritage materials.' },
      { id: generateId(), question: 'How do I choose the right material for my project?', answer: 'You can explore product categories or contact us for guidance based on design, finish, and budget.' },
    ]
  },
  {
    id: 'support', title: 'Account & Support',
    items: [
      { id: generateId(), question: 'Do I need an account to place an order?', answer: 'No. You can checkout as a guest. Creating an account helps with tracking and managing orders.' },
      { id: generateId(), question: 'What can I do with a customer account?', answer: 'View orders, save addresses, track shipments, and manage account details.' },
      { id: generateId(), question: 'How do I reset my password?', answer: 'Use the "Forgot Password" option on the login page.' },
      { id: generateId(), question: 'How can I contact support?', answer: 'You can reach us via contact form, WhatsApp, or email.' },
      { id: generateId(), question: 'What details should I include when contacting support?', answer: 'Order number, issue description, and relevant images (if applicable).' },
      { id: generateId(), question: 'How quickly will I receive a response?', answer: 'Most queries are responded to within 24–48 hours.' },
      { id: generateId(), question: 'Can I modify or cancel an order after placing it?', answer: 'Changes may be possible before dispatch. Contact us immediately after placing the order.' },
      { id: generateId(), question: 'What should I do if I receive a damaged or incorrect product?', answer: 'Contact us within 48 hours with photos and order details. We will assist with resolution.' },
    ]
  },
];

export default function FaqTab() {
  const [groups, setGroups] = useState<FaqGroup[]>(defaultFaqGroups);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchFaq = async () => {
      try {
        const res = await api.settings.get('faq_data');
        if (mounted && res?.value) {
          const parsed = typeof res.value === 'string' ? JSON.parse(res.value) : res.value;
          setGroups(parsed);
        }
      } catch (err) {
        console.error('Failed to load FAQ from backend, using defaults', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchFaq();
    return () => { mounted = false; };
  }, []);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  // New group
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupTitle, setNewGroupTitle] = useState('');

  // New item
  const [addingToGroup, setAddingToGroup] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const [saved, setSaved] = useState(false);

  const updateState = (updated: FaqGroup[]) => {
    setGroups(updated);
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      await api.admin.settings.update('faq_data', groups);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save FAQ to backend', err);
      alert(`Failed to save changes: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  // Group operations
  const addGroup = () => {
    if (!newGroupTitle.trim()) return;
    const id = newGroupTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    updateState([...groups, { id, title: newGroupTitle.trim(), items: [] }]);
    setNewGroupTitle(''); setShowNewGroup(false);
  };

  const deleteGroup = (groupId: string) => {
    if (!window.confirm('Delete this entire FAQ group and all its questions?')) return;
    updateState(groups.filter(g => g.id !== groupId));
  };

  // Item operations
  const addItem = (groupId: string) => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    updateState(groups.map(g => g.id === groupId ? { ...g, items: [...g.items, { id: generateId(), question: newQuestion.trim(), answer: newAnswer.trim() }] } : g));
    setNewQuestion(''); setNewAnswer(''); setAddingToGroup(null);
  };

  const startEditing = (item: FaqItem) => {
    setEditingItem(item.id); setEditQuestion(item.question); setEditAnswer(item.answer);
  };

  const saveEditing = (groupId: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    updateState(groups.map(g => g.id === groupId ? { ...g, items: g.items.map(i => i.id === editingItem ? { ...i, question: editQuestion.trim(), answer: editAnswer.trim() } : i) } : g));
    setEditingItem(null);
  };

  const deleteItem = (groupId: string, itemId: string) => {
    updateState(groups.map(g => g.id === groupId ? { ...g, items: g.items.filter(i => i.id !== itemId) } : g));
  };

  const resetToDefaults = () => {
    if (!window.confirm('Reset all FAQ data to defaults? This will overwrite your changes.')) return;
    updateState(defaultFaqGroups);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-1">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-primary" />
            <h2 className="font-headline text-xl">FAQ Management</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {saved && <span className="text-sm text-primary font-medium animate-pulse">✓ Saved</span>}
            <button onClick={resetToDefaults} className="text-xs font-medium text-on-surface-variant hover:text-error transition-colors flex items-center gap-1">
              <AlertTriangle size={12} /> Reset to Defaults
            </button>
            <button onClick={handleSaveAll} disabled={isSaving} className="bg-primary text-on-primary px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant">
          Manage the FAQ sections displayed on the Help & FAQ page. Changes are saved dynamically to the database.
        </p>
      </div>

      {/* FAQ Groups */}
      {groups.map(group => (
        <div key={group.id} className="rounded-2xl border border-outline-variant/30 bg-surface shadow-sm overflow-hidden">
          {/* Group Header */}
          <div
            className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors gap-4 cursor-pointer"
            onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
          >
            <div className="flex items-center gap-3">
              <h3 className="font-headline text-lg text-on-surface">{group.title}</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{group.items.length} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  deleteGroup(group.id); 
                }} 
                className="p-1.5 rounded text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-colors"
                title="Delete Group"
              >
                <Trash2 size={14} />
              </button>
              {expandedGroup === group.id ? <ChevronUp size={18} className="text-on-surface-variant" /> : <ChevronDown size={18} className="text-on-surface-variant" />}
            </div>
          </div>

          {/* Expanded Content */}
          {expandedGroup === group.id && (
            <div className="border-t border-outline-variant/20 p-5 space-y-3">
              {group.items.map(item => (
                <div key={item.id} className="rounded-lg border border-outline-variant/20 p-4">
                  {editingItem === item.id ? (
                    <div className="space-y-3">
                      <input value={editQuestion} onChange={e => setEditQuestion(e.target.value)} className="w-full rounded-lg border border-outline-variant p-2.5 text-sm font-medium" placeholder="Question" />
                      <textarea value={editAnswer} onChange={e => setEditAnswer(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant p-2.5 text-sm" placeholder="Answer" />
                      <div className="flex gap-2">
                        <button onClick={() => saveEditing(group.id)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"><Save size={14} className="inline mr-1" />Save</button>
                        <button onClick={() => setEditingItem(null)} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium hover:bg-surface-variant"><X size={14} className="inline mr-1" />Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-on-surface">{item.question}</p>
                          <p className="mt-1 text-sm text-on-surface-variant leading-relaxed">{item.answer}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button onClick={() => startEditing(item)} className="p-1.5 rounded text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => deleteItem(group.id, item.id)} className="p-1.5 rounded text-on-surface-variant/50 hover:text-error hover:bg-error/10 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add New Item */}
              {addingToGroup === group.id ? (
                <div className="rounded-lg border-2 border-dashed border-primary/30 p-4 space-y-3">
                  <input value={newQuestion} onChange={e => setNewQuestion(e.target.value)} className="w-full rounded-lg border border-outline-variant p-2.5 text-sm" placeholder="New question..." />
                  <textarea value={newAnswer} onChange={e => setNewAnswer(e.target.value)} rows={3} className="w-full rounded-lg border border-outline-variant p-2.5 text-sm" placeholder="Answer..." />
                  <div className="flex gap-2">
                    <button onClick={() => addItem(group.id)} disabled={!newQuestion.trim() || !newAnswer.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Add Question</button>
                    <button onClick={() => { setAddingToGroup(null); setNewQuestion(''); setNewAnswer(''); }} className="rounded-lg border border-outline-variant px-4 py-2 text-sm font-medium hover:bg-surface-variant">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingToGroup(group.id)} className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant/30 py-3 text-sm font-medium text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors">
                  <Plus size={16} /> Add Question
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Add New Group */}
      {showNewGroup ? (
        <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-surface p-6 space-y-4">
          <h3 className="font-headline text-lg">New FAQ Group</h3>
          <input value={newGroupTitle} onChange={e => setNewGroupTitle(e.target.value)} className="w-full rounded-lg border border-outline-variant p-2.5" placeholder="Group title (e.g. Payment & Pricing)" />
          <div className="flex gap-2">
            <button onClick={addGroup} disabled={!newGroupTitle.trim()} className="rounded-lg bg-primary px-5 py-2.5 font-medium text-white disabled:opacity-50">Create Group</button>
            <button onClick={() => { setShowNewGroup(false); setNewGroupTitle(''); }} className="rounded-lg border border-outline-variant px-5 py-2.5 font-medium hover:bg-surface-variant">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowNewGroup(true)} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-outline-variant/30 py-6 text-sm font-medium text-on-surface-variant hover:border-primary/50 hover:text-primary transition-colors">
          <Plus size={18} /> Add New FAQ Group
        </button>
      )}
    </div>
  );
}

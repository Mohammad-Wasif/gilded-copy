import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Edit2, Save, X, HelpCircle, AlertTriangle } from 'lucide-react';

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
      { id: generateId(), question: 'Can I reserve items before placing a bulk order?', answer: 'Yes. We can temporarily reserve materials for confirmed projects while you finalize quantities.' },
      { id: generateId(), question: 'Is there a minimum order quantity?', answer: 'Retail orders have no minimum. Wholesale or bulk orders may have minimum quantity requirements depending on the product type.' },
    ]
  },
  {
    id: 'shipping', title: 'Shipping & Delivery',
    items: [
      { id: generateId(), question: 'How long does dispatch take?', answer: 'Retail orders are typically dispatched within 2–4 business days.' },
      { id: generateId(), question: 'Do you ship internationally?', answer: 'Yes. We ship worldwide to artisans, boutiques, costume houses, and production studios.' },
      { id: generateId(), question: 'How long does delivery take?', answer: 'Domestic delivery usually takes 3–7 days. International shipping timelines vary based on destination.' },
    ]
  },
  {
    id: 'returns', title: 'Returns & Exchanges',
    items: [
      { id: generateId(), question: 'What is your return policy?', answer: 'We accept returns within 7 days if the product is unused and in original packaging.' },
      { id: generateId(), question: 'Can I exchange materials?', answer: 'Exchanges are possible for standard items. Custom or cut-to-order products cannot be exchanged.' },
    ]
  },
  {
    id: 'wholesale', title: 'Wholesale & Bulk',
    items: [
      { id: generateId(), question: 'How do I apply for wholesale pricing?', answer: 'You can apply through our Contact page or reach out directly via WhatsApp for wholesale inquiries.' },
      { id: generateId(), question: 'What discounts are available for bulk orders?', answer: 'Bulk pricing depends on quantity and product type. Contact us for a custom quote.' },
    ]
  },
];

const STORAGE_KEY = 'admin_faq_data';

function loadFaqData(): FaqGroup[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return defaultFaqGroups;
}

function saveFaqData(groups: FaqGroup[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

export default function FaqTab() {
  const [groups, setGroups] = useState<FaqGroup[]>(loadFaqData);
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

  const persist = (updated: FaqGroup[]) => {
    setGroups(updated);
    saveFaqData(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Group operations
  const addGroup = () => {
    if (!newGroupTitle.trim()) return;
    const id = newGroupTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    persist([...groups, { id, title: newGroupTitle.trim(), items: [] }]);
    setNewGroupTitle(''); setShowNewGroup(false);
  };

  const deleteGroup = (groupId: string) => {
    if (!window.confirm('Delete this entire FAQ group and all its questions?')) return;
    persist(groups.filter(g => g.id !== groupId));
  };

  // Item operations
  const addItem = (groupId: string) => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    persist(groups.map(g => g.id === groupId ? { ...g, items: [...g.items, { id: generateId(), question: newQuestion.trim(), answer: newAnswer.trim() }] } : g));
    setNewQuestion(''); setNewAnswer(''); setAddingToGroup(null);
  };

  const startEditing = (item: FaqItem) => {
    setEditingItem(item.id); setEditQuestion(item.question); setEditAnswer(item.answer);
  };

  const saveEditing = (groupId: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;
    persist(groups.map(g => g.id === groupId ? { ...g, items: g.items.map(i => i.id === editingItem ? { ...i, question: editQuestion.trim(), answer: editAnswer.trim() } : i) } : g));
    setEditingItem(null);
  };

  const deleteItem = (groupId: string, itemId: string) => {
    persist(groups.map(g => g.id === groupId ? { ...g, items: g.items.filter(i => i.id !== itemId) } : g));
  };

  const resetToDefaults = () => {
    if (!window.confirm('Reset all FAQ data to defaults? This will overwrite your changes.')) return;
    persist(defaultFaqGroups);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-primary" />
            <h2 className="font-headline text-xl">FAQ Management</h2>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-sm text-primary font-medium animate-pulse">✓ Saved</span>}
            <button onClick={resetToDefaults} className="text-xs font-medium text-on-surface-variant hover:text-error transition-colors flex items-center gap-1">
              <AlertTriangle size={12} /> Reset to Defaults
            </button>
          </div>
        </div>
        <p className="text-sm text-on-surface-variant">
          Manage the FAQ sections displayed on the Help & FAQ page. Changes are saved automatically to local storage.
        </p>
        <p className="mt-2 text-xs text-on-surface-variant/70 italic">
          Note: To make FAQ data dynamic from the database, a backend API can be added later. Currently stored in browser localStorage.
        </p>
      </div>

      {/* FAQ Groups */}
      {groups.map(group => (
        <div key={group.id} className="rounded-2xl border border-outline-variant/30 bg-surface shadow-sm overflow-hidden">
          {/* Group Header */}
          <button
            onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
            className="w-full flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3">
              <h3 className="font-headline text-lg text-on-surface">{group.title}</h3>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{group.items.length} questions</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); deleteGroup(group.id); }} className="p-1.5 rounded text-on-surface-variant/40 hover:text-error hover:bg-error/10 transition-colors">
                <Trash2 size={14} />
              </button>
              {expandedGroup === group.id ? <ChevronUp size={18} className="text-on-surface-variant" /> : <ChevronDown size={18} className="text-on-surface-variant" />}
            </div>
          </button>

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

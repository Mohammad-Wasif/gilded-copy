import { useState } from 'react';
import { Layers, Award, HelpCircle } from 'lucide-react';
import ApplicationsTab from './ApplicationsTab';
import BestSellersTab from './BestSellersTab';
import FaqTab from './FaqTab';

const tabs = [
  { id: 'applications', label: 'Applications', icon: Layers },
  { id: 'bestsellers', label: 'Best Sellers', icon: Award },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
] as const;

type TabId = typeof tabs[number]['id'];

export default function AdminMisc() {
  const [activeTab, setActiveTab] = useState<TabId>('applications');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline text-3xl font-medium text-on-surface">Misc Settings</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Manage storefront sections and content</p>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 rounded-xl border border-outline-variant/30 bg-surface-container-low p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'applications' && <ApplicationsTab />}
      {activeTab === 'bestsellers' && <BestSellersTab />}
      {activeTab === 'faq' && <FaqTab />}
    </div>
  );
}

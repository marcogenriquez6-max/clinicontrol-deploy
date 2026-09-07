import { useState, type ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  badge?: string | number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  variant?: 'pills' | 'underline' | 'cards';
  onChange?: (tabId: string) => void;
}

export default function Tabs({ tabs, defaultTab, className = '', variant = 'pills', onChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleChange = (id: string) => {
    setActiveTab(id);
    onChange?.(id);
  };

  const active = tabs.find(t => t.id === activeTab) || tabs[0];

  const tabStyles = {
    pills: {
      container: 'flex gap-1 p-1 bg-[var(--bg-tertiary)] rounded-xl',
      tab: (active: boolean) =>
        `flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
          active ? 'bg-[var(--bg-primary)] text-[var(--primary-600)] shadow-sm' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
        }`,
    },
    underline: {
      container: 'flex gap-0 border-b border-[var(--border-primary)]',
      tab: (active: boolean) =>
        `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 ${
          active ? 'border-[var(--primary-500)] text-[var(--primary-600)]' : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--border-primary)]'
        }`,
    },
    cards: {
      container: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3',
      tab: (active: boolean) =>
        `flex items-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
          active ? 'bg-[var(--primary-50)] border-[var(--primary-200)] text-[var(--primary-700)] shadow-sm' : 'bg-[var(--bg-card)] border-[var(--border-primary)] text-[var(--text-secondary)] hover:border-[var(--neutral-300)] hover:shadow-sm'
        }`,
    },
  };

  const style = tabStyles[variant];

  return (
    <div className={className}>
      <div className={style.container}>
        {tabs.filter(t => !t.disabled).map(tab => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={style.tab(activeTab === tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className={`ml-auto px-1.5 py-0.5 text-xs font-bold rounded-full ${
                activeTab === tab.id ? 'bg-[var(--primary-200)] text-[var(--primary-800)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="mt-6" key={active?.id}>
        {active?.content}
      </div>
    </div>
  );
}

import type { ReactNode } from 'react';
import { useState } from 'react';
import TopNav from './TopNav';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import ToastContainer from '../ui/Toast';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <Sidebar collapsed={collapsed} onToggleCollapsed={() => setCollapsed(!collapsed)} />
      <TopNav collapsed={collapsed} />
      <main className={`pt-14 pb-[calc(3.75rem+env(safe-area-inset-bottom))] transition-[padding] duration-300 lg:pb-0 ${collapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {children}
        </div>
      </main>
      <BottomNav />
      <ToastContainer />
    </div>
  );
}

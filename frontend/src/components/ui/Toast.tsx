import { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

let addToastFn: ((toast: Omit<ToastMessage, 'id'>) => void) | null = null;

export function toast(type: ToastType, title: string, message?: string) {
  addToastFn?.({ type, title, message });
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((t: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { ...t, id }]);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="fixed top-5 right-5 z-[300] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast: t, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    const leaveTimer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(() => onRemove(t.id), 300);
    }, 4000);
    return () => clearTimeout(leaveTimer);
  }, [t.id, onRemove]);

  const config = {
    success: { icon: CheckCircle, border: 'border-[var(--success-200)]', bg: 'bg-[var(--success-50)]', titleColor: 'text-emerald-800', iconColor: 'text-[var(--success-500)]' },
    error: { icon: XCircle, border: 'border-[var(--danger-200)]', bg: 'bg-[var(--danger-50)]', titleColor: 'text-red-800', iconColor: 'text-[var(--danger-500)]' },
    warning: { icon: AlertTriangle, border: 'border-amber-200', bg: 'bg-amber-50', titleColor: 'text-amber-800', iconColor: 'text-amber-500' },
    info: { icon: Info, border: 'border-[var(--primary-200)]', bg: 'bg-[var(--primary-50)]', titleColor: 'text-blue-800', iconColor: 'text-[var(--primary-500)]' },
  };

  const c = config[t.type];
  const Icon = c.icon;

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border bg-[var(--bg-card)] shadow-xl
        transition-all duration-300 ease-out
        ${isLeaving ? 'opacity-0 translate-x-8 scale-95' : isVisible ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-95'}
      `}
    >
      <div className={`p-1.5 rounded-xl ${c.bg} flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${c.iconColor}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${c.titleColor}`}>{t.title}</p>
        {t.message && <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{t.message}</p>}
      </div>
      <button onClick={() => { setIsLeaving(true); setTimeout(() => onRemove(t.id), 300); }} className="flex-shrink-0 p-0.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

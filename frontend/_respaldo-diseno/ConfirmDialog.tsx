import { useEffect, useCallback, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, X } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  detail?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'info' | 'warning';
  loading?: boolean;
  icon?: ReactNode;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  detail,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'info',
  loading = false,
  icon,
}: ConfirmDialogProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !loading) onClose();
  }, [onClose, loading]);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setMounted(true);
        requestAnimationFrame(() => setVisible(true));
      });
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      requestAnimationFrame(() => setVisible(false));
      const timer = setTimeout(() => setMounted(false), 200);
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      return () => clearTimeout(timer);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!mounted) return null;

  const config = {
    danger: {
      icon: icon || <XCircle className="w-10 h-10 text-[var(--danger-500)]" />,
      bg: 'bg-[var(--danger-50)]',
      border: 'border-[var(--danger-200)]',
      btn: 'bg-gradient-to-r from-danger-500 to-danger-600 text-white shadow-sm hover:from-danger-600 hover:to-danger-700',
      iconCircle: 'bg-[var(--danger-100)]',
    },
    success: {
      icon: icon || <CheckCircle className="w-10 h-10 text-[var(--success-500)]" />,
      bg: 'bg-[var(--success-50)]',
      border: 'border-[var(--success-200)]',
      btn: 'bg-gradient-to-r from-success-500 to-success-600 text-white shadow-sm hover:from-success-600 hover:to-success-700',
      iconCircle: 'bg-[var(--success-100)]',
    },
    info: {
      icon: icon || <Info className="w-10 h-10 text-[var(--primary-500)]" />,
      bg: 'bg-[var(--primary-50)]',
      border: 'border-[var(--primary-200)]',
      btn: 'bg-gradient-to-r from-[var(--primary-600)] to-[var(--primary-800)] text-white shadow-sm hover:from-[var(--primary-700)] hover:to-[var(--primary-900)]',
      iconCircle: 'bg-[var(--primary-100)]',
    },
    warning: {
      icon: icon || <AlertTriangle className="w-10 h-10 text-[var(--warning-500)]" />,
      bg: 'bg-[var(--warning-50)]',
      border: 'border-[var(--warning-200)]',
      btn: 'bg-gradient-to-r from-[var(--warning-500)] to-[var(--warning-600)] text-white shadow-sm hover:from-[var(--warning-600)] hover:to-[var(--warning-700)]',
      iconCircle: 'bg-[var(--warning-100)]',
    },
  };

  const style = config[variant];

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`} onClick={() => !loading && onClose()} />
        <div className={`relative bg-[var(--bg-card)] rounded-lg shadow-2xl w-full max-w-md transform transition-all duration-300 ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className="flex items-center justify-between px-6 pt-6 pb-0">
            <div className={`p-3 rounded-lg ${style.iconCircle}`}>
              {style.icon}
            </div>
            <button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="px-6 py-4">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{message}</p>
            {detail && (
              <div className={`mt-3 p-3 rounded-lg ${style.bg} border ${style.border}`}>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{detail}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 px-6 pb-6">
            <button
              className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium text-[var(--text-primary)] bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] transition-all disabled:opacity-50 active:scale-[0.97]"
              onClick={onClose}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.97] ${style.btn}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {!loading && confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

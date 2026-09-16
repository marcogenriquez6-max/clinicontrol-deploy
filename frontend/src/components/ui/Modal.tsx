import { useEffect, useCallback, useState, useRef, type ReactNode } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full' | '2xl';
  showClose?: boolean;
  preventClose?: boolean;
  accent?: 'primary' | 'success' | 'danger' | 'warning' | 'accent' | 'fuchsia' | 'rose';
  /** Si hay cambios sin guardar, al cerrar se muestra una confirmación antes de perderlos. */
  hasUnsavedChanges?: boolean;
  unsavedTitle?: string;
  unsavedMessage?: string;
}

const accentBars: Record<string, string> = {
  primary: 'bg-[var(--primary-600)]',
  success: 'bg-gradient-to-r from-[var(--success-500)] to-[var(--success-600)]',
  danger: 'bg-gradient-to-r from-[var(--danger-500)] to-[var(--danger-600)]',
  warning: 'bg-gradient-to-r from-[var(--warning-500)] to-[var(--warning-600)]',
  accent: 'bg-gradient-to-r from-[var(--info-500)] to-[var(--info-600)]',
  fuchsia: 'bg-gradient-to-r from-[var(--fuchsia-500)] to-[var(--fuchsia-600)]',
  rose: 'bg-gradient-to-r from-[var(--rose-500)] to-[var(--rose-600)]',
};

export default function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true, preventClose = false, accent, hasUnsavedChanges = false, unsavedTitle = 'Cambios sin guardar', unsavedMessage = 'Hay cambios sin guardar. ¿Salir de todos modos?' }: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const requestClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setConfirmClose(true);
    } else {
      onClose();
    }
  }, [hasUnsavedChanges, onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && !preventClose) requestClose();
  }, [preventClose, requestClose]);

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

  const sizes: Record<string, string> = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    '2xl': 'max-w-3xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-all duration-300 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => !preventClose && requestClose()}
      />

      {/* Scroll container */}
      <div className="fixed inset-0 z-[101] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 pt-16 sm:pt-24 pb-16 sm:pb-24">
          <div
            ref={cardRef}
            className={`relative w-full ${sizes[size]} bg-[var(--bg-card)] rounded-2xl shadow-2xl border border-[var(--border-primary)]/10 transform transition-all duration-300 ${
              visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
            }`}
          >
            {accent && <div className={`h-1 w-full rounded-t-2xl ${accentBars[accent]}`} />}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)]">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
              {showClose && (
                <button
                  onClick={requestClose}
                  className="p-1.5 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all duration-200 active:scale-90"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="p-6">{children}</div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={() => { setConfirmClose(false); onClose(); }}
        title={unsavedTitle}
        message={unsavedMessage}
        confirmText="Salir sin guardar"
        cancelText="Continuar editando"
        variant="warning"
        icon={<AlertTriangle className="w-10 h-10 text-amber-500" />}
        detail="Los cambios que haya realizado en este formulario no se guardarán si continúa."
      />
    </>
  );
}
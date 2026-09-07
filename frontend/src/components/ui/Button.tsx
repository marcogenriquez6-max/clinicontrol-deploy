import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', loading, icon, fullWidth, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-semibold transition-all duration-150 select-none active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-400)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-secondary)]';
    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-md',
      md: 'px-4 py-2 text-sm gap-2 rounded-lg',
      lg: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
    };
    const variants = {
      primary: 'bg-[var(--primary-600)] text-white shadow-sm hover:bg-[var(--primary-700)] hover:shadow-md active:bg-[var(--primary-800)]',
      secondary: 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-primary)] hover:bg-[var(--bg-secondary)] hover:border-[var(--neutral-300)]',
      danger: 'bg-[var(--danger-600)] text-white shadow-sm hover:bg-[var(--danger-700)] hover:shadow-md',
      success: 'bg-[var(--success-600)] text-white shadow-sm hover:bg-[var(--success-700)] hover:shadow-md',
      ghost: 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]',
      outline: 'border border-[var(--primary-300)] text-[var(--primary-700)] bg-transparent hover:bg-[var(--primary-50)] hover:border-[var(--primary-400)]',
      premium: 'bg-gradient-to-b from-[var(--primary-500)] to-[var(--primary-700)] text-white shadow-sm hover:shadow-md hover:brightness-110',
    };

    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${sizes[size]} ${icon ? '!p-2' : ''} ${fullWidth ? 'w-full' : ''} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className={`animate-spin ${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />}
        {!loading && children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
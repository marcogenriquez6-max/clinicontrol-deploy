import { forwardRef, type InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  helperText?: string;
  prefix?: React.ReactNode;
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helperText, prefix, id, required, onFocus, onBlur, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            {label}{required && <span className="text-[var(--danger-500)] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {prefix && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[var(--text-tertiary)]">
              {prefix}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            onFocus={onFocus}
            onBlur={onBlur}
            className={`
              w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 rounded-xl text-sm text-[var(--text-primary)]
              placeholder:text-[var(--text-tertiary)] transition-all duration-200
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-400)]
              ${error
                ? 'border-[var(--danger-500)] focus:border-[var(--danger-500)] focus:ring-4 focus:ring-[var(--danger-100)]'
                : 'border-[var(--border-primary)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)] focus:shadow-[var(--shadow-glow-primary)]'
              }
              ${prefix ? 'pl-10' : ''}
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--bg-tertiary)]
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-[var(--danger-500)] font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-xs text-[var(--text-tertiary)]">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
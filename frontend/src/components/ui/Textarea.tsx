import { forwardRef, type TextareaHTMLAttributes } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, id, required, ...props }, ref) => {
    const textareaId = id || `textarea-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            {label}{required && <span className="text-[var(--danger-500)] ml-0.5">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={`
            w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 rounded-xl text-sm text-[var(--text-primary)]
            placeholder:text-[var(--text-tertiary)] resize-none min-h-[100px] transition-all duration-200 focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)]
            ${error ? 'border-[var(--danger-500)] focus:border-[var(--danger-500)] focus:ring-4 focus:ring-[var(--danger-100)]' : 'border-[var(--border-primary)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)]'}
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--bg-tertiary)]
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-[var(--danger-500)] font-medium">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
export default Textarea;

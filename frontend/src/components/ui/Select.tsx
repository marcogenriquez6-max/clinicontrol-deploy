import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option { value: string | number; label: string; }

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, options, placeholder, id, required, ...props }, ref) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
            {label}{required && <span className="text-[var(--danger-500)] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`
              w-full px-3.5 py-2.5 bg-[var(--bg-primary)] border-2 rounded-xl text-sm text-[var(--text-primary)]
              appearance-none cursor-pointer transition-all duration-200 focus-visible:outline-2 focus-visible:ring-2 focus-visible:ring-[var(--primary-400)]
              ${error ? 'border-[var(--danger-500)] focus:border-[var(--danger-500)] focus:ring-4 focus:ring-[var(--danger-100)]' : 'border-[var(--border-primary)] focus:border-[var(--primary-500)] focus:ring-4 focus:ring-[var(--primary-100)]'}
              disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--bg-tertiary)]
              ${className}
            `}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((option, index) => (
              <option key={option.value != null ? option.value : index} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)] pointer-events-none transition-transform duration-200 group-focus-within:rotate-180" />
        </div>
        {error && <p className="mt-1.5 text-xs text-[var(--danger-500)] font-medium flex items-center gap-1">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
export default Select;

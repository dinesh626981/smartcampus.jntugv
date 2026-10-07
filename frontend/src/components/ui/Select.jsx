import { useState, forwardRef, useId } from 'react';
import { FaChevronDown } from 'react-icons/fa';

/**
 * Material 3 Outlined Select with Floating Label
 */
const Select = forwardRef(({
  label,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  options = [],
  children,
  error,
  helperText,
  hint,
  disabled = false,
  required = false,
  className = '',
  name,
  id: customId,
  ...props
}, ref) => {
  const generatedId = useId();
  const selectId = customId || name || generatedId;
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = (value !== undefined && value !== null && value !== '') ||
                   (defaultValue !== undefined && defaultValue !== null && defaultValue !== '');
  const isFloated = isFocused || hasValue || true; // Select label stays floated to avoid obscuring option text

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div className={`w-full flex flex-col ${className}`}>
      <div className="relative w-full">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          className={`
            w-full h-14 bg-transparent text-[var(--md-sys-color-on-surface)]
            text-base font-normal rounded-input
            px-4 pr-10 appearance-none
            border transition-all duration-150 outline-none
            ${error
              ? 'border-2 border-[var(--md-sys-color-error)]'
              : isFocused
                ? 'border-2 border-[var(--md-sys-color-primary)] ring-0'
                : 'border border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-outline)]'
            }
            ${disabled ? 'opacity-38 cursor-not-allowed bg-neutral-100/50' : 'cursor-pointer'}
          `}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={typeof opt === 'string' ? opt : opt.value}
                  value={typeof opt === 'string' ? opt : opt.value}
                  className="bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)]"
                >
                  {typeof opt === 'string' ? opt : opt.label}
                </option>
              ))
            : children}
        </select>

        {label && (
          <label
            htmlFor={selectId}
            className={`
              absolute pointer-events-none transition-all duration-150 select-none
              bg-[var(--md-sys-color-surface)] px-1 left-3
              -top-2 text-xs font-medium z-10
              ${error
                ? 'text-[var(--md-sys-color-error)]'
                : isFocused
                  ? 'text-[var(--md-sys-color-primary)] font-medium'
                  : 'text-[var(--md-sys-color-on-surface-variant)]'
              }
              ${disabled ? 'opacity-38' : ''}
            `}
          >
            {label}
            {required && <span className="text-[var(--md-sys-color-error)] ml-0.5">*</span>}
          </label>
        )}

        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none">
          <FaChevronDown className="h-3 w-3" />
        </div>
      </div>

      {(error || helperText || hint) && (
        <div className="px-4 pt-1 text-xs">
          <span className={error ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}>
            {error || helperText || hint}
          </span>
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;

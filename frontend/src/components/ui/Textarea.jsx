import { useState, forwardRef, useId } from 'react';

/**
 * Material 3 Outlined Textarea with Floating Label & Counter
 */
const Textarea = forwardRef(({
  label,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  error,
  helperText,
  counter,
  maxLength,
  rows = 4,
  disabled = false,
  required = false,
  className = '',
  name,
  id: customId,
  ...props
}, ref) => {
  const generatedId = useId();
  const textareaId = customId || name || generatedId;
  const [isFocused, setIsFocused] = useState(false);

  const hasValue = (value !== undefined && value !== null && value !== '') ||
                   (defaultValue !== undefined && defaultValue !== null && defaultValue !== '');

  const isFloated = isFocused || hasValue || !!placeholder;

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={`w-full flex flex-col ${className}`}>
      <div className="relative w-full">
        <textarea
          ref={ref}
          id={textareaId}
          name={name}
          rows={rows}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          maxLength={maxLength}
          required={required}
          placeholder={isFocused ? placeholder : ''}
          className={`
            w-full bg-transparent text-[var(--md-sys-color-on-surface)]
            text-base font-normal rounded-input
            p-4 outline-none transition-all duration-150 resize-y
            ${error
              ? 'border-2 border-[var(--md-sys-color-error)]'
              : isFocused
                ? 'border-2 border-[var(--md-sys-color-primary)] ring-0'
                : 'border border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-outline)]'
            }
            ${disabled ? 'opacity-38 cursor-not-allowed bg-neutral-100/50' : ''}
          `}
          {...props}
        />

        {label && (
          <label
            htmlFor={textareaId}
            className={`
              absolute pointer-events-none transition-all duration-150 select-none
              bg-[var(--md-sys-color-surface)] px-1 left-3
              ${isFloated
                ? '-top-2 text-xs font-medium z-10'
                : 'top-4 text-base font-normal'
              }
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
      </div>

      {(helperText || error || (counter && maxLength)) && (
        <div className="flex justify-between items-center px-4 pt-1 text-xs">
          <div className={error ? 'text-[var(--md-sys-color-error)]' : 'text-[var(--md-sys-color-on-surface-variant)]'}>
            {error || helperText}
          </div>
          {counter && maxLength && (
            <div className="text-[var(--md-sys-color-on-surface-variant)] text-xs font-mono ml-auto">
              {currentLength}/{maxLength}
            </div>
          )}
        </div>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;

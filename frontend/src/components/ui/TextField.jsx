import { useState, forwardRef, useId } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * Material 3 Outlined Text Field with Floating Label & Counter
 */
const TextField = forwardRef(({
  label,
  value,
  defaultValue,
  onChange,
  onFocus,
  onBlur,
  type = 'text',
  placeholder,
  error,
  helperText,
  counter,
  maxLength,
  leftIcon,
  rightIcon,
  disabled = false,
  required = false,
  className = '',
  name,
  id: customId,
  showPasswordToggle = true,
  ...props
}, ref) => {
  const generatedId = useId();
  const inputId = customId || name || generatedId;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const effectiveType = isPassword && showPassword ? 'text' : type;

  // Check if controlled or uncontrolled value is present to float the label
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
        {/* Left Icon Slot */}
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none z-10">
            {leftIcon}
          </div>
        )}

        {/* Input Element */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={effectiveType}
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
            w-full h-14 bg-transparent text-[var(--md-sys-color-on-surface)]
            text-base font-normal rounded-input
            px-4 ${leftIcon ? 'pl-11' : ''} ${(rightIcon || (isPassword && showPasswordToggle && !rightIcon)) ? 'pr-11' : ''}
            border transition-all duration-150 outline-none
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

        {/* Floating Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={`
              absolute pointer-events-none transition-all duration-150 select-none
              bg-[var(--md-sys-color-surface)] px-1
              ${leftIcon && !isFloated ? 'left-10' : 'left-3'}
              ${isFloated
                ? '-top-2 text-xs font-medium z-10'
                : 'top-1/2 -translate-y-1/2 text-base font-normal'
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

        {/* Right Icon Slot / Password Visibility Toggle */}
        {rightIcon ? (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 z-10">
            {rightIcon}
          </div>
        ) : (isPassword && showPasswordToggle) ? (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex items-center">
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="p-1.5 rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors focus:outline-none cursor-pointer"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
            </button>
          </div>
        ) : null}
      </div>

      {/* Helper text, Error & Character Counter */}
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

TextField.displayName = 'TextField';

export default TextField;

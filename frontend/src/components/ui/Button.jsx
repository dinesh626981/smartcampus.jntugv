import { forwardRef } from 'react';

/**
 * Material 3 Button Component
 * Supports filled, tonal, outlined, and text variants with 9999px pill geometry.
 */
const Button = forwardRef(({
  children,
  variant = 'filled',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}, ref) => {
  // Normalize legacy variant aliases
  let resolvedVariant = variant;
  if (variant === 'primary') resolvedVariant = 'filled';
  if (variant === 'secondary' || variant === 'outline') resolvedVariant = 'outlined';
  if (variant === 'ghost') resolvedVariant = 'text';

  const baseStyles = 'inline-flex items-center justify-center font-sans font-medium rounded-full transition-all duration-150 select-none cursor-pointer disabled:opacity-38 disabled:cursor-not-allowed whitespace-nowrap tracking-[0.1px]';

  const variantStyles = {
    filled: 'bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] hover:shadow-m3-1 active:shadow-none hover:brightness-95',
    tonal: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] hover:shadow-m3-1 hover:brightness-95',
    outlined: 'bg-transparent text-[var(--md-sys-color-primary)] border border-[var(--md-sys-color-outline-variant)] hover:bg-[var(--md-sys-color-primary)]/8 hover:border-[var(--md-sys-color-outline)]',
    text: 'bg-transparent text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/8 px-3',
    danger: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)] hover:brightness-95',
  };

  const sizeStyles = {
    sm: 'h-8 px-4 text-xs',
    md: resolvedVariant === 'text' ? 'h-10 px-3 text-sm' : 'h-10 px-6 text-sm',
    lg: 'h-12 px-7 text-base',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variantStyles[resolvedVariant] || variantStyles.filled}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{children}</span>
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="inline-flex shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="inline-flex shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

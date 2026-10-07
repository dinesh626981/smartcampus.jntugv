/**
 * Material 3 Card Component
 * 16px radius, 1px outline-variant border, clean elevation.
 */
const Card = ({
  title,
  subtitle,
  action,
  children,
  className = '',
  noPadding = false,
  variant = 'outlined', // 'outlined' or 'elevated' or 'tonal'
  ...props
}) => {
  const variantStyles = {
    outlined: 'bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]',
    elevated: 'bg-[var(--md-sys-color-surface)] shadow-m3-1 border border-transparent',
    tonal: 'bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)]',
  };

  return (
    <div
      className={`
        rounded-card overflow-hidden transition-all duration-150
        ${variantStyles[variant] || variantStyles.outlined}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-medium leading-6 text-[var(--md-sys-color-on-surface)]">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm leading-5 text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export default Card;

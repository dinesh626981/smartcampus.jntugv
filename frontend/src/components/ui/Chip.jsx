/**
 * Material 3 Chip Component
 * 8px radius, tonal surfaces, label-small typography.
 */
const Chip = ({
  children,
  variant = 'default',
  icon,
  onDelete,
  onClick,
  className = '',
  selected = false,
  ...props
}) => {
  const variantStyles = {
    default: 'bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]',
    primary: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]',
    success: 'bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)]',
    warning: 'bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)]',
    error: 'bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-error)]',
    pending: 'bg-neutral-100 text-neutral-700',
    assigned: 'bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]',
    'in progress': 'bg-[var(--md-sys-color-warning-container)] text-[var(--md-sys-color-on-warning-container)]',
    resolved: 'bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)]',
    closed: 'bg-neutral-100 text-neutral-500',
  };

  const interactiveStyles = onClick ? 'cursor-pointer hover:brightness-95 active:brightness-90' : '';
  const selectedStyles = selected ? 'border border-[var(--md-sys-color-primary)] font-semibold' : '';

  return (
    <span
      onClick={onClick}
      className={`
        inline-flex items-center gap-1.5 h-6 px-2.5 rounded-chip
        text-xs font-medium leading-4 tracking-normal transition-colors
        ${variantStyles[variant.toLowerCase()] || variantStyles.default}
        ${interactiveStyles}
        ${selectedStyles}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="text-[11px] shrink-0">{icon}</span>}
      <span>{children}</span>
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-0.5 hover:opacity-75 focus:outline-none"
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Chip;

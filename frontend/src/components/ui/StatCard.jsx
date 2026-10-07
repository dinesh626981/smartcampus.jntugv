/**
 * Material 3 StatCard Component
 * 16px radius, outline-variant border, clean metric layout.
 */
const StatCard = ({
  label,
  value,
  description,
  icon,
  trend,
  className = '',
}) => {
  return (
    <div
      className={`
        bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)]
        rounded-card p-5 transition-shadow duration-150
        flex flex-col justify-between
        ${className}
      `}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium leading-5 text-[var(--md-sys-color-on-surface-variant)]">
          {label}
        </span>
        {icon && (
          <div className="w-9 h-9 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0 text-sm">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="text-3xl font-normal leading-9 text-[var(--md-sys-color-on-surface)]">
          {value}
        </div>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-[var(--md-sys-color-on-surface-variant)]">
            {trend && <span className="font-medium text-[var(--md-sys-color-success)]">{trend}</span>}
            {description && <span>{description}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;

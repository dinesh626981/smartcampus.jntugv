/**
 * Material 3 PageHeader Component
 * Headline large (32px, 400 weight), body-medium/large subtitle, action slot.
 */
const PageHeader = ({
  title,
  subtitle,
  action,
  breadcrumbs,
  className = '',
}) => {
  return (
    <div className={`mb-6 pb-2 ${className}`}>
      {breadcrumbs && (
        <div className="mb-2 text-xs font-normal text-[var(--md-sys-color-on-surface-variant)]">
          {breadcrumbs}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] leading-[40px] font-normal tracking-normal text-[var(--md-sys-color-on-surface)]">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm sm:text-base leading-6 text-[var(--md-sys-color-on-surface-variant)] max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {action && (
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;

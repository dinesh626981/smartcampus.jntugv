import React from 'react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon,
  title = 'No items found',
  description = 'There are no records to display at this time.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 px-4 border border-dashed border-[var(--md-sys-color-outline-variant)] rounded-card bg-[var(--md-sys-color-surface-container)]/50 ${className}`}>
      {Icon && (
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] mb-3">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h3 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[var(--md-sys-color-on-surface-variant)] max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="outlined" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;

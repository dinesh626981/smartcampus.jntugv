import { useEffect, useRef } from 'react';
import Button from './Button';

/**
 * Material 3 Dialog Component
 * 28px radius, tonal surface, headline-small, body-large, right-aligned text buttons.
 */
const Dialog = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  actions,
  cancelText = 'Cancel',
  confirmText,
  onConfirm,
  confirmVariant = 'text',
  loading = false,
  maxWidth = 'max-w-md',
}) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Scrim: rgba(0,0,0,0.32) */}
      <div
        className="fixed inset-0 bg-black/32 transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Surface: 28px radius, 24px padding */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        className={`
          relative w-full ${maxWidth} z-10
          bg-[var(--md-sys-color-dialog-surface)] text-[var(--md-sys-color-on-surface)]
          rounded-dialog p-6 shadow-dialog
          transition-transform duration-200 ease-out transform scale-100
        `}
      >
        {/* Title: Headline Small (24px, 400 weight) */}
        {title && (
          <h2 className="text-2xl font-normal leading-8 text-[var(--md-sys-color-on-surface)]">
            {title}
          </h2>
        )}

        {/* Subtitle / Supporting text: Body Large (16px, secondary color) */}
        {subtitle && (
          <p className="mt-4 text-base leading-6 text-[var(--md-sys-color-on-surface-variant)]">
            {subtitle}
          </p>
        )}

        {/* Content Body: 24px top spacing if title/subtitle present */}
        <div className={title || subtitle ? 'mt-6' : ''}>
          {children}
        </div>

        {/* Actions: Right-aligned text buttons */}
        {(actions || onConfirm || onClose) && (
          <div className="mt-6 flex items-center justify-end gap-2 pt-2">
            {actions ? (
              actions
            ) : (
              <>
                {onClose && (
                  <Button variant="text" onClick={onClose} disabled={loading}>
                    {cancelText}
                  </Button>
                )}
                {onConfirm && (
                  <Button
                    variant={confirmVariant}
                    onClick={onConfirm}
                    loading={loading}
                  >
                    {confirmText || 'Confirm'}
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;

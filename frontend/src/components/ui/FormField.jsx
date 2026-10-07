/**
 * Material 3 FormField wrapper component
 */
export const FormField = ({
  label,
  required = false,
  error,
  helperText,
  children,
  className = '',
  id,
}) => {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[var(--md-sys-color-on-surface-variant)]"
        >
          {label}
          {required && <span className="text-[var(--md-sys-color-error)] ml-1">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-[var(--md-sys-color-error)] flex items-center gap-1 mt-1">
          <svg className="h-3.5 w-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">{helperText}</p>
      ) : null}
    </div>
  );
};

export default FormField;

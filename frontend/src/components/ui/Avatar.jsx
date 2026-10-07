import React, { useState } from 'react';
import { getAvatarUrl } from '../../utils/cloudinaryUrl';

/**
 * Avatar Component
 * Displays user profile photo with Cloudinary face-centering & auto-format,
 * falling back gracefully to the styled initial letter circle.
 *
 * Props:
 * - src: Profile photo URL (Cloudinary, Google, or external)
 * - name: User display name for alt text & initial letter fallback
 * - size: 'xs' (24px), 'sm' (32px), 'md' (48px), 'lg' (96px), 'xl' (128px)
 * - className: Optional custom class overrides
 * - source: Optional string ('uploaded', 'google_imported', 'google_pending')
 */
const SIZE_CONFIGS = {
  xs: { sizePx: 24, classNames: 'h-6 w-6 text-[10px]' },
  sm: { sizePx: 32, classNames: 'h-8 w-8 text-xs' },
  md: { sizePx: 48, classNames: 'h-12 w-12 text-base' },
  lg: { sizePx: 96, classNames: 'h-24 w-24 text-2xl' },
  xl: { sizePx: 128, classNames: 'h-32 w-32 text-3xl' },
};

export const Avatar = ({
  src,
  name = 'User',
  size = 'md',
  className = '',
  source = null,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const config = SIZE_CONFIGS[size] || SIZE_CONFIGS.md;
  const initial = (name && typeof name === 'string' && name.trim().length > 0)
    ? name.trim().charAt(0).toUpperCase()
    : 'U';

  const optimizedSrc = !hasError && src ? getAvatarUrl(src, config.sizePx) : null;
  const isGooglePending = source === 'google_pending' || (src && src.includes('googleusercontent.com'));

  if (!optimizedSrc || hasError) {
    return (
      <div
        className={`rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-semibold flex items-center justify-center select-none shrink-0 shadow-xs ${config.classNames} ${className}`}
        title={name}
        aria-label={name}
        {...props}
      >
        <span>{initial}</span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-full overflow-hidden shrink-0 bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] shadow-xs flex items-center justify-center relative ${config.classNames} ${className}`}
      title={name}
      {...props}
    >
      <img
        src={optimizedSrc}
        alt={name || 'User profile photo'}
        loading="lazy"
        referrerPolicy={isGooglePending ? 'no-referrer' : undefined}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover object-center"
      />
    </div>
  );
};

export default Avatar;

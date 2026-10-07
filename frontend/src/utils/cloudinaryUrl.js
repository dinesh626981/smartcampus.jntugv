/**
 * Utility to handle Cloudinary URL dynamic optimization and fallback paths.
 */

const API_BASE_URL = import.meta.env.BACKEND_API_URL || 'http://127.0.0.1:5001/api';

/**
 * Returns an optimized image URL.
 * If Cloudinary: injects f_auto,q_auto,w_{width},c_limit transformations.
 * If legacy local filename/relative path: resolves to backend API /uploads endpoint.
 *
 * @param {string} urlOrFilename - Cloudinary URL, local uploads filename, or full URL
 * @param {number} [width=900] - Target bounding width
 * @returns {string|null}
 */
export const getOptimizedImageUrl = (urlOrFilename, width = 900) => {
  if (!urlOrFilename) return null;

  const url = String(urlOrFilename).trim();
  if (!url) return null;

  // Cloudinary URL detection
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    // Avoid double transformation injection
    if (url.includes('/upload/f_auto') || url.includes('/upload/w_')) {
      return url;
    }
    const transformSegment = `f_auto,q_auto,w_${width},c_limit/`;
    return url.replace('/upload/', `/upload/${transformSegment}`);
  }

  // Already an absolute external URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Relative API uploads path
  if (url.startsWith('/api/uploads/')) {
    const host = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${host}${url}`;
  }

  // Raw filename (legacy format in database)
  return `${API_BASE_URL}/uploads/${url}`;
};

/**
 * Helper specifically for table/card thumbnail views (300px width limit)
 */
export const getThumbnailUrl = (urlOrFilename) => {
  return getOptimizedImageUrl(urlOrFilename, 300);
};

/**
 * Returns optimized avatar URL with face-centering, square crop and auto format.
 *
 * @param {string} url - Cloudinary or external URL
 * @param {number} [size=96] - Avatar dimension in pixels
 * @returns {string|null}
 */
export const getAvatarUrl = (url, size = 96) => {
  if (!url) return null;
  const clean = String(url).trim();
  if (!clean) return null;

  if (clean.includes('res.cloudinary.com') && clean.includes('/upload/')) {
    if (clean.includes('/upload/f_auto') || clean.includes('/upload/w_') || clean.includes('/upload/c_fill')) {
      return clean;
    }
    const transformSegment = `f_auto,q_auto,w_${size},h_${size},c_fill,g_face/`;
    return clean.replace('/upload/', `/upload/${transformSegment}`);
  }

  // Google profile photo: request larger/custom size if supported
  if (clean.includes('lh3.googleusercontent.com')) {
    if (clean.includes('=s')) {
      return clean.replace(/=s\d+(-c)?/, `=s${size}-c`);
    }
    return `${clean}=s${size}-c`;
  }

  return clean;
};


/**
 * Checks if an image has been removed during storage cleanup.
 *
 * @param {Object} complaint
 * @param {'before'|'proof'} type
 * @returns {boolean}
 */
export const isImageDeleted = (complaint, type = 'before') => {
  if (!complaint) return false;
  if (type === 'before') {
    return Boolean(complaint.image_deleted_at && !complaint.image_url && !complaint.image);
  }
  return Boolean(complaint.completion_image_deleted_at && !complaint.completion_image_url && !complaint.completion_image);
};

/**
 * Returns the formatted deletion date for purged images.
 *
 * @param {Object} complaint
 * @param {'before'|'proof'} type
 * @returns {string}
 */
export const getDeletedDateFormatted = (complaint, type = 'before') => {
  if (!complaint) return '';
  const dateStr = type === 'before' ? complaint.image_deleted_at : complaint.completion_image_deleted_at;
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

import imageCompression from 'browser-image-compression';

/**
 * Formats byte values to human readable string (KB/MB)
 */
export const formatBytes = (bytes, decimals = 1) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Compresses a profile avatar image before upload.
 *
 * Rules:
 * - maxSizeMB: 0.1 (target < 100 KB)
 * - maxWidthOrHeight: 600
 * - fileType: 'image/jpeg'
 * - Web worker enabled
 *
 * @param {File|Blob} fileOrBlob - Original image file or cropped blob
 * @param {Function} [onProgress] - Optional progress callback (0 - 100)
 * @returns {Promise<{compressedFile: File, originalSize: number, compressedSize: number, originalSizeFormatted: string, compressedSizeFormatted: string}>}
 */
export const compressAvatar = async (fileOrBlob, onProgress = null) => {
  if (!fileOrBlob) return null;

  const MAX_RAW_BYTES = 15 * 1024 * 1024; // 15MB maximum accepted raw file
  if (fileOrBlob.size > MAX_RAW_BYTES) {
    throw new Error('Image exceeds 15 MB. Please choose a smaller photo.');
  }

  const options = {
    maxSizeMB: 0.1, // 100 KB limit
    maxWidthOrHeight: 600,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.85,
    onProgress: (p) => {
      if (typeof onProgress === 'function') {
        onProgress(Math.round(p));
      }
    }
  };

  try {
    const compressedBlob = await imageCompression(fileOrBlob, options);
    const fileName = (fileOrBlob instanceof File && fileOrBlob.name) ? fileOrBlob.name : 'avatar.jpg';
    const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
    const compressedFile = new File([compressedBlob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    return {
      compressedFile,
      originalSize: fileOrBlob.size,
      compressedSize: compressedFile.size,
      originalSizeFormatted: formatBytes(fileOrBlob.size),
      compressedSizeFormatted: formatBytes(compressedFile.size)
    };
  } catch (error) {
    console.error('Avatar compression failed:', error);
    // If browser compression errors, check if original is already small enough (< 2MB backend ceiling)
    if (fileOrBlob.size <= 2 * 1024 * 1024) {
      const fallbackFile = fileOrBlob instanceof File ? fileOrBlob : new File([fileOrBlob], 'avatar.jpg', { type: fileOrBlob.type || 'image/jpeg' });
      return {
        compressedFile: fallbackFile,
        originalSize: fileOrBlob.size,
        compressedSize: fileOrBlob.size,
        originalSizeFormatted: formatBytes(fileOrBlob.size),
        compressedSizeFormatted: formatBytes(fileOrBlob.size)
      };
    }
    throw error;
  }
};

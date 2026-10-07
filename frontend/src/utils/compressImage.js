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
 * Compresses an image file in the browser before upload.
 *
 * Constraints:
 * - Max raw input size: 15MB
 * - Target output size: < 400KB (maxSizeMB: 0.4)
 * - Max dimensions: 1600x1600
 * - Web worker enabled for non-blocking UI
 * - Output format: JPEG, quality: 0.8
 *
 * @param {File} file - Original file from input
 * @param {Function} [onProgress] - Optional progress callback (progress: 0 to 100)
 * @returns {Promise<{compressedFile: File, originalSize: number, compressedSize: number, originalSizeFormatted: string, compressedSizeFormatted: string, compressionRatio: number}>}
 */
export const compressImage = async (file, onProgress = null) => {
  if (!file) return null;

  const MAX_RAW_BYTES = 15 * 1024 * 1024; // 15MB
  if (file.size > MAX_RAW_BYTES) {
    throw new Error('Image exceeds the maximum upload limit of 15MB. Please choose a smaller file.');
  }

  const options = {
    maxSizeMB: 0.4, // Target under 400KB
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.8,
    onProgress: (p) => {
      if (typeof onProgress === 'function') {
        onProgress(Math.round(p));
      }
    }
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    
    // Ensure file preserves a name with .jpg extension
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    let compressedFile = new File([compressedBlob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });

    // If original is already within limits and smaller than the re-encoded JPEG, keep original
    if (file.size <= MAX_RAW_BYTES && compressedFile.size >= file.size) {
      compressedFile = file;
    }

    const originalSize = file.size;
    const compressedSize = compressedFile.size;
    const savedBytes = originalSize - compressedSize;
    const compressionRatio = savedBytes > 0 ? Math.round((savedBytes / originalSize) * 100) : 0;

    return {
      compressedFile,
      originalSize,
      compressedSize,
      originalSizeFormatted: formatBytes(originalSize),
      compressedSizeFormatted: formatBytes(compressedSize),
      compressionRatio
    };
  } catch (error) {
    console.error('Image compression failed:', error);
    // If compression fails unexpectedly, verify if original meets backend limit
    if (file.size <= MAX_RAW_BYTES) {
      return {
        compressedFile: file,
        originalSize: file.size,
        compressedSize: file.size,
        originalSizeFormatted: formatBytes(file.size),
        compressedSizeFormatted: formatBytes(file.size),
        compressionRatio: 0
      };
    }
    throw error;
  }
};

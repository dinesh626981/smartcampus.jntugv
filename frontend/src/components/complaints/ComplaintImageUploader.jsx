import React from 'react';
import PropTypes from 'prop-types';
import { FaFileUpload, FaTrash, FaSpinner, FaCheckCircle } from 'react-icons/fa';

/**
 * Photographic evidence uploader with background compression progress indicator.
 */
export const ComplaintImageUploader = ({
  image,
  imagePreview,
  compressing,
  compressionProgress,
  compressionStats,
  onImageChange,
  onRemove,
}) => {
  return (
    <div className="border border-dashed border-[var(--md-sys-color-outline-variant)] rounded-card p-6 bg-[var(--md-sys-color-surface-container)] text-center">
      {!imagePreview ? (
        <label className="cursor-pointer block">
          <div className="mx-auto h-12 w-12 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center mb-3">
            <FaFileUpload className="h-5 w-5" />
          </div>
          <span className="text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline">
            Upload an inspection photograph
          </span>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
            PNG, JPG, or WEBP up to 15MB (Auto-compressed to &lt; 400KB)
          </p>
          <input
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp"
            onChange={onImageChange}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-3 max-w-md mx-auto">
          <div className="flex items-center justify-between bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-chip p-3">
            <div className="flex items-center gap-3">
              <img
                src={imagePreview}
                alt="Evidence preview"
                className="h-14 w-14 object-cover rounded-input border border-[var(--md-sys-color-outline-variant)]"
              />
              <div className="text-left">
                <p className="text-xs font-medium text-[var(--md-sys-color-on-surface)] truncate max-w-[180px]">
                  {image?.name || 'Image uploaded'}
                </p>
                {compressing ? (
                  <div className="flex items-center gap-1.5 text-xs text-[var(--md-sys-color-primary)] mt-0.5">
                    <FaSpinner className="animate-spin text-xs" />
                    <span>Processing image...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                      <FaCheckCircle className="text-[10px]" />
                      Ready to upload
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onRemove}
              disabled={compressing}
              className="text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)] p-2 rounded-full transition-colors disabled:opacity-50"
              title="Remove image"
            >
              <FaTrash className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

ComplaintImageUploader.propTypes = {
  image: PropTypes.object,
  imagePreview: PropTypes.string,
  compressing: PropTypes.bool,
  compressionProgress: PropTypes.number,
  compressionStats: PropTypes.object,
  onImageChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default ComplaintImageUploader;

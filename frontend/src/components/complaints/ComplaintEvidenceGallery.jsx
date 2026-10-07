import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaSearchPlus, FaArchive, FaTimes } from 'react-icons/fa';
import Card from '../ui/Card';
import {
  getOptimizedImageUrl,
  isImageDeleted,
  getDeletedDateFormatted,
} from '../../utils/cloudinaryUrl';

/**
 * Photographic evidence display with before/after comparison and lightbox zoom.
 */
export const ComplaintEvidenceGallery = ({ complaint }) => {
  const [lightboxImage, setLightboxImage] = useState(null);

  const initialImage = complaint.image_url || complaint.image;
  const proofImage = complaint.completion_image_url || complaint.completion_image;
  const isInitialDeleted = isImageDeleted(complaint, 'before') || complaint.image_deleted_at;
  const isProofDeleted = isImageDeleted(complaint, 'proof') || complaint.completion_image_deleted_at;

  return (
    <>
      <Card title="Photographic evidence">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Initial image */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] block">
              Initial inspection (reported)
            </span>
            {initialImage ? (
              <div
                onClick={() => setLightboxImage(getOptimizedImageUrl(initialImage, 1600))}
                className="group relative h-48 rounded-card overflow-hidden border border-[var(--md-sys-color-outline-variant)] bg-neutral-900/5 dark:bg-neutral-900/40 flex items-center justify-center cursor-pointer shadow-sm hover:shadow transition-all"
              >
                <img
                  src={getOptimizedImageUrl(initialImage, 900)}
                  alt="Initial inspection"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium backdrop-blur-[2px]">
                  <FaSearchPlus className="text-sm" />
                  <span>View full image</span>
                </div>
              </div>
            ) : isInitialDeleted ? (
              <div className="h-48 rounded-card border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 p-4 flex flex-col items-center justify-center text-center">
                <FaArchive className="text-amber-500 text-2xl mb-2" />
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Image removed to free up storage
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                  {getDeletedDateFormatted(complaint, 'before')
                    ? `Purged on ${getDeletedDateFormatted(complaint, 'before')}`
                    : 'Purged during system maintenance'}
                </span>
              </div>
            ) : (
              <div className="h-48 rounded-card border border-dashed border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-center text-xs text-[var(--md-sys-color-on-surface-variant)] italic">
                No initial photograph attached
              </div>
            )}
          </div>

          {/* Completion image */}
          <div className="space-y-1.5">
            <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] block">
              Resolution work (staff proof)
            </span>
            {proofImage ? (
              <div
                onClick={() => setLightboxImage(getOptimizedImageUrl(proofImage, 1600))}
                className="group relative h-48 rounded-card overflow-hidden border border-[var(--md-sys-color-outline-variant)] bg-neutral-900/5 dark:bg-neutral-900/40 flex items-center justify-center cursor-pointer shadow-sm hover:shadow transition-all"
              >
                <img
                  src={getOptimizedImageUrl(proofImage, 900)}
                  alt="Resolution proof"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-medium backdrop-blur-[2px]">
                  <FaSearchPlus className="text-sm" />
                  <span>View full proof</span>
                </div>
              </div>
            ) : isProofDeleted ? (
              <div className="h-48 rounded-card border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/30 p-4 flex flex-col items-center justify-center text-center">
                <FaArchive className="text-amber-500 text-2xl mb-2" />
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                  Proof image removed to free up storage
                </span>
                <span className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">
                  {getDeletedDateFormatted(complaint, 'proof')
                    ? `Purged on ${getDeletedDateFormatted(complaint, 'proof')}`
                    : 'Purged during system maintenance'}
                </span>
              </div>
            ) : (
              <div className="h-48 rounded-card border border-dashed border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-center text-xs text-[var(--md-sys-color-on-surface-variant)] italic">
                Resolution image pending staff submission
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white bg-black/40 hover:bg-black/60 p-2 rounded-full transition-colors cursor-pointer"
              title="Close full view"
            >
              <FaTimes className="text-base" />
            </button>
            <img
              src={lightboxImage}
              alt="Enlarged evidence"
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </>
  );
};

ComplaintEvidenceGallery.propTypes = {
  complaint: PropTypes.object.isRequired,
};

export default ComplaintEvidenceGallery;

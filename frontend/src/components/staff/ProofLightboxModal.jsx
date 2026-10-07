import React from 'react';
import PropTypes from 'prop-types';
import { FaTimes } from 'react-icons/fa';

/**
 * Modal to preview a technician's uploaded proof of work image.
 */
export const ProofLightboxModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[var(--md-sys-color-dialog-surface)] rounded-dialog p-4 max-w-2xl max-h-[85vh] overflow-hidden shadow-dialog relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2 border-b border-[var(--md-sys-color-outline-variant)] mb-2">
          <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
            Resolution work inspection
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] p-1 rounded-full cursor-pointer"
            title="Close inspection"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
        <img
          src={imageUrl}
          alt="Work proof inspection"
          className="max-h-[70vh] w-auto mx-auto object-contain rounded-card"
        />
      </div>
    </div>
  );
};

ProofLightboxModal.propTypes = {
  imageUrl: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default ProofLightboxModal;

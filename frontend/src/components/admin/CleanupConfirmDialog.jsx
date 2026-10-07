import React from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle } from 'react-icons/fa';
import Dialog from '../ui/Dialog';
import TextField from '../ui/TextField';

/**
 * Confirmation dialog for destructive Cloudinary media purge.
 */
export const CleanupConfirmDialog = ({
  isOpen,
  onClose,
  confirmInput,
  setConfirmInput,
  previewData,
  filterDays,
  onConfirm,
  loading,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Permanent Media Purge"
      subtitle="This operation permanently removes images from Cloudinary to free up storage credits."
      confirmText="Confirm & Delete"
      confirmDisabled={confirmInput.trim() !== 'DELETE' || loading}
      loading={loading}
      onConfirm={onConfirm}
    >
      <div className="space-y-4">
        <div className="p-4 rounded-chip bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-200 space-y-1.5">
          <p className="font-semibold flex items-center gap-1.5">
            <FaExclamationTriangle /> Warning: Irreversible Action
          </p>
          <p>
            You are about to purge <strong>{previewData?.total_images_count || 0} media assets</strong> from{' '}
            <strong>{previewData?.candidate_count || 0} resolved complaints</strong> older than {filterDays} days.
          </p>
          <p>
            Complaint metadata, descriptions, audit trails, and feedback will remain completely intact. Deleted images will display a clean "Image removed to free up storage" placeholder.
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface)] mb-1.5">
            Please type <span className="font-mono font-bold text-rose-600 dark:text-rose-400">DELETE</span> to confirm:
          </label>
          <TextField
            type="text"
            placeholder="DELETE"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            autoFocus
          />
        </div>
      </div>
    </Dialog>
  );
};

CleanupConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  confirmInput: PropTypes.string.isRequired,
  setConfirmInput: PropTypes.func.isRequired,
  previewData: PropTypes.object,
  filterDays: PropTypes.number.isRequired,
  onConfirm: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default CleanupConfirmDialog;

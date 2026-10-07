import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';

/**
 * Confirmation dialog to delete a user's uploaded avatar.
 */
export const RemovePhotoDialog = ({
  isOpen,
  onClose,
  onConfirm,
  removing,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => !removing && onClose()}
      title="Remove Profile Photo"
    >
      <div className="space-y-4">
        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          Are you sure you want to remove your profile photo? Your account will revert to showing your name initials.
        </p>

        <div className="flex justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="text"
            onClick={onClose}
            disabled={removing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="filled"
            onClick={onConfirm}
            loading={removing}
            className="bg-[var(--md-sys-color-error)] text-white hover:brightness-95"
          >
            Remove Photo
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

RemovePhotoDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  removing: PropTypes.bool,
};

export default RemovePhotoDialog;

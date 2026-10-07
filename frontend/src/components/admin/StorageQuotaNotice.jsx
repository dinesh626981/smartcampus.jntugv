import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import Button from '../ui/Button';

/**
 * Global alert banner displayed when Cloudinary quota reaches warning or critical levels.
 */
export const StorageQuotaNotice = ({ storageUsage }) => {
  if (!storageUsage || (storageUsage.level !== 'warning' && storageUsage.level !== 'critical')) {
    return null;
  }

  return (
    <div className="flex items-center justify-between p-3.5 rounded-card bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs shadow-xs">
      <div className="flex items-center gap-2.5">
        <FaExclamationTriangle className="text-amber-600 dark:text-amber-400 text-base shrink-0" />
        <span>
          <strong>Cloudinary Storage Notice:</strong> Quota utilization is at{' '}
          <span className="font-semibold">{storageUsage.percent_used}%</span> ({storageUsage.credits_used} / {storageUsage.credits_limit} credits used). Consider purging legacy complaint media to free up monthly bandwidth.
        </span>
      </div>
      <Link to="/admin/storage">
        <Button variant="filled" size="sm" className="!bg-amber-600 hover:!bg-amber-700 !text-white shrink-0">
          Clean Storage
        </Button>
      </Link>
    </div>
  );
};

StorageQuotaNotice.propTypes = {
  storageUsage: PropTypes.object,
};

export default StorageQuotaNotice;

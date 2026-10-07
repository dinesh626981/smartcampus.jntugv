import React from 'react';
import PropTypes from 'prop-types';
import { FaBuilding, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

/**
 * Staff institutional details strip displaying department, contact email/phone, and staff ID.
 */
export const StaffCredentialsBanner = ({ user }) => {
  return (
    <div className="bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-card p-4 flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--md-sys-color-on-surface-variant)]">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1.5 font-medium text-[var(--md-sys-color-on-surface)]">
          <FaBuilding className="h-3.5 w-3.5 text-[var(--md-sys-color-primary)]" />
          <span>{user?.department_name || 'General Maintenance'}</span>
        </span>
        <span className="text-neutral-300">|</span>
        <span className="flex items-center gap-1.5 font-mono">
          <FaEnvelope className="h-3 w-3 text-neutral-400" />
          <span>{user?.email}</span>
        </span>
        {user?.phone && (
          <>
            <span className="text-neutral-300">|</span>
            <span className="flex items-center gap-1.5 font-mono">
              <FaPhoneAlt className="h-3 w-3 text-neutral-400" />
              <span>{user.phone}</span>
            </span>
          </>
        )}
      </div>
      <div className="font-mono text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
        Staff ID: #{user?.id}
      </div>
    </div>
  );
};

StaffCredentialsBanner.propTypes = {
  user: PropTypes.object,
};

export default StaffCredentialsBanner;

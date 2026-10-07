import React from 'react';
import PropTypes from 'prop-types';
import { FaCheckCircle, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';

/**
 * Storage allocation and quota meter card with stacked segments and policy notices.
 */
export const StorageAllocationCard = ({ usage, loading }) => {
  const getUsageLevelBadge = (level, percent) => {
    if (level === 'critical' || percent >= 90) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
          <FaExclamationTriangle className="text-xs" /> Critical ({percent}%)
        </span>
      );
    }
    if (level === 'warning' || percent >= 70) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
          <FaExclamationTriangle className="text-xs" /> High ({percent}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
        <FaCheckCircle className="text-xs" /> Healthy ({percent}%)
      </span>
    );
  };

  const complaintMb = usage?.complaint_images_mb || 0;
  const profileMb = usage?.profile_photos_mb || 0;
  const totalStoredMb = usage?.storage_used_mb || (complaintMb + profileMb) || 0.1;
  const otherMb = Math.max(0, Math.round((totalStoredMb - complaintMb - profileMb) * 100) / 100);
  const complaintPct = Math.round((complaintMb / totalStoredMb) * 100);
  const profilePct = Math.round((profileMb / totalStoredMb) * 100);
  const otherPct = Math.max(0, 100 - complaintPct - profilePct);

  const isNearLimit = (usage?.percent_used >= 80) || (usage?.level === 'critical') || (usage?.level === 'warning');
  const isReclaimableNearZero = (usage?.reclaimable_mb || 0) <= 0.5;
  const showNoFreeSpaceWarning = isNearLimit && isReclaimableNearZero;

  return (
    <Card title="Storage Allocation & Quota" subtitle="Cloudinary Free Plan (25 Credits/Month)">
      {loading ? (
        <div className="h-32 flex items-center justify-center">
          <Spinner />
        </div>
      ) : usage ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold tracking-tight text-[var(--md-sys-color-on-surface)]">
              {usage.credits_used} <span className="text-sm font-normal text-[var(--md-sys-color-on-surface-variant)]">/ {usage.credits_limit} credits</span>
            </span>
            {getUsageLevelBadge(usage.level, usage.percent_used)}
          </div>

          {/* Stacked Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-4 rounded-full bg-[var(--md-sys-color-surface-container)] overflow-hidden border border-[var(--md-sys-color-outline-variant)] flex">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${complaintPct}%` }}
                title={`Complaint Images: ${complaintMb} MB (${complaintPct}%)`}
              />
              <div
                className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                style={{ width: `${profilePct}%` }}
                title={`Profile Photos (Protected): ${profileMb} MB (${profilePct}%)`}
              />
              <div
                className="h-full bg-neutral-300 dark:bg-neutral-600 transition-all duration-500"
                style={{ width: `${otherPct}%` }}
                title={`Other assets: ${otherMb} MB (${otherPct}%)`}
              />
            </div>

            <div className="flex justify-between text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono">
              <span>{usage.storage_used_mb} MB stored</span>
              <span>{usage.percent_used}% quota utilized</span>
            </div>
          </div>

          {/* Asset Class Breakdown Legend */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--md-sys-color-outline-variant)] text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
              <span className="text-[var(--md-sys-color-on-surface-variant)]">Complaints:</span>
              <span className="font-semibold font-mono text-[var(--md-sys-color-on-surface)]">{complaintMb} MB</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-500 shrink-0" />
              <span className="text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1">
                Profiles <FaLock className="text-amber-500 text-[10px]" title="Protected asset class" />:
              </span>
              <span className="font-semibold font-mono text-[var(--md-sys-color-on-surface)]">{profileMb} MB</span>
            </div>
          </div>

          {/* Policy & Protection Guarantee */}
          <div className="p-2.5 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
              <FaLock className="text-xs shrink-0" />
              <span>Profile photos are permanent and never deleted by cleanup.</span>
            </div>
            <div className="text-[var(--md-sys-color-on-surface-variant)]">
              Free space can only come from complaint images.
            </div>
            <div className="font-mono text-[10px] text-[var(--md-sys-color-primary)] pt-0.5">
              Reclaimable (3-mo rule): {usage.reclaimable_mb || 0} MB
            </div>
          </div>

          {/* Edge Case Warning */}
          {showNoFreeSpaceWarning && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2">
              <FaExclamationTriangle className="text-rose-600 shrink-0 mt-0.5" />
              <span>Cleanup cannot free more space. Consider upgrading the Cloudinary plan or moving archives elsewhere.</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-rose-500">Failed to load usage data.</p>
      )}
    </Card>
  );
};

StorageAllocationCard.propTypes = {
  usage: PropTypes.object,
  loading: PropTypes.bool,
};

export default StorageAllocationCard;

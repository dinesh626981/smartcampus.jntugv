import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaEye } from 'react-icons/fa';
import Button from '../ui/Button';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import EmptyState from '../ui/EmptyState';
import { getOptimizedImageUrl } from '../../utils/cloudinaryUrl';

const API_URL = import.meta.env.BACKEND_API_URL || 'http://localhost:5001/api';

/**
 * Task queue table for departmental technicians with status updates and proof viewer.
 */
export const StaffTaskTable = ({
  tasks = [],
  onOpenUpdateModal,
  onPreviewProof,
  activeTab = 'completed',
}) => {
  if (tasks.length === 0) {
    return (
      <div className="p-8">
        <EmptyState
          title="No tasks in this category"
          description={`There are currently zero ${activeTab} complaints assigned to your department queue.`}
        />
      </div>
    );
  }

  const getProofUrl = (c) => {
    if (c.completion_image_url) return getOptimizedImageUrl(c.completion_image_url, 1200);
    if (c.completion_image) {
      if (c.completion_image.startsWith('http')) return c.completion_image;
      return `${API_URL}/uploads/${c.completion_image}`;
    }
    return null;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--md-sys-color-outline-variant)] h-12">
            <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">ID</th>
            <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Issue title & location</th>
            <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Priority</th>
            <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Status</th>
            <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Proof of work</th>
            <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
          {tasks.map((c) => {
            const proofUrl = getProofUrl(c);

            return (
              <tr key={c.id} className="h-[52px] hover:bg-neutral-50/50 transition-colors">
                <td className="px-4 font-mono text-xs font-semibold text-[var(--md-sys-color-primary)]">
                  #{c.id}
                </td>
                <td className="px-4 py-2">
                  <div className="font-medium text-sm text-[var(--md-sys-color-on-surface)] leading-snug">{c.title}</div>
                  <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1 mt-0.5">
                    <FaMapMarkerAlt className="h-2.5 w-2.5 text-neutral-400 shrink-0" />
                    <span>{c.location}</span>
                  </div>
                </td>
                <td className="px-4">
                  <PriorityBadge priority={c.priority} />
                </td>
                <td className="px-4">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4">
                  {proofUrl ? (
                    <button
                      type="button"
                      onClick={() => onPreviewProof(proofUrl)}
                      className="inline-flex items-center gap-1 text-xs text-[var(--md-sys-color-primary)] hover:underline font-medium cursor-pointer"
                    >
                      <FaEye className="h-3 w-3" />
                      <span>View proof</span>
                    </button>
                  ) : (
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono">—</span>
                  )}
                </td>
                <td className="px-4 text-right space-x-2">
                  {!['Resolved', 'Closed'].includes(c.status) && onOpenUpdateModal && (
                    <Button
                      variant="tonal"
                      size="sm"
                      onClick={() => onOpenUpdateModal(c)}
                    >
                      Update status
                    </Button>
                  )}
                  <Link to={`/student/complaints/${c.id}`}>
                    <Button variant="text" size="sm">
                      Details
                    </Button>
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

StaffTaskTable.propTypes = {
  tasks: PropTypes.array,
  onOpenUpdateModal: PropTypes.func,
  onPreviewProof: PropTypes.func.isRequired,
  activeTab: PropTypes.string,
};

export default StaffTaskTable;

import React from 'react';
import TextField from '../ui/TextField';
import Select from '../ui/Select';
import Button from '../ui/Button';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  COMPLAINT_PRIORITIES,
} from '../../constants/complaintConstants';
import { FaSearch, FaRedo } from 'react-icons/fa';

/**
 * Standardized search and filter bar for complaint queues.
 */
export const ComplaintFilterBar = ({
  searchTerm = '',
  onSearchChange,
  statusFilter = '',
  onStatusChange,
  categoryFilter = '',
  onCategoryChange,
  priorityFilter = '',
  onPriorityChange,
  onReset,
  showCategory = true,
  showPriority = true,
  showStatus = true,
}) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...COMPLAINT_STATUSES.map((st) => ({ value: st, label: st })),
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...COMPLAINT_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    ...COMPLAINT_PRIORITIES.map((p) => ({ value: p, label: `${p} Priority` })),
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
      {onSearchChange && (
        <TextField
          placeholder="Search by title, location, ID..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          leadingIcon={<FaSearch className="text-neutral-400 text-sm" />}
          className="w-full"
        />
      )}

      {showStatus && onStatusChange && (
        <Select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          options={statusOptions}
          className="w-full"
        />
      )}

      {showCategory && onCategoryChange && (
        <Select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          options={categoryOptions}
          className="w-full"
        />
      )}

      {showPriority && onPriorityChange && (
        <Select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          options={priorityOptions}
          className="w-full"
        />
      )}

      {onReset && (
        <div className="flex justify-end lg:col-span-4 pt-1">
          <Button
            variant="text"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-[var(--md-sys-color-primary)]"
          >
            <FaRedo className="text-xs" /> Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default ComplaintFilterBar;

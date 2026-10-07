import React from 'react';
import DataTable from '../ui/DataTable';
import { StatusBadge, PriorityBadge } from '../ui/Badge';
import { formatDate } from '../../utils/formatters';

/**
 * Standardized complaint table with responsive columns and status badges.
 */
export const ComplaintTable = ({
  complaints = [],
  loading = false,
  onRowClick,
  showStudent = false,
  showStaff = false,
  showCategory = true,
  actionRenderer,
  emptyTitle = 'No complaints found',
  emptyDescription = 'There are no complaints matching your criteria.',
}) => {
  const columns = [
    {
      header: 'ID',
      key: 'id',
      className: 'w-16 font-mono text-xs text-[var(--md-sys-color-on-surface-variant)]',
      render: (val) => `#${val}`,
    },
    {
      header: 'Title & Location',
      key: 'title',
      className: 'min-w-[200px]',
      render: (_, row) => (
        <div>
          <div className="font-medium text-[var(--md-sys-color-on-surface)] line-clamp-1">
            {row.title}
          </div>
          <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] line-clamp-1">
            {row.location}
          </div>
        </div>
      ),
    },
  ];

  if (showCategory) {
    columns.push({
      header: 'Category',
      key: 'category',
      className: 'hidden sm:table-cell',
      render: (val) => (
        <span className="text-sm text-[var(--md-sys-color-on-surface-variant)]">{val}</span>
      ),
    });
  }

  if (showStudent) {
    columns.push({
      header: 'Student',
      key: 'student_name',
      className: 'hidden md:table-cell',
      render: (_, row) => (
        <div>
          <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
            {row.student_name || '—'}
          </div>
          <div className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
            {row.student_registration_number || row.student_department || ''}
          </div>
        </div>
      ),
    });
  }

  if (showStaff) {
    columns.push({
      header: 'Technician',
      key: 'assigned_staff_name',
      className: 'hidden lg:table-cell',
      render: (val) => (
        <span className="text-sm text-[var(--md-sys-color-on-surface)]">
          {val || <span className="text-neutral-400 italic">Unassigned</span>}
        </span>
      ),
    });
  }

  columns.push(
    {
      header: 'Priority',
      key: 'priority',
      render: (val) => <PriorityBadge priority={val} />,
    },
    {
      header: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      header: 'Date',
      key: 'created_at',
      className: 'hidden sm:table-cell whitespace-nowrap text-xs text-[var(--md-sys-color-on-surface-variant)]',
      render: (val) => formatDate(val),
    }
  );

  if (actionRenderer) {
    columns.push({
      header: '',
      key: 'actions',
      align: 'right',
      render: (_, row) => actionRenderer(row),
    });
  }

  return (
    <DataTable
      columns={columns}
      data={complaints}
      loading={loading}
      onRowClick={onRowClick}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    />
  );
};

export default ComplaintTable;

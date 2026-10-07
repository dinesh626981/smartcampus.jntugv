import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { complaintsService } from '../services/api';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt } from 'react-icons/fa';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import DataTable from '../components/ui/DataTable';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { ComplaintUpdateModal } from '../components/common';
import { formatDate } from '../utils/formatters';

export const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected complaint for updating status
  const [activeComplaint, setActiveComplaint] = useState(null);

  const fetchAssigned = useCallback(async () => {
    setLoading(true);
    try {
      const res = await complaintsService.getComplaints();
      setComplaints(Array.isArray(res) ? res : (res?.complaints || []));
    } catch {
      toast.error('Failed to load assigned complaints.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssigned();
  }, [fetchAssigned]);

  const handleUpdateSubmit = async (complaintId, formData) => {
    try {
      await complaintsService.updateComplaint(complaintId, formData, true);
      toast.success('Task updated. Central administrator and student notified.');
      setActiveComplaint(null);
      await fetchAssigned();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update complaint status.';
      toast.error(msg);
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (val, row) => (
        <span className="font-mono text-xs font-semibold text-[var(--md-sys-color-primary)]">
          #{row.id}
        </span>
      ),
    },
    {
      key: 'title',
      header: 'Complaint & location',
      render: (val, row) => (
        <div>
          <div className="font-medium text-[var(--md-sys-color-on-surface)] leading-snug">{row.title}</div>
          <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1 mt-0.5">
            <FaMapMarkerAlt className="h-3 w-3 text-neutral-400 shrink-0" />
            <span>{row.location}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (val, row) => (
        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">{row.category}</span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (val, row) => <PriorityBadge priority={row.priority} />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (val, row) => <StatusBadge status={row.status} />,
    },
    {
      key: 'created_at',
      header: 'Logged date',
      render: (val, row) => (
        <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right',
      render: (val, row) => (
        <div className="flex items-center justify-end gap-1.5">
          {!['Resolved', 'Closed'].includes(row.status) && (
            <Button
              variant="tonal"
              size="sm"
              onClick={() => setActiveComplaint(row)}
            >
              Update
            </Button>
          )}
          <Link to={`/student/complaints/${row.id}`}>
            <Button variant="text" size="sm">
              Details
            </Button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">

      <PageHeader
        title="Assigned maintenance queue"
        subtitle="Manage and remediate facility issues routed directly to your technician roster."
      />

      <Card noPadding>
        <div className="px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
          <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
            Allocated tasks ({complaints.length})
          </div>
        </div>

        <DataTable
          columns={columns}
          data={complaints}
          loading={loading}
          emptyTitle="Task queue is clear"
          emptyDescription="You have no pending maintenance complaints allocated to your queue."
        />
      </Card>

      {/* Shared Complaint Update Modal configured for Staff */}
      <ComplaintUpdateModal
        isOpen={Boolean(activeComplaint)}
        onClose={() => setActiveComplaint(null)}
        complaint={activeComplaint}
        onSave={handleUpdateSubmit}
        isStaff={true}
      />
    </div>
  );
};

export default AssignedComplaints;

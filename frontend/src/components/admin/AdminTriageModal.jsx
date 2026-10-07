import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Dialog from '../ui/Dialog';
import Select from '../ui/Select';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
  COMPLAINT_PRIORITIES,
} from '../../constants/complaintConstants';

/**
 * Dialog for administrative triage, category/priority adjustment, and department technician assignment.
 */
export const AdminTriageModal = ({
  isOpen,
  onClose,
  complaint,
  departments = [],
  staffList = [],
  onSave,
  submitting = false,
}) => {
  const [assignDept, setAssignDept] = useState('');
  const [assignStaff, setAssignStaff] = useState('');
  const [updateCategory, setUpdateCategory] = useState('');
  const [updatePriority, setUpdatePriority] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');

  useEffect(() => {
    if (complaint) {
      setAssignDept(complaint.department_id ? complaint.department_id.toString() : '');
      setAssignStaff(complaint.assigned_staff ? complaint.assigned_staff.toString() : '');
      setUpdateCategory(complaint.category || '');
      setUpdatePriority(complaint.priority || 'Medium');
      setUpdateStatus(complaint.status || 'Pending');
    }
  }, [complaint]);

  const getFilteredStaffOptions = () => {
    if (!assignDept) return [];
    return staffList.filter((s) => s.department_id === parseInt(assignDept, 10));
  };

  const handleConfirm = async () => {
    if (!complaint) return;
    await onSave(complaint.id, {
      department_id: assignDept ? parseInt(assignDept, 10) : null,
      assigned_staff: assignStaff ? parseInt(assignStaff, 10) : null,
      category: updateCategory,
      priority: updatePriority,
      status: updateStatus,
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={complaint ? `Ticket triage: #${complaint.id}` : ''}
      subtitle={complaint ? complaint.title : ''}
      confirmText="Save assignment"
      loading={submitting}
      onConfirm={handleConfirm}
    >
      {complaint && (
        <div className="space-y-4">
          <div className="p-3 bg-[var(--md-sys-color-surface-container)] rounded-chip text-xs text-[var(--md-sys-color-on-surface-variant)]">
            Reported by <span className="font-medium text-[var(--md-sys-color-on-surface)]">{complaint.student_name}</span> at{' '}
            <span className="font-medium text-[var(--md-sys-color-on-surface)]">{complaint.location}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={updateCategory}
              onChange={(e) => setUpdateCategory(e.target.value)}
              options={COMPLAINT_CATEGORIES.map((c) => ({ value: c, label: c }))}
            />
            <Select
              label="Priority tier"
              value={updatePriority}
              onChange={(e) => setUpdatePriority(e.target.value)}
              options={COMPLAINT_PRIORITIES.map((p) => ({ value: p, label: p }))}
            />
          </div>

          <Select
            label="Lifecycle status"
            value={updateStatus}
            onChange={(e) => setUpdateStatus(e.target.value)}
            options={COMPLAINT_STATUSES.map((st) => ({ value: st, label: st }))}
          />

          <Select
            label="Assigned department"
            value={assignDept}
            onChange={(e) => {
              setAssignDept(e.target.value);
              setAssignStaff('');
            }}
            options={[
              { value: '', label: '-- Select department --' },
              ...departments.map((d) => ({
                value: d.id.toString(),
                label: d.department_name,
              })),
            ]}
          />

          <Select
            label="Assigned technician"
            value={assignStaff}
            onChange={(e) => setAssignStaff(e.target.value)}
            disabled={!assignDept}
            options={[
              { value: '', label: '-- Select staff member --' },
              ...getFilteredStaffOptions().map((s) => ({
                value: s.id.toString(),
                label: `${s.name} (${s.email})`,
              })),
            ]}
            hint={!assignDept ? 'Select a department first to populate staff' : undefined}
          />
        </div>
      )}
    </Dialog>
  );
};

AdminTriageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  complaint: PropTypes.object,
  departments: PropTypes.array,
  staffList: PropTypes.array,
  onSave: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
};

export default AdminTriageModal;

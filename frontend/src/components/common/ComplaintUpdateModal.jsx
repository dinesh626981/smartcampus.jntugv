import React, { useState, useEffect } from 'react';
import Dialog from '../ui/Dialog';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import { COMPLAINT_STATUSES, COMPLAINT_PRIORITIES } from '../../constants/complaintConstants';
import { compressImage } from '../../utils/compressImage';

/**
 * Dialog for updating complaint status, technician assignments, notes, and proof image.
 */
export const ComplaintUpdateModal = ({
  isOpen = false,
  onClose,
  complaint = null,
  onSave,
  isStaff = false,
  staffList = [],
}) => {
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [remarks, setRemarks] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (complaint) {
      setStatus(complaint.status || 'Pending');
      setPriority(complaint.priority || 'Medium');
      setAssignedStaff(complaint.assigned_staff ? String(complaint.assigned_staff) : '');
      setRemarks(complaint.resolution_remarks || '');
      setProofFile(null);
      setProofPreview(null);
    }
  }, [complaint]);

  const handleProofChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setProofFile(compressed);
      setProofPreview(URL.createObjectURL(compressed));
    } catch {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    } finally {
      setCompressing(false);
    }
  };

  const handleConfirm = async () => {
    if (!complaint) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('status', status);
      formData.append('admin_remarks', remarks);
      formData.append('resolution_remarks', remarks);

      if (!isStaff) {
        formData.append('priority', priority);
        if (assignedStaff) {
          formData.append('assigned_staff', assignedStaff);
        }
      }

      if (proofFile) {
        formData.append('completion_image', proofFile);
      }

      await onSave(complaint.id, formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const staffOptions = [
    { value: '', label: 'Unassigned' },
    ...staffList.map((s) => ({
      value: String(s.id),
      label: `${s.name || s.user?.name || 'Staff'} (${s.department_name || 'General'})`,
    })),
  ];

  const statusOptions = COMPLAINT_STATUSES.map((st) => ({ value: st, label: st }));
  const priorityOptions = COMPLAINT_PRIORITIES.map((p) => ({ value: p, label: p }));

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Update Complaint #${complaint?.id || ''}`}
      subtitle={complaint?.title}
      confirmText={compressing ? 'Optimizing Proof...' : 'Save Changes'}
      onConfirm={handleConfirm}
      loading={submitting || compressing}
      confirmVariant="filled"
    >
      <div className="space-y-4">
        <Select
          label="Complaint Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statusOptions}
        />

        {!isStaff && (
          <>
            <Select
              label="Priority Level"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              options={priorityOptions}
            />

            {staffList.length > 0 && (
              <Select
                label="Assign Technician"
                value={assignedStaff}
                onChange={(e) => setAssignedStaff(e.target.value)}
                options={staffOptions}
              />
            )}
          </>
        )}

        <Textarea
          label="Resolution Remarks / Technician Notes"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Describe actions taken or resolution details..."
          rows={3}
        />

        <div>
          <label className="block text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] mb-1.5">
            Work Completion Proof (Optional Image)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleProofChange}
            disabled={compressing || submitting}
            className="block w-full text-xs text-neutral-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-medium file:bg-[var(--md-sys-color-primary-container)] file:text-[var(--md-sys-color-on-primary-container)] hover:file:brightness-95 cursor-pointer"
          />
          {proofPreview && (
            <div className="mt-2 relative w-24 h-24 rounded-lg overflow-hidden border border-neutral-200">
              <img src={proofPreview} alt="Proof preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};

export default ComplaintUpdateModal;

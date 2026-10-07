import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintsService, aiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaArrowLeft } from 'react-icons/fa';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import PageHeader from '../components/ui/PageHeader';
import Spinner from '../components/ui/Spinner';
import Avatar from '../components/ui/Avatar';
import {
  ComplaintTimeline,
  ComplaintEvidenceGallery,
  ComplaintFeedbackForm,
} from '../components/complaints';
import { formatDate } from '../utils/formatters';

export const ComplaintDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status Explanation state
  const [statusExplanation, setStatusExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const fetchComplaintDetails = useCallback(async () => {
    try {
      const data = await complaintsService.getComplaintDetails(id);
      setComplaint(data);
    } catch (err) {
      toast.error('Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaintDetails();
  }, [fetchComplaintDetails]);

  const handleCloseTicket = async () => {
    try {
      await complaintsService.updateComplaint(complaint.id, { status: 'Closed' });
      toast.success('Complaint ticket closed and archived successfully.');
      fetchComplaintDetails();
    } catch (err) {
      toast.error('Failed to close ticket.');
    }
  };

  const handleExplainStatus = async () => {
    setLoadingExplanation(true);
    try {
      const res = await aiService.explainStatus(complaint.id);
      setStatusExplanation(res.explanation);
    } catch (err) {
      toast.error('Failed to generate AI status explanation.');
    } finally {
      setLoadingExplanation(false);
    }
  };

  if (loading) {
    return <Spinner fullScreen={false} className="my-24 mx-auto block" />;
  }

  if (!complaint) {
    return (
      <div className="text-center py-16 bg-[var(--md-sys-color-surface)] border border-[var(--md-sys-color-outline-variant)] rounded-card p-8">
        <h3 className="text-xl font-normal text-[var(--md-sys-color-on-surface)]">Complaint record not found</h3>
        <p className="text-sm text-[var(--md-sys-color-on-surface-variant)] mt-1 mb-4">The requested ticket does not exist or has been removed.</p>
        <Link to={user.role === 'student' ? '/student/complaints' : user.role === 'staff' ? '/staff/complaints' : '/admin/complaints'}>
          <Button variant="outlined" size="sm">
            Back to registry
          </Button>
        </Link>
      </div>
    );
  }

  const backLink =
    user.role === 'student'
      ? '/student/complaints'
      : user.role === 'staff'
        ? '/staff/complaints'
        : '/admin/complaints';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">

      {/* Back button */}
      <div>
        <Link
          to={backLink}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline"
        >
          <FaArrowLeft className="h-3 w-3" />
          <span>Back to registry</span>
        </Link>
      </div>

      {/* Page Header */}
      <PageHeader
        title={complaint.title}
        subtitle={`Ticket #${complaint.id} • ${complaint.category} • Filed on ${formatDate(complaint.created_at)} at ${complaint.location}`}
        action={
          <div className="flex items-center gap-2">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        }
      />

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN (7/12): Description, Images, Remarks, AI Analysis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Issue Description Card */}
          <Card title="Grievance details">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
                <div>
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">Department</span>
                  <span className="font-medium text-[var(--md-sys-color-on-surface)]">{complaint.department_name || complaint.category}</span>
                </div>
                <div>
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant)] block">Campus location</span>
                  <span className="font-medium text-[var(--md-sys-color-on-surface)]">{complaint.location}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] block mb-1.5">
                  Detailed statement
                </span>
                <div className="p-4 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-input text-sm text-[var(--md-sys-color-on-surface)] leading-relaxed whitespace-pre-wrap">
                  {complaint.description}
                </div>
              </div>
            </div>
          </Card>

          {/* Photographic Evidence (Before & After) */}
          <ComplaintEvidenceGallery complaint={complaint} />

          {/* Technician Remarks */}
          {complaint.resolution_remarks && (
            <Card title="Technician resolution log">
              <div className="p-4 bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)] rounded-chip text-sm leading-relaxed">
                <p className="font-medium mb-1">Staff note:</p>
                <p className="italic">"{complaint.resolution_remarks}"</p>
              </div>
            </Card>
          )}

          {/* AI Analysis Panel */}
          {(user.role === 'admin' || user.role === 'staff') && complaint.ai_analysis && (
            <Card
              title="Automated diagnostic summary"
              subtitle="Machine-generated semantic classification"
              action={
                <span className="font-mono text-xs text-[var(--md-sys-color-on-surface-variant)] bg-[var(--md-sys-color-surface-container)] px-2.5 py-1 rounded-chip border border-[var(--md-sys-color-outline-variant)]">
                  Confidence: {Math.round((complaint.ai_analysis.confidence || 0) * 100)}%
                </span>
              }
            >
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
                  <div>
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Suggested category</span>
                    <span className="font-medium text-[var(--md-sys-color-on-surface)] block mt-0.5">{complaint.ai_analysis.category || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Suggested urgency</span>
                    <span className="font-medium text-[var(--md-sys-color-on-surface)] block mt-0.5">{complaint.ai_analysis.urgency || 'N/A'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Summary abstract</span>
                  <p className="text-[var(--md-sys-color-on-surface)] italic mt-0.5 leading-relaxed">
                    "{complaint.ai_analysis.summary || 'Summary unavailable'}"
                  </p>
                </div>

                {complaint.ai_analysis.recommended_action && (
                  <div className="pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-xs text-[var(--md-sys-color-on-surface-variant)]">Recommended action</span>
                    <p className="text-[var(--md-sys-color-on-surface)] mt-0.5">{complaint.ai_analysis.recommended_action}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN (5/12): Progress Timeline, Assignment, Student Feedback */}
        <div className="lg:col-span-5 space-y-6">
          {/* Vertical Progress Timeline */}
          <ComplaintTimeline
            status={complaint.status}
            assignedStaffName={complaint.assigned_staff_name}
            userRole={user.role}
            statusExplanation={statusExplanation}
            loadingExplanation={loadingExplanation}
            onExplainStatus={handleExplainStatus}
          />

          {/* Complainant Student Info */}
          {(user.role === 'admin' || user.role === 'staff') && (
            <Card title="Student complainant">
              <div className="space-y-3 text-xs">
                <div className="flex items-center space-x-3 pb-3 border-b border-[var(--md-sys-color-outline-variant)]">
                  <Avatar
                    src={complaint.student_profile_photo_url}
                    name={complaint.student_name}
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-[var(--md-sys-color-on-surface)] text-sm">{complaint.student_name || 'Student'}</p>
                    <p className="text-[var(--md-sys-color-on-surface-variant)] text-[11px]">Registered Student Complainant</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
                  <span className="text-[var(--md-sys-color-on-surface-variant)]">Full Name:</span>
                  <span className="font-medium text-[var(--md-sys-color-on-surface)]">{complaint.student_name || '—'}</span>
                </div>
                {complaint.student_registration_number && (
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">Reg Number:</span>
                    <span className="font-mono font-semibold text-[var(--md-sys-color-primary)]">{complaint.student_registration_number}</span>
                  </div>
                )}
                {complaint.student_department && (
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">Department:</span>
                    <span className="font-medium text-[var(--md-sys-color-on-surface)]">{complaint.student_department}</span>
                  </div>
                )}
                {complaint.student_email && (
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--md-sys-color-outline-variant)]">
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">Email:</span>
                    <span className="font-mono text-[var(--md-sys-color-on-surface)]">{complaint.student_email}</span>
                  </div>
                )}
                {complaint.student_phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--md-sys-color-on-surface-variant)]">Phone:</span>
                    <span className="font-mono text-[var(--md-sys-color-on-surface)]">{complaint.student_phone}</span>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Assigned Staff Box */}
          <Card title="Technician assignment">
            {complaint.assigned_staff_name ? (
              <div className="flex items-center space-x-3 text-xs">
                <Avatar
                  src={complaint.assigned_staff_profile_photo_url}
                  name={complaint.assigned_staff_name}
                  size="md"
                />
                <div>
                  <p className="font-medium text-[var(--md-sys-color-on-surface)] text-sm">{complaint.assigned_staff_name}</p>
                  <p className="text-[var(--md-sys-color-on-surface-variant)]">Department specialist technician</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] italic">No technician currently assigned to this ticket.</p>
            )}
          </Card>

          {/* Student Feedback & Ticket Closure */}
          {user.role === 'student' && complaint.status === 'Resolved' && (
            <ComplaintFeedbackForm
              complaintId={complaint.id}
              onTicketClosed={handleCloseTicket}
              onFeedbackCompleted={fetchComplaintDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetails;

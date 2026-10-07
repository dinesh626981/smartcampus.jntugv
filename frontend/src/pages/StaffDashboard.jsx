import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, complaintsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import {
  FaClipboardList,
  FaHourglassHalf,
  FaCheckCircle,
  FaArrowRight,
} from 'react-icons/fa';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Spinner from '../components/ui/Spinner';
import { ComplaintUpdateModal } from '../components/common';
import {
  StaffCredentialsBanner,
  ProofLightboxModal,
  StaffTaskTable,
} from '../components/staff';

export const StaffDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('completed');

  // Quick resolution modal state
  const [activeModalComplaint, setActiveModalComplaint] = useState(null);

  // Lightbox preview for completion images
  const [previewImageUrl, setPreviewImageUrl] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await dashboardService.getDashboardData();
      setData(res);
    } catch {
      toast.error('Failed to load staff dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleUpdateComplaint = async (complaintId, formData) => {
    try {
      await complaintsService.updateComplaint(complaintId, formData, true);
      toast.success('Task status updated successfully.');
      setActiveModalComplaint(null);
      await fetchDashboard();
      setActiveTab('completed');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task status.';
      toast.error(msg);
    }
  };

  if (loading) {
    return <Spinner fullScreen={false} className="my-24 mx-auto block" />;
  }

  const stats = data?.stats || { assigned: 0, completed: 0, pending: 0 };
  const recent = data?.recent_complaints || [];
  const completedComplaints =
    data?.completed_complaints || recent.filter((c) => ['Resolved', 'Closed'].includes(c.status));
  const pendingComplaints =
    data?.pending_complaints || recent.filter((c) => !['Resolved', 'Closed'].includes(c.status));

  const getDisplayedList = () => {
    if (activeTab === 'completed') return completedComplaints;
    if (activeTab === 'pending') return pendingComplaints;
    return recent;
  };

  const displayedList = getDisplayedList();

  const tabItems = [
    { id: 'completed', label: 'Completed tasks', count: completedComplaints.length },
    { id: 'pending', label: 'Pending action', count: pendingComplaints.length },
    { id: 'all', label: 'All assigned', count: recent.length },
  ];

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <PageHeader
        title={`Staff Dashboard • ${data?.name || user?.name || 'Technician'}`}
        subtitle="Inspect assigned campus defects, update remediation progress, and submit verified completion images."
        action={
          <Link to="/staff/complaints">
            <Button variant="outlined" size="md" icon={<FaArrowRight className="text-xs" />} iconPosition="right">
              View queue
            </Button>
          </Link>
        }
      />

      {/* Staff Institutional Credentials Strip */}
      <StaffCredentialsBanner user={user} />

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total assigned"
          value={stats.assigned}
          icon={<FaClipboardList />}
          description="Overall task allocation"
        />
        <StatCard
          label="Pending remediation"
          value={stats.pending}
          icon={<FaHourglassHalf />}
          description="In-progress or awaiting work"
        />
        <StatCard
          label="Completed & verified"
          value={stats.completed}
          icon={<FaCheckCircle />}
          description="Proof submitted to admin"
        />
      </div>

      {/* Tasks Registry Table with Tabs */}
      <Card noPadding>
        <div className="px-6 pt-4">
          <Tabs
            tabs={tabItems}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId)}
          />
        </div>

        <StaffTaskTable
          tasks={displayedList}
          onOpenUpdateModal={setActiveModalComplaint}
          onPreviewProof={setPreviewImageUrl}
          activeTab={activeTab}
        />
      </Card>

      {/* Shared Complaint Update Modal configured for Staff */}
      <ComplaintUpdateModal
        isOpen={Boolean(activeModalComplaint)}
        onClose={() => setActiveModalComplaint(null)}
        complaint={activeModalComplaint}
        onSave={handleUpdateComplaint}
        isStaff={true}
      />

      {/* Proof Lightbox Modal */}
      <ProofLightboxModal
        imageUrl={previewImageUrl}
        onClose={() => setPreviewImageUrl(null)}
      />
    </div>
  );
};

export default StaffDashboard;

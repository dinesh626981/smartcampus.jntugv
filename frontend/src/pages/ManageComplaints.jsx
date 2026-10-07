import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { complaintsService, adminService } from '../services/api';
import { toast } from 'react-toastify';
import {
  FaSearch,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserTie,
  FaFilter,
} from 'react-icons/fa';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import Select from '../components/ui/Select';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { AdminTriageModal } from '../components/admin';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUSES,
} from '../constants/complaintConstants';
import { formatDate } from '../utils/formatters';

const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allStaff, setAllStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Modal / Assign State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [submittingAssign, setSubmittingAssign] = useState(false);

  const fetchStaticData = async () => {
    try {
      const [depts, staffList] = await Promise.all([
        adminService.getDepartments(),
        adminService.getStaff(),
      ]);
      setDepartments(depts);
      setAllStaff(staffList);
    } catch (err) {
      console.error('Failed to load static datasets:', err);
    }
  };

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const res = await complaintsService.getComplaints(params);
      setComplaints(Array.isArray(res) ? res : (res?.complaints || []));
    } catch {
      toast.error('Failed to load complaints registry.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, categoryFilter]);

  useEffect(() => {
    fetchStaticData();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleAssignSave = async (complaintId, updateData) => {
    setSubmittingAssign(true);
    try {
      await complaintsService.updateComplaint(complaintId, updateData);
      toast.success('Complaint triage and dispatch parameters recorded.');
      setSelectedComplaint(null);
      fetchComplaints();
    } catch {
      toast.error('Failed to update complaint configurations.');
    } finally {
      setSubmittingAssign(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this complaint ticket?')) {
      return;
    }

    try {
      await complaintsService.deleteComplaint(id);
      toast.success('Complaint record expunged successfully.');
      fetchComplaints();
    } catch {
      toast.error('Failed to delete complaint.');
    }
  };

  return (
    <div className="space-y-6">

      <PageHeader
        title="Issue registry & dispatch"
        subtitle="Review, prioritize, and allocate institutional grievances to designated department technicians."
      />

      {/* Filter Bar Card */}
      <Card noPadding className="p-4 sm:p-5">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-5">
            <TextField
              type="text"
              label="Search title, roll number, student, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<FaSearch className="text-xs" />}
            />
          </div>

          <div className="md:col-span-3">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All statuses' },
                ...COMPLAINT_STATUSES.map((st) => ({ value: st, label: st })),
              ]}
            />
          </div>

          <div className="md:col-span-3">
            <Select
              label="Category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'All categories' },
                ...COMPLAINT_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
              ]}
            />
          </div>

          <div className="md:col-span-1 flex gap-2">
            <Button type="submit" variant="filled" className="w-full">
              <FaFilter className="text-xs" />
            </Button>
          </div>
        </form>
      </Card>

      {/* Complaints Log Table */}
      <Card noPadding>
        <div className="px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
          <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
            Registered tickets ({complaints.length})
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner text="Querying database..." />
          </div>
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints matching filters"
            description="Adjust your search query or reset status/category criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--md-sys-color-outline-variant)] h-12">
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">ID</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Title & location</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Student</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Category</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Technician</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Status</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                {complaints.map((c) => (
                  <tr key={c.id} className="h-[52px] hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 font-mono text-xs font-semibold text-[var(--md-sys-color-primary)]">
                      #{c.id}
                    </td>
                    <td className="px-4 py-2 max-w-xs">
                      <div className="font-medium text-sm text-[var(--md-sys-color-on-surface)] truncate">{c.title}</div>
                      <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1 truncate">
                          <FaMapMarkerAlt className="text-[10px]" />
                          <span>{c.location}</span>
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <FaCalendarAlt className="text-[10px]" />
                          <span>{formatDate(c.created_at)}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 text-xs text-[var(--md-sys-color-on-surface)] font-medium">
                      {c.student_name}
                    </td>
                    <td className="px-4 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      {c.category}
                    </td>
                    <td className="px-4 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      {c.assigned_staff_name ? (
                        <span className="flex items-center gap-1.5 font-medium text-[var(--md-sys-color-on-surface)]">
                          <FaUserTie className="text-neutral-400 text-xs" />
                          <span>{c.assigned_staff_name}</span>
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Link to={`/student/complaints/${c.id}`}>
                        <Button variant="text" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="tonal"
                        size="sm"
                        onClick={() => setSelectedComplaint(c)}
                      >
                        Triage
                      </Button>
                      <Button
                        variant="text"
                        size="sm"
                        onClick={() => handleDelete(c.id)}
                        className="text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]"
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Admin Triage & Assignment Dialog */}
      <AdminTriageModal
        isOpen={Boolean(selectedComplaint)}
        onClose={() => setSelectedComplaint(null)}
        complaint={selectedComplaint}
        departments={departments}
        staffList={allStaff}
        onSave={handleAssignSave}
        submitting={submittingAssign}
      />
    </div>
  );
};

export default ManageComplaints;

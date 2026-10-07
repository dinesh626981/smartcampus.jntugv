import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-toastify';
import { FaBuilding, FaPlus } from 'react-icons/fa';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

export const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [deptName, setDeptName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await adminService.getDepartments();
      setDepartments(res || []);
    } catch {
      toast.error('Failed to load departments list.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deptName || !deptName.trim()) {
      toast.error('Please enter a valid department name.');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createDepartment(deptName.trim());
      toast.success('Department created successfully.');
      setDeptName('');
      fetchDepartments();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create department.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? Any associated staff assignments will be cleared.')) {
      return;
    }

    try {
      await adminService.deleteDepartment(id);
      toast.success('Department removed successfully.');
      fetchDepartments();
    } catch {
      toast.error('Failed to delete department.');
    }
  };

  return (
    <div className="space-y-6">

      <PageHeader
        title="Campus departments"
        subtitle="Manage academic, operational, and facility divisions responsible for physical plant maintenance."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Department List Table */}
        <div className="lg:col-span-8">
          <Card noPadding>
            <div className="px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaBuilding className="text-[var(--md-sys-color-primary)] text-sm" />
                <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">Operational divisions</span>
              </div>
              <span className="font-mono text-xs text-[var(--md-sys-color-on-surface-variant)]">
                {departments.length} Registered
              </span>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center">
                <Spinner text="Querying departments..." />
              </div>
            ) : departments.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No departments defined"
                  description="Use the creation form to define institutional maintenance branches."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--md-sys-color-outline-variant)] h-12">
                      <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Dept code</th>
                      <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Division name</th>
                      <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                    {departments.map((d) => (
                      <tr key={d.id} className="h-[52px] hover:bg-neutral-50/50 transition-colors">
                        <td className="px-4 font-mono text-xs font-semibold text-[var(--md-sys-color-primary)]">
                          DPT-{String(d.id).padStart(3, '0')}
                        </td>
                        <td className="px-4 font-medium text-[var(--md-sys-color-on-surface)]">{d.department_name}</td>
                        <td className="px-4 text-right">
                          <Button
                            variant="text"
                            size="sm"
                            onClick={() => handleDelete(d.id)}
                            className="text-[var(--md-sys-color-error)] hover:bg-[var(--md-sys-color-error-container)]"
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Create Department Form with Floating Labels */}
        <div className="lg:col-span-4">
          <Card title="Add division">
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                label="Department name"
                type="text"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                required
                helperText="Designation displayed on ticket triage selectors"
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="filled"
                  className="w-full"
                  loading={submitting}
                  icon={<FaPlus className="text-xs" />}
                >
                  Create department
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageDepartments;

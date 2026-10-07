import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';
import { toast } from 'react-toastify';
import {
  FaUserTie,
  FaEnvelope,
  FaBuilding,
  FaPlus,
  FaPhone,
} from 'react-icons/fa';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import PhoneInput from '../components/ui/PhoneInput';
import Select from '../components/ui/Select';
import Chip from '../components/ui/Chip';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';

export const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // New staff form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department_id: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStaffAndDepts = useCallback(async () => {
    try {
      const [staffRes, deptsRes] = await Promise.all([
        adminService.getStaff(),
        adminService.getDepartments(),
      ]);
      const staffList = Array.isArray(staffRes) ? staffRes : (staffRes?.staff || []);
      const deptsList = Array.isArray(deptsRes) ? deptsRes : (deptsRes?.departments || []);
      setStaff(staffList);
      setDepartments(deptsList);
    } catch {
      toast.error('Failed to load staff/departments records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffAndDepts();
  }, [fetchStaffAndDepts]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, department_id } = formData;

    if (!name || !email || !password || !department_id) {
      toast.error('Please enter all required fields.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must contain at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createStaff(formData);
      toast.success('Department staff member registered successfully.');
      setFormData({ name: '', email: '', password: '', phone: '', department_id: '' });
      fetchStaffAndDepts();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create staff member.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">

      <PageHeader
        title="Staff & technician directory"
        subtitle="Manage maintenance engineers, department allocations, and technical service credentials."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Staff Directory Table */}
        <div className="lg:col-span-8">
          <Card noPadding>
            <div className="px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaUserTie className="text-[var(--md-sys-color-primary)] text-sm" />
                <span className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">Technician roster</span>
              </div>
              <span className="font-mono text-xs text-[var(--md-sys-color-on-surface-variant)]">
                {Array.isArray(staff) ? staff.length : 0} Active staff
              </span>
            </div>

            {loading ? (
              <div className="p-12 flex justify-center">
                <Spinner text="Querying roster..." />
              </div>
            ) : (!Array.isArray(staff) || staff.length === 0) ? (
              <div className="p-8">
                <EmptyState
                  title="No staff members registered"
                  description="Use the registration form to create department technician accounts."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--md-sys-color-outline-variant)] h-12">
                      <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Staff ID</th>
                      <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Name</th>
                      <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Department</th>
                      <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Contact credentials</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                    {Array.isArray(staff) && staff.map((s) => (
                      <tr key={s.id} className="h-[52px] hover:bg-neutral-50/50 transition-colors">
                        <td className="px-4 font-mono text-xs font-semibold text-[var(--md-sys-color-primary)]">
                          STF-{String(s.id).padStart(4, '0')}
                        </td>
                        <td className="px-4 font-medium text-[var(--md-sys-color-on-surface)]">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={s.profile_photo_url} name={s.name} size="xs" />
                            <span>{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                          <Chip variant="default">
                            <FaBuilding className="text-neutral-400 text-[10px]" />
                            <span>{s.department_name || 'Unallocated'}</span>
                          </Chip>
                        </td>
                        <td className="px-4 text-xs">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 text-[var(--md-sys-color-on-surface)] font-mono">
                              <FaEnvelope className="text-neutral-400 text-[10px]" />
                              <span>{s.email}</span>
                            </div>
                            {s.phone && (
                              <div className="flex items-center gap-1.5 text-[var(--md-sys-color-on-surface-variant)] font-mono text-[11px]">
                                <FaPhone className="text-neutral-400 text-[10px]" />
                                <span>{s.phone}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Create Staff Account Form with Floating Labels */}
        <div className="lg:col-span-4">
          <Card title="Add new technician">
            <form onSubmit={handleSubmit} className="space-y-4">
              <TextField
                label="Full legal name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />

              <TextField
                label="Institutional email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <TextField
                label="Initial password (min 8 chars)"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <PhoneInput
                label="Contact phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                helperText="Used for SMS dispatch alerts and mobile login"
              />

              <Select
                label="Department allocation"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
                options={[
                  { value: '', label: '-- Select department --' },
                  ...departments.map((dept) => ({
                    value: dept.id.toString(),
                    label: dept.department_name,
                  })),
                ]}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="filled"
                  className="w-full"
                  loading={submitting}
                  icon={<FaPlus className="text-xs" />}
                >
                  Register staff account
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ManageStaff;

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../services/api';
import { toast } from 'react-toastify';
import {
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaUserPlus,
} from 'react-icons/fa';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Chip from '../components/ui/Chip';
import Tabs from '../components/ui/Tabs';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';
import { formatDate } from '../utils/formatters';

export const ManageStudents = () => {
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'admins'
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'students') {
        const res = await adminService.getStudents();
        setStudents(Array.isArray(res) ? res : (res?.students || []));
      } else {
        const res = await adminService.getAdmins();
        setAdmins(Array.isArray(res) ? res : (res?.admins || []));
      }
    } catch {
      toast.error(`Failed to retrieve ${activeTab} records.`);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentList = activeTab === 'students' ? students : admins;

  const tabItems = [
    { id: 'students', label: 'Student registry', count: Array.isArray(students) ? students.length : 0 },
    { id: 'admins', label: 'Administrator directory', count: Array.isArray(admins) ? admins.length : 0 },
  ];

  return (
    <div className="space-y-6">

      <PageHeader
        title="User account registry"
        subtitle="Manage enrolled student records and verified system administrators with elevated privileges."
        action={
          activeTab === 'admins' ? (
            <Link to="/register?role=admin">
              <Button variant="filled" size="sm" icon={<FaUserPlus className="text-xs" />}>
                Register administrator
              </Button>
            </Link>
          ) : null
        }
      />

      <Card noPadding>
        {/* Material 3 Underline Tabs Header */}
        <div className="px-6 pt-4">
          <Tabs
            tabs={tabItems}
            activeTab={activeTab}
            onChange={(tabId) => setActiveTab(tabId)}
          />
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner text="Querying user records..." />
          </div>
        ) : (!Array.isArray(currentList) || currentList.length === 0) ? (
          <div className="p-8">
            <EmptyState
              title={`No ${activeTab} records available`}
              description={`The database returned no registered records under ${activeTab}.`}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--md-sys-color-outline-variant)] h-12">
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Account ID</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Full name</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Reg Number</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Department</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Institutional email</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Contact phone</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Authority role</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] text-right">Registration date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                {currentList.map((user) => (
                  <tr key={user.id} className="h-[52px] hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 font-mono text-xs font-semibold text-[var(--md-sys-color-primary)]">
                      USR-{String(user.id).padStart(4, '0')}
                    </td>
                    <td className="px-4 py-2 font-medium text-[var(--md-sys-color-on-surface)]">
                      <div className="flex items-center gap-2.5">
                        <Avatar
                          src={user.profile_photo_url}
                          name={user.name}
                          size="xs"
                          source={user.profile_photo_source}
                        />
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 font-mono text-xs font-semibold text-[var(--md-sys-color-primary)]">
                      {user.registration_number || '—'}
                    </td>
                    <td className="px-4 text-xs text-[var(--md-sys-color-on-surface)]">
                      {user.department_name || user.department || '—'}
                    </td>
                    <td className="px-4 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      <div className="flex items-center gap-1.5">
                        <FaEnvelope className="text-neutral-400 text-xs" />
                        <span className="font-mono">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      <div className="flex items-center gap-1.5">
                        <FaPhone className="text-neutral-400 text-xs" />
                        <span>{user.phone || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4">
                      <Chip
                        variant={user.role === 'admin' ? 'primary' : 'default'}
                        className="capitalize"
                      >
                        {user.role}
                      </Chip>
                    </td>
                    <td className="px-4 text-right text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono">
                      <div className="inline-flex items-center gap-1.5">
                        <FaCalendarAlt className="text-neutral-400 text-xs" />
                        <span>{formatDate(user.created_at)}</span>
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
  );
};

export default ManageStudents;

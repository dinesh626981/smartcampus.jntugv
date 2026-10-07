import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService, adminService } from '../services/api';
import { toast } from 'react-toastify';
import {
  FaUsers,
  FaUserTie,
  FaClipboardList,
  FaHourglassHalf,
  FaArrowRight,
  FaMapMarkerAlt,
  FaFileExport,
  FaHdd,
} from 'react-icons/fa';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import { AdminAnalyticsCharts, StorageQuotaNotice } from '../components/admin';

export const AdminDashboard = () => {
  const [dbData, setDbData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [storageUsage, setStorageUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const [dashResult, reportsResult, storageResult] = await Promise.allSettled([
          dashboardService.getDashboardData(),
          adminService.getReports(),
          adminService.getStorageUsage(),
        ]);

        if (!isMounted) return;

        if (dashResult.status === 'fulfilled') {
          setDbData(dashResult.value);
        } else {
          console.warn('Dashboard metrics fetch error:', dashResult.reason);
        }

        if (reportsResult.status === 'fulfilled') {
          setStatsData(reportsResult.value);
        } else {
          console.warn('Reports metrics fetch error:', reportsResult.reason);
        }

        if (storageResult.status === 'fulfilled') {
          setStorageUsage(storageResult.value);
        }

        // Only show error toast if both primary dashboard & reports requests failed
        if (dashResult.status === 'rejected' && reportsResult.status === 'rejected') {
          toast.error('Failed to load administrative analytics.');
        }
      } catch (err) {
        if (isMounted) {
          toast.error('Failed to load administrative analytics.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <Spinner fullScreen={false} className="my-24 mx-auto block" />;
  }

  const rawStats = dbData?.stats || {};
  const stats = {
    total_complaints: rawStats.total_complaints ?? rawStats.total ?? 0,
    pending: rawStats.pending ?? rawStats.pending_complaints ?? 0,
    total_students: rawStats.total_students ?? 0,
    total_staff: rawStats.total_staff ?? 0,
  };
  const recent = dbData?.recent_complaints || [];

  return (
    <div className="space-y-6">

      <PageHeader
        title="Administrative operations & telemetry"
        subtitle="Real-time volume telemetry, department allocation analytics, and campus issue resolution queues."
        action={
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/storage">
              <Button
                variant={storageUsage?.level === 'critical' ? 'filled' : 'outlined'}
                size="md"
                className={storageUsage?.level === 'critical' ? '!bg-rose-600 !text-white' : ''}
                icon={<FaHdd className="text-xs" />}
              >
                Storage ({storageUsage?.storage_used_mb || 0} MB)
              </Button>
            </Link>
            <Link to="/admin/reports">
              <Button variant="outlined" size="md" icon={<FaFileExport className="text-xs" />}>
                Export audit CSV
              </Button>
            </Link>
            <Link to="/admin/complaints">
              <Button variant="filled" size="md">
                Triage queue
              </Button>
            </Link>
          </div>
        }
      />

      {/* Storage Quota Alert Banner */}
      <StorageQuotaNotice storageUsage={storageUsage} />

      {/* Stat Cards: 4 Column Google Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total complaints"
          value={stats.total_complaints}
          icon={<FaClipboardList />}
          description="Lifetime logged"
        />
        <StatCard
          label="Pending dispatch"
          value={stats.pending}
          icon={<FaHourglassHalf />}
          description="Action needed"
        />
        <StatCard
          label="Enrolled students"
          value={stats.total_students}
          icon={<FaUsers />}
          description="Active accounts"
        />
        <StatCard
          label="Department technicians"
          value={stats.total_staff}
          icon={<FaUserTie />}
          description="Roster allocated"
        />
      </div>

      {/* Analytics Charts Grid */}
      <AdminAnalyticsCharts statsData={statsData} />

      {/* Recent Complaints Queue Table */}
      <Card noPadding>
        <div className="px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-[var(--md-sys-color-on-surface)]">
              Recent issue registry
            </h3>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
              Latest campus tickets requiring triage or dispatch
            </p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline inline-flex items-center gap-1"
          >
            <span>View full registry</span>
            <FaArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Issue registry is empty"
              description="No complaints have been reported yet across campus facilities."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-[var(--md-sys-color-outline-variant)] h-12">
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">ID</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Issue title & location</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Student</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Category</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Priority</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Status</th>
                  <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                {recent.map((c) => (
                  <tr key={c.id} className="h-[52px] hover:bg-neutral-50/50 transition-colors">
                    <td className="px-4 font-mono text-xs font-semibold text-[var(--md-sys-color-primary)]">
                      #{c.id}
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium text-sm text-[var(--md-sys-color-on-surface)] leading-snug">{c.title}</div>
                      <div className="text-xs text-[var(--md-sys-color-on-surface-variant)] flex items-center gap-1 mt-0.5">
                        <FaMapMarkerAlt className="h-2.5 w-2.5 text-neutral-400 shrink-0" />
                        <span>{c.location}</span>
                      </div>
                    </td>
                    <td className="px-4 text-xs text-[var(--md-sys-color-on-surface)] font-medium">
                      {c.student_name || 'Enrolled Student'}
                    </td>
                    <td className="px-4 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      {c.category}
                    </td>
                    <td className="px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-4">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 text-right space-x-1.5 whitespace-nowrap">
                      <Link to={`/student/complaints/${c.id}`}>
                        <Button variant="text" size="sm">
                          Details
                        </Button>
                      </Link>
                      <Link to="/admin/complaints">
                        <Button variant="tonal" size="sm">
                          Dispatch
                        </Button>
                      </Link>
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

export default AdminDashboard;

import React from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaClipboardList,
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
  FaPlusCircle,
  FaArrowRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import StatCard from '../components/ui/StatCard';
import Card from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import { useDashboard } from '../hooks/useDashboard';
import { formatDate } from '../utils/formatters';

export const StudentDashboard = () => {
  const { data, loading, error } = useDashboard();

  // Must be before any early return — Rules of Hooks
  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (loading) {
    return <Spinner fullScreen={false} className="my-24 mx-auto block" />;
  }

  const rawStats = data?.stats || {};
  const stats = {
    total: rawStats.total ?? rawStats.total_complaints ?? 0,
    pending: rawStats.pending ?? rawStats.pending_complaints ?? 0,
    resolved: rawStats.resolved ?? rawStats.resolved_complaints ?? 0,
    closed: rawStats.closed ?? rawStats.closed_complaints ?? 0,
  };

  const recent = data?.recent_complaints || [];
  const notifications = data?.notifications || [];

  return (
    <div className="space-y-6">

      {/* Page Header (Headline Large) */}
      <PageHeader
        title={`Welcome, ${data?.name || 'Student'}`}
        subtitle="Monitor filed grievances, check real-time technician progress, and submit new maintenance tickets."
        action={
          <Link to="/student/raise-complaint">
            <Button variant="filled" size="md" icon={<FaPlusCircle className="text-xs" />}>
              Raise a complaint
            </Button>
          </Link>
        }
      />

      {/* Stat Cards: 4 column */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total complaints"
          value={stats.total}
          icon={<FaClipboardList />}
          description="Lifetime submitted"
        />
        <StatCard
          label="Active / pending"
          value={stats.pending}
          icon={<FaHourglassHalf />}
          description="Awaiting resolution"
        />
        <StatCard
          label="Resolved issues"
          value={stats.resolved}
          icon={<FaCheckCircle />}
          description="Remediated by staff"
        />
        <StatCard
          label="Closed tickets"
          value={stats.closed}
          icon={<FaTimesCircle />}
          description="Confirmed resolved"
        />
      </div>

      {/* Main Grid: Recent complaints (8) + Notifications (4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Filings Table */}
        <div className="lg:col-span-8">
          <Card
            title="Recent issue filings"
            subtitle="The latest grievances submitted from your account"
            action={
              <Link
                to="/student/complaints"
                className="text-sm font-medium text-[var(--md-sys-color-primary)] hover:underline inline-flex items-center gap-1"
              >
                <span>Full history</span>
                <FaArrowRight className="h-3 w-3" />
              </Link>
            }
            noPadding
          >
            {recent.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No complaints filed yet"
                  description="You have not submitted any campus issues. Use the button above to report defects."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--md-sys-color-outline-variant)] h-12">
                      <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">ID</th>
                      <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Title & location</th>
                      <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Category</th>
                      <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)]">Status</th>
                      <th className="px-4 text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]">
                    {recent.map((c) => (
                      <tr key={c.id} className="h-[52px] hover:bg-neutral-50/50 transition-colors">
                        <td className="px-4 font-mono text-xs font-semibold text-[var(--md-sys-color-primary)]">
                          #{c.id}
                        </td>
                        <td className="px-4 py-2">
                          <p className="font-medium text-sm text-[var(--md-sys-color-on-surface)] truncate max-w-xs">{c.title}</p>
                          <div className="flex items-center gap-3 text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                            <span className="flex items-center gap-1">
                              <FaMapMarkerAlt className="h-2.5 w-2.5" />
                              <span>{c.location}</span>
                            </span>
                            <span className="flex items-center gap-1 font-mono">
                              <FaCalendarAlt className="h-2.5 w-2.5" />
                              <span>{formatDate(c.created_at)}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                          {c.category}
                        </td>
                        <td className="px-4">
                          <StatusBadge status={c.status} />
                        </td>
                        <td className="px-4 text-right">
                          <Link
                            to={`/student/complaints/${c.id}`}
                            className="text-xs font-medium text-[var(--md-sys-color-primary)] hover:underline inline-flex items-center gap-1"
                          >
                            <span>Track</span>
                            <FaArrowRight className="h-2.5 w-2.5" />
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

        {/* Right Column: Notifications Feed */}
        <div className="lg:col-span-4">
          <Card
            title="Activity & alerts"
            subtitle="Recent status changes and dispatches"
            action={
              <Link
                to="/student/notifications"
                className="text-xs font-medium text-[var(--md-sys-color-primary)] hover:underline"
              >
                View all
              </Link>
            }
          >
            {notifications.length === 0 ? (
              <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] italic text-center py-6">
                No recent alert dispatches.
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className="p-3 rounded-card bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-xs space-y-1"
                  >
                    <p className="text-[var(--md-sys-color-on-surface)] leading-relaxed">
                      {n.message}
                    </p>
                    <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono block">
                      {formatDate(n.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

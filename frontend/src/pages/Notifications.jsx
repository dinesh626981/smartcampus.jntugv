import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaCalendarAlt, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import Chip from '../components/ui/Chip';
import Avatar from '../components/ui/Avatar';
import { formatDateTime } from '../utils/formatters';

export const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await dashboardService.getNotifications();
      setNotifications(res || []);
    } catch {
      try {
        const fallback = await dashboardService.getDashboardData();
        setNotifications(fallback.notifications || []);
      } catch {
        toast.error('Failed to load notifications.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await dashboardService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark notifications as read.');
    }
  };

  const getComplaintLink = (n) => {
    if (!n.complaint_id) return null;
    if (user?.role === 'admin') return '/admin/complaints';
    if (user?.role === 'staff') return '/staff/complaints';
    return `/student/complaints/${n.complaint_id}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      <PageHeader
        title="Notifications & alerts"
        subtitle="Official updates on complaint dispatch, technician status progression, and resolution reviews."
        action={
          notifications.length > 0 && (
            <Button variant="text" size="sm" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          )
        }
      />

      <Card noPadding>
        {loading ? (
          <div className="py-16 text-center">
            <Spinner size="md" className="mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Notification tray is empty"
              description="You have no pending alerts or updates at this time."
            />
          </div>
        ) : (
          <div className="divide-y divide-[var(--md-sys-color-outline-variant)]">
            {notifications.map((n, idx) => {
              const link = getComplaintLink(n);
              const isStaffResolved =
                (n.title && n.title.toLowerCase().includes('resolved')) ||
                (n.message && n.message.toLowerCase().includes('resolved'));

              return (
                <div
                  key={n.id || idx}
                  className={`p-4 sm:p-5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    !n.is_read
                      ? 'bg-[var(--md-sys-color-primary-container)]/30'
                      : 'hover:bg-neutral-50/50'
                  }`}
                >
                  <div className="flex items-start gap-3.5 max-w-2xl min-w-0">
                    <Avatar
                      src={n.sender_profile_photo_url || n.user_profile_photo_url}
                      name={n.sender_name || n.title}
                      size="sm"
                      className="mt-0.5 shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-[var(--md-sys-color-on-surface)]">
                          {n.title}
                        </span>
                        {isStaffResolved && (
                          <Chip variant="success">
                            <FaCheckCircle className="h-3 w-3" />
                            <span>Staff resolved</span>
                          </Chip>
                        )}
                        {!n.is_read && (
                          <span
                            className="h-2 w-2 rounded-full bg-[var(--md-sys-color-primary)] shrink-0"
                            title="Unread"
                          />
                        )}
                      </div>

                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-[var(--md-sys-color-on-surface-variant)] font-mono pt-0.5">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt className="h-2.5 w-2.5" />
                          <span>{formatDateTime(n.created_at)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {link && (
                    <div className="shrink-0 self-start sm:self-center">
                      <Link to={link}>
                        <Button
                          variant="text"
                          size="sm"
                          icon={<FaArrowRight className="text-xs" />}
                          iconPosition="right"
                        >
                          View
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Notifications;

import React, { useState, useEffect } from 'react';
import { feedbackService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaStar, FaCommentDots } from 'react-icons/fa';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { formatDate } from '../utils/formatters';

export const FeedbackPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (user?.role === 'admin') {
        try {
          const res = await feedbackService.getAllFeedback();
          setData(res);
        } catch {
          toast.error('Failed to load system feedbacks.');
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card className="text-center py-8">
          <FaStar className="h-8 w-8 text-[#F29900] mx-auto mb-3" />
          <h3 className="text-lg font-medium text-[var(--md-sys-color-on-surface)]">Issue resolution feedback</h3>
          <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1 max-w-xs mx-auto leading-relaxed">
            Enrolled students submit formal service appraisals upon complaint resolution verification directly on the ticket record.
          </p>
        </Card>
      </div>
    );
  }

  const feedbacks = data?.feedbacks || [];
  const avgRating = Number(data?.average_rating || 0).toFixed(1);
  const count = data?.total_feedback_count || 0;

  return (
    <div className="space-y-6">

      <PageHeader
        title="Student satisfaction & feedback audit"
        subtitle="Review qualitative ratings and operational feedback submitted by students following ticket closure."
      />

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          label="Institutional average score"
          value={`${avgRating} / 5.0`}
          description="Weighted mean across closed tickets"
          icon={<FaStar className="text-[#F29900]" />}
        />
        <StatCard
          label="Total appraisals recorded"
          value={count}
          description="Formal reviews submitted to date"
          icon={<FaCommentDots className="text-[var(--md-sys-color-primary)]" />}
        />
      </div>

      {/* FEEDBACK LIST */}
      <Card noPadding>
        <div className="px-6 py-4 border-b border-[var(--md-sys-color-outline-variant)] flex items-center justify-between">
          <div className="text-sm font-medium text-[var(--md-sys-color-on-surface)]">
            Student commentary & appraisals
          </div>
          <span className="font-mono text-xs text-[var(--md-sys-color-on-surface-variant)]">
            {feedbacks.length} Entries
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center">
            <Spinner text="Querying feedback records..." />
          </div>
        ) : feedbacks.length === 0 ? (
          <EmptyState
            title="No feedback submissions on record"
            description="Student appraisals will be logged here once maintenance tickets are marked resolved."
          />
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedbacks.map((f) => (
              <div
                key={f.id}
                className="p-4 bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] rounded-card space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="font-mono text-xs text-[var(--md-sys-color-primary)] font-medium">
                      Ticket #{f.complaint_id}
                    </span>
                    <h4 className="font-medium text-[var(--md-sys-color-on-surface)] text-sm truncate max-w-xs mt-0.5">
                      {f.complaint_title}
                    </h4>
                  </div>
                  <div className="flex gap-0.5 text-[#F29900] shrink-0">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <FaStar
                        key={idx}
                        className={`text-xs ${
                          idx <= f.rating ? 'text-[#F29900]' : 'text-[var(--md-sys-color-outline-variant)]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[var(--md-sys-color-on-surface)] italic bg-[var(--md-sys-color-surface)] p-3 rounded-[4px] border border-[var(--md-sys-color-outline-variant)] leading-relaxed font-sans">
                  "{f.comment || 'No written commentary provided.'}"
                </p>

                <div className="text-[11px] text-[var(--md-sys-color-on-surface-variant)] font-mono text-right">
                  {formatDate(f.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FeedbackPage;

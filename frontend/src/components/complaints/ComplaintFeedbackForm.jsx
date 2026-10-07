import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaCheckCircle, FaStar } from 'react-icons/fa';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { feedbackService } from '../../services/api';
import { toast } from 'react-toastify';

/**
 * Student feedback submission form and ticket closure action.
 */
export const ComplaintFeedbackForm = ({
  complaintId,
  onTicketClosed,
  onFeedbackCompleted,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [closing, setClosing] = useState(false);

  const handleClose = async () => {
    setClosing(true);
    try {
      if (onTicketClosed) {
        await onTicketClosed();
      }
    } finally {
      setClosing(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        complaint_id: complaintId,
        rating,
        comment,
      });
      toast.success('Feedback recorded. Thank you for rating the service.');
      setSubmitted(true);
      if (onFeedbackCompleted) {
        onFeedbackCompleted();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit feedback.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card title="Confirm resolution & feedback">
      <div className="space-y-4">
        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] leading-relaxed">
          The facility team marked this complaint as resolved. Please verify the remediation and submit your feedback score.
        </p>

        <Button
          variant="filled"
          size="md"
          onClick={handleClose}
          loading={closing}
          icon={<FaCheckCircle className="text-xs" />}
          className="w-full bg-[var(--md-sys-color-success)] text-white hover:brightness-95"
        >
          Accept & close ticket
        </Button>

        {!submitted ? (
          <form
            onSubmit={handleFeedbackSubmit}
            className="pt-4 border-t border-[var(--md-sys-color-outline-variant)] space-y-4"
          >
            <span className="text-xs font-medium text-[var(--md-sys-color-on-surface-variant)] block">
              Quality rating
            </span>

            {/* Star Rating */}
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none cursor-pointer"
                  aria-label={`Rate ${star} star`}
                >
                  <FaStar
                    className={`h-5 w-5 ${
                      star <= rating ? 'text-[var(--md-sys-color-warning)]' : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-mono font-medium text-[var(--md-sys-color-on-surface-variant)] ml-2">
                {rating} / 5 Stars
              </span>
            </div>

            <Textarea
              label="Service feedback"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Comment on resolution speed or workmanship..."
            />

            <Button
              type="submit"
              variant="outlined"
              size="sm"
              loading={submitting}
              className="w-full"
            >
              Submit feedback
            </Button>
          </form>
        ) : (
          <div className="p-3 bg-[var(--md-sys-color-success-container)] text-[var(--md-sys-color-on-success-container)] rounded-chip text-xs text-center font-medium">
            Feedback received. Thank you for your review.
          </div>
        )}
      </div>
    </Card>
  );
};

ComplaintFeedbackForm.propTypes = {
  complaintId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onTicketClosed: PropTypes.func,
  onFeedbackCompleted: PropTypes.func,
};

export default ComplaintFeedbackForm;

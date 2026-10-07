import React from 'react';
import PropTypes from 'prop-types';
import { FaBrain } from 'react-icons/fa';
import Card from '../ui/Card';

const STEPS = ['Pending', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

/**
 * Visual lifecycle progression timeline for a complaint.
 */
export const ComplaintTimeline = ({
  status,
  assignedStaffName,
  userRole,
  statusExplanation,
  loadingExplanation,
  onExplainStatus,
}) => {
  const currentStepIndex = STEPS.indexOf(status);

  return (
    <Card
      title="Remediation lifecycle"
      action={
        userRole === 'student' && onExplainStatus && (
          <button
            type="button"
            onClick={onExplainStatus}
            disabled={loadingExplanation}
            className="text-xs text-[var(--md-sys-color-primary)] hover:underline font-medium disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer"
          >
            <FaBrain className="h-3 w-3" />
            <span>{loadingExplanation ? 'Analyzing...' : 'Explain status'}</span>
          </button>
        )
      }
    >
      {statusExplanation && (
        <div className="mb-4 p-3 bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-chip text-xs leading-relaxed italic">
          {statusExplanation}
        </div>
      )}

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-[var(--md-sys-color-outline-variant)]">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div key={step} className="relative">
              <span
                className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 bg-white ${
                  isCompleted
                    ? 'border-[var(--md-sys-color-success)] bg-[var(--md-sys-color-success)]'
                    : isCurrent
                      ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary)] ring-2 ring-[var(--md-sys-color-primary-container)]'
                      : 'border-[var(--md-sys-color-outline-variant)]'
                }`}
              />

              <div>
                <h4
                  className={`text-xs font-medium ${
                    isCompleted
                      ? 'text-[var(--md-sys-color-success)]'
                      : isCurrent
                        ? 'text-[var(--md-sys-color-primary)] font-semibold'
                        : 'text-[var(--md-sys-color-on-surface-variant)]'
                  }`}
                >
                  {step}
                </h4>
                <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5 leading-relaxed">
                  {step === 'Pending' && 'Recorded in central database.'}
                  {step === 'Assigned' &&
                    (assignedStaffName
                      ? `Assigned to ${assignedStaffName}.`
                      : 'Routing to department staff.')}
                  {step === 'In Progress' && 'Active maintenance in progress.'}
                  {step === 'Resolved' && 'Work finished. Pending student confirmation.'}
                  {step === 'Closed' && 'Issue resolved and archived.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

ComplaintTimeline.propTypes = {
  status: PropTypes.string.isRequired,
  assignedStaffName: PropTypes.string,
  userRole: PropTypes.string,
  statusExplanation: PropTypes.string,
  loadingExplanation: PropTypes.bool,
  onExplainStatus: PropTypes.func,
};

export default ComplaintTimeline;

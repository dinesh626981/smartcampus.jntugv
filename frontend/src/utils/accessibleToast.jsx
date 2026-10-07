import React from 'react';
import { toast as reactToastifyToast } from 'react-toastify';

/**
 * WCAG 2.1 Compliant Toast Duration Calculator:
 * - Word Count Rule: +1 second for every 3 words in message (minimum 4 seconds).
 * - Simple Info / Success: 4 seconds minimum (or higher for longer word counts).
 * - Actionable Toast: 6 - 8 seconds (7500ms default, or higher for longer word counts).
 * - Error / Critical Info: 10+ seconds (10000ms minimum, or higher for longer word counts).
 *
 * Accessibility Controls:
 * - Pause on hover: timer freezes when cursor hovers over toast.
 * - Pause on focus / window change: timer freezes when navigating away.
 * - Dismiss button: explicit accessible "X" button so users can dismiss at their own pace.
 */
export function calculateWcagDuration(content, type = 'info', hasAction = false) {
  let text = '';
  if (typeof content === 'string') {
    text = content;
  } else if (content && typeof content === 'object') {
    if (typeof content.props?.children === 'string') {
      text = content.props.children;
    } else if (Array.isArray(content.props?.children)) {
      text = content.props.children
        .map((c) => (typeof c === 'string' ? c : c?.props?.children || ''))
        .join(' ');
    } else if (content.message) {
      text = String(content.message);
    }
  }

  // Count words (tokens separated by whitespace)
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  // +1 second for every 3 words
  const wordCountDuration = Math.ceil(words / 3) * 1000;

  if (type === 'error') {
    // Error / Critical Info: 10+ seconds (10000ms minimum)
    return Math.max(10000, wordCountDuration);
  }

  if (hasAction) {
    // Actionable Toast: 6 - 8 seconds (7500ms default)
    return Math.max(7500, wordCountDuration);
  }

  // Simple Info / Success / Warning: 4 seconds minimum (4000ms)
  return Math.max(4000, wordCountDuration);
}

/**
 * Creates accessible toast options adhering to WCAG 2.1.
 */
function createAccessibleOptions(content, type, userOptions = {}) {
  const hasAction = Boolean(
    userOptions.hasAction || userOptions.actionText || userOptions.onAction
  );
  const calculatedDuration = calculateWcagDuration(content, type, hasAction);

  return {
    autoClose: userOptions.autoClose ?? calculatedDuration,
    pauseOnHover: userOptions.pauseOnHover ?? true,
    pauseOnFocusLoss: userOptions.pauseOnFocusLoss ?? true,
    closeButton: userOptions.closeButton ?? true,
    role: type === 'error' ? 'alert' : 'status',
    ...userOptions,
  };
}

// Preserve references to underlying react-toastify methods
const rawToast = reactToastifyToast;
const rawSuccess = reactToastifyToast.success;
const rawError = reactToastifyToast.error;
const rawInfo = reactToastifyToast.info;
const rawWarn = reactToastifyToast.warn;

/**
 * Initialize global WCAG 2.1 toast patch.
 * This wraps react-toastify so that every toast across the entire app
 * automatically adheres to WCAG 2.1 reading and interaction duration rules.
 */
export function initAccessibleToast() {
  if (reactToastifyToast.__wcagPatched) return;

  reactToastifyToast.success = (content, options) => {
    return rawSuccess(content, createAccessibleOptions(content, 'success', options));
  };

  reactToastifyToast.error = (content, options) => {
    return rawError(content, createAccessibleOptions(content, 'error', options));
  };

  reactToastifyToast.info = (content, options) => {
    return rawInfo(content, createAccessibleOptions(content, 'info', options));
  };

  reactToastifyToast.warn = (content, options) => {
    return rawWarn(content, createAccessibleOptions(content, 'warn', options));
  };

  /**
   * Actionable Toast Helper (6 - 8 seconds duration):
   * Usage: toast.action("Complaint submitted.", { actionText: "View", onAction: () => navigate(...) })
   */
  reactToastifyToast.action = (message, actionConfig = {}) => {
    const {
      actionText = 'View',
      onAction = () => {},
      type = 'info',
      ...restOptions
    } = actionConfig;

    const actionToastContent = ({ closeToast }) => (
      <div className="flex items-center justify-between gap-3 w-full pr-1">
        <span className="text-xs sm:text-sm font-medium leading-snug">{message}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            try {
              onAction();
            } finally {
              closeToast?.();
            }
          }}
          className="px-2.5 py-1 text-xs font-semibold rounded bg-white/20 hover:bg-white/30 text-white underline focus:outline-none focus:ring-2 focus:ring-white/80 transition-colors shrink-0"
        >
          {actionText}
        </button>
      </div>
    );

    const options = createAccessibleOptions(message, type, {
      hasAction: true,
      ...restOptions,
    });

    if (type === 'success') return rawSuccess(actionToastContent, options);
    if (type === 'error') return rawError(actionToastContent, options);
    if (type === 'warn') return rawWarn(actionToastContent, options);
    return rawInfo(actionToastContent, options);
  };

  reactToastifyToast.__wcagPatched = true;
}

// Auto-initialize upon import
initAccessibleToast();

export default reactToastifyToast;

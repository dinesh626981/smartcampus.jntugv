export const COMPLAINT_CATEGORIES = [
  'Electrical',
  'Water Supply',
  'Furniture',
  'Laboratory',
  'Hostel',
  'Transport',
  'Internet',
  'Cleaning',
  'Security',
  'Other',
];

export const COMPLAINT_STATUSES = [
  'Pending',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
];

export const COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High'];

export const STATUS_STYLE_MAP = {
  Pending: {
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  Assigned: {
    badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800',
    dot: 'bg-sky-500',
  },
  'In Progress': {
    badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  Resolved: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    dot: 'bg-emerald-500',
  },
  Closed: {
    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-500',
  },
};

export const PRIORITY_STYLE_MAP = {
  High: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
};

import Chip from './Chip';

const STATUS_VARIANT_MAP = {
  pending: 'pending',
  assigned: 'assigned',
  'in progress': 'in progress',
  resolved: 'resolved',
  closed: 'closed',
};

const PRIORITY_VARIANT_MAP = {
  high: 'error',
  medium: 'warning',
  low: 'success',
};

export const StatusBadge = ({ status = 'Unknown', className = '' }) => {
  const key = String(status).toLowerCase();
  const variant = STATUS_VARIANT_MAP[key] || 'default';

  return (
    <Chip variant={variant} className={className}>
      {status}
    </Chip>
  );
};

export const PriorityBadge = ({ priority = 'Normal', className = '' }) => {
  const key = String(priority).toLowerCase();
  const variant = PRIORITY_VARIANT_MAP[key] || 'default';

  return (
    <Chip variant={variant} className={className}>
      {priority}
    </Chip>
  );
};

const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  return (
    <Chip variant={variant} className={className} {...props}>
      {children}
    </Chip>
  );
};

export default Badge;

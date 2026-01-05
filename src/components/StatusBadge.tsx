import { TransactionStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TransactionStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusConfig: Record<TransactionStatus, { label: string; className: string }> = {
  DRAFT: {
    label: 'Draft',
    className: 'status-badge-draft',
  },
  PENDING_APPROVAL: {
    label: 'Pending Approval',
    className: 'status-badge-pending',
  },
  APPROVED: {
    label: 'Approved',
    className: 'status-badge-approved',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'status-badge-rejected',
  },
  EXECUTED: {
    label: 'Executed',
    className: 'status-badge-executed',
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'sm',
  className 
}) => {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'status-badge font-medium',
        config.className,
        sizeClasses[size],
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;

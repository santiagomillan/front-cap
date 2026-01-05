import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  primary: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  success: {
    iconBg: 'bg-status-approved-bg',
    iconColor: 'text-status-approved',
  },
  warning: {
    iconBg: 'bg-status-pending-bg',
    iconColor: 'text-status-pending',
  },
  danger: {
    iconBg: 'bg-status-rejected-bg',
    iconColor: 'text-status-rejected',
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}) => {
  const styles = variantStyles[variant];

  return (
    <div className={cn('stat-card animate-fade-in', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{value}</p>
          {trend && (
            <p className="mt-1 text-xs text-muted-foreground">{trend}</p>
          )}
        </div>
        <div className={cn('p-3 rounded-lg', styles.iconBg)}>
          <Icon className={cn('w-6 h-6', styles.iconColor)} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;

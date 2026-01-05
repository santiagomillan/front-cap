import { TransactionStatus } from '@/types';
import { Check, X, Clock, FileEdit, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusStepperProps {
  currentStatus: TransactionStatus;
  className?: string;
}

const steps = [
  { status: 'DRAFT', label: 'Draft', icon: FileEdit },
  { status: 'PENDING_APPROVAL', label: 'Pending', icon: Clock },
  { status: 'APPROVED', label: 'Approved', icon: Check },
  { status: 'EXECUTED', label: 'Executed', icon: Zap },
];

const rejectedStep = { status: 'REJECTED', label: 'Rejected', icon: X };

const getStatusIndex = (status: TransactionStatus): number => {
  if (status === 'REJECTED') return 2; // Show at position 2 (after pending)
  return steps.findIndex(s => s.status === status);
};

const StatusStepper: React.FC<StatusStepperProps> = ({ currentStatus, className }) => {
  const isRejected = currentStatus === 'REJECTED';
  const currentIndex = getStatusIndex(currentStatus);
  
  const displaySteps = isRejected 
    ? [steps[0], steps[1], rejectedStep] 
    : steps;

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {displaySteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.status === currentStatus;
          const isPast = index < currentIndex;
          const isRejectedStep = step.status === 'REJECTED';
          
          return (
            <div key={step.status} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                    isActive && !isRejectedStep && 'bg-primary text-primary-foreground shadow-lg',
                    isActive && isRejectedStep && 'bg-destructive text-destructive-foreground shadow-lg',
                    isPast && 'bg-status-approved text-primary-foreground',
                    !isActive && !isPast && 'bg-muted text-muted-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    'mt-2 text-xs font-medium',
                    isActive && 'text-foreground',
                    isPast && 'text-status-approved',
                    !isActive && !isPast && 'text-muted-foreground'
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {index < displaySteps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2 transition-all duration-300',
                    index < currentIndex ? 'bg-status-approved' : 'bg-border'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusStepper;

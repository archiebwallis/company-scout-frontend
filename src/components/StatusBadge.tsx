import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { label: 'Pending', className: 'bg-muted text-muted-foreground' },
  running: { label: 'Running', className: 'bg-primary/15 text-primary' },
  completed: { label: 'Completed', className: 'bg-score-high/15 text-score-high' },
  failed: { label: 'Failed', className: 'bg-score-low/15 text-score-low' },
};

interface StatusBadgeProps {
  status: keyof typeof statusConfig;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.className)}>
      {status === 'running' && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
      {config.label}
    </span>
  );
}

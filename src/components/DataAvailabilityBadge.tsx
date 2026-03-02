import { AlertTriangle, CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DataAvailabilityBadgeProps {
  availability: 'full' | 'partial' | 'limited' | null | undefined;
  size?: 'sm' | 'md';
}

export function DataAvailabilityBadge({ availability, size = 'sm' }: DataAvailabilityBadgeProps) {
  if (!availability || availability === 'full') return null;

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  const config = {
    partial: {
      icon: CircleAlert,
      className: 'text-score-mid',
      label: 'Partial data available — some criteria had limited evidence',
    },
    limited: {
      icon: AlertTriangle,
      className: 'text-score-low',
      label: 'Limited or no data found — scores may not reflect reality',
    },
  };

  const { icon: Icon, className, label } = config[availability] ?? config.limited;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex shrink-0', className)}>
          <Icon className={iconSize} />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

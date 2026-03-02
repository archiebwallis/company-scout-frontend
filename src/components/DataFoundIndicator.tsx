import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DataFoundIndicatorProps {
  dataFound?: boolean;
  confidence: string;
}

export function DataFoundIndicator({ dataFound, confidence }: DataFoundIndicatorProps) {
  const noData = dataFound === false || (dataFound === undefined && confidence === 'low');
  if (!noData) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-score-low/60 ml-1 shrink-0" />
      </TooltipTrigger>
      <TooltipContent side="top">No data found for this criterion</TooltipContent>
    </Tooltip>
  );
}

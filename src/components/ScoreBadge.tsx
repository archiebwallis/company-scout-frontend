import { cn } from '@/lib/utils';
import { getScoreLevel } from '@/lib/mock-data';

interface ScoreBadgeProps {
  score: number;
  maxScore: number;
  size?: 'sm' | 'md' | 'lg';
}

export function ScoreBadge({ score, maxScore, size = 'sm' }: ScoreBadgeProps) {
  const level = getScoreLevel(score, maxScore);
  return (
    <span className={cn(
      'inline-flex items-center justify-center rounded-md font-semibold tabular-nums',
      size === 'sm' && 'px-2 py-0.5 text-xs',
      size === 'md' && 'px-3 py-1 text-sm',
      size === 'lg' && 'px-4 py-2 text-2xl',
      level === 'high' && 'bg-score-high/15 text-score-high',
      level === 'mid' && 'bg-score-mid/15 text-score-mid',
      level === 'low' && 'bg-score-low/15 text-score-low',
    )}>
      {score}
    </span>
  );
}

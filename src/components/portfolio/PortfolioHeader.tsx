import { ArrowLeft, LayoutGrid, Table2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { ScoreDistribution } from '@/lib/portfolio-utils';

interface PortfolioHeaderProps {
  runName: string;
  runDate: string;
  companyCount: number;
  distribution: ScoreDistribution;
  runId: string;
  viewMode: 'heatmap' | 'table';
  onViewModeChange: (mode: 'heatmap' | 'table') => void;
}

export function PortfolioHeader({
  runName,
  runDate,
  companyCount,
  distribution,
  runId,
  viewMode,
  onViewModeChange,
}: PortfolioHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border pb-4 mb-6">
      <Link
        to={`/runs/${runId}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Back to run
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{runName}</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Ranked by value creation readiness (people, process, revenue/capital) against typical PE hold dynamics.
          </p>
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{runDate}</span>
            <span>{companyCount} companies</span>
            <span>
              Scores: {distribution.min} — {distribution.median} (median) — {distribution.max}
            </span>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-md border border-border">
          <button
            onClick={() => onViewModeChange('heatmap')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors rounded-l-md',
              viewMode === 'heatmap'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={cn(
              'px-3 py-1.5 text-sm font-medium transition-colors rounded-r-md',
              viewMode === 'table'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Table2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

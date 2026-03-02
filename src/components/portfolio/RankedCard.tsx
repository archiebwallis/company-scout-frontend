import { cn } from '@/lib/utils';
import { CompanyLogo } from '@/components/CompanyLogo';
import { ScoreBadge } from '@/components/ScoreBadge';
import { getTierColor, type EnrichedCompany } from '@/lib/portfolio-utils';
import { getScoreLevel } from '@/lib/mock-data';

interface RankedCardProps {
  enriched: EnrichedCompany;
  maxScore: number;
  isSelected: boolean;
  onClick: () => void;
}

export function RankedCard({ enriched, maxScore, isSelected, onClick }: RankedCardProps) {
  const { company, rank, tier, drivers, risks } = enriched;
  const level = getScoreLevel(company.totalScore, maxScore);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-lg border bg-card p-3 transition-all duration-200',
        'hover:bg-muted/30 cursor-pointer',
        isSelected
          ? 'border-primary ring-1 ring-primary/30'
          : 'border-border'
      )}
    >
      <div className="flex items-center gap-3">
        {/* Rank number */}
        <span className={cn(
          'text-lg font-bold tabular-nums w-8 shrink-0',
          getTierColor(tier)
        )}>
          #{rank}
        </span>

        {/* Logo */}
        <CompanyLogo
          name={company.name}
          logoDomain={company.logoDomain}
          size="sm"
        />

        {/* Name + score bar */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium truncate">{company.name}</span>
            <ScoreBadge score={company.totalScore} maxScore={maxScore} />
          </div>
          <div className="h-1 rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                level === 'high' ? 'bg-score-high' :
                level === 'mid' ? 'bg-score-mid' : 'bg-score-low'
              )}
              style={{ width: `${(company.totalScore / maxScore) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Driver + risk chips */}
      <div className="flex flex-wrap gap-1 mt-2 ml-11">
        {drivers.slice(0, 3).map(d => (
          <span
            key={d.criterionName}
            className="text-[10px] px-1.5 py-0.5 rounded bg-score-high/10 text-score-high"
          >
            {d.criterionName}
          </span>
        ))}
        {risks.slice(0, 1).map(r => (
          <span
            key={r.criterionName}
            className="text-[10px] px-1.5 py-0.5 rounded bg-score-low/10 text-score-low"
          >
            {r.criterionName}
          </span>
        ))}
      </div>
    </button>
  );
}

import { CompanyLogo } from '@/components/CompanyLogo';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  scoreToColor,
  scoreToTextColor,
  getTierBgColor,
  getConfidenceColor,
  type EnrichedCompany,
} from '@/lib/portfolio-utils';

interface HeatmapTileProps {
  enriched: EnrichedCompany;
  maxScore: number;
  isSelected: boolean;
  onClick: () => void;
}

export function HeatmapTile({ enriched, maxScore, isSelected, onClick }: HeatmapTileProps) {
  const { company, tier, confidence, drivers } = enriched;
  const bgColor = scoreToColor(company.totalScore, maxScore);
  const textColor = scoreToTextColor(company.totalScore, maxScore);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            'relative rounded-lg p-3 text-left transition-all duration-200 border-2',
            'hover:scale-[1.02] hover:shadow-lg cursor-pointer',
            isSelected
              ? 'border-primary ring-2 ring-primary/30'
              : 'border-transparent hover:border-border/50'
          )}
          style={{ backgroundColor: bgColor }}
        >
          {/* Top row: logo + name */}
          <div className="flex items-center gap-2 mb-2">
            <CompanyLogo
              name={company.name}
              logoDomain={company.logoDomain}
              size="sm"
              className="border border-white/20"
            />
            <span className={cn('text-sm font-medium truncate', textColor)}>
              {company.name}
            </span>
          </div>

          {/* Big score */}
          <div className={cn('text-3xl font-bold tabular-nums mb-2', textColor)}>
            {company.totalScore}
          </div>

          {/* Bottom row: tier badge + confidence dot */}
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-[10px] font-semibold px-1.5 py-0.5 rounded border',
              getTierBgColor(tier)
            )}>
              {tier}
            </span>
            <span className={cn(
              'w-2 h-2 rounded-full shrink-0',
              getConfidenceColor(confidence)
            )} />
            {/* Driver chips (max 2) */}
            {drivers.slice(0, 2).map(d => (
              <span
                key={d.criterionName}
                className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/70 truncate max-w-[80px]"
              >
                {d.criterionName}
              </span>
            ))}
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <p className="font-medium mb-1">{company.name} — {company.totalScore}/{maxScore}</p>
        <p className="text-xs text-muted-foreground mb-2">
          {tier} · Confidence: {confidence} · Data: {enriched.dataCoveragePct}%
        </p>
        <p className="text-xs font-medium mb-1">Top drivers:</p>
        <ul className="text-xs text-muted-foreground space-y-0.5">
          {drivers.map(d => (
            <li key={d.criterionName}>
              {d.criterionName}: {d.score}/{maxScore}
            </li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
}

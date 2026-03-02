import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, TrendingUp, AlertTriangle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { CompanyLogo } from '@/components/CompanyLogo';
import { ScoreBadge } from '@/components/ScoreBadge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getTierBgColor, getConfidenceColor, type EnrichedCompany } from '@/lib/portfolio-utils';
import { getScoreLevel } from '@/lib/mock-data';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';

interface CompanyDrawerProps {
  enriched: EnrichedCompany | null;
  maxScore: number;
  open: boolean;
  onClose: () => void;
}

export function CompanyDrawer({ enriched, maxScore, open, onClose }: CompanyDrawerProps) {
  const [showReport, setShowReport] = useState(false);

  if (!enriched) return null;

  const { company, tier, confidence, drivers, risks, dataCoveragePct } = enriched;

  const radarData = company.criterionScores.map(cs => ({
    criterion: cs.criterionName,
    score: cs.score,
    fullMark: maxScore,
  }));

  const missingData = company.criterionScores.filter(
    cs => cs.dataFound === false || (cs.dataFound === undefined && cs.confidence === 'low')
  );

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <CompanyLogo name={company.name} logoDomain={company.logoDomain} size="lg" />
            <div>
              <SheetTitle className="text-xl">{company.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2 mt-1">
                <ScoreBadge score={company.totalScore} maxScore={maxScore} size="md" />
                <span className={cn(
                  'text-xs font-semibold px-1.5 py-0.5 rounded border',
                  getTierBgColor(tier)
                )}>
                  {tier}
                </span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span className={cn('w-2 h-2 rounded-full', getConfidenceColor(confidence))} />
                  {confidence === 'H' ? 'High' : confidence === 'M' ? 'Medium' : 'Low'} confidence
                </span>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Mini radar chart */}
        <div className="rounded-lg border border-border bg-card p-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Score Breakdown</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(220, 13%, 18%)" />
                <PolarAngleAxis
                  dataKey="criterion"
                  tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, maxScore]}
                  tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 9 }}
                />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Drivers */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-score-high" />
            Drivers
          </h3>
          <div className="space-y-2">
            {drivers.map(d => (
              <div key={d.criterionName} className="rounded-md border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{d.criterionName}</span>
                  <ScoreBadge score={d.score} maxScore={maxScore} />
                </div>
                <p className="text-xs text-muted-foreground">{d.reasoning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risks */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 text-score-low" />
            Risks
          </h3>
          <div className="space-y-2">
            {risks.map(r => (
              <div key={r.criterionName} className="rounded-md border border-border bg-card p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{r.criterionName}</span>
                  <ScoreBadge score={r.score} maxScore={maxScore} />
                </div>
                <p className="text-xs text-muted-foreground">{r.reasoning}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Data coverage */}
        <div className="rounded-lg border border-border bg-card p-4 mb-4">
          <h3 className="text-sm font-medium mb-2">Data Coverage</h3>
          <div className="flex items-center gap-3 mb-2">
            <Progress value={dataCoveragePct} className="h-2 flex-1" />
            <span className="text-sm font-medium tabular-nums">{dataCoveragePct}%</span>
          </div>
          {missingData.length > 0 && (
            <div className="text-xs text-muted-foreground">
              <span className="font-medium text-score-low">Missing data:</span>{' '}
              {missingData.map(cs => cs.criterionName).join(', ')}
            </div>
          )}
        </div>

        {/* Per-criterion scores */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">All Scores</h3>
          <div className="space-y-1.5">
            {company.criterionScores.map(cs => {
              const level = getScoreLevel(cs.score, maxScore);
              return (
                <div key={cs.criterionId} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-28 truncate shrink-0">
                    {cs.criterionName}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full rounded-full',
                        level === 'high' ? 'bg-score-high' :
                        level === 'mid' ? 'bg-score-mid' : 'bg-score-low'
                      )}
                      style={{ width: `${(cs.score / maxScore) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium tabular-nums w-6 text-right">
                    {cs.score}
                  </span>
                  {cs.dataFound === false && (
                    <span className="text-[9px] px-1 py-0.5 rounded bg-score-low/10 text-score-low">
                      no data
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sources */}
        {company.sources.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">Sources</h3>
            <div className="space-y-1">
              {company.sources.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-primary hover:underline truncate"
                >
                  <ExternalLink className="h-3 w-3 shrink-0" /> {url}
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Collapsible research report */}
        <div className="rounded-lg border border-border bg-card">
          <button
            onClick={() => setShowReport(!showReport)}
            className="w-full px-4 py-3 text-left text-sm font-medium flex items-center justify-between hover:bg-muted/30 transition-colors"
          >
            Research Report
            {showReport ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {showReport && (
            <div className="px-4 pb-4 text-xs text-muted-foreground whitespace-pre-line border-t border-border pt-3">
              {company.researchReport}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

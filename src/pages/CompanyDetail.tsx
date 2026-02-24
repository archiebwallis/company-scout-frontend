import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import { useRun, useConfigs } from '@/lib/api';
import { getMaxScore, getScoreLevel } from '@/lib/mock-data';
import { ScoreBadge } from '@/components/ScoreBadge';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

export default function CompanyDetail() {
  const { id, companyId } = useParams();
  const { data: run, isLoading: runLoading } = useRun(id);
  const { data: configs } = useConfigs();
  const config = configs?.find(c => c.id === run?.configId);
  const maxScore = config ? getMaxScore(config.scale) : 10;
  const [showReport, setShowReport] = useState(false);

  const company = run?.companies.find(c => c.id === companyId);

  if (runLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!run || !company) return <div className="text-muted-foreground">Not found</div>;

  const radarData = company.criterionScores.map(cs => ({
    criterion: cs.criterionName,
    score: cs.score,
    fullMark: maxScore,
  }));

  return (
    <div>
      <Link to={`/runs/${run.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to run
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold">{company.name}</h1>
        <ScoreBadge score={company.totalScore} maxScore={maxScore} size="lg" />
      </div>

      <div className="rounded-lg border border-border bg-card p-6 mb-6">
        <h2 className="font-semibold mb-4">Score Overview</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(220, 13%, 18%)" />
              <PolarAngleAxis dataKey="criterion" tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, maxScore]} tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 10 }} />
              <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {company.criterionScores.map(cs => {
          const level = getScoreLevel(cs.score, maxScore);
          return (
            <div key={cs.criterionId} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{cs.criterionName}</span>
                <ScoreBadge score={cs.score} maxScore={maxScore} />
              </div>
              <div className="h-1.5 rounded-full bg-muted mb-3">
                <div
                  className={cn('h-full rounded-full', level === 'high' ? 'bg-score-high' : level === 'mid' ? 'bg-score-mid' : 'bg-score-low')}
                  style={{ width: `${(cs.score / maxScore) * 100}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">{cs.reasoning}</p>
              <div className="mt-2">
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  cs.confidence === 'high' ? 'bg-score-high/10 text-score-high' :
                  cs.confidence === 'medium' ? 'bg-score-mid/10 text-score-mid' :
                  'bg-score-low/10 text-score-low'
                )}>
                  {cs.confidence} confidence
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-card">
        <button onClick={() => setShowReport(!showReport)} className="w-full px-4 py-3 text-left font-medium text-sm flex items-center justify-between hover:bg-muted/30 transition-colors">
          Research Report
          <span className="text-muted-foreground text-xs">{showReport ? 'Hide' : 'Show'}</span>
        </button>
        {showReport && (
          <div className="px-4 pb-4 text-sm text-muted-foreground whitespace-pre-line border-t border-border pt-3">
            {company.researchReport}
          </div>
        )}
      </div>

      {company.sources.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Sources</h3>
          <div className="space-y-1">
            {company.sources.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                <ExternalLink className="h-3 w-3" /> {url}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

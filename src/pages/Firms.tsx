import { Link } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { useFirms } from '@/lib/api';
import { ScoreBadge } from '@/components/ScoreBadge';

export default function Firms() {
  const { data: firms, isLoading } = useFirms();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">PE Firms</h1>
        <Link to="/runs/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          + New Analysis
        </Link>
      </div>

      {(!firms || firms.length === 0) ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Building2 className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-2">No PE firm analyses yet</p>
          <p className="text-sm text-muted-foreground">
            Use the <Link to="/runs/new" className="text-primary hover:underline">"Scrape PE Firm"</Link> option when creating a new run to group analyses by firm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {firms.map(firm => (
            <Link
              key={firm.firmName}
              to={`/firms/${encodeURIComponent(firm.firmName)}`}
              className="block rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold truncate">{firm.firmName}</h2>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Runs</p>
                  <p className="text-xl font-bold">{firm.runCount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Companies</p>
                  <p className="text-xl font-bold">{firm.totalCompanies}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                {firm.averageScore > 0 ? (
                  <ScoreBadge score={firm.averageScore} maxScore={10} />
                ) : (
                  <span className="text-sm text-muted-foreground">No scores yet</span>
                )}
                <span className="text-xs text-muted-foreground">{firm.latestRunDate}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Plus, Loader2 } from 'lucide-react';
import { useRuns } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { ScoreBadge } from '@/components/ScoreBadge';

export default function Runs() {
  const { data: runs, isLoading } = useRuns();

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
        <h1 className="text-2xl font-bold">All Runs</h1>
        <Link to="/runs/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Run
        </Link>
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Config</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Companies</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {(runs ?? []).map(run => (
              <tr key={run.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/runs/${run.id}`} className="text-primary hover:underline font-medium">{run.name}</Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{run.configName}</td>
                <td className="px-4 py-3 text-muted-foreground">{run.date}</td>
                <td className="px-4 py-3 text-muted-foreground">{run.companiesScored}/{run.companyCount}</td>
                <td className="px-4 py-3"><StatusBadge status={run.status} /></td>
                <td className="px-4 py-3">
                  {run.averageScore > 0 ? <ScoreBadge score={run.averageScore} maxScore={10} /> : <span className="text-muted-foreground">—</span>}
                </td>
              </tr>
            ))}
            {(!runs || runs.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No runs yet. <Link to="/runs/new" className="text-primary hover:underline">Create your first run</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

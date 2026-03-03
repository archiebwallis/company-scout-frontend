import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Loader2 } from 'lucide-react';
import { useFirmRuns, useFirms } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { ScoreBadge } from '@/components/ScoreBadge';

export default function FirmDetail() {
  const { firmName: encodedFirmName } = useParams();
  const firmName = encodedFirmName ? decodeURIComponent(encodedFirmName) : '';
  const { data: runs, isLoading } = useFirmRuns(firmName);
  const { data: firms } = useFirms();
  const firmSummary = firms?.find(f => f.firmName === firmName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <Link to="/firms" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> All PE Firms
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold">{firmName}</h1>
        </div>
        <Link to="/runs/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          + New Run
        </Link>
      </div>

      {firmSummary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Runs</p>
            <p className="text-2xl font-bold">{firmSummary.runCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Companies</p>
            <p className="text-2xl font-bold">{firmSummary.totalCompanies}</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Avg Score</p>
            <p className="text-2xl font-bold">
              {firmSummary.averageScore > 0 ? firmSummary.averageScore : '—'}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Latest Run</p>
            <p className="text-2xl font-bold">{firmSummary.latestRunDate}</p>
          </div>
        </div>
      )}

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
                  No runs found for this firm.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

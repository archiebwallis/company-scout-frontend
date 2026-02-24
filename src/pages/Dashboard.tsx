import { Link } from 'react-router-dom';
import { BarChart3, Users, TrendingUp, Activity, Loader2 } from 'lucide-react';
import { useStats, useRuns } from '@/lib/api';
import { StatsCard } from '@/components/StatsCard';
import { StatusBadge } from '@/components/StatusBadge';
import { ScoreBadge } from '@/components/ScoreBadge';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: runs, isLoading: runsLoading } = useRuns();

  if (statsLoading || runsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total Runs" value={stats?.totalRuns ?? 0} icon={BarChart3} />
        <StatsCard title="Companies Scored" value={stats?.companiesScored ?? 0} icon={Users} />
        <StatsCard title="Average Score" value={stats?.averageScore ?? 0} icon={TrendingUp} />
        <StatsCard title="Active Runs" value={stats?.activeRuns ?? 0} icon={Activity} />
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Runs</h2>
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

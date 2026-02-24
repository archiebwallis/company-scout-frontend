import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, BarChart3, Search, ArrowUpDown, Loader2 } from 'lucide-react';
import { useRun } from '@/lib/api';
import { useConfigs } from '@/lib/api';
import { getMaxScore } from '@/lib/mock-data';
import { ScoreBadge } from '@/components/ScoreBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { Progress } from '@/components/ui/progress';

export default function RunDetail() {
  const { id } = useParams();
  const { data: run, isLoading } = useRun(id);
  const { data: configs } = useConfigs();
  const config = configs?.find(c => c.id === run?.configId);
  const maxScore = config ? getMaxScore(config.scale) : 10;

  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>('totalScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredCompanies = useMemo(() => {
    if (!run) return [];
    let companies = run.companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    companies = [...companies].sort((a, b) => {
      if (sortKey === 'name') {
        return sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      let aVal: number, bVal: number;
      if (sortKey === 'totalScore') {
        aVal = a.totalScore; bVal = b.totalScore;
      } else {
        aVal = a.criterionScores.find(cs => cs.criterionId === sortKey)?.score ?? 0;
        bVal = b.criterionScores.find(cs => cs.criterionId === sortKey)?.score ?? 0;
      }
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
    return companies;
  }, [run?.companies, search, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!run) return <div className="text-muted-foreground">Run not found</div>;

  const progress = run.companyCount > 0 ? (run.companiesScored / run.companyCount) * 100 : 0;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold">{run.name}</h1>
            <StatusBadge status={run.status} />
          </div>
          <p className="text-sm text-muted-foreground">{run.configName} · {run.date}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/runs/${run.id}/visualize`} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors">
            <BarChart3 className="h-4 w-4" /> Visualize
          </Link>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      {(run.status === 'running' || run.status === 'pending') && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">
              {run.status === 'pending' ? 'Preparing...' : 'Scoring in progress'}
            </span>
            <span className="font-medium">{run.companiesScored}/{run.companyCount} companies scored</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." className="w-full rounded-md border border-input bg-card pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Company <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none" onClick={() => handleSort('totalScore')}>
                <div className="flex items-center gap-1">Total <ArrowUpDown className="h-3 w-3" /></div>
              </th>
              {config?.criteria.map(c => (
                <th key={c.id} className="text-left px-4 py-3 font-medium text-muted-foreground cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort(c.id)}>
                  <div className="flex items-center gap-1">{c.name} <ArrowUpDown className="h-3 w-3" /></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredCompanies.map(company => (
              <tr key={company.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <Link to={`/runs/${run.id}/companies/${company.id}`} className="text-primary hover:underline font-medium whitespace-nowrap">{company.name}</Link>
                </td>
                <td className="px-4 py-3"><ScoreBadge score={company.totalScore} maxScore={maxScore} /></td>
                {company.criterionScores.map(cs => (
                  <td key={cs.criterionId} className="px-4 py-3"><ScoreBadge score={cs.score} maxScore={maxScore} /></td>
                ))}
              </tr>
            ))}
            {filteredCompanies.length === 0 && run.companies.length === 0 && (
              <tr>
                <td colSpan={(config?.criteria.length ?? 0) + 2} className="px-4 py-8 text-center text-muted-foreground">
                  {run.status === 'running' || run.status === 'pending'
                    ? 'Companies are being researched and scored...'
                    : 'No company results available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

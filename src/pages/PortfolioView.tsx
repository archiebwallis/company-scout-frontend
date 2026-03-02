import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ArrowUpDown } from 'lucide-react';
import { useRun, useConfigs } from '@/lib/api';
import { getMaxScore } from '@/lib/mock-data';
import { ScoreBadge } from '@/components/ScoreBadge';
import { CompanyLogo } from '@/components/CompanyLogo';
import { DataAvailabilityBadge } from '@/components/DataAvailabilityBadge';
import { DataFoundIndicator } from '@/components/DataFoundIndicator';
import { PortfolioHeader } from '@/components/portfolio/PortfolioHeader';
import { FilterBar, type Filters } from '@/components/portfolio/FilterBar';
import { HeatmapGrid } from '@/components/portfolio/HeatmapGrid';
import { RankedCardsList } from '@/components/portfolio/RankedCardsList';
import { CompanyDrawer } from '@/components/portfolio/CompanyDrawer';
import {
  enrichCompanies,
  computeScoreDistribution,
  type EnrichedCompany,
} from '@/lib/portfolio-utils';

const emptyFilters: Filters = {
  search: '',
  tiers: [],
  confidence: [],
  dataAvailability: [],
};

export default function PortfolioView() {
  const { id } = useParams();
  const { data: run, isLoading } = useRun(id);
  const { data: configs } = useConfigs();
  const config = configs?.find(c => c.id === run?.configId);
  const maxScore = config ? getMaxScore(config.scale) : 10;

  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'heatmap' | 'table'>('heatmap');

  // Enrich all companies with derived data
  const allEnriched = useMemo(
    () => (run ? enrichCompanies(run.companies) : []),
    [run?.companies]
  );

  // Apply filters
  const filtered = useMemo(() => {
    return allEnriched.filter(e => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!e.company.name.toLowerCase().includes(q)) return false;
      }
      if (filters.tiers.length > 0 && !filters.tiers.includes(e.tier)) return false;
      if (filters.confidence.length > 0 && !filters.confidence.includes(e.confidence)) return false;
      if (filters.dataAvailability.length > 0) {
        const avail = e.company.dataAvailability ?? 'full';
        if (!filters.dataAvailability.includes(avail)) return false;
      }
      return true;
    });
  }, [allEnriched, filters]);

  const distribution = useMemo(
    () => computeScoreDistribution(run?.companies ?? []),
    [run?.companies]
  );

  const selectedEnriched = allEnriched.find(e => e.company.id === selectedId) ?? null;

  const handleSelect = (companyId: string) => {
    setSelectedId(prev => prev === companyId ? null : companyId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!run || !config) return <div className="text-muted-foreground">Run not found</div>;

  return (
    <div>
      <PortfolioHeader
        runName={run.name}
        runDate={run.date}
        companyCount={run.companies.length}
        distribution={distribution}
        runId={run.id}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="mt-6">
        {viewMode === 'heatmap' ? (
          <div className="flex gap-6">
            {/* Left: Heatmap grid (~65%) */}
            <div className="flex-[2] min-w-0">
              <HeatmapGrid
                companies={filtered}
                maxScore={maxScore}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            </div>

            {/* Right: Ranked cards (~35%) */}
            <div className="flex-1 min-w-[280px] hidden md:block">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                Rankings ({filtered.length})
              </h3>
              <RankedCardsList
                companies={filtered}
                maxScore={maxScore}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            </div>
          </div>
        ) : (
          /* Table view — similar to RunDetail but with tier/confidence/data columns */
          <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground w-8">#</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Company</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    <div className="flex items-center gap-1">Total <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Tier</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Conf</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Data</th>
                  {config.criteria.map(c => (
                    <th key={c.id} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(enriched => {
                  const { company, rank, tier, confidence } = enriched;
                  return (
                    <tr
                      key={company.id}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleSelect(company.id)}
                    >
                      <td className="px-4 py-3 text-muted-foreground font-medium tabular-nums">
                        {rank}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <CompanyLogo name={company.name} logoDomain={company.logoDomain} size="sm" />
                          <span className="font-medium whitespace-nowrap">{company.name}</span>
                          <DataAvailabilityBadge availability={company.dataAvailability} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ScoreBadge score={company.totalScore} maxScore={maxScore} />
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs">{tier}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs">{confidence}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs tabular-nums">{enriched.dataCoveragePct}%</span>
                      </td>
                      {company.criterionScores.map(cs => (
                        <td key={cs.criterionId} className="px-4 py-3">
                          <div className="inline-flex items-center">
                            <ScoreBadge score={cs.score} maxScore={maxScore} />
                            <DataFoundIndicator dataFound={cs.dataFound} confidence={cs.confidence} />
                          </div>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Company drawer */}
      <CompanyDrawer
        enriched={selectedEnriched}
        maxScore={maxScore}
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}

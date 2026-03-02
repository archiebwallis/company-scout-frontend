import { HeatmapTile } from './HeatmapTile';
import type { EnrichedCompany } from '@/lib/portfolio-utils';

interface HeatmapGridProps {
  companies: EnrichedCompany[];
  maxScore: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function HeatmapGrid({ companies, maxScore, selectedId, onSelect }: HeatmapGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {companies.map(enriched => (
        <HeatmapTile
          key={enriched.company.id}
          enriched={enriched}
          maxScore={maxScore}
          isSelected={selectedId === enriched.company.id}
          onClick={() => onSelect(enriched.company.id)}
        />
      ))}
      {companies.length === 0 && (
        <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
          No companies match the current filters
        </div>
      )}
    </div>
  );
}

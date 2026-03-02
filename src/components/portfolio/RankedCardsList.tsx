import { useRef, useEffect } from 'react';
import { RankedCard } from './RankedCard';
import type { EnrichedCompany } from '@/lib/portfolio-utils';

interface RankedCardsListProps {
  companies: EnrichedCompany[];
  maxScore: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function RankedCardsList({ companies, maxScore, selectedId, onSelect }: RankedCardsListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected card
  useEffect(() => {
    if (!selectedId || !containerRef.current) return;
    const card = containerRef.current.querySelector(`[data-company-id="${selectedId}"]`);
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [selectedId]);

  return (
    <div ref={containerRef} className="space-y-2 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
      {companies.map(enriched => (
        <div key={enriched.company.id} data-company-id={enriched.company.id}>
          <RankedCard
            enriched={enriched}
            maxScore={maxScore}
            isSelected={selectedId === enriched.company.id}
            onClick={() => onSelect(enriched.company.id)}
          />
        </div>
      ))}
      {companies.length === 0 && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No companies match the current filters
        </div>
      )}
    </div>
  );
}

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Tier } from '@/lib/portfolio-utils';

export interface Filters {
  search: string;
  tiers: Tier[];
  confidence: ('H' | 'M' | 'L')[];
  dataAvailability: ('full' | 'partial' | 'limited')[];
}

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function Pill({ label, active, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 py-1 rounded-full text-xs font-medium border transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
      )}
    >
      {label}
    </button>
  );
}

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={filters.search}
          onChange={e => onChange({ ...filters, search: e.target.value })}
          placeholder="Search companies..."
          className="w-full rounded-md border border-input bg-card pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-muted-foreground py-1">Tier:</span>
        {(['Tier 1', 'Tier 2', 'Tier 3'] as Tier[]).map(t => (
          <Pill
            key={t}
            label={t}
            active={filters.tiers.includes(t)}
            onClick={() => onChange({ ...filters, tiers: toggleItem(filters.tiers, t) })}
          />
        ))}

        <span className="text-xs text-muted-foreground py-1 ml-2">Confidence:</span>
        {(['H', 'M', 'L'] as const).map(c => (
          <Pill
            key={c}
            label={c === 'H' ? 'High' : c === 'M' ? 'Medium' : 'Low'}
            active={filters.confidence.includes(c)}
            onClick={() => onChange({ ...filters, confidence: toggleItem(filters.confidence, c) })}
          />
        ))}

        <span className="text-xs text-muted-foreground py-1 ml-2">Data:</span>
        {(['full', 'partial', 'limited'] as const).map(d => (
          <Pill
            key={d}
            label={d.charAt(0).toUpperCase() + d.slice(1)}
            active={filters.dataAvailability.includes(d)}
            onClick={() => onChange({ ...filters, dataAvailability: toggleItem(filters.dataAvailability, d) })}
          />
        ))}
      </div>
    </div>
  );
}

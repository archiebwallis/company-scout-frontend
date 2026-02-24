import { Link } from 'react-router-dom';
import { Plus, Settings, Loader2 } from 'lucide-react';
import { useConfigs } from '@/lib/api';

export default function ScoringConfigs() {
  const { data: configs, isLoading } = useConfigs();

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
        <h1 className="text-2xl font-bold">Scoring Configurations</h1>
        <Link to="/configs/new" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Create New Config
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(configs ?? []).map(config => (
          <Link key={config.id} to={`/configs/${config.id}`} className="block rounded-lg border border-border bg-card p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{config.name}</h3>
                {config.isDefault && <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/15 text-primary mt-1">Default</span>}
              </div>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{config.description}</p>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
              <span>{config.criteria.length} criteria</span>
              <span>Scale: {config.scale}</span>
              <span>{config.createdAt}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

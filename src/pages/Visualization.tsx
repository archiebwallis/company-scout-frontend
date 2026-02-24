import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useRun, useConfigs } from '@/lib/api';
import { getMaxScore } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter, Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6'];

const tooltipStyle = {
  backgroundColor: 'hsl(220, 18%, 11%)',
  border: '1px solid hsl(220, 13%, 18%)',
  borderRadius: '6px',
  color: 'hsl(210, 15%, 90%)',
};

export default function Visualization() {
  const { id } = useParams();
  const { data: run, isLoading: runLoading } = useRun(id);
  const { data: configs } = useConfigs();
  const config = configs?.find(c => c.id === run?.configId);
  const maxScore = config ? getMaxScore(config.scale) : 10;

  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');

  if (runLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!run || !config) return <div className="text-muted-foreground">Not found</div>;

  const effectiveXAxis = xAxis || config.criteria[0]?.id || '';
  const effectiveYAxis = yAxis || config.criteria[1]?.id || config.criteria[0]?.id || '';

  const sortedByScore = useMemo(() => [...run.companies].sort((a, b) => b.totalScore - a.totalScore), [run.companies]);
  const top10 = sortedByScore.slice(0, 10);
  const bottom10 = [...sortedByScore.slice(-10)].reverse();

  const bucketSize = maxScore <= 10 ? 1 : 10;
  const distribution = useMemo(() => {
    const buckets: Record<string, number> = {};
    for (let i = 0; i < maxScore; i += bucketSize) {
      buckets[`${i + 1}-${i + bucketSize}`] = 0;
    }
    run.companies.forEach(c => {
      const bucket = Math.floor((c.totalScore - 1) / bucketSize) * bucketSize;
      const key = `${bucket + 1}-${bucket + bucketSize}`;
      if (buckets[key] !== undefined) buckets[key]++;
    });
    return Object.entries(buckets).map(([range, count]) => ({ range, count }));
  }, [run.companies, maxScore, bucketSize]);

  const radarCompareData = config.criteria.map(c => {
    const point: Record<string, string | number> = { criterion: c.name };
    selectedCompanies.forEach(companyId => {
      const company = run.companies.find(co => co.id === companyId);
      if (company) {
        const cs = company.criterionScores.find(s => s.criterionId === c.id);
        point[company.name] = cs?.score ?? 0;
      }
    });
    return point;
  });

  const scatterData = run.companies.map(c => ({
    name: c.name,
    x: c.criterionScores.find(cs => cs.criterionId === effectiveXAxis)?.score ?? 0,
    y: c.criterionScores.find(cs => cs.criterionId === effectiveYAxis)?.score ?? 0,
    totalScore: c.totalScore,
  }));

  const toggleCompany = (companyId: string) => {
    setSelectedCompanies(prev =>
      prev.includes(companyId)
        ? prev.filter(cid => cid !== companyId)
        : prev.length < 4 ? [...prev, companyId] : prev
    );
  };

  const tickStyle = { fill: 'hsl(215, 15%, 50%)', fontSize: 12 };
  const gridStroke = 'hsl(220, 13%, 18%)';

  return (
    <div>
      <Link to={`/runs/${run.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to run
      </Link>
      <h1 className="text-2xl font-bold mb-6">Visualization — {run.name}</h1>

      <Tabs defaultValue="distribution">
        <TabsList className="mb-6">
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="ranking">Top / Bottom</TabsTrigger>
          <TabsTrigger value="radar">Radar Compare</TabsTrigger>
          <TabsTrigger value="scatter">Scatter Plot</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Score Distribution</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="range" tick={tickStyle} />
                  <YAxis tick={tickStyle} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="ranking">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-semibold mb-4">Top 10</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={top10} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis type="number" domain={[0, maxScore]} tick={tickStyle} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ ...tickStyle, fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="totalScore" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-semibold mb-4">Bottom 10</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bottom10} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis type="number" domain={[0, maxScore]} tick={tickStyle} />
                    <YAxis type="category" dataKey="name" width={130} tick={{ ...tickStyle, fontSize: 11 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="totalScore" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="radar">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Radar Comparison <span className="text-muted-foreground font-normal text-sm">(select up to 4)</span></h2>
            <div className="flex flex-wrap gap-2 mb-4 max-h-32 overflow-y-auto">
              {run.companies.map(c => (
                <button
                  key={c.id}
                  onClick={() => toggleCompany(c.id)}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium border transition-colors',
                    selectedCompanies.includes(c.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
            {selectedCompanies.length > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarCompareData}>
                    <PolarGrid stroke={gridStroke} />
                    <PolarAngleAxis dataKey="criterion" tick={tickStyle} />
                    <PolarRadiusAxis angle={30} domain={[0, maxScore]} tick={{ ...tickStyle, fontSize: 10 }} />
                    {selectedCompanies.map((companyId, i) => {
                      const company = run.companies.find(c => c.id === companyId);
                      return company ? (
                        <Radar key={companyId} name={company.name} dataKey={company.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.1} />
                      ) : null;
                    })}
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground py-12 text-center">Select companies above to compare</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="scatter">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-semibold mb-4">Scatter Plot</h2>
            <div className="flex gap-4 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">X Axis</label>
                <select value={effectiveXAxis} onChange={e => setXAxis(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground">
                  {config.criteria.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Y Axis</label>
                <select value={effectiveYAxis} onChange={e => setYAxis(e.target.value)} className="rounded-md border border-input bg-background px-2 py-1 text-sm text-foreground">
                  {config.criteria.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="x" name={config.criteria.find(c => c.id === effectiveXAxis)?.name} domain={[0, maxScore]} tick={tickStyle} />
                  <YAxis dataKey="y" name={config.criteria.find(c => c.id === effectiveYAxis)?.name} domain={[0, maxScore]} tick={tickStyle} />
                  <Tooltip
                    content={({ payload }) => {
                      if (payload && payload.length > 0) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-md border border-border bg-card p-2 text-sm shadow-lg">
                            <p className="font-medium">{data.name}</p>
                            <p className="text-muted-foreground">Total: {data.totalScore}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter data={scatterData} fill="#3b82f6">
                    {scatterData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Check, ChevronRight, Loader2, Sparkles, Plus, X } from 'lucide-react';
import { useConfigs, useCreateRun, useScrapePortfolio } from '@/lib/api';
import type { PortfolioCompany } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

function parseCSV(text: string): ParsedCSV {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => line.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
  return { headers, rows };
}

const steps = ['Upload CSV', 'Select Config', 'Review & Launch'];

export default function NewRun() {
  const [step, setStep] = useState(1);
  const [inputMode, setInputMode] = useState<'csv' | 'scrape'>('csv');
  const [csvData, setCsvData] = useState<ParsedCSV | null>(null);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [selectedConfigId, setSelectedConfigId] = useState('');
  const [runName, setRunName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Scrape PE firm state
  const [firmName, setFirmName] = useState('');
  const [scrapedCompanies, setScrapedCompanies] = useState<(PortfolioCompany & { selected: boolean })[]>([]);
  const [scrapeNotes, setScrapeNotes] = useState('');
  const [addingCompany, setAddingCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');

  const { data: configs, isLoading: configsLoading } = useConfigs();
  const createRun = useCreateRun();
  const scrapePortfolio = useScrapePortfolio();

  const handleFile = (file: File) => {
    setCsvFile(file);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(parseCSV(text));
    };
    reader.readAsText(file);
  };

  const handleScrape = async () => {
    if (!firmName.trim()) return;
    try {
      const result = await scrapePortfolio.mutateAsync({ firmName: firmName.trim() });
      setScrapedCompanies(result.companies.map(c => ({ ...c, selected: true })));
      setScrapeNotes(result.notes || '');
    } catch (err) {
      console.error('Scrape failed:', err);
    }
  };

  const handleScrapeContinue = () => {
    const selected = scrapedCompanies.filter(c => c.selected);
    if (selected.length === 0) return;
    const csv = 'company\n' + selected.map(c => c.name).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const file = new File([blob], `${firmName.trim().replace(/\s+/g, '-').toLowerCase()}-portfolio.csv`, { type: 'text/csv' });
    setCsvFile(file);
    setCsvData({ headers: ['company'], rows: selected.map(c => [c.name]) });
    setFileName(file.name);
    setStep(2);
  };

  const handleAddCompany = () => {
    if (!newCompanyName.trim()) return;
    setScrapedCompanies(prev => [...prev, { name: newCompanyName.trim(), sector: '', description: '', selected: true }]);
    setNewCompanyName('');
    setAddingCompany(false);
  };

  const toggleCompany = (index: number) => {
    setScrapedCompanies(prev => prev.map((c, i) => i === index ? { ...c, selected: !c.selected } : c));
  };

  const selectedCount = scrapedCompanies.filter(c => c.selected).length;

  const selectedConfig = configs?.find(c => c.id === selectedConfigId);

  const handleLaunch = async () => {
    if (!csvFile || !selectedConfigId || !runName) return;
    try {
      const result = await createRun.mutateAsync({
        file: csvFile,
        name: runName,
        configId: selectedConfigId,
        peFirmName: inputMode === 'scrape' && firmName.trim() ? firmName.trim() : undefined,
      });
      navigate(`/runs/${result.id}`);
    } catch (err) {
      console.error('Failed to create run:', err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">New Run</h1>

      <div className="flex items-center gap-2 mb-8">
        {steps.map((label, i) => {
          const s = i + 1;
          return (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                s < step ? 'bg-score-high text-primary-foreground' :
                s === step ? 'bg-primary text-primary-foreground' :
                'bg-muted text-muted-foreground'
              )}>
                {s < step ? <Check className="h-4 w-4" /> : s}
              </div>
              <span className={cn('text-sm', s === step ? 'text-foreground' : 'text-muted-foreground')}>
                {label}
              </span>
              {s < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div>
          {/* Mode toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setInputMode('csv')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                inputMode === 'csv'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <Upload className="h-4 w-4" /> Upload CSV
            </button>
            <button
              onClick={() => setInputMode('scrape')}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                inputMode === 'scrape'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              <Sparkles className="h-4 w-4" /> Scrape PE Firm
            </button>
          </div>

          {/* CSV upload mode */}
          {inputMode === 'csv' && (
            <>
              <div
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground font-medium">Drop a CSV file here or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">Supports .csv files with company names</p>
                <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
              {csvData && (
                <div className="mt-6">
                  <p className="text-sm text-muted-foreground mb-2">{fileName} — {csvData.rows.length} companies</p>
                  <div className="rounded-lg border border-border overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 sticky top-0">
                        <tr>{csvData.headers.map((h, i) => <th key={i} className="text-left px-4 py-2 font-medium text-muted-foreground">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {csvData.rows.slice(0, 20).map((row, i) => (
                          <tr key={i} className="border-t border-border">
                            {row.map((cell, j) => <td key={j} className="px-4 py-2">{cell}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button onClick={() => setStep(2)} className="mt-4">Continue</Button>
                </div>
              )}
            </>
          )}

          {/* Scrape PE firm mode */}
          {inputMode === 'scrape' && (
            <div>
              <div className="rounded-lg border border-border p-6">
                <label className="text-sm font-medium mb-2 block">PE Firm Name</label>
                <div className="flex gap-2">
                  <Input
                    value={firmName}
                    onChange={e => setFirmName(e.target.value)}
                    placeholder="e.g., Thoma Bravo, Vista Equity, Hg Capital"
                    onKeyDown={e => e.key === 'Enter' && handleScrape()}
                  />
                  <Button
                    onClick={handleScrape}
                    disabled={!firmName.trim() || scrapePortfolio.isPending}
                  >
                    {scrapePortfolio.isPending ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Searching...</>
                    ) : (
                      <><Sparkles className="h-4 w-4 mr-2" /> Scrape Portfolio</>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  We'll search the web for this firm's current portfolio companies
                </p>
              </div>

              {/* Loading state */}
              {scrapePortfolio.isPending && (
                <div className="mt-6 flex items-center gap-3 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm">Searching for portfolio companies... this may take 15-30 seconds</span>
                </div>
              )}

              {/* Error state */}
              {scrapePortfolio.isError && (
                <p className="mt-4 text-sm text-destructive">
                  Failed to scrape portfolio: {(scrapePortfolio.error as Error).message}
                </p>
              )}

              {/* Results */}
              {scrapedCompanies.length > 0 && !scrapePortfolio.isPending && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-muted-foreground">
                      {scrapedCompanies.length} companies found, <span className="text-foreground font-medium">{selectedCount} selected</span>
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setScrapedCompanies(prev => prev.map(c => ({ ...c, selected: true })))}
                        className="text-xs text-primary hover:underline"
                      >
                        Select all
                      </button>
                      <button
                        onClick={() => setScrapedCompanies(prev => prev.map(c => ({ ...c, selected: false })))}
                        className="text-xs text-muted-foreground hover:underline"
                      >
                        Deselect all
                      </button>
                    </div>
                  </div>

                  {scrapeNotes && (
                    <p className="text-xs text-amber-500 mb-3">{scrapeNotes}</p>
                  )}

                  <div className="rounded-lg border border-border overflow-hidden max-h-80 overflow-y-auto">
                    {scrapedCompanies.map((company, i) => (
                      <div
                        key={i}
                        onClick={() => toggleCompany(i)}
                        className={cn(
                          'flex items-center gap-3 px-4 py-2.5 cursor-pointer border-b border-border last:border-b-0 transition-colors',
                          company.selected ? 'bg-card hover:bg-muted/30' : 'bg-muted/20 opacity-60 hover:opacity-80'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={company.selected}
                          onChange={() => toggleCompany(i)}
                          className="rounded border-border"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{company.name}</span>
                          {company.sector && (
                            <span className="text-xs text-muted-foreground ml-2">{company.sector}</span>
                          )}
                          {company.description && (
                            <p className="text-xs text-muted-foreground truncate">{company.description}</p>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setScrapedCompanies(prev => prev.filter((_, j) => j !== i));
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add company */}
                  {addingCompany ? (
                    <div className="flex gap-2 mt-3">
                      <Input
                        value={newCompanyName}
                        onChange={e => setNewCompanyName(e.target.value)}
                        placeholder="Company name"
                        onKeyDown={e => e.key === 'Enter' && handleAddCompany()}
                        autoFocus
                      />
                      <Button size="sm" onClick={handleAddCompany} disabled={!newCompanyName.trim()}>Add</Button>
                      <Button size="sm" variant="outline" onClick={() => { setAddingCompany(false); setNewCompanyName(''); }}>Cancel</Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAddingCompany(true)}
                      className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-3"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add company manually
                    </button>
                  )}

                  <Button onClick={handleScrapeContinue} className="mt-4" disabled={selectedCount === 0}>
                    Continue with {selectedCount} {selectedCount === 1 ? 'company' : 'companies'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="max-w-xl">
          <label className="text-sm font-medium mb-2 block">Scoring Configuration</label>
          {configsLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <select
              value={selectedConfigId}
              onChange={e => setSelectedConfigId(e.target.value)}
              className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground"
            >
              <option value="">Select a config...</option>
              {(configs ?? []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {selectedConfig && (
            <div className="mt-4 rounded-lg border border-border p-4">
              <p className="font-medium">{selectedConfig.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{selectedConfig.description}</p>
              <p className="text-sm text-muted-foreground mt-2">Scale: {selectedConfig.scale} · {selectedConfig.criteria.length} criteria</p>
              <div className="mt-3 space-y-1">
                {selectedConfig.criteria.map(c => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="text-muted-foreground">{c.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={() => setStep(3)} disabled={!selectedConfigId}>Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="max-w-xl">
          <label className="text-sm font-medium mb-2 block">Run Name</label>
          <Input value={runName} onChange={e => setRunName(e.target.value)} placeholder="e.g., Q1 2025 Pipeline Review" />
          <div className="mt-6 rounded-lg border border-border p-4">
            <h3 className="font-medium mb-2">Summary</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Companies: {csvData?.rows.length ?? 0}</p>
              <p>Config: {selectedConfig?.name}</p>
              <p>Criteria: {selectedConfig?.criteria.length}</p>
              <p>Scale: {selectedConfig?.scale}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button
              onClick={handleLaunch}
              disabled={!runName || createRun.isPending}
            >
              {createRun.isPending ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Launching...</>
              ) : (
                'Launch Run'
              )}
            </Button>
          </div>
          {createRun.isError && (
            <p className="text-sm text-destructive mt-2">
              Failed to launch: {(createRun.error as Error).message}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

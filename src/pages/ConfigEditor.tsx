import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { useConfig, useCreateConfig, useUpdateConfig } from '@/lib/api';
import type { Criterion } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function ConfigEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const { data: existing, isLoading } = useConfig(id);
  const createConfig = useCreateConfig();
  const updateConfig = useUpdateConfig(id || '');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scale, setScale] = useState<string>('1-10');
  const [criteria, setCriteria] = useState<Criterion[]>([
    { id: 'new-1', name: '', weight: 100, description: '', researchGuidance: '' },
  ]);
  const [evaluationPrompt, setEvaluationPrompt] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (existing && !initialized) {
      setName(existing.name);
      setDescription(existing.description);
      setScale(existing.scale);
      setCriteria(existing.criteria);
      setEvaluationPrompt(existing.evaluationPrompt);
      setInitialized(true);
    }
  }, [existing, initialized]);

  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);

  const addCriterion = () => {
    setCriteria([...criteria, { id: `new-${Date.now()}`, name: '', weight: 0, description: '', researchGuidance: '' }]);
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const updateCriterion = (index: number, field: keyof Criterion, value: string | number) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  const moveCriterion = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= criteria.length) return;
    const updated = [...criteria];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setCriteria(updated);
  };

  const handleSave = async () => {
    const payload = {
      name,
      description,
      scale,
      criteria,
      evaluationPrompt,
      isDefault: false,
    };
    try {
      if (isEditing) {
        await updateConfig.mutateAsync(payload);
      } else {
        await createConfig.mutateAsync(payload);
      }
      navigate('/configs');
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  const isSaving = createConfig.isPending || updateConfig.isPending;

  if (isEditing && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Config' : 'New Config'}</h1>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-1 block">Config Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., SaaS Evaluation" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe the purpose of this scoring configuration..." className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Scoring Scale</label>
          <select value={scale} onChange={e => setScale(e.target.value)} className="rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground">
            <option value="1-5">1–5</option>
            <option value="1-10">1–10</option>
            <option value="1-100">1–100</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium">Criteria</label>
            <Button variant="outline" size="sm" onClick={addCriterion}><Plus className="h-3 w-3 mr-1" /> Add</Button>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Total Weight</span>
              <span className={totalWeight === 100 ? 'text-score-high' : 'text-score-mid'}>{totalWeight}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', totalWeight === 100 ? 'bg-score-high' : totalWeight > 100 ? 'bg-score-low' : 'bg-score-mid')}
                style={{ width: `${Math.min(totalWeight, 100)}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {criteria.map((criterion, i) => (
              <div key={criterion.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-start gap-2">
                  <div className="flex flex-col gap-1 pt-1">
                    <button onClick={() => moveCriterion(i, -1)} className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={i === 0}><ArrowUp className="h-3 w-3" /></button>
                    <button onClick={() => moveCriterion(i, 1)} className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={i === criteria.length - 1}><ArrowDown className="h-3 w-3" /></button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Input value={criterion.name} onChange={e => updateCriterion(i, 'name', e.target.value)} placeholder="Criterion name" />
                      </div>
                      <div className="w-24 relative">
                        <Input type="number" value={criterion.weight} onChange={e => updateCriterion(i, 'weight', parseInt(e.target.value) || 0)} />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                      </div>
                    </div>
                    <textarea value={criterion.description} onChange={e => updateCriterion(i, 'description', e.target.value)} placeholder="What does this criterion evaluate?" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground min-h-[60px] resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                    <textarea value={criterion.researchGuidance} onChange={e => updateCriterion(i, 'researchGuidance', e.target.value)} placeholder="Research guidance for AI..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground min-h-[60px] resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                  <button onClick={() => removeCriterion(i)} className="text-muted-foreground hover:text-score-low mt-1"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Evaluation Prompt</label>
          <textarea value={evaluationPrompt} onChange={e => setEvaluationPrompt(e.target.value)} placeholder="Master prompt to guide the AI scorer..." className="w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : 'Save Config'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/configs')}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

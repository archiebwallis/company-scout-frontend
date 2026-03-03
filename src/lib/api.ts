import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ScoringConfig, Run, CompanyResult, Criterion } from './mock-data';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  return res.json();
}

// ── Stats ───────────────────────────────────────────────────────────

export interface Stats {
  totalRuns: number;
  companiesScored: number;
  averageScore: number;
  activeRuns: number;
}

export function useStats() {
  return useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: () => apiFetch('/api/stats'),
  });
}

// ── Scoring Configs ─────────────────────────────────────────────────

export function useConfigs() {
  return useQuery<ScoringConfig[]>({
    queryKey: ['configs'],
    queryFn: () => apiFetch('/api/configs'),
  });
}

export function useConfig(id: string | undefined) {
  return useQuery<ScoringConfig>({
    queryKey: ['config', id],
    queryFn: () => apiFetch(`/api/configs/${id}`),
    enabled: !!id,
  });
}

interface ConfigPayload {
  name: string;
  description: string;
  scale: string;
  criteria: Criterion[];
  evaluationPrompt: string;
  isDefault: boolean;
}

export function useCreateConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConfigPayload) =>
      apiFetch<ScoringConfig>('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['configs'] });
    },
  });
}

export function useUpdateConfig(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ConfigPayload) =>
      apiFetch<ScoringConfig>(`/api/configs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['configs'] });
      qc.invalidateQueries({ queryKey: ['config', id] });
    },
  });
}

interface GenerateCriteriaResponse {
  name: string;
  description: string;
  criteria: Criterion[];
  evaluationPrompt: string;
}

export function useGenerateCriteria() {
  return useMutation({
    mutationFn: (params: { prompt: string; scale: string }) =>
      apiFetch<GenerateCriteriaResponse>('/api/configs/generate-criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }),
  });
}

export interface PortfolioCompany {
  name: string;
  sector: string;
  description: string;
}

interface ScrapePortfolioResponse {
  firmName: string;
  companies: PortfolioCompany[];
  notes: string;
}

export function useScrapePortfolio() {
  return useMutation({
    mutationFn: (params: { firmName: string }) =>
      apiFetch<ScrapePortfolioResponse>('/api/scrape-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      }),
  });
}

export function useDeleteConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/configs/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['configs'] });
    },
  });
}

// ── Runs ────────────────────────────────────────────────────────────

type RunListItem = Omit<Run, 'companies'>;

export function useRuns() {
  return useQuery<RunListItem[]>({
    queryKey: ['runs'],
    queryFn: () => apiFetch('/api/runs'),
    refetchInterval: 5000,
  });
}

export function useRun(id: string | undefined) {
  return useQuery<Run>({
    queryKey: ['run', id],
    queryFn: () => apiFetch(`/api/runs/${id}`),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === 'running' || data.status === 'pending')) {
        return 3000;
      }
      return false;
    },
  });
}

export function useCompany(runId: string, companyId: string) {
  return useQuery<CompanyResult>({
    queryKey: ['company', runId, companyId],
    queryFn: () => apiFetch(`/api/runs/${runId}/companies/${companyId}`),
    enabled: !!runId && !!companyId,
  });
}

interface CreateRunParams {
  file: File;
  name: string;
  configId: string;
  peFirmName?: string;
}

export function useCreateRun() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: CreateRunParams) => {
      const form = new FormData();
      form.append('file', params.file);
      form.append('name', params.name);
      form.append('config_id', params.configId);
      if (params.peFirmName) {
        form.append('pe_firm_name', params.peFirmName);
      }
      const res = await fetch(`${API_BASE}/api/runs`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`API error ${res.status}: ${body}`);
      }
      return res.json() as Promise<RunListItem>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['runs'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['firms'] });
    },
  });
}

// ── PE Firms ──────────────────────────────────────────────────────────

export interface FirmSummary {
  firmName: string;
  runCount: number;
  totalCompanies: number;
  averageScore: number;
  latestRunDate: string;
}

export function useFirms() {
  return useQuery<FirmSummary[]>({
    queryKey: ['firms'],
    queryFn: () => apiFetch('/api/firms'),
  });
}

export function useFirmRuns(firmName: string | undefined) {
  return useQuery<RunListItem[]>({
    queryKey: ['firm-runs', firmName],
    queryFn: () => apiFetch(`/api/firms/${encodeURIComponent(firmName!)}/runs`),
    enabled: !!firmName,
    refetchInterval: 5000,
  });
}

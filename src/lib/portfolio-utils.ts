import type { CompanyResult, CriterionScore } from './mock-data';

// ── Tier derivation ─────────────────────────────────────────

export type Tier = 'Tier 1' | 'Tier 2' | 'Tier 3';

export function deriveTier(rank: number, total: number): Tier {
  const pct = rank / total;
  if (pct <= 0.25) return 'Tier 1';
  if (pct <= 0.75) return 'Tier 2';
  return 'Tier 3';
}

export function getTierColor(tier: Tier): string {
  switch (tier) {
    case 'Tier 1': return 'text-tier-gold';
    case 'Tier 2': return 'text-tier-silver';
    case 'Tier 3': return 'text-tier-bronze';
  }
}

export function getTierBgColor(tier: Tier): string {
  switch (tier) {
    case 'Tier 1': return 'bg-tier-gold/15 text-tier-gold border-tier-gold/30';
    case 'Tier 2': return 'bg-tier-silver/15 text-tier-silver border-tier-silver/30';
    case 'Tier 3': return 'bg-tier-bronze/15 text-tier-bronze border-tier-bronze/30';
  }
}

// ── Confidence aggregation ──────────────────────────────────

export type AggregatedConfidence = 'H' | 'M' | 'L';

export function aggregateConfidence(scores: CriterionScore[]): AggregatedConfidence {
  if (scores.length === 0) return 'L';
  const counts = { high: 0, medium: 0, low: 0 };
  for (const s of scores) {
    counts[s.confidence]++;
  }
  if (counts.high >= scores.length / 2) return 'H';
  if (counts.low >= scores.length / 2) return 'L';
  return 'M';
}

export function getConfidenceColor(conf: AggregatedConfidence): string {
  switch (conf) {
    case 'H': return 'bg-score-high';
    case 'M': return 'bg-score-mid';
    case 'L': return 'bg-score-low';
  }
}

// ── Drivers and risks ───────────────────────────────────────

export interface Driver {
  criterionName: string;
  score: number;
  reasoning: string;
  confidence: string;
}

export function deriveDrivers(scores: CriterionScore[], count: number = 3): Driver[] {
  return [...scores]
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(s => ({
      criterionName: s.criterionName,
      score: s.score,
      reasoning: s.reasoning,
      confidence: s.confidence,
    }));
}

export function deriveRisks(scores: CriterionScore[], count: number = 2): Driver[] {
  return [...scores]
    .sort((a, b) => a.score - b.score)
    .slice(0, count)
    .map(s => ({
      criterionName: s.criterionName,
      score: s.score,
      reasoning: s.reasoning,
      confidence: s.confidence,
    }));
}

// ── Score distribution ──────────────────────────────────────

export interface ScoreDistribution {
  min: number;
  p25: number;
  median: number;
  p75: number;
  max: number;
}

export function computeScoreDistribution(companies: CompanyResult[]): ScoreDistribution {
  if (companies.length === 0) {
    return { min: 0, p25: 0, median: 0, p75: 0, max: 0 };
  }
  const sorted = [...companies].map(c => c.totalScore).sort((a, b) => a - b);
  const percentile = (p: number) => {
    const idx = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(idx);
    const upper = Math.ceil(idx);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (sorted[upper] - sorted[lower]) * (idx - lower);
  };
  return {
    min: sorted[0],
    p25: Math.round(percentile(25) * 10) / 10,
    median: Math.round(percentile(50) * 10) / 10,
    p75: Math.round(percentile(75) * 10) / 10,
    max: sorted[sorted.length - 1],
  };
}

// ── Tile color interpolation ────────────────────────────────

export function scoreToColor(score: number, maxScore: number): string {
  const pct = Math.max(0, Math.min(1, score / maxScore));
  // HSL: blue hue (217), varying saturation and lightness for intensity
  const lightness = 10 + (1 - pct) * 15; // 10% at max score, 25% at min
  const saturation = 25 + pct * 45; // 25% at min, 70% at max
  return `hsl(217, ${saturation}%, ${lightness}%)`;
}

export function scoreToTextColor(score: number, maxScore: number): string {
  const pct = score / maxScore;
  return pct >= 0.5 ? 'text-white' : 'text-foreground';
}

// ── Enriched company type for Portfolio View ────────────────

export interface EnrichedCompany {
  company: CompanyResult;
  rank: number;
  tier: Tier;
  confidence: AggregatedConfidence;
  drivers: Driver[];
  risks: Driver[];
  dataCoveragePct: number;
}

export function enrichCompanies(companies: CompanyResult[]): EnrichedCompany[] {
  const sorted = [...companies].sort((a, b) => b.totalScore - a.totalScore);
  return sorted.map((company, idx) => ({
    company,
    rank: idx + 1,
    tier: deriveTier(idx + 1, sorted.length),
    confidence: aggregateConfidence(company.criterionScores),
    drivers: deriveDrivers(company.criterionScores),
    risks: deriveRisks(company.criterionScores),
    dataCoveragePct: company.dataCoveragePct ?? 100,
  }));
}

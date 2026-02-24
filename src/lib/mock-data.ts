// Types
export interface Criterion {
  id: string;
  name: string;
  weight: number;
  description: string;
  researchGuidance: string;
}

export interface ScoringConfig {
  id: string;
  name: string;
  description: string;
  scale: '1-5' | '1-10' | '1-100';
  criteria: Criterion[];
  evaluationPrompt: string;
  createdAt: string;
  isDefault?: boolean;
}

export interface CriterionScore {
  criterionId: string;
  criterionName: string;
  score: number;
  reasoning: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface CompanyResult {
  id: string;
  name: string;
  totalScore: number;
  criterionScores: CriterionScore[];
  researchReport: string;
  sources: string[];
}

export interface Run {
  id: string;
  name: string;
  configId: string;
  configName: string;
  date: string;
  companyCount: number;
  companiesScored: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  averageScore: number;
  companies: CompanyResult[];
}

// Helpers
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function genScore(i: number, j: number, max: number): number {
  const r = seededRandom(i * 7 + j * 13 + 42);
  return Math.max(1, Math.min(max, Math.round(r * (max - 2) + 2)));
}

export function getScoreLevel(score: number, max: number): 'high' | 'mid' | 'low' {
  const pct = score / max;
  if (pct >= 0.7) return 'high';
  if (pct >= 0.4) return 'mid';
  return 'low';
}

export function getMaxScore(scale: string): number {
  if (scale === '1-5') return 5;
  if (scale === '1-100') return 100;
  return 10;
}

// Configs
const defaultCriteria: Criterion[] = [
  { id: 'mp', name: 'Market Position', weight: 20, description: "Evaluates the company's competitive standing and market share.", researchGuidance: 'Look for market share data, competitive landscape, brand recognition.' },
  { id: 'fh', name: 'Financial Health', weight: 20, description: 'Assesses financial stability, revenue growth, and profitability.', researchGuidance: 'Research revenue, growth rates, profitability, debt levels, funding.' },
  { id: 'pt', name: 'Product/Technology', weight: 20, description: 'Evaluates quality, innovation, and technical differentiation.', researchGuidance: 'Analyze product reviews, tech stack, patents, innovation pipeline.' },
  { id: 'tl', name: 'Team & Leadership', weight: 20, description: 'Assesses experience and capability of leadership team.', researchGuidance: 'Research founders, C-suite backgrounds, key hires, culture.' },
  { id: 'gp', name: 'Growth Potential', weight: 20, description: 'Evaluates future growth trajectory and expansion opportunities.', researchGuidance: 'Look for TAM analysis, growth vectors, expansion plans.' },
];

export const scoringConfigs: ScoringConfig[] = [
  {
    id: 'config-default', name: 'Default Evaluation',
    description: 'Balanced evaluation across five key dimensions for general company assessment.',
    scale: '1-10', criteria: defaultCriteria,
    evaluationPrompt: 'Evaluate the company across all criteria using available public information. Provide balanced, evidence-based assessments.',
    createdAt: '2024-01-15', isDefault: true,
  },
  {
    id: 'config-saas', name: 'SaaS Evaluation',
    description: 'Specialized configuration for evaluating SaaS companies with focus on recurring revenue and unit economics.',
    scale: '1-10',
    criteria: [
      { id: 'arr', name: 'ARR & Revenue Quality', weight: 25, description: 'Annual recurring revenue and predictability.', researchGuidance: 'Look for ARR, NRR, MRR growth, churn rates.' },
      { id: 'ue', name: 'Unit Economics', weight: 20, description: 'CAC, LTV, payback period, and gross margins.', researchGuidance: 'Research customer acquisition costs, LTV ratios.' },
      { id: 'pm', name: 'Product-Market Fit', weight: 20, description: 'Evidence of strong product-market fit.', researchGuidance: 'Look for NPS scores, G2 reviews, testimonials.' },
      { id: 'sc', name: 'Scalability', weight: 15, description: 'Ability to scale operations efficiently.', researchGuidance: 'Analyze infrastructure, automation, operational leverage.' },
      { id: 'mo', name: 'Market Opportunity', weight: 10, description: 'Total addressable market size.', researchGuidance: 'Research TAM, SAM, SOM, market growth rates.' },
      { id: 'tm', name: 'Team Quality', weight: 10, description: 'Founding team strength.', researchGuidance: 'Evaluate founder backgrounds, key leadership.' },
    ],
    evaluationPrompt: 'Focus on SaaS-specific metrics and unit economics. Prioritize quantitative data.',
    createdAt: '2024-03-22',
  },
  {
    id: 'config-pe', name: 'PE Target Screen',
    description: 'Private equity target screening focused on acquisition suitability.',
    scale: '1-100',
    criteria: [
      { id: 'fp', name: 'Financial Profile', weight: 30, description: 'EBITDA, margins, cash flow stability.', researchGuidance: 'Deep dive into financials, margins, cash flow.' },
      { id: 'md', name: 'Market Dynamics', weight: 25, description: 'Market structure, competitive moat.', researchGuidance: 'Analyze industry structure, barriers to entry.' },
      { id: 'ov', name: 'Operational Value-Add', weight: 25, description: 'Opportunities for post-acquisition improvement.', researchGuidance: 'Identify inefficiencies, bolt-on opportunities.' },
      { id: 'ri', name: 'Risk Assessment', weight: 20, description: 'Key risks including regulatory and concentration.', researchGuidance: 'Evaluate risk factors: concentration, regulatory, tech obsolescence.' },
    ],
    evaluationPrompt: 'Assess as a potential PE acquisition target. Focus on value creation and risk.',
    createdAt: '2024-06-10',
  },
];

// Company names
const companyNames = [
  'CloudVault Inc.', 'DataStream Analytics', 'NexaFlow Systems', 'PulseMetrics AI',
  'SynthAI Labs', 'VectorEdge Tech', 'CipherLink Security', 'QuantumGrid Solutions',
  'StratosData Corp', 'NovaBridge Software', 'ArcticDB Technologies', 'BloomStack Digital',
  'CoreSignal Networks', 'DriftLabs Innovation', 'EliteOps Platform', 'FluxPoint Media',
  'GlideScale AI', 'HorizonAPI Inc.', 'InfraVault Cloud', 'JoltMetrics Analytics',
  'KiteWorks Software', 'LatticeIO Systems', 'MeshDrive Tech', 'NetPulse Solutions',
  'OmniStack Digital', 'PivotCloud AI', 'QuarkSoft Labs', 'RippleBase Data',
  'ScaleForge Inc.', 'TerraNode Systems', 'UniFlow Analytics', 'VortexAI Corp',
  'WarpData Tech', 'XenonLabs Inc.', 'YieldTech Solutions', 'ZenithOps AI',
  'AlphaWave Digital', 'BrightPath Software', 'CatalystDB Inc.', 'DualCore Systems',
  'EchoLogic AI', 'FireGrid Networks', 'GateKeeper Security', 'HyperSync Labs',
  'IonPath Technologies', 'JadeStack Cloud', 'KryptonAI Solutions', 'LunarEdge Tech',
  'MagnetFlow Data', 'NimbusCore Inc.',
];

const reasonings = {
  high: [
    'Strong indicators of market leadership with consistent performance metrics.',
    'Demonstrates robust fundamentals and competitive advantages in this area.',
    'Above-average performance supported by solid evidence and market data.',
  ],
  mid: [
    'Moderate performance with some areas showing room for growth.',
    'Average positioning with a balanced mix of strengths and weaknesses.',
    'Mixed signals observed; further monitoring recommended.',
  ],
  low: [
    'Below expectations with notable challenges in this dimension.',
    'Limited evidence of competitive strength; improvement needed.',
    'Concerning indicators suggest elevated risk in this area.',
  ],
};

function generateCompanies(names: string[], config: ScoringConfig): CompanyResult[] {
  const max = getMaxScore(config.scale);
  return names.map((name, i) => {
    const criterionScores: CriterionScore[] = config.criteria.map((c, j) => {
      const score = genScore(i, j, max);
      const level = getScoreLevel(score, max);
      const templates = reasonings[level];
      return {
        criterionId: c.id,
        criterionName: c.name,
        score,
        reasoning: templates[Math.floor(seededRandom(i * 11 + j * 3) * templates.length)],
        confidence: (['high', 'medium', 'low'] as const)[Math.floor(seededRandom(i * 5 + j * 9 + 7) * 3)],
      };
    });
    const totalScore = Math.round(
      criterionScores.reduce((sum, cs, j) => sum + cs.score * config.criteria[j].weight / 100, 0) * 10
    ) / 10;
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    return {
      id: `company-${i}`,
      name,
      totalScore,
      criterionScores,
      researchReport: `## Company Overview\n\n${name} is an enterprise technology company providing innovative solutions in the B2B software space. The company has established a presence in multiple market segments.\n\n## Market Analysis\n\nThe company operates in a competitive landscape with several established players and emerging challengers. Market dynamics suggest continued growth potential with increasing enterprise adoption of cloud-native solutions.\n\n## Financial Summary\n\nBased on available information, the company demonstrates a financial profile consistent with its stage and market position. Key metrics indicate a trajectory aligned with industry benchmarks for companies of similar scale.\n\n## Product & Technology\n\nThe product portfolio showcases a modern technology stack with emphasis on scalability and user experience. Integration capabilities and API-first architecture are notable strengths that position the company well for enterprise sales.\n\n## Leadership\n\nThe executive team brings a combination of industry experience and entrepreneurial background. Recent strategic hires suggest investment in growth and operational excellence across key functions.`,
      sources: [
        `https://www.crunchbase.com/organization/${slug}`,
        `https://www.linkedin.com/company/${slug}`,
        `https://www.glassdoor.com/Overview/${slug}`,
      ],
    };
  });
}

// Runs
const run1Companies = generateCompanies(companyNames, scoringConfigs[0]);
const run2Companies = generateCompanies(companyNames.slice(0, 30), scoringConfigs[1]);
const run3Companies = generateCompanies(companyNames.slice(0, 12), scoringConfigs[2]);

export const runs: Run[] = [
  {
    id: 'run-1', name: 'Q4 2024 Pipeline Review',
    configId: 'config-default', configName: 'Default Evaluation',
    date: '2024-12-15', companyCount: 50, companiesScored: 50, status: 'completed',
    averageScore: Math.round(run1Companies.reduce((s, c) => s + c.totalScore, 0) / run1Companies.length * 10) / 10,
    companies: run1Companies,
  },
  {
    id: 'run-2', name: 'SaaS Market Scan',
    configId: 'config-saas', configName: 'SaaS Evaluation',
    date: '2024-12-20', companyCount: 30, companiesScored: 18, status: 'running',
    averageScore: Math.round(run2Companies.slice(0, 18).reduce((s, c) => s + c.totalScore, 0) / 18 * 10) / 10,
    companies: run2Companies.slice(0, 18),
  },
  {
    id: 'run-3', name: 'PE Targets Batch 1',
    configId: 'config-pe', configName: 'PE Target Screen',
    date: '2024-11-30', companyCount: 12, companiesScored: 12, status: 'completed',
    averageScore: Math.round(run3Companies.reduce((s, c) => s + c.totalScore, 0) / run3Companies.length * 10) / 10,
    companies: run3Companies,
  },
  {
    id: 'run-4', name: 'Failed Import Test',
    configId: 'config-default', configName: 'Default Evaluation',
    date: '2024-12-22', companyCount: 5, companiesScored: 0, status: 'failed',
    averageScore: 0, companies: [],
  },
];

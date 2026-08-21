export type NavigationTab = 
  | 'home' 
  | 'pipeline' 
  | 'behavior' 
  | 'static' 
  | 'ai-analysis' 
  | 'trust-report' 
  | 'overview' 
  | 'compliance' 
  | 'infrastructure';

export type EventCategory = 'Environment' | 'File' | 'Network' | 'Process' | 'Static' | 'Sandbox';
export type SeverityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface EventLog {
  id: string;
  time: string;
  category: EventCategory;
  severity: SeverityLevel;
  title: string;
  details: string;
  command?: string;
  pid?: number;
  user?: string;
  path?: string;
  destination?: string;
  timestamp: number;
}

export interface PipelineStage {
  id: string;
  stageNumber: string;
  name: string;
  status: 'completed' | 'running' | 'pending' | 'failed';
  icon: string;
  description: string;
}

export interface CodeFinding {
  id: string;
  title: string;
  location: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  snippet?: string;
  ruleId: string;
  remediation?: string;
}

export interface RiskFlag {
  id: string;
  title: string;
  details: string;
  type: 'error' | 'warning' | 'info';
  icon: string;
}

export interface ScoreItem {
  label: string;
  points: number;
  color: 'primary' | 'error' | 'tertiary' | 'neutral';
}

export interface AnalysisSession {
  id: string;
  targetRepo: string;
  repoUrl?: string;
  repoType: 'github' | 'zip';
  status: 'idle' | 'running' | 'completed';
  verdict: 'BLOCK' | 'TRUST' | 'REVIEW';
  trustScore: number;
  filesScanned: number;
  elapsedSeconds: number;
  currentStageIndex: number;
  executiveSummary: string;
  riskFlags: RiskFlag[];
  recommendedAction: string;
  license: string;
  licenseStatus: string;
  dependenciesTotal: number;
  dependenciesVulnerable: number;
  scoreBreakdown: ScoreItem[];
  events: EventLog[];
  codeFindings: CodeFinding[];
  stages: PipelineStage[];
  generatedAt: string;
}

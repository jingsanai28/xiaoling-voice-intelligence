export type ScenarioType = 'brand' | 'cs' | 'ops' | 'mixed';
export type RiskLevel = 'P0' | 'P1' | 'P2' | 'P3';
export type CaseStatus = 'pending_review' | 'pending_evidence' | 'assigned' | 'closed' | 'reviewing';
export type DecisionType = 'escalate' | 'downgrade' | 'more_evidence' | 'transfer' | 'mark_false_positive';
export type BadCaseType =
  | 'wrong_task_type'
  | 'wrong_agent'
  | 'risk_too_high'
  | 'risk_too_low'
  | 'review_false_positive'
  | 'review_false_negative'
  | 'insufficient_evidence'
  | 'unactionable_suggestion';

// 9-stage analysis pipeline
export type PipelineStageKey =
  | 'data_integrity_check'
  | 'permission_check'
  | 'dedup_noise_reduction'
  | 'topic_clustering'
  | 'agent_analysis'
  | 'memory_rule_match'
  | 'signal_valuation'
  | 'human_review_gate'
  | 'generate_result';

export interface PipelineStage {
  key: PipelineStageKey;
  stageName: string;
  icon: string;
  calledObject: string;
  tools: string;
  output: string;
  subAgents?: { agentName: string; agentType: string; conclusion: string }[];
}

export interface AgentCall {
  agentName: string;
  agentType: 'supervisor' | 'brand' | 'cs' | 'ops';
  conclusion: string;
  keyFindings: string[];
  timestamp: string;
}

export interface Evidence {
  id: string;
  type: 'keyword' | 'quote' | 'pattern' | 'history';
  content: string;
  source: string;
  severity: 'high' | 'medium' | 'low';
}

export interface RelatedEvent {
  id: string;
  title: string;
  similarity: number;
  riskLevel: RiskLevel;
  outcome: string;
  date: string;
}

export interface ReviewPackage {
  reviewer: string;
  priority: 'urgent' | 'high' | 'normal';
  questions: string[];
  aiSummary: string;
  evidenceList: Evidence[];
  relatedEvents: RelatedEvent[];
  allowedActions: string[];
  forbiddenActions: string[];
  decision?: DecisionType;
  decisionNotes?: string;
  decidedBy?: string;
  decidedAt?: string;
}

export interface FinalReport {
  generatedAt: string;
  executiveSummary: string;
  riskAssessment: string;
  teamRecommendations: Record<string, string>;
  suggestedActions: string[];
  requiresHumanConfirmation: boolean;
}

export interface EventLogEntry {
  id: string;
  timestamp: string;
  node: string;
  action: string;
  detail: string;
  actor: 'system' | 'admin' | 'agent';
}

export interface RiskCase {
  id: string;
  title: string;
  scenario: ScenarioType;
  source: string;
  channel: string;
  content: string;
  riskLevel: RiskLevel;
  confidence: number;
  status: CaseStatus;
  assignedTeams: string[];
  createdAt: string;
  updatedAt: string;
  sla?: string;
  isPublic: boolean;
  needsReview: boolean;
  reviewReason?: string;
  pipeline: PipelineStage[];
  agentCalls: AgentCall[];
  evidence: Evidence[];
  relatedEvents: RelatedEvent[];
  reviewPackage?: ReviewPackage;
  finalReport?: FinalReport;
  eventLog: EventLogEntry[];
}

export interface HistoricalEvent {
  id: string;
  title: string;
  type: string;
  riskLevel: RiskLevel;
  source: string;
  teams: string[];
  keyEvidence: string;
  actions: string;
  outcome: string;
  reviewNotes: string;
  date: string;
  inEvalSet: boolean;
}

export interface DashboardStats {
  todayTotalVoices: number;
  effectiveVoices: number;
  highValueSignals: number;
  pendingReview: number;
  inProgress: number;
  closedLoop: number;
  teamDistribution: { team: string; count: number }[];
  recentCorrections: { caseId: string; title: string; original: RiskLevel; corrected: RiskLevel; by: string }[];
  trends: { keyword: string; count: number; trend: 'up' | 'down' | 'stable' }[];
}

export interface FeedbackInput {
  scenario: ScenarioType;
  source: string;
  content: string;
  channel: string;
  background: string;
  isPublic: boolean;
}

export type SignalType = 'brand_risk' | 'service_signal' | 'product_signal' | 'opportunity_signal';
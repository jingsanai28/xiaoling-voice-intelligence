export type MessageType =
  | 'welcome'
  | 'user-text'
  | 'user-image'
  | 'analysis-plan'
  | 'system-status'
  | 'event-card'
  | 'system-response'
  | 'system-info';

export interface StatusLine {
  text: string;
  done: boolean;
}

export interface AnalysisPlanStep {
  key: string;
  label: string;
  detail: string;
  object: string;
}

export interface AnalysisPlan {
  title: string;
  summary: string;
  steps: AnalysisPlanStep[];
}

export interface EventCardData {
  id: string;
  signalType: string;
  signalLabel: string;
  title: string;
  riskLevel: string;
  confidence: number;
  needsReview: boolean;
  teams: string[];
  summary: string;
  caseId: string;
}

export interface ConversationMessage {
  id: string;
  type: MessageType;
  content?: string;
  imageUrl?: string;
  imageLabel?: string;
  eventData?: EventCardData;
  plan?: AnalysisPlan;
  statusLines?: StatusLine[];
  timestamp: string;
  sender: 'user' | 'xiao-ling';
}

export type EventState =
  | 'analyzing'
  | 'pending_evidence'
  | 'pending_review'
  | 'pending_assignment'
  | 'in_progress'
  | 'observing'
  | 'completed'
  | 'archived'
  | 'false_positive';

export interface EventStateInfo {
  state: EventState;
  label: string;
  dotClass: string;
  textClass: string;
}

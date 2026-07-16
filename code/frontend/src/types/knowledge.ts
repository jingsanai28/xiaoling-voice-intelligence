export type KnowledgeType = 'product' | 'policy_sop' | 'risk_compliance' | 'historical_case';

export type DocumentStatus =
  | 'uploading'
  | 'parsing'
  | 'pending_info'
  | 'draft'
  | 'pending_review'
  | 'published'
  | 'rejected'
  | 'parse_failed'
  | 'expired'
  | 'deprecated'
  | 'archived';

export type SensitivityLevel = 'public' | 'internal' | 'restricted' | 'sensitive';

export type ReviewAction = 'approve' | 'reject' | 'request_info' | 'save_draft';

export type CitationFeedback = 'helpful' | 'incorrect' | 'outdated';

export interface KnowledgeSpace {
  id: string;
  name: string;
  description: string;
  knowledgeType: KnowledgeType;
  owner: string;
  visibleTeams: string[];
  documentCount: number;
  publishedCount: number;
  updatedAt: string;
  status: 'active' | 'archived';
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  summary: string;
  spaceId: string;
  spaceName: string;
  knowledgeType: KnowledgeType;
  productLine?: string;
  source: string;
  owner: string;
  reviewer?: string;
  scope: string;
  sensitivity: SensitivityLevel;
  effectiveDate: string;
  expiryDate?: string;
  currentVersion: number;
  versions: DocumentVersion[];
  status: DocumentStatus;
  chunkCount: number;
  recentCitationCount: number;
  updatedAt: string;
  tags: string[];
  reviewHistory: ReviewEntry[];
}

export interface DocumentVersion {
  version: number;
  title: string;
  content: string;
  changeSummary: string;
  status: DocumentStatus;
  createdAt: string;
  createdBy: string;
}

export interface ReviewEntry {
  id: string;
  action: ReviewAction;
  reviewer: string;
  comment: string;
  timestamp: string;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  version: number;
  section: string;
  content: string;
  contextBefore: string;
  contextAfter: string;
  chunkIndex: number;
  relevanceScore?: number;
  metadata: Record<string, string>;
}

export interface Citation {
  id: string;
  eventId: string;
  documentId: string;
  documentTitle: string;
  version: number;
  section: string;
  snippet: string;
  citationReason: string;
  retrievedAt: string;
  relevanceScore: number;
  feedback?: CitationFeedback;
  feedbackNote?: string;
  feedbackBy?: string;
}

export interface RetrievalTestResult {
  chunkId: string;
  documentTitle: string;
  documentId: string;
  version: number;
  section: string;
  snippet: string;
  score: number;
  filterReason?: string;
  mark?: 'correct' | 'incorrect' | 'should_hit';
}

export interface KnowledgeOverviewStats {
  publishedCount: number;
  pendingReviewCount: number;
  parseFailedCount: number;
  expiringSoonCount: number;
  recentCitations7d: number;
  spaces: KnowledgeSpace[];
}

export interface UsageRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  documentId: string;
  documentTitle: string;
  version: number;
  snippet: string;
  user: string;
  timestamp: string;
  action: 'cited' | 'viewed' | 'feedback';
}
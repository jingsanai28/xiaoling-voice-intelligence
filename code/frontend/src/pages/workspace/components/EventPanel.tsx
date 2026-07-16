import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockCaseById } from '@/mocks/cases';
import { simStages } from '@/mocks/pipelineSim';
import { mockCitations, mockDocumentById } from '@/mocks/knowledge';
import DocumentDetailDrawer from '@/pages/knowledge/components/DocumentDetailDrawer';
import type { EventCardData, EventStateInfo } from '@/types/conversation';
import type { KnowledgeDocument } from '@/types/knowledge';
import type { Citation, CitationFeedback } from '@/types/knowledge';
import { knowledgeApi } from '@/services/knowledgeApi';
import type { TriageResult } from '@/services/triageApi';

const riskLevelConfig: Record<string, { bg: string; text: string; label: string }> = {
  P0: { bg: 'bg-accent-100', text: 'text-accent-700', label: '重大' },
  P1: { bg: 'bg-accent-50', text: 'text-accent-600', label: '高' },
  P2: { bg: 'bg-primary-50', text: 'text-primary-700', label: '中' },
  P3: { bg: 'bg-secondary-50', text: 'text-secondary-700', label: '低' },
};

const stageLabels: Record<string, string> = {
  data_integrity_check: '检查数据完整性',
  permission_check: '检查数据权限',
  dedup_noise_reduction: '去除重复和低信息内容',
  topic_clustering: '聚合相似反馈主题',
  agent_analysis: '调用专业 Agent 分析',
  memory_rule_match: '匹配历史事件和业务规则',
  signal_valuation: '判断信号价值与优先级',
  human_review_gate: '判断是否需要人工复核',
  generate_result: '生成分析结果',
};

const eventStates: EventStateInfo[] = [
  { state: 'analyzing', label: '分析中', dotClass: 'bg-primary-400', textClass: 'text-primary-600' },
  { state: 'pending_evidence', label: '待补充证据', dotClass: 'bg-secondary-400', textClass: 'text-secondary-600' },
  { state: 'pending_review', label: '待人工复核', dotClass: 'bg-accent-400', textClass: 'text-accent-600' },
  { state: 'pending_assignment', label: '待分派', dotClass: 'bg-secondary-400', textClass: 'text-secondary-600' },
  { state: 'in_progress', label: '处理中', dotClass: 'bg-primary-400', textClass: 'text-primary-600' },
  { state: 'observing', label: '持续观察', dotClass: 'bg-secondary-400', textClass: 'text-secondary-600' },
  { state: 'completed', label: '已完成', dotClass: 'bg-secondary-400', textClass: 'text-secondary-600' },
  { state: 'archived', label: '已归档', dotClass: 'bg-foreground-400', textClass: 'text-foreground-500' },
  { state: 'false_positive', label: '已标记为误判', dotClass: 'bg-foreground-400', textClass: 'text-foreground-500' },
];

type TabKey = 'summary' | 'evidence' | 'progress' | 'history' | 'review' | 'report' | 'log' | 'knowledge';

interface EventPanelProps {
  eventData: EventCardData | null;
  analysis: TriageResult | null;
  onAddToTask: () => void;
  onContinue: () => void;
  onAddEvidence: () => void;
  taskAdded: boolean;
}

export default function EventPanel({ eventData, analysis, onAddToTask, onContinue, onAddEvidence, taskAdded }: EventPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('summary');
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [knowledgeDoc, setKnowledgeDoc] = useState<KnowledgeDocument | null>(null);
  const [citations, setCitations] = useState<Citation[]>(
    eventData ? mockCitations.filter((item) => item.eventId === eventData.caseId) : [],
  );

  useEffect(() => {
    if (!eventData) {
      setCitations([]);
      return;
    }
    const fallback = mockCitations.filter((item) => item.eventId === eventData.caseId);
    setCitations(fallback);
    knowledgeApi.citations(eventData.caseId).then(setCitations).catch(() => undefined);
  }, [eventData?.caseId]);

  const openKnowledgeDocument = async (documentId: string) => {
    try {
      setKnowledgeDoc(await knowledgeApi.document(documentId));
    } catch {
      const fallback = mockDocumentById[documentId];
      if (fallback) setKnowledgeDoc(fallback);
    }
  };

  const submitCitationFeedback = async (citationId: string, feedback: CitationFeedback) => {
    try {
      const updated = await knowledgeApi.citationFeedback(citationId, feedback);
      setCitations((items) => items.map((item) => item.id === citationId ? updated : item));
    } catch {
      setCitations((items) => items.map((item) => item.id === citationId ? { ...item, feedback } : item));
    }
  };

  if (!eventData) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="text-center max-w-xs">
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-background-200/70 flex items-center justify-center">
            <i className="ri-file-list-3-line text-2xl text-foreground-400"></i>
          </div>
          <p className="text-sm text-foreground-500 font-body leading-relaxed">
            完成第一轮分析后，<br />事件信息会在这里打开。
          </p>
        </div>
      </div>
    );
  }

  const risk = riskLevelConfig[eventData.riskLevel] || riskLevelConfig.P3;
  const foundCase = analysis ? undefined : mockCaseById[eventData.caseId];
  const realEvidence = analysis?.evidence || [];
  const realHistory = analysis?.historical_matches || [];
  const realEvents = analysis?.events || [];

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'summary', label: '事件摘要', icon: 'ri-flashlight-line' },
    { key: 'evidence', label: '核心证据', icon: 'ri-file-text-line' },
    { key: 'progress', label: 'AI 分析进度', icon: 'ri-node-tree' },
    { key: 'knowledge', label: '知识依据', icon: 'ri-book-open-line' },
    { key: 'history', label: '历史事件', icon: 'ri-history-line' },
    { key: 'review', label: '人工复核', icon: 'ri-shield-check-line' },
    { key: 'report', label: '完整报告', icon: 'ri-file-chart-line' },
    { key: 'log', label: '事件日志', icon: 'ri-timeline-view' },
  ];

  return (
    <div className="h-full flex flex-col bg-background-50">
      {/* Event Header */}
      <div className="p-5 border-b border-background-200/70 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono text-foreground-400">{eventData.id}</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-label ${risk.bg} ${risk.text}`}>
            {eventData.riskLevel} · {risk.label}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary-50 text-secondary-700 font-label">
            {eventData.signalLabel}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-foreground-900 font-heading leading-snug mb-3">{eventData.title}</h3>

        <div className="flex items-center gap-2 mb-3">
          {eventData.teams.map((team) => (
            <span key={team} className="px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-700 text-[10px] font-label">{team}</span>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2 mb-3 px-2.5 py-2 rounded-lg bg-background-100 border border-background-200/70">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${eventData.needsReview ? 'bg-accent-400' : 'bg-primary-400'}`}></span>
            <span className={`text-[10px] font-label truncate ${eventData.needsReview ? 'text-accent-600' : 'text-primary-600'}`}>
              {eventData.needsReview ? '待人工复核' : '事件工作区已打开'}
            </span>
          </div>
          <span className="text-[10px] text-foreground-400 font-body whitespace-nowrap">可持续更新</span>
        </div>

        <div className="flex gap-2 mb-3">
          <button type="button" onClick={onContinue} className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg border border-background-200/70 bg-background-50 text-[10px] text-foreground-600 hover:text-primary-700 hover:border-primary-300 transition-colors cursor-pointer font-label">
            <i className="ri-chat-3-line"></i>继续追问
          </button>
          <button type="button" onClick={onAddEvidence} className="flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg border border-background-200/70 bg-background-50 text-[10px] text-foreground-600 hover:text-primary-700 hover:border-primary-300 transition-colors cursor-pointer font-label">
            <i className="ri-image-add-line"></i>补充证据
          </button>
        </div>

        <button
          type="button"
          onClick={onAddToTask}
          disabled={taskAdded}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap font-label ${
            taskAdded
              ? 'bg-secondary-50 text-secondary-600 border border-secondary-200'
              : 'bg-primary-500 text-background-50 hover:bg-primary-600'
          }`}
        >
          <i className={taskAdded ? 'ri-check-line' : 'ri-task-line'}></i>
          <span>{taskAdded ? '已添加到任务' : '添加到任务'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="px-3 py-2 border-b border-background-200/70 flex-shrink-0 overflow-x-auto">
        <div className="flex items-center gap-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap font-label ${
                activeTab === tab.key
                  ? 'bg-primary-500 text-background-50'
                  : 'text-foreground-500 hover:text-foreground-700 hover:bg-background-100'
              }`}
            >
              <i className={`${tab.icon} text-[11px]`}></i>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {activeTab === 'summary' && (
          <div className="space-y-4">
            <div>
              <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-2">发生了什么</h4>
              <p className="text-xs text-foreground-700 leading-relaxed font-body">{eventData.summary}</p>
            </div>
            {analysis && (
              <>
                <div>
                  <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-2">分析结论</h4>
                  <p className="text-xs text-foreground-700 leading-relaxed whitespace-pre-wrap font-body">{analysis.final_report || '分析已完成，暂无报告正文。'}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-background-100 border border-background-200/70 p-3">
                    <span className="text-[10px] text-foreground-500 font-label">运行方式</span>
                    <p className="text-sm text-foreground-700 font-mono mt-0.5">{analysis.graph_runtime}</p>
                  </div>
                  <div className="rounded-lg bg-background-100 border border-background-200/70 p-3">
                    <span className="text-[10px] text-foreground-500 font-label">调用 Agent</span>
                    <p className="text-sm text-foreground-700 font-body mt-0.5 truncate">{analysis.selected_agents.join('、') || '无'}</p>
                  </div>
                </div>
              </>
            )}
            {foundCase && (
              <>
                <div>
                  <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-2">为什么值得关注</h4>
                  <p className="text-xs text-foreground-700 leading-relaxed font-body">
                    {foundCase.isPublic ? '该反馈已在公开平台传播，存在扩散和品牌风险。' : '虽未广泛公开传播，但涉及核心业务链路或数据安全。'}
                    {foundCase.needsReview ? '建议人工复核后决定后续处理。' : '置信度较高，已自动分派责任团队。'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-background-100 border border-background-200/70 p-3">
                    <span className="text-[10px] text-foreground-500 font-label">置信度</span>
                    <p className="text-sm font-semibold text-foreground-800 font-mono mt-0.5">{Math.round(eventData.confidence * 100)}%</p>
                  </div>
                  <div className="rounded-lg bg-background-100 border border-background-200/70 p-3">
                    <span className="text-[10px] text-foreground-500 font-label">来源渠道</span>
                    <p className="text-sm text-foreground-700 font-body mt-0.5 truncate">{foundCase.source}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-2">下一步动作</h4>
                  <p className="text-xs text-foreground-600 font-body leading-relaxed">
                    {foundCase.needsReview
                      ? '建议先完成人工复核，确认后将事件添加到任务并分派至责任团队。'
                      : '建议将事件添加到任务，由责任团队在 SLA 内处理。'}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'evidence' && analysis && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-3">核心证据</h4>
            {realEvidence.length === 0 ? <p className="text-xs text-foreground-500 font-body">当前结果没有提取到结构化证据。</p> : realEvidence.map((ev, index) => (
              <div key={String(ev.id || index)} className="p-3 rounded-lg bg-background-100 border border-background-200/70">
                <div className="flex items-center gap-2 mb-1.5"><span className="px-1.5 py-0.5 rounded text-[10px] font-semibold font-label bg-primary-50 text-primary-700">{ev.severity || '事实'}</span><span className="text-[10px] text-foreground-500 font-body">{ev.source || '分析提取'}</span></div>
                <p className="text-xs text-foreground-700 leading-relaxed font-body">{ev.content || '未提供证据内容'}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'evidence' && foundCase && (
          <div className="space-y-2">
            <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-3">核心证据</h4>
            {foundCase.evidence.map((ev) => (
              <div key={ev.id} className="p-3 rounded-lg bg-background-100 border border-background-200/70">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold font-label ${
                    ev.severity === 'high' ? 'bg-accent-100 text-accent-700' : ev.severity === 'medium' ? 'bg-primary-50 text-primary-700' : 'bg-secondary-50 text-secondary-700'
                  }`}>
                    {ev.severity === 'high' ? '高' : ev.severity === 'medium' ? '中' : '低'}
                  </span>
                  <span className="text-[10px] text-foreground-500 font-body">{ev.source}</span>
                </div>
                <p className="text-xs text-foreground-700 leading-relaxed font-body">{ev.content}</p>
              </div>
            ))}
            <div className="mt-4">
              <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-2">原始反馈内容</h4>
              <div className="p-3 rounded-lg bg-background-100 border border-background-200/70">
                <p className="text-xs text-foreground-700 leading-relaxed whitespace-pre-wrap font-body">{foundCase.content}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label">AI 分析进度 · 9 阶段</h4>
                <p className="text-[10px] text-foreground-400 font-body mt-1">展示可审计摘要，不展示模型隐藏思维过程。</p>
              </div>
              <span className="text-[10px] text-primary-600 font-label whitespace-nowrap">已完成</span>
            </div>
            <div className="space-y-0">
              {(analysis ? realEvents.map((event, idx) => ({
                key: `${event.node}-${idx}`,
                icon: event.node.includes('agent') || event.node === 'supervisor' ? 'ri-openai-line' : 'ri-checkbox-circle-line',
                kind: event.node.includes('agent') || event.node === 'supervisor' ? 'agent' as const : 'system' as const,
                calledObject: event.node,
                outputDetail: event.message,
                tools: Object.keys(event.data || {}),
                logLines: [`${event.action} · ${event.message}`],
                subAgents: [],
              })) : simStages).map((stage, idx, stages) => {
                const isLast = idx === stages.length - 1;
                const isExpanded = expandedStage === stage.key;
                return (
                  <div key={stage.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        stage.kind === 'agent' ? 'bg-primary-100 text-primary-600' :
                        stage.kind === 'gate' ? 'bg-accent-100 text-accent-600' :
                        stage.kind === 'output' ? 'bg-background-200 text-foreground-600' :
                        'bg-secondary-100 text-secondary-600'
                      }`}>
                        <i className={`text-xs ${stage.icon}`}></i>
                      </div>
                      {!isLast && <div className="w-0.5 flex-1 min-h-[20px] bg-background-200"></div>}
                    </div>
                    <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-3'}`}>
                      <button type="button" onClick={() => setExpandedStage(isExpanded ? null : stage.key)} className="w-full text-left cursor-pointer bg-transparent border-none p-0">
                        <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-mono text-foreground-400">#{idx + 1}</span>
                        <span className="text-[11px] font-semibold text-foreground-700 font-label">{stageLabels[stage.key] || stage.name}</span>
                        <span className="ml-auto text-[10px] text-foreground-400"><i className={isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i></span>
                        </div>
                        <p className="text-[10px] text-foreground-500 leading-relaxed font-body">{stage.outputDetail}</p>
                      </button>
                      {isExpanded && (
                        <div className="mt-2 mb-1 rounded-lg bg-background-100 border border-background-200/70 p-3 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] text-foreground-500 font-label">执行对象</span>
                            <span className="text-[10px] text-foreground-700 font-mono">{stage.calledObject}</span>
                          </div>
                          {stage.tools.length > 0 && (
                            <div>
                              <span className="text-[10px] text-foreground-500 font-label">调用工具</span>
                              <div className="flex flex-wrap gap-1 mt-1">{stage.tools.map((tool) => <span key={tool} className="px-1.5 py-0.5 rounded bg-background-50 border border-background-200/70 text-[9px] text-foreground-600 font-mono">{tool}</span>)}</div>
                            </div>
                          )}
                          {stage.subAgents && stage.subAgents.length > 0 && (
                            <div><span className="text-[10px] text-foreground-500 font-label">调用 Agent</span><p className="text-[10px] text-foreground-700 font-body mt-1">{stage.subAgents.map((agent) => 'name' in agent ? agent.name : agent.agentName).join('、')}</p></div>
                          )}
                          <div>
                            <span className="text-[10px] text-foreground-500 font-label">可审计日志</span>
                            {stage.logLines.slice(0, 3).map((line) => <p key={line} className="text-[10px] text-foreground-600 font-mono leading-relaxed mt-1">{line}</p>)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'knowledge' && (
          <div>
            <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-3">知识依据</h4>
            {citations.length === 0 ? (
              <div className="text-center py-8">
                <i className="ri-book-open-line text-2xl text-foreground-300 block mb-2"></i>
                <p className="text-xs text-foreground-500 font-body">未找到可用企业知识</p>
                <p className="text-[10px] text-foreground-400 font-body mt-1">Agent 在分析时未检索到匹配的企业知识文档，<br />相关判断基于通用模型知识，请人工核实。</p>
                <div className="mt-3 inline-flex flex-wrap gap-1 justify-center">
                  {['产品知识', '客服政策', '历史案例'].map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded bg-background-100 border border-background-200/70 text-[10px] text-foreground-500 font-label">建议补充：{t}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-[10px] text-foreground-500 font-body mb-3">
                  Agent 从企业知识库中检索到 <span className="font-semibold text-foreground-700">{citations.length} 条</span>相关知识依据
                </p>
                <div className="space-y-2">
                  {citations.map((citation) => (
                    <div key={citation.id} className="rounded-lg border border-background-200/70 bg-background-50 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-foreground-400">{citation.id}</span>
                          <button
                            type="button"
                            onClick={() => void openKnowledgeDocument(citation.documentId)}
                            className="text-[10px] font-semibold text-primary-600 font-label text-left bg-transparent border-none cursor-pointer hover:underline p-0"
                          >
                            {citation.documentTitle}
                          </button>
                        </div>
                        <span className="text-[10px] font-mono text-primary-600">
                          相关度 {Math.round(citation.relevanceScore * 100)}%
                        </span>
                      </div>

                      <div className="p-2.5 rounded bg-background-100 border border-background-200/40 mb-2">
                        <p className="text-[11px] text-foreground-700 font-body leading-relaxed">{citation.snippet}</p>
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-foreground-500 font-body">
                        <span>
                          <i className="ri-git-branch-line mr-1 text-foreground-400"></i>
                          v{citation.version} · {citation.section}
                        </span>
                        <span>
                          <i className="ri-information-line mr-1 text-foreground-400"></i>
                          {citation.citationReason}
                        </span>
                      </div>

                      {/* Feedback */}
                      {citation.feedback ? (
                        <div className="mt-2 pt-2 border-t border-background-200/40 flex items-center gap-1.5">
                          <span className={`text-[10px] font-label ${
                            citation.feedback === 'helpful' ? 'text-secondary-600' :
                            citation.feedback === 'incorrect' ? 'text-accent-600' :
                            'text-accent-600'
                          }`}>
                            <i className={`mr-1 ${citation.feedback === 'helpful' ? 'ri-thumb-up-line' : 'ri-error-warning-line'}`}></i>
                            {citation.feedback === 'helpful' ? '有帮助' : citation.feedback === 'incorrect' ? '引用错误' : '内容已过期'}
                          </span>
                          {citation.feedbackNote && (
                            <span className="text-[9px] text-foreground-500 font-body">{citation.feedbackNote}</span>
                          )}
                        </div>
                      ) : (
                        <div className="mt-2 pt-2 border-t border-background-200/40 flex items-center gap-1.5">
                          <span className="text-[10px] text-foreground-500 font-label">标记：</span>
                          {[
                            { value: 'helpful' as const, label: '有帮助', icon: 'ri-thumb-up-line' },
                            { value: 'incorrect' as const, label: '引用错误', icon: 'ri-error-warning-line' },
                            { value: 'outdated' as const, label: '已过期', icon: 'ri-timer-line' },
                          ].map((fb) => (
                            <button
                              key={fb.value}
                              type="button"
                              onClick={() => void submitCitationFeedback(citation.id, fb.value)}
                              className="px-1.5 py-0.5 rounded border border-background-200/40 text-[10px] text-foreground-500 font-label hover:bg-background-200/60 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <i className={`${fb.icon} text-[9px] mr-0.5`}></i>
                              {fb.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <Link
                        to={`/knowledge/document/${citation.documentId}`}
                        className="inline-flex items-center gap-1 mt-2 text-[10px] text-primary-600 font-label no-underline hover:underline"
                      >
                        <i className="ri-external-link-line text-[9px]"></i>
                        打开文档详情
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Missing knowledge notice */}
                <div className="rounded-lg bg-background-100 border border-background-200/70 p-3 mt-3 flex items-start gap-2">
                  <i className="ri-lightbulb-line text-foreground-400 text-sm mt-0.5"></i>
                  <div className="text-[10px] text-foreground-500 font-body leading-relaxed">
                    <p className="font-semibold text-foreground-600 mb-0.5">知识库覆盖提示</p>
                    <p>如发现重要判断缺少企业知识支撑，可将缺失信息提交为知识补充待办，由知识库管理员跟进录入。</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-3">历史相似事件</h4>
            {analysis ? (
              realHistory.length > 0 ? <div className="space-y-2">{realHistory.map((item, index) => <div key={String(item.id || index)} className="p-3 rounded-lg bg-background-100 border border-background-200/70"><p className="text-xs text-foreground-700 font-body">{String(item.title || item.summary || '历史相似事件')}</p><p className="text-[10px] text-foreground-500 font-body mt-1">相似度 {String(item.similarity || item.score || '未提供')}</p></div>)}</div> : <p className="text-xs text-foreground-500 font-body">没有找到相似历史事件。</p>
            ) : foundCase && foundCase.relatedEvents.length > 0 ? (
              <div className="space-y-2">
                {foundCase.relatedEvents.map((ev) => {
                  const hr = riskLevelConfig[ev.riskLevel];
                  return (
                    <div key={ev.id} className="p-3 rounded-lg bg-background-100 border border-background-200/70">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold font-label ${hr?.bg || ''} ${hr?.text || ''}`}>
                          {ev.riskLevel}
                        </span>
                        <span className="text-[10px] font-mono text-foreground-400">相似度 {Math.round(ev.similarity * 100)}%</span>
                      </div>
                      <p className="text-xs text-foreground-700 font-body mb-1">{ev.title}</p>
                      <p className="text-[10px] text-foreground-500 font-body">{ev.outcome}</p>
                      <p className="text-[10px] text-foreground-400 mt-0.5 font-body">{ev.date}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="ri-history-line text-2xl text-foreground-300 block mb-2"></i>
                <p className="text-xs text-foreground-500 font-body">没有找到高度相似的历史事件</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <div>
            <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-3">人工复核</h4>
            {eventData.needsReview ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-accent-50 border border-accent-200/70 p-3">
                  <div className="flex items-start gap-2">
                    <i className="ri-alert-line text-accent-500 text-sm mt-0.5"></i>
                    <div className="text-xs text-foreground-600 font-body">
                      <p className="font-semibold mb-0.5 text-accent-700">需要人工复核</p>
                      <p>该信号涉及公开传播、合规风险或高影响决策，建议在进入处理前完成人工复核确认。</p>
                    </div>
                  </div>
                </div>
                {analysis?.human_review_packet && <div className="rounded-lg bg-background-100 border border-background-200/70 p-3"><p className="text-[10px] font-semibold text-foreground-600 font-label mb-1">复核包</p><p className="text-[10px] text-foreground-600 font-body leading-relaxed">{JSON.stringify(analysis.human_review_packet)}</p></div>}
                <div>
                  <span className="text-[10px] font-semibold text-foreground-500 font-label">允许动作</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {['确认进入处理', '降级为持续观察', '要求补充证据', '转交其他团队', '标记为误判'].map((a) => (
                      <span key={a} className="px-2 py-0.5 rounded bg-background-100 border border-background-200/70 text-[10px] text-foreground-600 font-label">{a}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-accent-50/50 border border-accent-200/40 p-3">
                  <div className="flex items-start gap-2">
                    <i className="ri-forbid-line text-accent-500 text-sm mt-0.5"></i>
                    <div>
                      <p className="text-[10px] font-semibold text-accent-700 font-label mb-1">禁止动作 · 待人工确认</p>
                      <p className="text-[10px] text-foreground-600 font-body leading-relaxed">
                        涉及对外回应、赔偿、认责、法律结论、联系用户等动作，AI 仅提供建议，必须经人工确认后方可执行。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="ri-check-double-line text-2xl text-foreground-300 block mb-2"></i>
                <p className="text-xs text-foreground-500 font-body">该信号置信度较高，未触发人工复核规则</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'report' && (
          <div className="space-y-4">
            <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-3">完整报告</h4>
            <div className="rounded-lg bg-background-100 border border-background-200/70 p-4">
              <p className="text-xs text-foreground-700 leading-relaxed font-body">
                {analysis ? analysis.final_report : `经 9 阶段 AI 分析，识别为${eventData.signalLabel}信号，优先级 ${eventData.riskLevel}，置信度 ${Math.round(eventData.confidence * 100)}%。`}
                建议责任团队：{eventData.teams.join('、')}。
                {eventData.needsReview ? '该分析结果已暂存，等待人工复核确认后发布。' : '该分析结果可进入任务分派。'}
              </p>
            </div>
            <div className="rounded-lg bg-background-200/50 border border-background-200/70 p-4">
              <h5 className="text-[10px] font-semibold text-foreground-600 font-label mb-2">禁止自动执行的动作</h5>
              <ul className="list-disc list-inside space-y-1 text-[10px] text-foreground-600 font-body">
                <li>未经确认自动赔偿或退款</li>
                <li>未经确认对外发布回应或声明</li>
                <li>未经确认代表企业认责</li>
                <li>自动关闭高风险信号</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'log' && foundCase && (
          <div>
            <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-3">事件日志</h4>
            <div className="space-y-0">
              {foundCase.eventLog.map((entry, idx) => {
                const isLast = idx === foundCase.eventLog.length - 1;
                return (
                  <div key={entry.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full ${
                        entry.actor === 'agent' ? 'bg-primary-400' : entry.actor === 'system' ? 'bg-foreground-400' : 'bg-secondary-400'
                      }`}></div>
                      {!isLast && <div className="w-0.5 flex-1 min-h-[12px] bg-background-200"></div>}
                    </div>
                    <div className="pb-2.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-semibold text-foreground-700 font-label">{entry.node}</span>
                        <span className="text-[9px] text-foreground-400 font-mono">{entry.timestamp}</span>
                      </div>
                      <p className="text-[10px] text-foreground-600 font-body">{entry.action} — {entry.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Knowledge Document Detail Drawer */}
      {knowledgeDoc && (
        <DocumentDetailDrawer
          document={knowledgeDoc}
          onClose={() => setKnowledgeDoc(null)}
        />
      )}
    </div>
  );
}

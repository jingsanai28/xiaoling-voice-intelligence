import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { KnowledgeDocument } from '@/types/knowledge';

type TabKey = 'preview' | 'versions' | 'citations' | 'log';

const statusLabel: Record<string, string> = {
  published: '已发布',
  pending_review: '待审核',
  draft: '草稿',
  parse_failed: '解析失败',
  archived: '已归档',
  rejected: '已驳回',
  expired: '已过期',
};

const statusStyle: Record<string, string> = {
  published: 'bg-secondary-50 text-secondary-700 border-secondary-200/40',
  pending_review: 'bg-accent-50 text-accent-700 border-accent-200/40',
  draft: 'bg-foreground-100 text-foreground-600 border-foreground-200/40',
  parse_failed: 'bg-accent-100 text-accent-700 border-accent-200/40',
  archived: 'bg-foreground-100 text-foreground-500 border-foreground-200/40',
  rejected: 'bg-accent-50 text-accent-600 border-accent-200/40',
  expired: 'bg-foreground-100 text-foreground-500 border-foreground-200/40',
};

const sensitivityLabels: Record<string, string> = {
  public: '公开',
  internal: '内部',
  restricted: '受限',
  sensitive: '敏感',
};

const sensitivityStyles: Record<string, string> = {
  public: 'bg-secondary-50 text-secondary-600',
  internal: 'bg-primary-50 text-primary-600',
  restricted: 'bg-accent-50 text-accent-600',
  sensitive: 'bg-accent-100 text-accent-700',
};

interface DocumentDetailDrawerProps {
  document: KnowledgeDocument;
  highlightSnippet?: string;
  onClose: () => void;
  embedded?: boolean;
}

export default function DocumentDetailDrawer({ document: doc, highlightSnippet, onClose, embedded }: DocumentDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('preview');

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'preview', label: '内容预览', icon: 'ri-file-text-line' },
    { key: 'versions', label: '版本记录', icon: 'ri-git-branch-line' },
    { key: 'citations', label: '引用记录', icon: 'ri-link-m' },
    { key: 'log', label: '操作日志', icon: 'ri-history-line' },
  ];

  const knowledgeTypeLabels: Record<string, string> = {
    product: '产品知识',
    policy_sop: '政策与 SOP',
    risk_compliance: '品牌与合规',
    historical_case: '历史案例',
  };

  const highlightContent = (content: string) => {
    if (!highlightSnippet) return content;
    const escaped = highlightSnippet.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = content.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlightSnippet.toLowerCase()
        ? <mark key={i} className="bg-yellow-200/70 text-foreground-900 px-0.5 rounded">{part}</mark>
        : part
    );
  };

  return (
    <div
      className={`${embedded ? '' : 'fixed inset-0 z-50 flex justify-end'}`}
      onClick={embedded ? undefined : onClose}
    >
      <div
        className={`${embedded ? 'w-full' : 'w-[45%] min-w-[480px] max-w-[640px]'} h-full bg-background-50 overflow-y-auto border-l border-background-200/70`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background-50 z-10 p-5 border-b border-background-200/70">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold font-label ${statusStyle[doc.status]}`}>
                  {statusLabel[doc.status]}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-label ${sensitivityStyles[doc.sensitivity]}`}>
                  {sensitivityLabels[doc.sensitivity]}
                </span>
                <span className="text-[10px] font-mono text-foreground-400">v{doc.currentVersion}</span>
              </div>
              <h3 className="text-sm font-semibold text-foreground-900 font-heading leading-snug">{doc.title}</h3>
            </div>
            <div className="flex items-center gap-1">
              {doc.status === 'published' && (
                <Link
                  to={`/knowledge/document/${doc.id}`}
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-background-200/70 text-foreground-500 hover:text-primary-600 hover:border-primary-200 transition-colors cursor-pointer no-underline"
                  title="在新页面打开"
                >
                  <i className="ri-external-link-line text-xs"></i>
                </Link>
              )}
              <button type="button" onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-foreground-500 hover:text-foreground-700 cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-3 gap-2 text-[10px]">
            <div>
              <span className="text-foreground-500 font-label">知识类型</span>
              <p className="text-foreground-700 font-body mt-0.5">{knowledgeTypeLabels[doc.knowledgeType]}</p>
            </div>
            <div>
              <span className="text-foreground-500 font-label">负责人</span>
              <p className="text-foreground-700 font-body mt-0.5">{doc.owner}</p>
            </div>
            <div>
              <span className="text-foreground-500 font-label">适用范围</span>
              <p className="text-foreground-700 font-body mt-0.5">{doc.scope}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[121px] bg-background-50 z-10 px-3 border-b border-background-200/70">
          <div className="flex items-center gap-0.5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-t text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap font-label ${
                  activeTab === tab.key
                    ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/30'
                    : 'text-foreground-500 hover:text-foreground-700 border-b-2 border-transparent'
                }`}
              >
                <i className={`${tab.icon} text-[11px]`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {activeTab === 'preview' && (
            <div>
              <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-2">文档摘要</h4>
              <p className="text-xs text-foreground-600 font-body leading-relaxed mb-4">{doc.summary || '暂无摘要'}</p>

              {doc.status === 'parse_failed' ? (
                <div className="rounded-lg bg-accent-50/50 border border-accent-200/70 p-4 text-center">
                  <i className="ri-error-warning-line text-2xl text-accent-400 block mb-2"></i>
                  <p className="text-xs text-accent-600 font-body mb-1">文档解析失败</p>
                  <p className="text-[10px] text-foreground-500 font-body">文件格式无法识别或内容损坏，请重新上传</p>
                  <button type="button" className="mt-3 px-3 py-1.5 rounded-lg bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap font-label">
                    <i className="ri-refresh-line mr-1"></i>重新解析
                  </button>
                </div>
              ) : (
                <div className="rounded-lg border border-background-200/70 p-4 bg-background-100">
                  <div className="text-xs text-foreground-700 font-body leading-relaxed whitespace-pre-wrap">
                    {highlightSnippet ? highlightContent(doc.content) : doc.content}
                  </div>
                </div>
              )}

              {doc.status === 'published' && (
                <div className="mt-3 text-right">
                  <Link
                    to={`/knowledge/retrieval-test`}
                    className="inline-flex items-center gap-1 text-[10px] text-primary-600 font-label no-underline hover:underline"
                  >
                    <i className="ri-search-eye-line text-[9px]"></i>
                    用此文档测试检索
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-0">
              {doc.versions.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-git-branch-line text-2xl text-foreground-300 block mb-2"></i>
                  <p className="text-xs text-foreground-500 font-body">暂无版本记录</p>
                </div>
              ) : (
                doc.versions.map((ver, idx) => (
                  <div key={ver.version} className="flex gap-3 pb-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold font-mono ${
                        ver.version === doc.currentVersion
                          ? 'bg-primary-500 text-background-50'
                          : 'bg-background-100 text-foreground-600 border border-background-300'
                      }`}>
                        v{ver.version}
                      </div>
                      {idx < doc.versions.length - 1 && <div className="w-0.5 flex-1 min-h-[16px] bg-background-200"></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold text-foreground-800 font-label">{ver.title}</span>
                        <span className={`px-1 py-0.5 rounded text-[9px] font-label ${statusStyle[ver.status]}`}>
                          {statusLabel[ver.status]}
                        </span>
                      </div>
                      <p className="text-[10px] text-foreground-600 font-body mb-1">{ver.changeSummary}</p>
                      <p className="text-[9px] text-foreground-400 font-body">{ver.createdAt} · {ver.createdBy}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'citations' && (
            <div>
              {doc.recentCitationCount === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-link-m text-2xl text-foreground-300 block mb-2"></i>
                  <p className="text-xs text-foreground-500 font-body">该文档尚未被 Agent 引用</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-foreground-600 font-body mb-4">该文档已被 Agent 引用 {doc.recentCitationCount} 次，最近引用记录如下：</p>
                  <div className="space-y-2">
                    {[
                      { eventId: 'CASE-2026-101', snippet: doc.content.slice(0, 80) + '...', date: '2026-07-14 09:23', agent: '品牌 Agent', score: 0.94 },
                      { eventId: 'CASE-2026-103', snippet: doc.content.slice(30, 110) + '...', date: '2026-07-13 14:20', agent: '客服 Agent', score: 0.88 },
                    ].map((cit, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-background-100 border border-background-200/70">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-foreground-400">{cit.eventId}</span>
                          <span className="text-[10px] text-foreground-500 font-body">{cit.agent}</span>
                          <span className="text-[10px] font-mono text-primary-600">相关度 {Math.round(cit.score * 100)}%</span>
                        </div>
                        <p className="text-[11px] text-foreground-700 font-body">{cit.snippet}</p>
                        <p className="text-[9px] text-foreground-400 font-body mt-1">{cit.date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'log' && (
            <div>
              {doc.reviewHistory.length === 0 ? (
                <div className="text-center py-8">
                  <i className="ri-history-line text-2xl text-foreground-300 block mb-2"></i>
                  <p className="text-xs text-foreground-500 font-body">暂无操作日志</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {doc.reviewHistory.map((entry, idx) => (
                    <div key={entry.id} className="flex gap-3 pb-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          entry.action === 'approve' ? 'bg-secondary-100 text-secondary-600' : 'bg-accent-100 text-accent-600'
                        }`}>
                          <i className={`text-xs ${entry.action === 'approve' ? 'ri-check-line' : 'ri-close-line'}`}></i>
                        </div>
                        {idx < doc.reviewHistory.length - 1 && <div className="w-0.5 flex-1 min-h-[8px] bg-background-200"></div>}
                      </div>
                      <div>
                        <p className="text-[11px] text-foreground-700 font-body">
                          <span className="font-semibold font-label">{entry.reviewer}</span>
                          {' '}{entry.action === 'approve' ? '已通过' : entry.action === 'reject' ? '已驳回' : entry.action === 'request_info' ? '要求补充信息' : '保存为草稿'}
                        </p>
                        {entry.comment && <p className="text-[10px] text-foreground-500 font-body mt-0.5">{entry.comment}</p>}
                        <p className="text-[9px] text-foreground-400 font-body mt-0.5">{entry.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { mockDocumentById } from '@/mocks/knowledge';
import { knowledgeApi } from '@/services/knowledgeApi';
import type { KnowledgeDocument } from '@/types/knowledge';

type TabKey = 'preview' | 'versions' | 'chunks' | 'citations' | 'log';

const statusLabel: Record<string, string> = {
  published: '已发布',
  pending_review: '待审核',
  draft: '草稿',
  parse_failed: '解析失败',
  archived: '已归档',
  rejected: '已驳回',
};

const statusStyle: Record<string, string> = {
  published: 'bg-secondary-50 text-secondary-700 border-secondary-200/40',
  pending_review: 'bg-accent-50 text-accent-700 border-accent-200/40',
  draft: 'bg-foreground-100 text-foreground-600 border-foreground-200/40',
  parse_failed: 'bg-accent-100 text-accent-700 border-accent-200/40',
  archived: 'bg-foreground-100 text-foreground-500 border-foreground-200/40',
  rejected: 'bg-accent-50 text-accent-600 border-accent-200/40',
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

export default function DocumentDetail() {
  const { docId } = useParams<{ docId: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('preview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [doc, setDoc] = useState<KnowledgeDocument | undefined>(docId ? mockDocumentById[docId] : undefined);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!docId) return;
    knowledgeApi.document(docId).then(setDoc).catch(() => undefined);
  }, [docId]);

  const review = async (action: 'approve' | 'reject') => {
    if (!doc) return;
    try {
      const next = await knowledgeApi.reviewDocument(
        doc.id,
        action,
        action === 'approve' ? '从文档详情通过发布' : '请修改后重新提交',
      );
      setDoc(next);
      setActionError('');
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '操作失败');
    }
  };

  if (!doc) {
    return (
      <div className="p-12 text-center">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-background-200/70 flex items-center justify-center">
          <i className="ri-error-warning-line text-xl text-foreground-400"></i>
        </div>
        <p className="text-sm text-foreground-600 font-body">文档不存在或已被删除</p>
        <Link to="/knowledge/spaces" className="text-xs text-primary-600 font-label mt-2 inline-block no-underline hover:underline">返回空间列表</Link>
      </div>
    );
  }

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'preview', label: '文档预览', icon: 'ri-file-text-line' },
    { key: 'versions', label: '版本记录', icon: 'ri-git-branch-line' },
    { key: 'chunks', label: '知识片段', icon: 'ri-stack-line' },
    { key: 'citations', label: '引用记录', icon: 'ri-link-m' },
    { key: 'log', label: '操作日志', icon: 'ri-history-line' },
  ];

  return (
    <div className="p-6">
      {/* Back link */}
      <div className="flex items-center gap-2 mb-4">
        <Link to={`/knowledge/spaces?space=${doc.spaceId}`} className="text-xs text-foreground-500 hover:text-foreground-700 no-underline font-label">
          <i className="ri-arrow-left-line mr-1"></i>返回 {doc.spaceName}
        </Link>
      </div>

      {/* Header */}
      <div className="rounded-lg border border-background-200/70 bg-background-50 p-5 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2 py-0.5 rounded border text-[10px] font-semibold font-label ${statusStyle[doc.status]}`}>
                {statusLabel[doc.status]}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-label ${sensitivityStyles[doc.sensitivity]}`}>
                {sensitivityLabels[doc.sensitivity]}
              </span>
              <span className="text-[10px] font-mono text-foreground-400">v{doc.currentVersion}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground-900 font-heading">{doc.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {doc.status === 'published' && (
              <button type="button" onClick={() => setShowUploadModal(true)} className="px-3 py-1.5 rounded-lg border border-background-200/70 text-xs text-foreground-600 font-label hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-upload-line mr-1"></i>创建新版本
              </button>
            )}
            {doc.status === 'pending_review' && (
              <>
                <button type="button" onClick={() => void review('approve')} className="px-3 py-1.5 rounded-lg bg-secondary-500 text-background-50 text-xs font-medium hover:bg-secondary-600 transition-colors cursor-pointer whitespace-nowrap font-label">
                  <i className="ri-check-line mr-1"></i>通过发布
                </button>
                <button type="button" onClick={() => void review('reject')} className="px-3 py-1.5 rounded-lg border border-background-200/70 text-xs text-foreground-600 font-label hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap">
                  <i className="ri-close-line mr-1"></i>驳回
                </button>
              </>
            )}
          </div>
        </div>
        {actionError && <p className="text-[10px] text-accent-600 font-body mb-3">{actionError}</p>}

        {/* Metadata */}
        <div className="grid grid-cols-4 gap-3 text-[10px]">
          <div>
            <span className="text-foreground-500 font-label">所属空间</span>
            <p className="text-foreground-700 font-body mt-0.5">{doc.spaceName}</p>
          </div>
          <div>
            <span className="text-foreground-500 font-label">知识类型</span>
            <p className="text-foreground-700 font-body mt-0.5">
              {doc.knowledgeType === 'product' ? '产品知识' : doc.knowledgeType === 'policy_sop' ? '政策与 SOP' : doc.knowledgeType === 'risk_compliance' ? '品牌与合规' : '历史案例'}
            </p>
          </div>
          <div>
            <span className="text-foreground-500 font-label">负责人</span>
            <p className="text-foreground-700 font-body mt-0.5">{doc.owner}</p>
          </div>
          <div>
            <span className="text-foreground-500 font-label">最近引用</span>
            <p className="text-foreground-700 font-mono mt-0.5">{doc.recentCitationCount} 次</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 text-[10px] mt-3">
          <div>
            <span className="text-foreground-500 font-label">适用范围</span>
            <p className="text-foreground-700 font-body mt-0.5">{doc.scope}</p>
          </div>
          <div>
            <span className="text-foreground-500 font-label">生效日期</span>
            <p className="text-foreground-700 font-body mt-0.5">{doc.effectiveDate}</p>
          </div>
          <div>
            <span className="text-foreground-500 font-label">失效日期</span>
            <p className="text-foreground-700 font-body mt-0.5">{doc.expiryDate || '未设置'}</p>
          </div>
          <div>
            <span className="text-foreground-500 font-label">来源</span>
            <p className="text-foreground-700 font-body mt-0.5">{doc.source}</p>
          </div>
        </div>
        {doc.tags.length > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            {doc.tags.map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 rounded bg-background-100 text-[10px] text-foreground-500 font-label">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="rounded-lg border border-background-200/70 bg-background-50 overflow-hidden">
        <div className="flex items-center border-b border-background-200/70 px-1 py-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap font-label ${
                activeTab === tab.key
                  ? 'bg-primary-500 text-background-50'
                  : 'text-foreground-500 hover:text-foreground-700'
              }`}
            >
              <i className={`${tab.icon} text-[11px]`}></i>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'preview' && (
            <div>
              <h4 className="text-xs font-semibold text-foreground-700 font-label mb-2">文档摘要</h4>
              <p className="text-xs text-foreground-600 font-body leading-relaxed mb-4">{doc.summary}</p>
              <div className="rounded-lg border border-background-200/70 p-4 bg-background-100">
                <pre className="text-xs text-foreground-700 font-body leading-relaxed whitespace-pre-wrap">{doc.content}</pre>
              </div>
            </div>
          )}

          {activeTab === 'versions' && (
            <div className="space-y-0">
              {doc.versions.map((ver, idx) => (
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
              ))}
            </div>
          )}

          {activeTab === 'chunks' && (
            <div>
              <p className="text-xs text-foreground-600 font-body mb-4">该文档共被解析为 {doc.chunkCount} 个知识片段。系统自动完成切片，管理员无需逐条编辑。</p>
              {Array.from({ length: Math.min(doc.chunkCount, 5) }).map((_, idx) => (
                <div key={idx} className="mb-3 p-3 rounded-lg bg-background-100 border border-background-200/70">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-mono text-foreground-400">#{idx + 1}</span>
                    <span className="text-[10px] text-foreground-500 font-label">片段 {idx + 1}</span>
                  </div>
                  <p className="text-[11px] text-foreground-700 font-body leading-relaxed">
                    文档内容片段 #{idx + 1} —— 完整内容请查看上方「文档预览」页签。
                  </p>
                </div>
              ))}
              {doc.chunkCount > 5 && (
                <p className="text-[10px] text-foreground-400 font-body text-center">…… 还有 {doc.chunkCount - 5} 个片段</p>
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
                  <p className="text-xs text-foreground-600 font-body mb-4">该文档已被 Agent 引用 {doc.recentCitationCount} 次。</p>
                  <div className="space-y-2">
                    {[
                      { eventId: 'case-001', snippet: doc.content.slice(0, 60) + '...', date: '2026-07-14 09:23' },
                      { eventId: 'case-003', snippet: doc.content.slice(30, 90) + '...', date: '2026-07-13 16:45' },
                    ].map((cit, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-background-100 border border-background-200/70">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-foreground-400">{cit.eventId}</span>
                          <span className="text-[10px] text-foreground-500 font-body">{cit.date}</span>
                        </div>
                        <p className="text-[11px] text-foreground-700 font-body">{cit.snippet}</p>
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

      {/* New Version Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowUploadModal(false)}>
          <div className="bg-background-50 rounded-lg w-[480px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-background-200/70">
              <h3 className="text-sm font-semibold text-foreground-900 font-heading">创建新版本</h3>
              <button type="button" onClick={() => setShowUploadModal(false)} className="w-6 h-6 flex items-center justify-center rounded text-foreground-500 hover:text-foreground-700 cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">版本说明</label>
                <textarea className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body resize-none" rows={2} placeholder="描述本次修改的内容" maxLength={500}></textarea>
              </div>
              <div className="rounded-lg border-2 border-dashed border-background-300 bg-background-100 p-8 text-center cursor-pointer hover:border-primary-300 transition-colors">
                <i className="ri-upload-cloud-2-line text-2xl text-foreground-400 block mb-2"></i>
                <p className="text-xs text-foreground-600 font-body">拖拽文件到此处，或点击上传</p>
                <p className="text-[10px] text-foreground-400 font-body mt-1">支持 PDF、DOCX、TXT、Markdown（模拟）</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-background-200/70">
              <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded-lg border border-background-200/70 text-xs text-foreground-600 font-label hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap">取消</button>
              <button type="button" onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded-lg bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap font-label">创建新版本</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockDocuments } from '@/mocks/knowledge';
import type { KnowledgeDocument } from '@/types/knowledge';
import type { ReviewAction } from '@/types/knowledge';
import { knowledgeApi } from '@/services/knowledgeApi';

type ReviewTab = 'pending' | 'submitted' | 'completed';

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

export default function ReviewPage() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(mockDocuments);
  const [activeTab, setActiveTab] = useState<ReviewTab>('pending');
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [drawerAction, setDrawerAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [rejectAction, setRejectAction] = useState('reject');
  const [actionError, setActionError] = useState('');

  const pendingDocs = documents.filter((d) => d.status === 'pending_review');
  const submittedDocs = documents.filter((d) => d.status === 'published' || d.status === 'pending_review' || d.status === 'rejected' || d.status === 'draft');
  const completedDocs = documents.filter((d) => d.status === 'published');

  const displayDocs = activeTab === 'pending' ? pendingDocs : activeTab === 'submitted' ? submittedDocs : completedDocs;

  const openApprove = (doc: KnowledgeDocument) => {
    setSelectedDoc(doc);
    setDrawerAction('approve');
    setReviewComment('');
  };

  const openReject = (doc: KnowledgeDocument) => {
    setSelectedDoc(doc);
    setDrawerAction('reject');
    setReviewComment('');
    setRejectAction('reject');
  };

  const loadDocuments = async () => {
    try {
      setDocuments(await knowledgeApi.documents());
    } catch {
      // Keep bundled demo data available while the local API is offline.
    }
  };

  useEffect(() => {
    void loadDocuments();
  }, []);

  const handleApprove = async () => {
    if (!selectedDoc) return;
    try {
      await knowledgeApi.reviewDocument(selectedDoc.id, 'approve', reviewComment);
      setSelectedDoc(null);
      setDrawerAction(null);
      setActionError('');
      await loadDocuments();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '审核失败');
    }
  };

  const handleReject = async () => {
    if (!selectedDoc) return;
    if (!reviewComment.trim() && rejectAction !== 'save_draft') {
      setActionError('请填写驳回或补充说明');
      return;
    }
    try {
      await knowledgeApi.reviewDocument(selectedDoc.id, rejectAction as ReviewAction, reviewComment);
      setSelectedDoc(null);
      setDrawerAction(null);
      setActionError('');
      await loadDocuments();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '审核失败');
    }
  };

  const knowledgeTypeLabel: Record<string, string> = {
    product: '产品知识',
    policy_sop: '政策 SOP',
    risk_compliance: '合规规则',
    historical_case: '历史案例',
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground-900 font-heading">发布审核</h3>
          <p className="text-[11px] text-foreground-500 font-body mt-0.5">
            {pendingDocs.length} 篇文档等待审核 · 涉及赔偿、合规、法务和对外口径的知识不得跳过人工审核
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4">
        {([
          { key: 'pending' as const, label: '待我审核', count: pendingDocs.length },
          { key: 'submitted' as const, label: '我提交的', count: submittedDocs.length },
          { key: 'completed' as const, label: '已完成', count: completedDocs.length },
        ]).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap font-label ${
              activeTab === tab.key
                ? 'bg-primary-500 text-background-50'
                : 'bg-background-50 border border-background-200/70 text-foreground-600 hover:bg-background-100'
            }`}
          >
            {tab.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold font-mono ${
              activeTab === tab.key ? 'bg-background-50/20 text-background-50' : 'bg-background-200/70 text-foreground-500'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Review Table */}
      <div className="rounded-lg border border-background-200/70 bg-background-50 overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-background-100 border-b border-background-200/70 text-[10px] font-semibold text-foreground-500 uppercase tracking-wider font-label">
          <span className="col-span-3">文档</span>
          <span className="col-span-1">变更类型</span>
          <span className="col-span-2">知识空间</span>
          <span className="col-span-1">敏感级别</span>
          <span className="col-span-1.5">提交人</span>
          <span className="col-span-1.5">计划生效</span>
          <span className="col-span-1">提交时间</span>
          <span className="col-span-1"></span>
        </div>

        {displayDocs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-background-200/70 flex items-center justify-center">
              <i className="ri-check-double-line text-lg text-foreground-400"></i>
            </div>
            <p className="text-xs text-foreground-500 font-body">
              {activeTab === 'pending' ? '暂无待审核文档' : activeTab === 'submitted' ? '暂无已提交文档' : '暂无已完成审核的文档'}
            </p>
          </div>
        ) : (
          displayDocs.map((doc) => (
            <div key={doc.id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-background-200/40 last:border-b-0 items-center hover:bg-background-100/50 transition-colors">
              <div className="col-span-3 flex items-center gap-2.5 min-w-0">
                <i className="ri-file-text-line text-foreground-400 flex-shrink-0"></i>
                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="text-xs font-medium text-foreground-800 font-body truncate bg-transparent border-none cursor-pointer hover:text-primary-600 transition-colors text-left p-0"
                >
                  {doc.title}
                </button>
              </div>
              <span className="col-span-1 text-[10px] text-foreground-500 font-body">{doc.status === 'pending_review' ? '首次提交' : '版本更新'}</span>
              <span className="col-span-2 text-[10px] text-foreground-500 font-body truncate">{doc.spaceName}</span>
              <span className={`col-span-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-label w-fit ${sensitivityStyles[doc.sensitivity]}`}>
                {sensitivityLabels[doc.sensitivity]}
              </span>
              <span className="col-span-1.5 text-[10px] text-foreground-500 font-body truncate">{doc.owner}</span>
              <span className="col-span-1.5 text-[10px] text-foreground-500 font-body">{doc.effectiveDate}</span>
              <span className="col-span-1 text-[10px] text-foreground-500 font-body">{doc.updatedAt.slice(5)}</span>
              <div className="col-span-1 flex items-center gap-1">
                {activeTab === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => openApprove(doc)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg bg-secondary-500 text-background-50 hover:bg-secondary-600 transition-colors cursor-pointer"
                      title="通过并发布"
                    >
                      <i className="ri-check-line text-xs"></i>
                    </button>
                    <button
                      type="button"
                      onClick={() => openReject(doc)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-background-200/70 text-foreground-500 hover:text-accent-600 hover:border-accent-200 transition-colors cursor-pointer"
                      title="驳回"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </button>
                  </>
                )}
                {activeTab === 'completed' && (
                  <span className="text-[10px] text-secondary-600 font-label">
                    <i className="ri-check-line mr-0.5"></i>已发布
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Review Drawer */}
      {selectedDoc && drawerAction === 'approve' && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedDoc(null)}>
          <div className="w-[480px] h-full bg-background-50 overflow-y-auto border-l border-background-200/70" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-background-50 z-10 p-5 border-b border-background-200/70">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground-900 font-heading">审核文档</h3>
                <button type="button" onClick={() => setSelectedDoc(null)} className="w-6 h-6 flex items-center justify-center rounded text-foreground-500 hover:text-foreground-700 cursor-pointer">
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <p className="text-xs font-medium text-foreground-700 font-body mb-1">{selectedDoc.title}</p>
              <span className="text-[10px] text-foreground-500 font-mono">v{selectedDoc.currentVersion} · {selectedDoc.owner} 提交</span>
            </div>

            <div className="p-5 space-y-4">
              {/* Document Summary */}
              <div>
                <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-2">文档摘要</h4>
                <p className="text-xs text-foreground-700 font-body leading-relaxed">{selectedDoc.summary}</p>
              </div>

              {/* Version Change */}
              {selectedDoc.versions.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-2">版本变化</h4>
                  <div className="rounded-lg bg-background-100 border border-background-200/70 p-3">
                    <p className="text-xs text-foreground-700 font-body">{selectedDoc.versions[0]?.changeSummary}</p>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div>
                <h4 className="text-[11px] font-semibold text-foreground-500 uppercase tracking-wider font-label mb-2">元数据完整性</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <i className="ri-check-line text-secondary-500 text-xs"></i>
                    <span className="text-foreground-600 font-body">所属空间：{selectedDoc.spaceName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="ri-check-line text-secondary-500 text-xs"></i>
                    <span className="text-foreground-600 font-body">知识类型：{knowledgeTypeLabel[selectedDoc.knowledgeType]}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="ri-check-line text-secondary-500 text-xs"></i>
                    <span className="text-foreground-600 font-body">负责人：{selectedDoc.owner}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="ri-check-line text-secondary-500 text-xs"></i>
                    <span className="text-foreground-600 font-body">生效日期：{selectedDoc.effectiveDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <i className="ri-check-line text-secondary-500 text-xs"></i>
                    <span className="text-foreground-600 font-body">敏感级别：{sensitivityLabels[selectedDoc.sensitivity]}</span>
                  </div>
                  {selectedDoc.expiryDate && (
                    <div className="flex items-center gap-1.5">
                      <i className="ri-check-line text-secondary-500 text-xs"></i>
                      <span className="text-foreground-600 font-body">失效日期：{selectedDoc.expiryDate}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Risk Warning */}
              {(selectedDoc.sensitivity === 'sensitive' || selectedDoc.tags?.some((t: string) => ['退款', '赔偿', '合规', '法务', '数据安全'].includes(t))) && (
                <div className="rounded-lg bg-accent-50/50 border border-accent-200/40 p-3">
                  <div className="flex items-start gap-2">
                    <i className="ri-alert-line text-accent-500 text-sm mt-0.5"></i>
                    <div>
                      <p className="text-[11px] font-semibold text-accent-700 font-label">高风险知识 · 必须由指定审核人确认，不可跳过审核</p>
                      <p className="text-[10px] text-foreground-600 font-body leading-relaxed mt-0.5">
                        涉及赔偿、合规、法务和对外口径的知识，须经人工审核确认方可发布。AI 不可自动通过。
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Comment */}
              <div>
                <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">审核意见</label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body resize-none"
                  rows={3}
                  placeholder="可选，填写审核意见..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  maxLength={500}
                ></textarea>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="sticky bottom-0 bg-background-50 border-t border-background-200/70 p-5 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedDoc(null)} className="px-4 py-2 rounded-lg border border-background-200/70 text-xs text-foreground-600 font-label hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap">取消</button>
              {actionError && <p className="mr-auto text-[10px] text-accent-600 font-body">{actionError}</p>}
              <button type="button" onClick={() => void handleApprove()} className="px-4 py-2 rounded-lg bg-secondary-500 text-background-50 text-xs font-medium hover:bg-secondary-600 transition-colors cursor-pointer whitespace-nowrap font-label">
                <i className="ri-check-line mr-1"></i>通过并发布
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Drawer */}
      {selectedDoc && drawerAction === 'reject' && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedDoc(null)}>
          <div className="w-[480px] h-full bg-background-50 overflow-y-auto border-l border-background-200/70" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-background-50 z-10 p-5 border-b border-background-200/70">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground-900 font-heading">驳回审核</h3>
                <button type="button" onClick={() => setSelectedDoc(null)} className="w-6 h-6 flex items-center justify-center rounded text-foreground-500 hover:text-foreground-700 cursor-pointer">
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <p className="text-xs font-medium text-foreground-700 font-body">{selectedDoc.title}</p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">驳回原因 <span className="text-accent-500">*</span></label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body resize-none"
                  rows={4}
                  placeholder="请填写驳回原因，帮助文档负责人理解需要改进的部分..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  maxLength={500}
                ></textarea>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-2">驳回后操作</label>
                <div className="space-y-1.5">
                  {[
                    { value: 'reject', label: '驳回并返回草稿', desc: '文档状态变为草稿，可修改后重新提交' },
                    { value: 'request_info', label: '要求补充元数据', desc: '文档保持待审核，但标记为缺少必要信息' },
                    { value: 'save_draft', label: '先保存为草稿', desc: '不驳回，暂时存入草稿箱等待进一步处理' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        rejectAction === opt.value
                          ? 'border-accent-300 bg-accent-50/30'
                          : 'border-background-200/70 bg-background-50 hover:bg-background-100'
                      }`}
                    >
                      <input type="radio" name="reject_action" value={opt.value} className="w-3.5 h-3.5 mt-0.5 accent-accent-500 cursor-pointer" checked={rejectAction === opt.value} onChange={(e) => setRejectAction(e.target.value)} />
                      <div>
                        <p className="text-xs font-semibold text-foreground-700 font-label">{opt.label}</p>
                        <p className="text-[10px] text-foreground-500 font-body">{opt.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-background-50 border-t border-background-200/70 p-5 flex justify-end gap-2">
              <button type="button" onClick={() => setSelectedDoc(null)} className="px-4 py-2 rounded-lg border border-background-200/70 text-xs text-foreground-600 font-label hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap">取消</button>
              {actionError && <p className="mr-auto text-[10px] text-accent-600 font-body">{actionError}</p>}
              <button type="button" onClick={() => void handleReject()} className="px-4 py-2 rounded-lg bg-accent-500 text-background-50 text-xs font-medium hover:bg-accent-600 transition-colors cursor-pointer whitespace-nowrap font-label">
                <i className="ri-close-line mr-1"></i>确认驳回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

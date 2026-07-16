import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { mockOverviewStats, mockDocuments, mockRecentCitations } from '@/mocks/knowledge';
import { knowledgeApi, type RecentCitation } from '@/services/knowledgeApi';
import type { KnowledgeDocument, KnowledgeOverviewStats } from '@/types/knowledge';

export default function KnowledgeOverview() {
  const [stats, setStats] = useState<KnowledgeOverviewStats>(mockOverviewStats);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(mockDocuments);
  const [recentCitations, setRecentCitations] = useState<RecentCitation[]>(mockRecentCitations);
  const [usingLiveApi, setUsingLiveApi] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const loadKnowledgeOverview = async () => {
    try {
      const [nextStats, nextDocuments, nextCitations] = await Promise.all([
        knowledgeApi.overview(),
        knowledgeApi.documents(),
        knowledgeApi.recentCitations(),
      ]);
      setStats(nextStats);
      setDocuments(nextDocuments);
      setRecentCitations(nextCitations);
      setUsingLiveApi(true);
    } catch {
      setUsingLiveApi(false);
    }
  };

  useEffect(() => {
    void loadKnowledgeOverview();
  }, []);

  const statCards = [
    { label: '已发布', value: stats.publishedCount, icon: 'ri-file-text-line', color: 'bg-secondary-50 text-secondary-700', border: 'border-secondary-200/40', filter: 'published' },
    { label: '待审核', value: stats.pendingReviewCount, icon: 'ri-check-double-line', color: 'bg-accent-50 text-accent-700', border: 'border-accent-200/40', filter: 'pending_review', link: '/knowledge/review' },
    { label: '解析失败', value: stats.parseFailedCount, icon: 'ri-error-warning-line', color: 'bg-accent-100 text-accent-700', border: 'border-accent-200/40', filter: 'parse_failed' },
    { label: '30 天内过期', value: stats.expiringSoonCount, icon: 'ri-timer-line', color: 'bg-secondary-50 text-secondary-700', border: 'border-secondary-200/40', filter: 'expiring' },
    { label: '近 7 天引用', value: stats.recentCitations7d, icon: 'ri-link-m', color: 'bg-primary-50 text-primary-700', border: 'border-primary-200/40', filter: 'cited' },
  ];

  const spaceTypeLabels: Record<string, string> = {
    product: '产品知识',
    policy_sop: '政策与 SOP',
    risk_compliance: '品牌与合规',
    historical_case: '历史案例',
  };

  const spaceTypeIcons: Record<string, string> = {
    product: 'ri-smartphone-line',
    policy_sop: 'ri-file-list-3-line',
    risk_compliance: 'ri-shield-line',
    historical_case: 'ri-history-line',
  };

  const spaceTypeColors: Record<string, string> = {
    product: 'bg-primary-50 text-primary-700',
    policy_sop: 'bg-secondary-50 text-secondary-700',
    risk_compliance: 'bg-accent-50 text-accent-700',
    historical_case: 'bg-primary-50 text-primary-600',
  };

  // Docs that need attention: pending_review, parse_failed, expiring soon
  const attentionDocs = documents.filter(
    (d) => d.status === 'pending_review' || d.status === 'parse_failed' || d.status === 'expired'
  );

  const statusLabel: Record<string, string> = {
    pending_review: '待审核',
    parse_failed: '解析失败',
    expired: '已过期',
  };

  const statusStyle: Record<string, string> = {
    pending_review: 'bg-accent-50 text-accent-700 border-accent-200',
    parse_failed: 'bg-accent-100 text-accent-700 border-accent-200',
    expired: 'bg-foreground-100 text-foreground-500 border-foreground-200',
  };

  const problemLabel: Record<string, string> = {
    pending_review: '等待审核发布',
    parse_failed: '文档解析失败，需重新上传',
    expired: '文档已过期，建议归档或更新',
  };

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground-900 font-heading">知识概览</h3>
          <span className={`px-2 py-0.5 rounded text-[10px] font-label ${usingLiveApi ? 'bg-secondary-50 text-secondary-700' : 'bg-background-200 text-foreground-500'}`}>
            {usingLiveApi ? '后端已连接' : '演示数据'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap font-label"
          >
            <i className="ri-upload-cloud-line text-sm"></i>上传知识
          </button>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-background-300 bg-background-50 text-foreground-700 text-xs font-medium hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap font-label"
          >
            <i className="ri-add-line text-sm"></i>新建文本
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-lg border ${card.border} bg-background-50 p-4 ${card.link ? 'cursor-pointer hover:bg-background-100 transition-colors' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.color}`}>
                <i className={`${card.icon} text-sm`}></i>
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground-900 font-heading">{card.value}</p>
            <p className="text-[11px] text-foreground-500 font-label mt-0.5">{card.label}</p>
            {card.link && (
              <Link to={card.link} className="inline-flex items-center gap-1 text-[10px] text-primary-600 font-label mt-2 no-underline hover:underline">
                去审核 <i className="ri-arrow-right-line text-[9px]"></i>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Knowledge Spaces */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-foreground-800 font-heading uppercase tracking-wider">知识空间</h3>
          <Link
            to="/knowledge/spaces"
            className="text-[11px] text-primary-600 font-label no-underline hover:underline"
          >
            查看全部
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {stats.spaces.map((space) => (
            <Link
              key={space.id}
              to={`/knowledge/spaces?space=${space.id}`}
              className="rounded-lg border border-background-200/70 bg-background-50 p-4 no-underline hover:border-primary-200/70 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${spaceTypeColors[space.knowledgeType]}`}>
                    <i className={`${spaceTypeIcons[space.knowledgeType]} text-sm`}></i>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground-800 font-heading group-hover:text-primary-600 transition-colors">{space.name}</h4>
                    <p className="text-[10px] text-foreground-500 font-body">{spaceTypeLabels[space.knowledgeType]}</p>
                  </div>
                </div>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-label ${
                  space.status === 'active' ? 'bg-secondary-50 text-secondary-600' : 'bg-foreground-100 text-foreground-500'
                }`}>
                  {space.status === 'active' ? '活跃' : '已归档'}
                </span>
              </div>
              <p className="text-[11px] text-foreground-600 font-body leading-relaxed mb-3">{space.description}</p>
              <div className="flex items-center gap-4 text-[10px] text-foreground-500 font-body">
                <span>
                  <i className="ri-file-line mr-1 text-foreground-400"></i>
                  {space.documentCount} 份文档
                </span>
                <span>
                  <i className="ri-check-line mr-1 text-foreground-400"></i>
                  已发布 {space.publishedCount}
                </span>
                {space.publishedCount < space.documentCount && (
                  <span className="text-accent-600">
                    <i className="ri-time-line mr-1"></i>
                    待审核 {space.documentCount - space.publishedCount}
                  </span>
                )}
                <span className="ml-auto text-foreground-400">
                  <i className="ri-history-line mr-1"></i>
                  {space.updatedAt.slice(5)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Needs Attention */}
      <div>
        <h3 className="text-xs font-semibold text-foreground-800 font-heading uppercase tracking-wider mb-3">需要处理</h3>
        <div className="rounded-lg border border-background-200/70 bg-background-50 overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-background-100 border-b border-background-200/70 text-[10px] font-semibold text-foreground-500 uppercase tracking-wider font-label">
            <span className="col-span-5">文档</span>
            <span className="col-span-2">所属空间</span>
            <span className="col-span-2">问题</span>
            <span className="col-span-2">负责人</span>
            <span className="col-span-1"></span>
          </div>
          {attentionDocs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-foreground-500 font-body">暂无需要处理的文档</p>
            </div>
          ) : (
            attentionDocs.map((doc) => (
              <div key={doc.id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-background-200/40 last:border-b-0 items-center hover:bg-background-100/50 transition-colors">
                <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                  <i className={`text-foreground-400 flex-shrink-0 ${doc.status === 'parse_failed' ? 'ri-error-warning-line text-accent-500' : 'ri-file-text-line'}`}></i>
                  <span className="text-xs font-medium text-foreground-800 font-body truncate">{doc.title}</span>
                </div>
                <span className="col-span-2 text-[10px] text-foreground-500 font-body">{doc.spaceName}</span>
                <span className={`col-span-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-label w-fit border ${statusStyle[doc.status]}`}>
                  {statusLabel[doc.status]}
                </span>
                <span className="col-span-2 text-[10px] text-foreground-500 font-body">{doc.owner}</span>
                <div className="col-span-1 flex justify-end">
                  <Link
                    to={`/knowledge/document/${doc.id}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-background-200/70 text-foreground-500 hover:text-primary-600 hover:border-primary-200 transition-colors cursor-pointer no-underline"
                    title="查看详情"
                  >
                    <i className="ri-arrow-right-line text-xs"></i>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Agent Citations */}
      <div>
        <h3 className="text-xs font-semibold text-foreground-800 font-heading uppercase tracking-wider mb-3">最近被 Agent 引用</h3>
        <div className="rounded-lg border border-background-200/70 bg-background-50 overflow-hidden">
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-background-100 border-b border-background-200/70 text-[10px] font-semibold text-foreground-500 uppercase tracking-wider font-label">
            <span className="col-span-4">事件</span>
            <span className="col-span-3">引用文档</span>
            <span className="col-span-2">引用次数</span>
            <span className="col-span-3">最后引用</span>
          </div>
          {recentCitations.map((rc) => (
            <div key={rc.id} className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b border-background-200/40 last:border-b-0 items-center hover:bg-background-100/50 transition-colors">
              <span className="col-span-4 text-[10px] text-foreground-700 font-body truncate" title={rc.eventTitle}>{rc.eventTitle}</span>
              <Link to={`/knowledge/document/${rc.documentId}`} className="col-span-3 text-[10px] text-primary-600 font-body truncate no-underline hover:underline" title={rc.documentTitle}>{rc.documentTitle}</Link>
              <span className="col-span-2 text-[10px] font-mono text-foreground-600">{rc.citationCount} 次</span>
              <span className="col-span-3 text-[10px] text-foreground-500 font-mono">{rc.lastCitedAt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal — Step 1: Content */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onCreated={() => void loadKnowledgeOverview()}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [uploadType, setUploadType] = useState<'file' | 'text'>('file');
  const [files, setFiles] = useState<{ name: string; status: string }[]>([]);
  const [textTitle, setTextTitle] = useState('');
  const [textContent, setTextContent] = useState('');

  // Step 2 form
  const [spaceId, setSpaceId] = useState('');
  const [knowledgeType, setKnowledgeType] = useState('');
  const [owner, setOwner] = useState('');
  const [scope, setScope] = useState('');
  const [productLine, setProductLine] = useState('');
  const [tags, setTags] = useState('');
  const [source, setSource] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [sensitivity, setSensitivity] = useState('internal');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileDrop = () => {
    setFiles([
      { name: '售后管理规范_v3.pdf', status: 'ready' },
    ]);
  };

  const handleStartProcessing = async (action: 'process' | 'draft' = 'process') => {
    const newErrors: Record<string, string> = {};
    if (!spaceId) newErrors.spaceId = '请选择所属空间';
    if (!knowledgeType) newErrors.knowledgeType = '请选择知识类型';
    if (!owner) newErrors.owner = '请填写负责人';
    if (!scope) newErrors.scope = '请填写适用范围';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const title = uploadType === 'text' ? textTitle.trim() : files[0]?.name || '';
    const content = uploadType === 'text' ? textContent.trim() : `上传文件：${files[0]?.name || ''}。等待后端文件解析能力接入。`;
    if (!title) newErrors.content = uploadType === 'text' ? '请填写文档标题' : '请选择一个文件';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await knowledgeApi.createDocument({
        title,
        content,
        fileName: uploadType === 'file' ? files[0]?.name : undefined,
        spaceId,
        knowledgeType,
        owner,
        scope,
        productLine,
        tags,
        source,
        effectiveDate,
        expiryDate,
        sensitivity,
        action,
      });
      onCreated();
      onClose();
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : '提交失败，请确认本地 API 已启动' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="bg-background-50 rounded-lg w-[720px] max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header with steps */}
        <div className="flex items-center justify-between p-5 border-b border-background-200/70">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-foreground-900 font-heading">上传知识</h3>
            <div className="flex items-center gap-1.5">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${step === 1 ? 'bg-primary-500 text-background-50' : 'bg-secondary-50 text-secondary-700'}`}>1</span>
              <span className={`text-[11px] font-label ${step === 1 ? 'text-foreground-700' : 'text-foreground-400'}`}>选择内容</span>
              <i className="ri-arrow-right-s-line text-foreground-400 text-xs"></i>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono ${step === 2 ? 'bg-primary-500 text-background-50' : 'bg-foreground-100 text-foreground-500'}`}>2</span>
              <span className={`text-[11px] font-label ${step === 2 ? 'text-foreground-700' : 'text-foreground-400'}`}>补充信息</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded text-foreground-500 hover:text-foreground-700 cursor-pointer">
            <i className="ri-close-line"></i>
          </button>
        </div>

        {step === 1 ? (
          <>
            <div className="p-5">
              {/* Toggle upload type */}
              <div className="flex items-center gap-1 bg-background-100 rounded-lg p-1 mb-4 w-fit">
                <button
                  type="button"
                  onClick={() => setUploadType('file')}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap font-label ${
                    uploadType === 'file' ? 'bg-background-50 text-foreground-800 shadow-sm' : 'text-foreground-500 hover:text-foreground-700'
                  }`}
                >
                  上传文件
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('text')}
                  className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap font-label ${
                    uploadType === 'text' ? 'bg-background-50 text-foreground-800 shadow-sm' : 'text-foreground-500 hover:text-foreground-700'
                  }`}
                >
                  新建文本
                </button>
              </div>

              {uploadType === 'file' ? (
                <>
                  {/* Drop zone */}
                  <div
                    onClick={handleFileDrop}
                    className="rounded-lg border-2 border-dashed border-background-300 bg-background-100 p-10 text-center cursor-pointer hover:border-primary-300 transition-colors"
                  >
                    <i className="ri-upload-cloud-2-line text-3xl text-foreground-400 block mb-3"></i>
                    <p className="text-xs text-foreground-600 font-body mb-1">拖拽文件到此处，或点击上传</p>
                    <p className="text-[10px] text-foreground-400 font-body">支持 PDF、DOCX、TXT、Markdown（模拟）</p>
                  </div>

                  {/* File list */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-background-100 border border-background-200/70">
                          <i className="ri-file-pdf-line text-accent-500 text-lg"></i>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-foreground-700 font-body truncate">{f.name}</p>
                            <p className="text-[10px] text-secondary-600 font-body">
                              <i className="ri-check-line mr-1"></i>已就绪
                            </p>
                          </div>
                          <button type="button" className="w-6 h-6 flex items-center justify-center rounded text-foreground-400 hover:text-accent-500 cursor-pointer">
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">文档标题</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
                      placeholder="输入文档标题"
                      value={textTitle}
                      onChange={(e) => setTextTitle(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">正文内容</label>
                    <textarea
                      className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body resize-none"
                      rows={10}
                      placeholder="输入 Markdown 格式的正文内容..."
                      value={textContent}
                      onChange={(e) => setTextContent(e.target.value)}
                      maxLength={500}
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-5 border-t border-background-200/70">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-background-200/70 text-xs text-foreground-600 font-label hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap">取消</button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap font-label"
              >
                下一步
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-5 space-y-4">
              {/* Required fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">所属空间 <span className="text-accent-500">*</span></label>
                  <select
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-foreground-700 focus:border-primary-400 outline-none font-body cursor-pointer ${errors.spaceId ? 'border-accent-400 bg-accent-50/30' : 'border-background-200/70 bg-background-50'}`}
                    value={spaceId}
                    onChange={(e) => setSpaceId(e.target.value)}
                  >
                    <option value="">请选择</option>
                    <option value="space-product">产品知识</option>
                    <option value="space-policy">客服政策与 SOP</option>
                    <option value="space-compliance">品牌与合规规则</option>
                    <option value="space-history">历史事件案例</option>
                  </select>
                  {errors.spaceId && <p className="text-[10px] text-accent-600 mt-0.5">{errors.spaceId}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">知识类型 <span className="text-accent-500">*</span></label>
                  <select
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-foreground-700 focus:border-primary-400 outline-none font-body cursor-pointer ${errors.knowledgeType ? 'border-accent-400 bg-accent-50/30' : 'border-background-200/70 bg-background-50'}`}
                    value={knowledgeType}
                    onChange={(e) => setKnowledgeType(e.target.value)}
                  >
                    <option value="">请选择</option>
                    <option value="product">产品知识</option>
                    <option value="policy_sop">政策与 SOP</option>
                    <option value="risk_compliance">品牌与合规</option>
                    <option value="historical_case">历史案例</option>
                  </select>
                  {errors.knowledgeType && <p className="text-[10px] text-accent-600 mt-0.5">{errors.knowledgeType}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">负责人 <span className="text-accent-500">*</span></label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body ${errors.owner ? 'border-accent-400 bg-accent-50/30' : 'border-background-200/70 bg-background-50'}`}
                    placeholder="输入负责人姓名"
                    value={owner}
                    onChange={(e) => setOwner(e.target.value)}
                  />
                  {errors.owner && <p className="text-[10px] text-accent-600 mt-0.5">{errors.owner}</p>}
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">适用范围 <span className="text-accent-500">*</span></label>
                  <input
                    type="text"
                    className={`w-full px-3 py-2 rounded-lg border text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body ${errors.scope ? 'border-accent-400 bg-accent-50/30' : 'border-background-200/70 bg-background-50'}`}
                    placeholder="例如：客服、运营团队"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                  />
                  {errors.scope && <p className="text-[10px] text-accent-600 mt-0.5">{errors.scope}</p>}
                </div>
              </div>

              {/* Optional fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">产品/业务线</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
                    placeholder="例如：支付、会员"
                    value={productLine}
                    onChange={(e) => setProductLine(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">标签</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
                    placeholder="逗号分隔多个标签"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">来源</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
                    placeholder="例如：内部制定"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">敏感级别</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 focus:border-primary-400 outline-none font-body cursor-pointer"
                    value={sensitivity}
                    onChange={(e) => setSensitivity(e.target.value)}
                  >
                    <option value="public">公开</option>
                    <option value="internal">内部</option>
                    <option value="restricted">受限</option>
                    <option value="sensitive">敏感</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">生效时间</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
                    value={effectiveDate}
                    onChange={(e) => setEffectiveDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">失效时间</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5 border-t border-background-200/70">
              <button type="button" onClick={() => setStep(1)} className="px-4 py-2 rounded-lg border border-background-200/70 text-xs text-foreground-600 font-label hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap">上一步</button>
              {errors.form && <p className="mr-auto text-[10px] text-accent-600 font-body">{errors.form}</p>}
              <button type="button" disabled={isSubmitting} onClick={() => void handleStartProcessing('draft')} className="px-4 py-2 rounded-lg border border-background-200/70 text-xs text-foreground-600 font-label hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50">保存草稿</button>
              <button type="button" disabled={isSubmitting} onClick={() => void handleStartProcessing('process')} className="px-4 py-2 rounded-lg bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap font-label disabled:opacity-50">
                {isSubmitting ? '正在提交...' : '开始处理'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

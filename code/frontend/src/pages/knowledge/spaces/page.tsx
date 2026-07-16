import { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { mockSpaces, mockDocuments } from '@/mocks/knowledge';
import type { KnowledgeSpace, KnowledgeDocument } from '@/types/knowledge';
import { knowledgeApi } from '@/services/knowledgeApi';
import DocumentDetailDrawer from '@/pages/knowledge/components/DocumentDetailDrawer';
import SpaceSettingsDrawer from '@/pages/knowledge/components/SpaceSettingsDrawer';

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

const statusLabel: Record<string, string> = {
  published: '已发布',
  pending_review: '待审核',
  draft: '草稿',
  parsing: '解析中',
  parse_failed: '解析失败',
  expired: '已过期',
  deprecated: '已停用',
  archived: '已归档',
};

const statusStyle: Record<string, string> = {
  published: 'bg-secondary-50 text-secondary-700',
  pending_review: 'bg-accent-50 text-accent-700',
  draft: 'bg-foreground-100 text-foreground-600',
  parsing: 'bg-primary-50 text-primary-600',
  parse_failed: 'bg-accent-100 text-accent-700',
  expired: 'bg-foreground-100 text-foreground-500',
  deprecated: 'bg-foreground-100 text-foreground-500',
  archived: 'bg-foreground-100 text-foreground-500',
};

export default function KnowledgeSpaces() {
  const [searchParams] = useSearchParams();
  const selectedSpaceId = searchParams.get('space');
  const [spaces, setSpaces] = useState<KnowledgeSpace[]>(mockSpaces);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(mockDocuments);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createType, setCreateType] = useState<KnowledgeSpace['knowledgeType']>('product');
  const [createOwner, setCreateOwner] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [formError, setFormError] = useState('');

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const currentSpace = spaces.find((s) => s.id === selectedSpaceId);

  const spaceDocs = selectedSpaceId
    ? documents.filter((d) => d.spaceId === selectedSpaceId)
    : [];

  const filteredDocs = spaceDocs.filter((d) => {
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    if (filterType !== 'all' && d.knowledgeType !== filterType) return false;
    if (searchQuery && !d.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Action menu
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActionMenuId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadKnowledgeData = async () => {
    try {
      const [nextSpaces, nextDocuments] = await Promise.all([
        knowledgeApi.spaces(),
        knowledgeApi.documents(),
      ]);
      setSpaces(nextSpaces);
      setDocuments(nextDocuments);
    } catch {
      // Keep Readdy's bundled demo data available when the local API is offline.
    }
  };

  useEffect(() => {
    void loadKnowledgeData();
  }, []);

  const handleCreateSpace = async () => {
    if (!createName.trim() || !createOwner.trim()) {
      setFormError('请填写空间名称和负责人');
      return;
    }
    try {
      await knowledgeApi.createSpace({
        name: createName.trim(),
        description: createDescription.trim(),
        knowledgeType: createType,
        owner: createOwner.trim(),
      });
      setShowCreate(false);
      setFormError('');
      setCreateName('');
      setCreateOwner('');
      setCreateDescription('');
      await loadKnowledgeData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : '创建失败');
    }
  };

  const handleDocumentAction = async (document: KnowledgeDocument, label: string) => {
    setActionMenuId(null);
    if (label === '提交审核') {
      try {
        await knowledgeApi.submitDocument(document.id);
        await loadKnowledgeData();
      } catch (error) {
        setFormError(error instanceof Error ? error.message : '提交审核失败');
      }
    }
  };

  const getActionsForStatus = (status: string) => {
    const all = [
      { label: '编辑元数据', icon: 'ri-edit-line', enabled: true },
      { label: '创建新版本', icon: 'ri-git-branch-line', enabled: status === 'published' },
      { label: '检索测试', icon: 'ri-search-eye-line', enabled: status === 'published' || status === 'pending_review' },
      { label: '提交审核', icon: 'ri-send-plane-line', enabled: status === 'draft' || status === 'pending_info' },
      { label: '停用', icon: 'ri-pause-circle-line', enabled: status === 'published' },
      { label: '归档', icon: 'ri-archive-line', enabled: status === 'published' || status === 'expired' },
    ];
    return all;
  };

  return (
    <div className="p-6">
      {/* Back / header */}
      {!selectedSpaceId ? (
        <>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-foreground-900 font-heading">知识空间</h3>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap font-label"
            >
              <i className="ri-add-line text-sm"></i>创建空间
            </button>
          </div>

          {/* Spaces Grid */}
          <div className="grid grid-cols-2 gap-3">
            {spaces.map((space) => (
              <Link
                key={space.id}
                to={`?space=${space.id}`}
                className="rounded-lg border border-background-200/70 bg-background-50 p-5 no-underline hover:border-primary-200/70 transition-colors cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${spaceTypeColors[space.knowledgeType]}`}>
                      <i className={`${spaceTypeIcons[space.knowledgeType]} text-base`}></i>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground-800 font-heading group-hover:text-primary-600 transition-colors">{space.name}</h4>
                      <p className="text-[10px] text-foreground-500 font-body mt-0.5">{space.owner}</p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-s-line text-foreground-400 group-hover:text-primary-500 transition-colors"></i>
                </div>
                <p className="text-xs text-foreground-600 font-body leading-relaxed mb-3">{space.description}</p>
                <div className="flex items-center gap-4 text-[10px] text-foreground-500 font-body">
                  <span>{space.documentCount} 份文档 · 已发布 {space.publishedCount}</span>
                  <span className="ml-auto">{space.updatedAt.slice(5)}</span>
                </div>
              </Link>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Space Detail Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Link to="/knowledge/spaces" className="text-xs text-foreground-500 hover:text-foreground-700 no-underline font-label">
                  <i className="ri-arrow-left-line mr-1"></i>知识空间
                </Link>
                <span className="text-foreground-400 text-xs">·</span>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded flex items-center justify-center ${spaceTypeColors[currentSpace?.knowledgeType || 'product']}`}>
                    <i className={`${spaceTypeIcons[currentSpace?.knowledgeType || 'product']} text-[10px]`}></i>
                  </div>
                  <span className="text-xs font-semibold text-foreground-800 font-label">{currentSpace?.name}</span>
                </div>
              </div>
              <p className="text-[11px] text-foreground-500 font-body">{currentSpace?.description}</p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-foreground-500 font-body">
                <span><i className="ri-user-line mr-1 text-foreground-400"></i>{currentSpace?.owner}</span>
                <span><i className="ri-team-line mr-1 text-foreground-400"></i>{currentSpace?.visibleTeams.length} 个可见团队</span>
                <span><i className="ri-file-line mr-1 text-foreground-400"></i>{currentSpace?.documentCount} 份文档</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setShowSettings(true)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-background-200/70 text-foreground-500 hover:text-foreground-700 hover:bg-background-100 transition-colors cursor-pointer" title="空间设置">
                <i className="ri-settings-3-line text-sm"></i>
              </button>
              <button type="button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap font-label">
                <i className="ri-upload-cloud-line text-sm"></i>上传知识
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-[10px] text-foreground-500 font-label">筛选：</span>
            {[
              { value: 'all', label: '全部状态' },
              { value: 'published', label: '已发布' },
              { value: 'pending_review', label: '待审核' },
              { value: 'draft', label: '草稿' },
              { value: 'parse_failed', label: '解析失败' },
              { value: 'expired', label: '已过期' },
            ].map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilterStatus(f.value)}
                className={`px-2.5 py-1 rounded text-[10px] font-medium transition-colors cursor-pointer whitespace-nowrap font-label ${
                  filterStatus === f.value
                    ? 'bg-primary-500 text-background-50'
                    : 'bg-background-50 border border-background-200/70 text-foreground-600 hover:bg-background-100'
                }`}
              >
                {f.label}
              </button>
            ))}
            <div className="w-px h-4 bg-background-300 mx-1"></div>
            <input
              type="text"
              className="px-3 py-1 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 outline-none font-body"
              placeholder="搜索文档..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Document Table */}
          <div className="rounded-lg border border-background-200/70 bg-background-50 overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-background-100 border-b border-background-200/70 text-[10px] font-semibold text-foreground-500 uppercase tracking-wider font-label">
              <span className="col-span-5">文档名称</span>
              <span className="col-span-1">版本</span>
              <span className="col-span-1.5">状态</span>
              <span className="col-span-1.5">负责人</span>
              <span className="col-span-1.5">最近引用</span>
              <span className="col-span-1.5 text-right">更多</span>
            </div>

            {filteredDocs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-background-200/70 flex items-center justify-center">
                  <i className="ri-file-line text-lg text-foreground-400"></i>
                </div>
                <p className="text-xs text-foreground-500 font-body">还没有知识文档</p>
                <p className="text-[10px] text-foreground-400 font-body mt-1">点击上方「上传知识」添加第一份文档</p>
                <div className="flex items-center gap-2 justify-center mt-3">
                  <button type="button" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap font-label">
                    <i className="ri-upload-cloud-line text-sm"></i>上传知识
                  </button>
                  <button type="button" className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-background-200/70 text-foreground-600 text-xs font-medium hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap font-label">
                    <i className="ri-add-line text-sm"></i>新建文本
                  </button>
                </div>
              </div>
            ) : (
              filteredDocs.map((doc) => (
                <div key={doc.id} className="grid grid-cols-12 gap-3 px-4 py-3 border-b border-background-200/40 last:border-b-0 items-center hover:bg-background-100/50 transition-colors">
                  <div className="col-span-5 flex items-center gap-2.5 min-w-0">
                    <i className={`flex-shrink-0 ${doc.status === 'parse_failed' ? 'ri-error-warning-line text-accent-500' : 'ri-file-text-line text-foreground-400'}`}></i>
                    <button
                      type="button"
                      onClick={() => setSelectedDoc(doc)}
                      className="text-xs font-medium text-foreground-800 font-body truncate bg-transparent border-none cursor-pointer hover:text-primary-600 transition-colors text-left p-0"
                    >
                      {doc.title}
                    </button>
                  </div>
                  <span className="col-span-1 text-[10px] font-mono text-foreground-500">v{doc.currentVersion}</span>
                  <span className="col-span-1.5">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-label ${statusStyle[doc.status] || ''}`}>
                      {statusLabel[doc.status] || doc.status}
                    </span>
                  </span>
                  <span className="col-span-1.5 text-[10px] text-foreground-500 font-body truncate">{doc.owner}</span>
                  <span className="col-span-1.5 text-[11px] font-mono text-foreground-500">{doc.recentCitationCount} 次</span>
                  <div className="col-span-1.5 flex justify-end relative" ref={actionMenuId === doc.id ? menuRef : undefined}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActionMenuId(actionMenuId === doc.id ? null : doc.id); }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg border border-background-200/70 text-foreground-500 hover:text-foreground-700 hover:bg-background-100 transition-colors cursor-pointer"
                    >
                      <i className="ri-more-2-fill text-xs"></i>
                    </button>
                    {actionMenuId === doc.id && (
                      <div className="absolute right-0 top-8 z-20 w-40 bg-background-50 rounded-lg border border-background-200/70 shadow-lg py-1">
                        {getActionsForStatus(doc.status).map((action) => (
                          <button
                            key={action.label}
                            type="button"
                            onClick={() => void handleDocumentAction(doc, action.label)}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors cursor-pointer font-body whitespace-nowrap ${
                              action.enabled
                                ? 'text-foreground-700 hover:bg-background-100'
                                : 'text-foreground-400 cursor-not-allowed'
                            }`}
                            disabled={!action.enabled}
                          >
                            <i className={`${action.icon} text-[11px]`}></i>
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Document Detail Drawer */}
      {selectedDoc && (
        <DocumentDetailDrawer
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}

      {/* Space Settings Drawer */}
      {showSettings && currentSpace && (
        <SpaceSettingsDrawer
          spaceName={currentSpace.name}
          spaceDescription={currentSpace.description}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Create Space Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setShowCreate(false)}>
          <div className="bg-background-50 rounded-lg w-[480px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-background-200/70">
              <h3 className="text-sm font-semibold text-foreground-900 font-heading">创建知识空间</h3>
              <button type="button" onClick={() => setShowCreate(false)} className="w-6 h-6 flex items-center justify-center rounded text-foreground-500 hover:text-foreground-700 cursor-pointer">
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">空间名称</label>
                <input type="text" value={createName} onChange={(event) => setCreateName(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body" placeholder="例如：产品知识 Q4" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">知识类型</label>
                <select value={createType} onChange={(event) => setCreateType(event.target.value as KnowledgeSpace['knowledgeType'])} className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 focus:border-primary-400 outline-none font-body cursor-pointer">
                  <option value="product">产品知识</option>
                  <option value="policy_sop">政策与 SOP</option>
                  <option value="risk_compliance">品牌与合规规则</option>
                  <option value="historical_case">历史事件案例</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">负责人</label>
                <input type="text" value={createOwner} onChange={(event) => setCreateOwner(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body" placeholder="输入负责人姓名" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">说明</label>
                <textarea value={createDescription} onChange={(event) => setCreateDescription(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body resize-none" rows={3} placeholder="描述该空间的用途和内容范围" maxLength={500}></textarea>
              </div>
              {formError && <p className="text-[10px] text-accent-600 font-body">{formError}</p>}
            </div>
            <div className="flex justify-end gap-2 p-5 border-t border-background-200/70">
              <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-background-200/70 text-xs text-foreground-600 font-label hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap">取消</button>
              <button type="button" onClick={() => void handleCreateSpace()} className="px-4 py-2 rounded-lg bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap font-label">创建空间</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

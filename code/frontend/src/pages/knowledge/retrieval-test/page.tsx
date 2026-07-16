import { useState } from 'react';
import { mockRetrievalTestResults } from '@/mocks/knowledge';
import type { RetrievalTestResult } from '@/types/knowledge';
import { knowledgeApi } from '@/services/knowledgeApi';

export default function RetrievalTest() {
  const [query, setQuery] = useState('用户说客服承诺赔偿后又反悔，应该如何处理？');
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [topK, setTopK] = useState(5);
  const [filterProductLine, setFilterProductLine] = useState('');
  const [filterKnowledgeType, setFilterKnowledgeType] = useState('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(true);

  const [results, setResults] = useState<RetrievalTestResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTime, setSearchTime] = useState(0);
  const [marks, setMarks] = useState<Record<string, RetrievalTestResult['mark']>>({});
  const [showShouldHit, setShowShouldHit] = useState(false);
  const [shouldHitDocument, setShouldHitDocument] = useState('');
  const [shouldHitNote, setShouldHitNote] = useState('');
  const [filteredCount, setFilteredCount] = useState(0);
  const [hasConflict, setHasConflict] = useState(false);
  const [searchError, setSearchError] = useState('');

  const toggleSpace = (id: string) => {
    setSelectedSpaces((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setHasSearched(true);
    setResults([]);
    setSearchError('');
    try {
      const response = await knowledgeApi.retrievalTest({
        query,
        spaceIds: selectedSpaces,
        limit: topK,
        productLine: filterProductLine,
        knowledgeType: filterKnowledgeType,
        activeOnly: filterActiveOnly,
      });
      setResults(response.results);
      setSearchTime(response.elapsedMs);
      setFilteredCount(response.filteredCount);
      setHasConflict(response.hasConflict);
      setMarks({});
    } catch (error) {
      setResults(mockRetrievalTestResults.slice(0, topK));
      setSearchTime(0);
      setFilteredCount(0);
      setHasConflict(false);
      setSearchError(error instanceof Error ? error.message : '检索失败，当前展示演示数据');
    } finally {
      setIsSearching(false);
    }
  };

  const handleMark = (chunkId: string, mark: RetrievalTestResult['mark']) => {
    setMarks((prev) => ({ ...prev, [chunkId]: mark }));
    const result = results.find((item) => item.chunkId === chunkId);
    void knowledgeApi.retrievalFeedback({
      query,
      chunkId,
      documentId: result?.documentId,
      mark,
    }).catch(() => undefined);
  };

  const handleShouldHit = () => {
    setShowShouldHit(true);
  };

  const submitShouldHit = async () => {
    if (!shouldHitDocument) return;
    await knowledgeApi.retrievalFeedback({
      query,
      documentId: shouldHitDocument,
      mark: 'should_hit',
      note: shouldHitNote,
    });
    setShowShouldHit(false);
    setShouldHitDocument('');
    setShouldHitNote('');
  };

  // Highlight keywords in snippet
  const highlightSnippet = (text: string) => {
    const keywords = query.split(/\s+/).filter((k) => k.length > 1);
    if (keywords.length === 0) return text;
    const pattern = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const parts = text.split(new RegExp(`(${pattern})`, 'gi'));
    return parts.map((part, i) =>
      keywords.some((k) => part.toLowerCase() === k.toLowerCase())
        ? <mark key={i} className="bg-yellow-200/70 text-foreground-900 px-0.5 rounded">{part}</mark>
        : part
    );
  };

  const markLabels: Record<string, { label: string; icon: string }> = {
    correct: { label: '命中正确', icon: 'ri-thumb-up-line' },
    incorrect: { label: '命中错误', icon: 'ri-thumb-down-line' },
    should_hit: { label: '应该命中但未命中', icon: 'ri-question-line' },
  };

  return (
    <div className="flex h-full bg-background-100">
      {/* Left Panel — Search Controls */}
      <div className="w-[38%] min-w-[320px] border-r border-background-200/70 p-6 overflow-y-auto">
        <h3 className="text-base font-semibold text-foreground-900 font-heading mb-4">检索测试</h3>

        <div className="space-y-4">
          {/* Query Input */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">查询内容</label>
            <textarea
              className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body resize-none"
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              maxLength={500}
            ></textarea>
          </div>

          {/* Space Selection */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">知识空间</label>
            <div className="space-y-1.5">
              {[
                { id: 'space-product', label: '产品知识' },
                { id: 'space-policy', label: '客服政策与 SOP' },
                { id: 'space-compliance', label: '品牌与合规规则' },
                { id: 'space-history', label: '历史事件案例' },
              ].map((space) => (
                <label key={space.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSpaces.includes(space.id)}
                    onChange={() => toggleSpace(space.id)}
                    className="w-3.5 h-3.5 rounded accent-primary-500 cursor-pointer"
                  />
                  <span className="text-xs text-foreground-700 font-body">{space.label}</span>
                </label>
              ))}
            </div>
            <p className="text-[9px] text-foreground-400 font-body mt-1">不选则检索全部空间</p>
          </div>

          {/* Top K */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">返回片段数量</label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 focus:border-primary-400 outline-none font-body cursor-pointer"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
            >
              <option value={3}>3</option>
              <option value={5}>5</option>
              <option value={10}>10</option>
            </select>
          </div>

          {/* Optional Filters */}
          <div>
            <label className="block text-[11px] font-semibold text-foreground-600 font-label mb-1">可选过滤</label>
            <div className="space-y-2">
              <input
                type="text"
                className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
                placeholder="产品线"
                value={filterProductLine}
                onChange={(e) => setFilterProductLine(e.target.value)}
              />
              <select
                className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 focus:border-primary-400 outline-none font-body cursor-pointer"
                value={filterKnowledgeType}
                onChange={(e) => setFilterKnowledgeType(e.target.value)}
              >
                <option value="">全部知识类型</option>
                <option value="product">产品知识</option>
                <option value="policy_sop">政策与 SOP</option>
                <option value="risk_compliance">品牌与合规</option>
                <option value="historical_case">历史案例</option>
              </select>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterActiveOnly}
                  onChange={(e) => setFilterActiveOnly(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-primary-500 cursor-pointer"
                />
                <span className="text-xs text-foreground-600 font-body">仅检索当前有效知识</span>
              </label>
            </div>
          </div>

          {/* Search Button */}
          <button
            type="button"
            onClick={() => void handleSearch()}
            disabled={isSearching}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-500 text-background-50 text-sm font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap font-label disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? (
              <>
                <div className="w-4 h-4 border-2 border-background-50/30 border-t-background-50 rounded-full animate-spin"></div>
                检索中...
              </>
            ) : (
              <>
                <i className="ri-search-line"></i>
                开始测试
              </>
            )}
          </button>
        </div>
      </div>

      {/* Right Panel — Results */}
      <div className="flex-1 p-6 overflow-y-auto">
        {!hasSearched ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-xs">
              <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-background-200/70 flex items-center justify-center">
                <i className="ri-search-eye-line text-2xl text-foreground-400"></i>
              </div>
              <p className="text-sm text-foreground-500 font-body">输入客户问题并选择知识空间，<br />点击「开始测试」查看检索结果</p>
            </div>
          </div>
        ) : isSearching ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 border-2 border-primary-300 border-t-primary-500 rounded-full animate-spin"></div>
              <span className="text-xs text-foreground-500 font-body">正在检索...</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-background-200/70 bg-background-50 p-4 animate-pulse">
                  <div className="h-3 bg-background-200 rounded w-2/3 mb-3"></div>
                  <div className="h-6 bg-background-100 rounded mb-2"></div>
                  <div className="h-2 bg-background-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-foreground-700 font-label">检索结果</span>
              <span className="text-[10px] text-foreground-500 font-mono">· 0 条命中 · 用时 {searchTime}ms</span>
            </div>

            <div className="rounded-lg border border-background-200/70 bg-background-50 p-12 text-center">
              <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-background-200/70 flex items-center justify-center">
                <i className="ri-search-line text-lg text-foreground-400"></i>
              </div>
              <p className="text-xs text-foreground-600 font-body mb-1">未找到可用企业知识</p>
              <p className="text-[10px] text-foreground-500 font-body mb-3">
                请检查所选知识空间、有效期设置，或考虑补充相关知识文档
              </p>
              <div className="inline-flex flex-wrap gap-1.5 justify-center">
                {['产品知识', '客服政策', '历史案例', '合规规则'].map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded bg-background-100 border border-background-200/70 text-[10px] text-foreground-500 font-label">建议补充：{t}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground-700 font-label">检索结果</span>
                <span className="text-[11px] font-mono text-secondary-600">
                  命中 {results.length} 条 · 用时 {searchTime}ms
                </span>
              </div>
              {filteredCount > 0 && (
                <span className="text-[10px] text-foreground-500 font-body">
                  <i className="ri-filter-off-line mr-1 text-accent-500"></i>
                  另有 {filteredCount} 条未发布或无效知识已被过滤
                </span>
              )}
            </div>

            {searchError && (
              <div className="mb-3 rounded-lg bg-accent-50 border border-accent-200/40 p-2 text-[10px] text-accent-700 font-body">
                API 未连接：{searchError}。以下为内置演示结果。
              </div>
            )}

            {/* Conflicts warning */}
            {hasConflict && (
              <div className="rounded-lg bg-accent-50/50 border border-accent-200/40 p-3 flex items-start gap-2 mb-3">
                <i className="ri-alert-line text-accent-500 text-sm mt-0.5"></i>
                <div>
                  <p className="text-[11px] font-semibold text-accent-700 font-label">知识存在冲突，需人工确认</p>
                  <p className="text-[10px] text-foreground-600 font-body leading-relaxed mt-0.5">
                    多条知识的适用条件存在重叠或矛盾，Agent 检索结果并列展示，不建议自动选择其中一条作为唯一依据。
                  </p>
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="space-y-2">
              {results.map((result, idx) => (
                <div key={result.chunkId} className="rounded-lg border border-background-200/70 bg-background-50 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="text-[10px] font-mono text-foreground-400 flex-shrink-0">#{idx + 1}</span>
                      <span className="text-xs font-semibold text-foreground-800 font-label truncate">{result.documentTitle}</span>
                      <span className="text-[10px] text-foreground-500 font-body flex-shrink-0">
                        v{result.version} · {result.section}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-primary-600 font-semibold flex-shrink-0 ml-2 whitespace-nowrap">
                      相关度 {Math.round(result.score * 100)}%
                    </span>
                  </div>

                  {/* Snippet with highlighting */}
                  <div className="p-3 rounded bg-background-100 border border-background-200/40 mb-3">
                    <p className="text-xs text-foreground-700 font-body leading-relaxed">
                      {highlightSnippet(result.snippet)}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-[10px] text-foreground-500 font-body mb-2">
                    <span>
                      <i className="ri-stack-line mr-1 text-foreground-400"></i>
                      {result.documentTitle.includes('退款') ? '客服政策与 SOP' :
                       result.documentTitle.includes('推责') ? '客服政策与 SOP' :
                       result.documentTitle.includes('应急') ? '产品知识' :
                       result.documentTitle.includes('品牌') || result.documentTitle.includes('扩散') ? '品牌与合规规则' : '历史事件案例'}
                    </span>
                    <span>
                      <i className="ri-calendar-line mr-1 text-foreground-400"></i>
                      有效期至 2026-12-31
                    </span>
                  </div>

                  {result.filterReason && (
                    <p className="text-[10px] text-accent-600 font-body mb-2 bg-accent-50 rounded p-2 border border-accent-200/40">
                      <i className="ri-filter-off-line mr-1"></i>{result.filterReason}
                    </p>
                  )}

                  {/* Marking Buttons */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-background-200/40">
                    <span className="text-[10px] text-foreground-500 font-label mr-1">标记：</span>
                    <button
                      type="button"
                      onClick={() => handleMark(result.chunkId, 'correct')}
                      className={`px-2 py-0.5 rounded text-[10px] font-label cursor-pointer transition-colors whitespace-nowrap ${
                        marks[result.chunkId] === 'correct'
                          ? 'bg-secondary-50 text-secondary-700 border border-secondary-200'
                          : 'text-foreground-500 border border-background-200/40 hover:bg-background-200/60'
                      }`}
                    >
                      <i className="ri-thumb-up-line text-[9px] mr-0.5"></i>命中正确
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMark(result.chunkId, 'incorrect')}
                      className={`px-2 py-0.5 rounded text-[10px] font-label cursor-pointer transition-colors whitespace-nowrap ${
                        marks[result.chunkId] === 'incorrect'
                          ? 'bg-accent-50 text-accent-700 border border-accent-200'
                          : 'text-foreground-500 border border-background-200/40 hover:bg-background-200/60'
                      }`}
                    >
                      <i className="ri-thumb-down-line text-[9px] mr-0.5"></i>命中错误
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* "Should have hit" section */}
            <div className="mt-4 pt-4 border-t border-background-200/70">
              {!showShouldHit ? (
                <button
                  type="button"
                  onClick={handleShouldHit}
                  className="inline-flex items-center gap-1.5 text-[10px] text-foreground-500 font-label hover:text-accent-600 transition-colors cursor-pointer"
                >
                  <i className="ri-add-line"></i>
                  应该命中但未命中
                </button>
              ) : (
                <div className="rounded-lg bg-accent-50/50 border border-accent-200/40 p-4">
                  <h4 className="text-[11px] font-semibold text-accent-700 font-label mb-2">记录"应该命中但未命中"</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] text-foreground-600 font-label mb-1">目标文档</label>
                      <select value={shouldHitDocument} onChange={(event) => setShouldHitDocument(event.target.value)} className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 focus:border-primary-400 outline-none font-body cursor-pointer">
                        <option value="">选择应该被命中的文档</option>
                        <option value="doc-001">售后退款与赔偿处理规范</option>
                        <option value="doc-002">客服公开承诺风险话术清单</option>
                        <option value="doc-003">App 支付失败应急处理 SOP</option>
                        <option value="doc-004">小红书投诉扩散升级规则</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] text-foreground-600 font-label mb-1">说明</label>
                      <textarea
                        className="w-full px-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-xs text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body resize-none"
                        rows={2}
                        placeholder="描述为什么该文档应该被命中..."
                        value={shouldHitNote}
                        onChange={(event) => setShouldHitNote(event.target.value)}
                        maxLength={500}
                      ></textarea>
                    </div>
                    <button
                      type="button"
                      onClick={() => void submitShouldHit()}
                      className="px-3 py-1.5 rounded-lg bg-accent-500 text-background-50 text-xs font-medium hover:bg-accent-600 transition-colors cursor-pointer whitespace-nowrap font-label"
                    >
                      提交反馈
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

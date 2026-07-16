import { useState } from 'react';
import { mockBadCases, mockEvalSets, mockIterations } from '@/mocks/evaluation';
import type { BadCaseEntry, EvalSetItem, IterationRecord } from '@/mocks/evaluation';
import type { BadCaseType } from '@/types/risk';

const errorTypeLabels: Record<BadCaseType, { label: string; color: string }> = {
  wrong_task_type: { label: '任务类型错误', color: 'bg-secondary-100 text-secondary-700' },
  wrong_agent: { label: 'Agent选择错误', color: 'bg-secondary-100 text-secondary-700' },
  risk_too_high: { label: '风险等级过高', color: 'bg-accent-100 text-accent-700' },
  risk_too_low: { label: '风险等级过低', color: 'bg-accent-100 text-accent-700' },
  review_false_positive: { label: '复核误触发', color: 'bg-secondary-100 text-secondary-700' },
  review_false_negative: { label: '复核漏触发', color: 'bg-secondary-100 text-secondary-700' },
  insufficient_evidence: { label: '证据不充分', color: 'bg-secondary-100 text-secondary-700' },
  unactionable_suggestion: { label: '建议不可执行', color: 'bg-secondary-100 text-secondary-700' },
};

const statusLabels: Record<string, { label: string; className: string }> = {
  pending_review: { label: '待确认', className: 'bg-accent-100 text-accent-700' },
  confirmed: { label: '已确认', className: 'bg-secondary-100 text-secondary-700' },
  in_eval_set: { label: '已入评估集', className: 'bg-primary-50 text-primary-700' },
  fixed: { label: '已修复', className: 'bg-background-200 text-foreground-600' },
};

const iterTypeLabels: Record<string, { label: string; icon: string; color: string }> = {
  prompt: { label: 'Prompt 优化', icon: 'ri-file-text-line', color: 'bg-primary-50 text-primary-700' },
  rule: { label: '规则调整', icon: 'ri-settings-3-line', color: 'bg-background-200 text-foreground-600' },
  calibration: { label: '风险校准', icon: 'ri-scales-3-line', color: 'bg-accent-100 text-accent-700' },
  agent_selection: { label: 'Agent 路由', icon: 'ri-git-branch-line', color: 'bg-secondary-100 text-secondary-700' },
};

const iterStatusLabels: Record<string, { label: string; className: string }> = {
  draft: { label: '草稿', className: 'bg-background-200 text-foreground-600' },
  testing: { label: '测试中', className: 'bg-accent-100 text-accent-700' },
  deployed: { label: '已部署', className: 'bg-primary-50 text-primary-700' },
  rolled_back: { label: '已回滚', className: 'bg-accent-100 text-accent-700' },
};

const riskDisplay: Record<string, { text: string; className: string }> = {
  P0: { text: 'P0', className: 'bg-accent-500 text-background-50' },
  P1: { text: 'P1', className: 'bg-accent-300 text-accent-900' },
  P2: { text: 'P2', className: 'bg-secondary-200 text-secondary-700' },
  P3: { text: 'P3', className: 'bg-background-200 text-foreground-500' },
};

const addedFromLabels: Record<string, string> = {
  bad_case: 'Bad Case',
  real_case: '真实案例',
  edge_case: '边缘案例',
};

// Count stats
const badCaseStats = {
  total: mockBadCases.length,
  pending: mockBadCases.filter((b) => b.status === 'pending_review').length,
  confirmed: mockBadCases.filter((b) => b.status === 'confirmed').length,
  inEvalSet: mockBadCases.filter((b) => b.status === 'in_eval_set').length,
};

const errorTypeCounts: Record<string, number> = {};
mockBadCases.forEach((b) => {
  errorTypeCounts[b.errorType] = (errorTypeCounts[b.errorType] || 0) + 1;
});

type TabKey = 'badcases' | 'evalsets' | 'iterations';

export default function EvaluationPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('badcases');
  const [expandedBadCase, setExpandedBadCase] = useState<string | null>(null);
  const [expandedEvalSet, setExpandedEvalSet] = useState<string | null>(null);
  const [expandedIter, setExpandedIter] = useState<string | null>(null);

  const tabs: { key: TabKey; label: string; count: number; icon: string }[] = [
    { key: 'badcases', label: 'Bad Case 队列', count: badCaseStats.total, icon: 'ri-error-warning-line' },
    { key: 'evalsets', label: '评估集', count: mockEvalSets.length, icon: 'ri-stack-line' },
    { key: 'iterations', label: '迭代记录', count: mockIterations.length, icon: 'ri-loop-left-line' },
  ];

  const sortedErrorTypes = Object.entries(errorTypeCounts).sort(([, a], [, b]) => b - a);

  const expandIcon = (isExpanded: boolean) => (
    <i className={`${isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'} text-foreground-400 text-sm mt-0.5`}></i>
  );

  return (
    <div className="flex-1 overflow-y-auto bg-background-50">
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground-900 font-heading">评估与迭代</h1>
            <p className="text-sm text-foreground-500 mt-1 font-body">
              Bad Case 驱动迭代闭环：标记 → 评估集 → 校准 → 回归验证
            </p>
          </div>
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-background-50 text-sm font-medium hover:bg-primary-600 transition-colors whitespace-nowrap cursor-pointer font-label"
          >
            <i className="ri-add-line text-base"></i>
            新建迭代
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg border border-background-200/70 bg-background-50 p-4">
            <p className="text-xs text-foreground-500 font-body mb-1">Bad Case 总数</p>
            <p className="text-2xl font-semibold text-foreground-900 font-heading">{badCaseStats.total}</p>
          </div>
          <div className="rounded-lg border border-background-200/70 bg-background-50 p-4">
            <p className="text-xs text-foreground-500 font-body mb-1">已入评估集</p>
            <p className="text-2xl font-semibold text-primary-600 font-heading">{badCaseStats.inEvalSet}</p>
          </div>
          <div className="rounded-lg border border-background-200/70 bg-background-50 p-4">
            <p className="text-xs text-foreground-500 font-body mb-1">待确认</p>
            <p className="text-2xl font-semibold text-accent-600 font-heading">{badCaseStats.pending}</p>
          </div>
          <div className="rounded-lg border border-background-200/70 bg-background-50 p-4">
            <p className="text-xs text-foreground-500 font-body mb-1">迭代周期</p>
            <p className="text-2xl font-semibold text-foreground-900 font-heading">{mockIterations.length}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 px-1 py-1 rounded-full bg-background-100 mb-5 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer whitespace-nowrap font-label ${
                activeTab === tab.key
                  ? 'bg-background-50 text-foreground-900'
                  : 'text-foreground-500 hover:text-foreground-700'
              }`}
            >
              <i className={`${tab.icon} text-sm`}></i>
              {tab.label}
              <span className={`text-[11px] px-1.5 rounded-full ${
                activeTab === tab.key ? 'bg-background-100 text-foreground-600' : 'bg-background-200/70 text-foreground-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'badcases' && (
          <div className="space-y-5">
            {/* Error Type Distribution */}
            <div className="rounded-lg border border-background-200/70 bg-background-50 p-5">
              <h3 className="text-sm font-semibold text-foreground-900 font-heading mb-4">错误类型分布</h3>
              <div className="flex flex-wrap gap-3">
                {sortedErrorTypes.map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${(errorTypeLabels as any)[type]?.color || 'bg-background-200 text-foreground-600'}`}>
                      {(errorTypeLabels as any)[type]?.label || type}
                    </span>
                    <span className="text-sm font-semibold text-foreground-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bad Case List */}
            <div className="rounded-lg border border-background-200/70 overflow-hidden">
              <div className="px-5 py-4 border-b border-background-200/70 bg-background-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground-900 font-heading">Bad Case 列表</h3>
                  <div className="flex items-center gap-3">
                    <select className="text-xs border border-background-200/70 rounded-md px-2.5 py-1.5 bg-background-50 text-foreground-600 cursor-pointer font-body">
                      <option>全部错误类型</option>
                      {sortedErrorTypes.map(([type]) => (
                        <option key={type} value={type}>{(errorTypeLabels as any)[type]?.label}</option>
                      ))}
                    </select>
                    <select className="text-xs border border-background-200/70 rounded-md px-2.5 py-1.5 bg-background-50 text-foreground-600 cursor-pointer font-body">
                      <option>全部状态</option>
                      <option value="pending_review">待确认</option>
                      <option value="confirmed">已确认</option>
                      <option value="in_eval_set">已入评估集</option>
                      <option value="fixed">已修复</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="divide-y divide-background-200/70">
                {mockBadCases.map((bad) => (
                  <div key={bad.id} className="bg-background-50">
                    <button
                      type="button"
                      onClick={() => setExpandedBadCase(expandedBadCase === bad.id ? null : bad.id)}
                      className="w-full text-left px-5 py-4 hover:bg-background-100/50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-xs text-foreground-400 font-mono">{bad.id}</span>
                            <span className={(errorTypeLabels[bad.errorType]?.color || 'bg-background-200 text-foreground-600') + ' px-2 py-0.5 rounded text-[11px] font-medium'}>
                              {errorTypeLabels[bad.errorType]?.label}
                            </span>
                            <span className={(statusLabels[bad.status]?.className || 'bg-background-200 text-foreground-600') + ' px-2 py-0.5 rounded text-[11px] font-medium'}>
                              {statusLabels[bad.status]?.label}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-foreground-900 mb-1">{bad.caseTitle}</p>
                          <div className="flex items-center gap-3 text-xs text-foreground-500 font-body flex-wrap">
                            <span className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${riskDisplay[bad.originalRisk]?.className.split(' ')[0]}`}></span>
                              原判 {bad.originalRisk}
                            </span>
                            <i className="ri-arrow-right-line text-[10px]"></i>
                            <span className="flex items-center gap-1">
                              <span className={`w-2 h-2 rounded-full ${riskDisplay[bad.correctedRisk]?.className.split(' ')[0]}`}></span>
                              修正 {bad.correctedRisk}
                            </span>
                            <span className="text-foreground-400">|</span>
                            <span>{bad.correctedBy}</span>
                            <span className="text-foreground-400">|</span>
                            <span>{bad.correctedAt.slice(0, 10)}</span>
                          </div>
                        </div>
                        {expandIcon(expandedBadCase === bad.id)}
                      </div>
                    </button>

                    {expandedBadCase === bad.id && (
                      <div className="px-5 pb-4 border-t border-background-200/70 bg-background-100/50">
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="rounded-lg border border-accent-200/50 bg-accent-50/30 p-4">
                            <p className="text-[11px] font-semibold text-accent-600 mb-2 font-label">AI 原始判断</p>
                            <p className="text-xs text-foreground-700 leading-relaxed font-body">{bad.originalJudgment}</p>
                          </div>
                          <div className="rounded-lg border border-primary-200/50 bg-primary-50/30 p-4">
                            <p className="text-[11px] font-semibold text-primary-600 mb-2 font-label">人工修正判断</p>
                            <p className="text-xs text-foreground-700 leading-relaxed font-body">{bad.correctedJudgment}</p>
                          </div>
                        </div>
                        <div className="mt-3 rounded-lg border border-background-200/70 bg-background-50 p-4">
                          <p className="text-[11px] font-semibold text-foreground-500 mb-1 font-label">修正备注</p>
                          <p className="text-xs text-foreground-700 leading-relaxed font-body">{bad.notes}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button type="button" className="px-3 py-1.5 rounded-md bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap">
                            加入评估集
                          </button>
                          <button type="button" className="px-3 py-1.5 rounded-md border border-background-200/70 text-foreground-600 text-xs font-medium hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap">
                            标记已修复
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'evalsets' && (
          <div className="space-y-4">
            {mockEvalSets.map((set) => (
              <div key={set.id} className="rounded-lg border border-background-200/70 bg-background-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedEvalSet(expandedEvalSet === set.id ? null : set.id)}
                  className="w-full text-left px-5 py-4 hover:bg-background-100/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <h3 className="text-sm font-semibold text-foreground-900 font-heading">{set.name}</h3>
                        <span className="text-xs text-foreground-400 font-mono">{set.id}</span>
                      </div>
                      <p className="text-xs text-foreground-500 mb-3 font-body">{set.description}</p>
                      <div className="flex items-center gap-4 text-xs text-foreground-500 font-body flex-wrap">
                        <span className="flex items-center gap-1">
                          <i className="ri-file-list-3-line text-xs"></i>
                          {set.caseCount} 条案例
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="ri-price-tag-3-line text-xs"></i>
                          {set.scenarios.join(' / ')}
                        </span>
                        {set.passRate && (
                          <span className="flex items-center gap-1">
                            <i className="ri-check-double-line text-xs"></i>
                            通过率 {set.passRate}
                          </span>
                        )}
                        <span className="text-foreground-400">更新 {set.updatedAt.slice(0, 10)}</span>
                      </div>
                    </div>
                    {expandIcon(expandedEvalSet === set.id)}
                  </div>
                </button>

                {expandedEvalSet === set.id && (
                  <div className="px-5 pb-4 border-t border-background-200/70">
                    <table className="w-full mt-4 text-xs">
                      <thead>
                        <tr className="text-left text-foreground-500 font-body border-b border-background-200/70">
                          <th className="pb-2 font-medium">案例</th>
                          <th className="pb-2 font-medium">期望场景</th>
                          <th className="pb-2 font-medium">期望风险</th>
                          <th className="pb-2 font-medium">期望复核</th>
                          <th className="pb-2 font-medium">来源</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-background-200/70">
                        {set.cases.map((c) => (
                          <tr key={c.caseId} className="hover:bg-background-100/50">
                            <td className="py-2.5 pr-4">
                              <span className="text-xs text-foreground-400 font-mono mr-2">{c.caseId}</span>
                              <span className="text-foreground-800">{c.title}</span>
                            </td>
                            <td className="py-2.5 pr-4 text-foreground-600">{c.expectedScenario}</td>
                            <td className="py-2.5 pr-4">
                              <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${riskDisplay[c.expectedRisk]?.className || ''}`}>
                                {c.expectedRisk}
                              </span>
                            </td>
                            <td className="py-2.5 pr-4">
                              <span className={c.expectedReview ? 'text-accent-600' : 'text-foreground-400'}>
                                {c.expectedReview ? '需要' : '不需要'}
                              </span>
                            </td>
                            <td className="py-2.5 text-foreground-500">{addedFromLabels[c.addedFrom]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="flex items-center gap-2 mt-4">
                      <button type="button" className="px-3 py-1.5 rounded-md bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap">
                        运行评估
                      </button>
                      <button type="button" className="px-3 py-1.5 rounded-md border border-background-200/70 text-foreground-600 text-xs font-medium hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap">
                        编辑评估集
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'iterations' && (
          <div className="space-y-4">
            {/* Iteration Timeline */}
            {mockIterations.map((iter, idx) => (
              <div key={iter.id} className="relative pl-10">
                {/* Timeline line */}
                {idx < mockIterations.length - 1 && (
                  <div className="absolute left-[19px] top-10 bottom-0 w-px bg-background-200/70"></div>
                )}

                <div className="rounded-lg border border-background-200/70 bg-background-50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedIter(expandedIter === iter.id ? null : iter.id)}
                    className="w-full text-left px-5 py-4 hover:bg-background-100/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className={`absolute left-[11px] top-6 w-[18px] h-[18px] rounded-full flex items-center justify-center ${
                        iter.status === 'deployed' ? 'bg-primary-500' : iter.status === 'testing' ? 'bg-accent-500' : 'bg-background-200'
                      }`}>
                        <i className="ri-check-line text-[10px] text-background-50"></i>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-xs text-foreground-400 font-mono">#{iter.version}</span>
                          <span className={(iterTypeLabels[iter.type]?.color || 'bg-background-200 text-foreground-600').replace('text-secondary-700', 'text-foreground-600').replace('bg-secondary-100', 'bg-background-200') + ' px-2 py-0.5 rounded text-[11px] font-medium'}>
                            <i className={`${iterTypeLabels[iter.type]?.icon || 'ri-settings-line'} text-[10px] mr-1`}></i>
                            {iterTypeLabels[iter.type]?.label || iter.type}
                          </span>
                          <span className={(iterStatusLabels[iter.status]?.className || 'bg-background-200 text-foreground-600') + ' px-2 py-0.5 rounded text-[11px] font-medium'}>
                            {iterStatusLabels[iter.status]?.label}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-foreground-900 mb-1">{iter.description}</p>
                        <div className="flex items-center gap-4 text-xs text-foreground-500 font-body flex-wrap">
                          <span>{iter.date.slice(0, 10)}</span>
                          {iter.status === 'deployed' && (
                            <>
                              <span className="text-foreground-400">|</span>
                              <span>通过率 {iter.beforePassRate} → <span className="text-primary-600 font-medium">{iter.afterPassRate}</span></span>
                            </>
                          )}
                          <span className="text-foreground-400">|</span>
                          <span>{iter.approvedBy}</span>
                        </div>
                      </div>
                      {expandIcon(expandedIter === iter.id)}
                    </div>
                  </button>

                  {expandedIter === iter.id && (
                    <div className="px-5 pb-4 border-t border-background-200/70 bg-background-100/50">
                      <div className="mt-4 space-y-3">
                        <div className="rounded-lg border border-background-200/70 bg-background-50 p-4">
                          <p className="text-[11px] font-semibold text-foreground-500 mb-2 font-label">变更内容</p>
                          <ul className="space-y-1.5">
                            {iter.changes.map((change, i) => (
                              <li key={i} className="flex items-start gap-2 text-xs text-foreground-700 font-body">
                                <i className="ri-arrow-right-s-line text-foreground-400 mt-0.5"></i>
                                {change}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-lg border border-background-200/70 bg-background-50 p-3">
                            <p className="text-[10px] text-foreground-400 font-label mb-1">评估集</p>
                            <p className="text-xs font-medium text-foreground-800">{iter.evalSetName}</p>
                          </div>
                          <div className="rounded-lg border border-background-200/70 bg-background-50 p-3">
                            <p className="text-[10px] text-foreground-400 font-label mb-1">通过率变化</p>
                            <p className="text-xs font-medium text-foreground-800">
                              {iter.beforePassRate} → <span className="text-primary-600">{iter.afterPassRate === '—' ? '测试中' : iter.afterPassRate}</span>
                            </p>
                          </div>
                          <div className="rounded-lg border border-background-200/70 bg-background-50 p-3">
                            <p className="text-[10px] text-foreground-400 font-label mb-1">回归问题</p>
                            <p className="text-xs font-medium text-foreground-800">
                              {iter.regressions.length > 0 ? iter.regressions[0] : '无'}
                            </p>
                          </div>
                        </div>

                        {iter.status === 'deployed' && iter.id === 'ITER-003' ? (
                          <div className="flex items-center gap-2">
                            <button type="button" className="px-3 py-1.5 rounded-md bg-primary-500 text-background-50 text-xs font-medium hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap">
                              审批并部署
                            </button>
                            <button type="button" className="px-3 py-1.5 rounded-md border border-background-200/70 text-foreground-600 text-xs font-medium hover:bg-background-100 transition-colors cursor-pointer whitespace-nowrap">
                              退回修改
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

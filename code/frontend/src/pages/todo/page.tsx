import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockCases } from '@/mocks/cases';
import type { RiskLevel, CaseStatus } from '@/types/risk';

const riskLevelConfig: Record<string, { bg: string; text: string; label: string }> = {
  P0: { bg: 'bg-accent-100', text: 'text-accent-700', label: 'P0' },
  P1: { bg: 'bg-accent-50', text: 'text-accent-600', label: 'P1' },
  P2: { bg: 'bg-primary-50', text: 'text-primary-700', label: 'P2' },
  P3: { bg: 'bg-secondary-50', text: 'text-secondary-700', label: 'P3' },
};

const statusLabels: Record<string, string> = {
  pending_review: '等待人工复核',
  pending_evidence: '等待补充证据',
  assigned: '等待责任团队接收',
  closed: '已关闭',
  reviewing: '复核中',
};

const todoTypeLabels: Record<string, string> = {
  pending_review: '待复核',
  pending_evidence: '待补证',
  assigned: '待接收',
  reviewing: '待确认',
};

const scenarioLabels: Record<string, string> = {
  brand: '品牌舆情',
  cs: '客服质检',
  ops: '运营反馈',
  mixed: '混合',
};

type FilterKey = 'riskLevel' | 'scenario' | 'status' | 'isPublic' | 'needsReview';

export default function TodoCenter() {
  const [filters, setFilters] = useState<Record<FilterKey, string>>({
    riskLevel: '',
    scenario: '',
    status: '',
    isPublic: '',
    needsReview: '',
  });

  const filteredCases = mockCases.filter((c) => {
    if (filters.riskLevel && c.riskLevel !== filters.riskLevel) return false;
    if (filters.scenario && c.scenario !== filters.scenario) return false;
    if (filters.status && c.status !== filters.status) return false;
    if (filters.isPublic === 'true' && !c.isPublic) return false;
    if (filters.isPublic === 'false' && c.isPublic) return false;
    if (filters.needsReview === 'true' && !c.needsReview) return false;
    if (filters.needsReview === 'false' && c.needsReview) return false;
    return true;
  });

  const setFilter = (key: FilterKey, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? '' : value }));
  };

  const clearFilters = () => {
    setFilters({ riskLevel: '', scenario: '', status: '', isPublic: '', needsReview: '' });
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="p-6">
      {/* Page intro */}
      <div className="mb-5">
        <h1 className="text-base font-semibold text-foreground-900 font-heading">待办事项</h1>
        <p className="text-xs text-foreground-500 mt-1 font-body">
          待办事项涵盖待补充证据、等待人工复核、等待责任团队接收、等待产品确认、等待持续观察和等待关闭归档。
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex items-center gap-1 px-1 py-1 rounded-full bg-background-50 border border-background-200/70">
          {(['P0', 'P1', 'P2', 'P3'] as RiskLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setFilter('riskLevel', level)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap font-label ${
                filters.riskLevel === level
                  ? 'bg-primary-500 text-background-50'
                  : 'text-foreground-600 hover:text-foreground-800'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 px-1 py-1 rounded-full bg-background-50 border border-background-200/70">
          {(['brand', 'cs', 'ops', 'mixed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter('scenario', s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap font-label ${
                filters.scenario === s
                  ? 'bg-primary-500 text-background-50'
                  : 'text-foreground-600 hover:text-foreground-800'
              }`}
            >
              {scenarioLabels[s]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 px-1 py-1 rounded-full bg-background-50 border border-background-200/70">
          {(['pending_review', 'pending_evidence', 'assigned'] as CaseStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setFilter('status', s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap font-label ${
                filters.status === s
                  ? 'bg-primary-500 text-background-50'
                  : 'text-foreground-600 hover:text-foreground-800'
              }`}
            >
              {todoTypeLabels[s]}
            </button>
          ))}
        </div>

        <button
          onClick={() => setFilter('isPublic', 'true')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border font-label ${
            filters.isPublic === 'true'
              ? 'bg-accent-500 text-background-50 border-accent-500'
              : 'text-foreground-600 border-background-200/70 bg-background-50 hover:border-accent-300'
          }`}
        >
          公开传播
        </button>
        <button
          onClick={() => setFilter('needsReview', 'true')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap border font-label ${
            filters.needsReview === 'true'
              ? 'bg-accent-500 text-background-50 border-accent-500'
              : 'text-foreground-600 border-background-200/70 bg-background-50 hover:border-accent-300'
          }`}
        >
          待人工确认
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-1 rounded-full text-xs font-medium text-foreground-500 hover:text-foreground-700 transition-colors cursor-pointer whitespace-nowrap font-label"
          >
            <i className="ri-close-line mr-1"></i>清除筛选
          </button>
        )}
      </div>

      <div className="mb-4">
        <span className="text-xs text-foreground-500 font-body">
          共 <span className="font-semibold text-foreground-700">{filteredCases.length}</span> 条待办事项
        </span>
      </div>

      {/* Table */}
      <div className="rounded-lg bg-background-50 border border-background-200/70 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-background-200/70 bg-background-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground-500 uppercase tracking-wider font-label">信号</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground-500 uppercase tracking-wider font-label">优先级</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground-500 uppercase tracking-wider font-label">责任团队</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground-500 uppercase tracking-wider font-label">待办类型</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground-500 uppercase tracking-wider font-label">SLA</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-foreground-500 uppercase tracking-wider font-label">发现时间</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => {
                const config = riskLevelConfig[c.riskLevel];
                return (
                  <tr key={c.id} className="border-b border-background-200/70 hover:bg-background-100/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/triage/${c.id}`}
                        className="text-sm font-medium text-foreground-800 hover:text-primary-600 transition-colors no-underline font-body"
                      >
                        <span className="text-xs text-foreground-500 mr-2 font-mono">{c.id}</span>
                        {c.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${config.bg} ${config.text} font-label`}>
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {c.assignedTeams.map((team) => (
                          <span key={team} className="px-1.5 py-0.5 rounded bg-secondary-50 text-secondary-700 text-[11px] font-label">{team}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium font-label ${
                        c.status === 'pending_review' ? 'text-accent-600' : c.status === 'pending_evidence' ? 'text-primary-600' : 'text-foreground-600'
                      }`}>
                        {statusLabels[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono font-body ${c.riskLevel === 'P0' ? 'text-accent-600 font-semibold' : 'text-foreground-600'}`}>
                        {c.sla || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground-500 font-body">{c.createdAt.slice(0, 10)}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredCases.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-inbox-line text-4xl text-foreground-300 block mb-3"></i>
          <p className="text-sm text-foreground-500 font-body">恭喜，暂无待办事项！</p>
        </div>
      )}
    </div>
  );
}
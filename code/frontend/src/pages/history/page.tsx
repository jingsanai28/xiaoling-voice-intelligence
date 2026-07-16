import { useState } from 'react';
import { mockHistoricalEvents } from '@/mocks/events';
import type { RiskLevel } from '@/types/risk';

const riskConfig: Record<string, { bg: string; text: string }> = {
  P0: { bg: 'bg-accent-100', text: 'text-accent-700' },
  P1: { bg: 'bg-accent-50', text: 'text-accent-600' },
  P2: { bg: 'bg-primary-50', text: 'text-primary-700' },
  P3: { bg: 'bg-secondary-50', text: 'text-secondary-700' },
};

export default function HistoryEvents() {
  const [filter, setFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = mockHistoricalEvents.filter((ev) => {
    if (filter && ev.riskLevel !== filter) return false;
    if (searchTerm && !ev.title.includes(searchTerm) && !ev.type.includes(searchTerm)) return false;
    return true;
  });

  return (
    <div className="p-6">
      {/* Page intro */}
      <div className="mb-5">
        <h1 className="text-base font-semibold text-foreground-900 font-heading">分析记录</h1>
        <p className="text-xs text-foreground-500 mt-1 font-body">
          记录历史分析的完整过程：原始输入、AI 分析链路、Agent 和工具调用、初始判断、人工修改、最终处理结果。
        </p>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-foreground-400 text-sm"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索事件标题或类型..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-700 placeholder:text-foreground-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
          />
        </div>
        <div className="flex items-center gap-1 px-1 py-1 rounded-full bg-background-50 border border-background-200/70">
          <button
            onClick={() => setFilter('')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap font-label ${!filter ? 'bg-primary-500 text-background-50' : 'text-foreground-600 hover:text-foreground-800'}`}
          >
            全部
          </button>
          {(['P0', 'P1', 'P2', 'P3'] as RiskLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap font-label ${filter === level ? 'bg-primary-500 text-background-50' : 'text-foreground-600 hover:text-foreground-800'}`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-2 gap-4">
        {filtered.map((ev) => {
          const rc = riskConfig[ev.riskLevel] || riskConfig.P3;
          return (
            <div key={ev.id} className="rounded-lg bg-background-50 border border-background-200/70 p-5 hover:border-background-300 transition-colors">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${rc.bg} ${rc.text} font-label`}>
                  {ev.riskLevel}
                </span>
                <span className="text-xs text-foreground-500 font-mono font-body">{ev.id}</span>
                <span className="text-[11px] text-foreground-400 font-body">{ev.date}</span>
                {ev.inEvalSet && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary-50 text-primary-600 font-label">评估集</span>
                )}
              </div>
              <h3 className="text-sm font-semibold text-foreground-800 mb-2 font-heading">{ev.title}</h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-foreground-500 font-label">事件类型</span>
                  <p className="text-foreground-700 mt-0.5 font-body">{ev.type}</p>
                </div>
                <div>
                  <span className="text-foreground-500 font-label">来源</span>
                  <p className="text-foreground-700 mt-0.5 font-body">{ev.source}</p>
                </div>
                <div>
                  <span className="text-foreground-500 font-label">涉及团队</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {ev.teams.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-secondary-50 text-secondary-700 text-[10px] font-label">{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-foreground-500 font-label">处理动作</span>
                  <p className="text-foreground-700 mt-0.5 font-body">{ev.actions}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-dashed border-background-200/70">
                <p className="text-xs text-foreground-500 font-body">
                  <span className="font-semibold text-foreground-600">结果：</span>{ev.outcome}
                </p>
                <p className="text-xs text-foreground-500 mt-1 font-body">
                  <span className="font-semibold text-foreground-600">复盘：</span>{ev.reviewNotes.slice(0, 120)}...
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-archive-line text-4xl text-foreground-300 block mb-3"></i>
          <p className="text-sm text-foreground-500 font-body">没有找到匹配的历史记录</p>
        </div>
      )}
    </div>
  );
}
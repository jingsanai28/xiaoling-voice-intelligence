import { Link } from 'react-router-dom';
import { mockDashboardStats } from '@/mocks/dashboard';
import { mockCases } from '@/mocks/cases';

const riskLevelConfig = {
  P0: { bg: 'bg-accent-100', text: 'text-accent-700', dot: 'bg-accent-500', label: '重大' },
  P1: { bg: 'bg-accent-50', text: 'text-accent-600', dot: 'bg-accent-500', label: '高' },
  P2: { bg: 'bg-primary-50', text: 'text-primary-700', dot: 'bg-primary-500', label: '中' },
  P3: { bg: 'bg-secondary-50', text: 'text-secondary-700', dot: 'bg-secondary-500', label: '低' },
};

const signalTypeLabels: Record<string, string> = {
  brand_risk: '品牌风险',
  service_signal: '服务信号',
  product_signal: '产品信号',
  opportunity_signal: '机会信号',
};

const scenarioLabels: Record<string, string> = {
  brand: '品牌舆情',
  cs: '客服质检',
  ops: '运营反馈',
  mixed: '混合场景',
};

export default function Dashboard() {
  const stats = mockDashboardStats;

  const highValueSignals = mockCases
    .filter((c) => c.status !== 'closed')
    .sort((a, b) => {
      const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
      return (order[a.riskLevel] ?? 4) - (order[b.riskLevel] ?? 4);
    });

  return (
    <div className="p-6 space-y-6">
      {/* Hero metric row */}
      <section className="grid grid-cols-6 gap-3">
        <div className="rounded-lg bg-background-50 border border-background-200/70 p-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-message-3-line text-foreground-400 text-sm"></i>
            <p className="text-xs text-foreground-500 font-label">今日新增声音</p>
          </div>
          <p className="text-[28px] font-bold text-foreground-900 font-heading">{stats.todayTotalVoices.toLocaleString()}</p>
          <p className="text-[10px] text-foreground-400 mt-0.5 font-body">评论 · 客服 · 投诉 · 工单 · 问卷</p>
        </div>
        <div className="rounded-lg bg-background-50 border border-background-200/70 p-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-filter-line text-secondary-500 text-sm"></i>
            <p className="text-xs text-foreground-500 font-label">降噪后有效</p>
          </div>
          <p className="text-[28px] font-bold text-foreground-900 font-heading">{stats.effectiveVoices.toLocaleString()}</p>
          <p className="text-[10px] text-foreground-400 mt-0.5 font-body">去重 · 降噪 · 聚合后</p>
        </div>
        <div className="rounded-lg bg-background-50 border border-accent-200/70 p-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-flashlight-line text-accent-500 text-sm"></i>
            <p className="text-xs text-foreground-500 font-label">高价值信号</p>
          </div>
          <p className="text-[28px] font-bold text-accent-600 font-heading">{stats.highValueSignals}</p>
          <p className="text-[10px] text-foreground-400 mt-0.5 font-body">需优先处理</p>
        </div>
        <div className="rounded-lg bg-background-50 border border-background-200/70 p-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-shield-check-line text-accent-500 text-sm"></i>
            <p className="text-xs text-foreground-500 font-label">待人工复核</p>
          </div>
          <p className="text-[28px] font-bold text-foreground-900 font-heading">{stats.pendingReview}</p>
          <p className="text-[10px] text-foreground-400 mt-0.5 font-body">AI 需人工确认</p>
        </div>
        <div className="rounded-lg bg-background-50 border border-background-200/70 p-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-arrow-right-circle-line text-primary-500 text-sm"></i>
            <p className="text-xs text-foreground-500 font-label">已进入处理</p>
          </div>
          <p className="text-[28px] font-bold text-foreground-900 font-heading">{stats.inProgress}</p>
          <p className="text-[10px] text-foreground-400 mt-0.5 font-body">已分派责任团队</p>
        </div>
        <div className="rounded-lg bg-background-50 border border-background-200/70 p-4">
          <div className="flex items-center gap-2 mb-1">
            <i className="ri-check-double-line text-secondary-500 text-sm"></i>
            <p className="text-xs text-foreground-500 font-label">已完成闭环</p>
          </div>
          <p className="text-[28px] font-bold text-secondary-600 font-heading">{stats.closedLoop}</p>
          <p className="text-[10px] text-foreground-400 mt-0.5 font-body">问题已解决</p>
        </div>
      </section>

      {/* Value description */}
      <div className="rounded-lg bg-background-200/50 border border-background-200/70 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary-50">
            <i className="ri-sound-module-line text-primary-500 text-lg"></i>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground-800 font-heading">小聆正在帮你倾听</p>
            <p className="text-xs text-foreground-500 font-body mt-0.5">
              今日从 {stats.todayTotalVoices.toLocaleString()} 条用户声音中降噪提炼出 <strong className="text-accent-600">{stats.highValueSignals} 条高价值信号</strong>，{stats.pendingReview} 条需要你亲自确认。
            </p>
          </div>
          <Link
            to="/triage"
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-sm font-medium text-background-50 hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap no-underline font-label"
          >
            <i className="ri-add-line"></i>
            <span>新建分析</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* High-value signals list */}
        <div className="col-span-2 space-y-4">
          <h3 className="text-sm font-semibold text-foreground-800 font-heading flex items-center gap-2">
            <i className="ri-flashlight-line text-accent-500"></i>
            高价值信号列表
          </h3>
          <div className="space-y-2" data-product-shop>
            {highValueSignals.map((c) => {
              const config = riskLevelConfig[c.riskLevel];
              return (
                <Link
                  key={c.id}
                  to={`/triage/${c.id}`}
                  className="block rounded-lg bg-background-50 border border-background-200/70 p-4 hover:border-primary-300 hover:bg-primary-50/20 transition-all duration-150 cursor-pointer no-underline"
                >
                  <div className="flex items-start gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${config.bg} ${config.text} font-label`}>
                      {c.riskLevel} · {config.label}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground-800 truncate font-body">{c.title}</p>
                      <p className="text-xs text-foreground-500 mt-1 truncate font-body">{c.content.slice(0, 100)}...</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-foreground-500 shrink-0">
                      <span className="px-2 py-0.5 rounded bg-secondary-50 text-secondary-700 text-[11px] font-label">
                        {scenarioLabels[c.scenario] || c.scenario}
                      </span>
                      {c.needsReview && (
                        <span className="px-2 py-0.5 rounded bg-accent-50 text-accent-600 text-[11px] font-label">
                          待复核
                        </span>
                      )}
                      <span className="font-body text-[11px]">{c.assignedTeams.join('、')}</span>
                      <span className="text-foreground-400 text-[10px]">{c.createdAt.slice(5, 10)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Team Distribution */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-3 flex items-center gap-2">
              <i className="ri-team-line text-foreground-500"></i>
              责任团队分布
            </h3>
            <div className="rounded-lg bg-background-50 border border-background-200/70 p-4 space-y-3">
              {stats.teamDistribution.map((item) => (
                <div key={item.team} className="flex items-center justify-between">
                  <span className="text-xs text-foreground-600 font-body">{item.team}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-background-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-400"
                        style={{ width: `${(item.count / 8) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-semibold text-foreground-800 font-label w-4 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trend Alerts */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-3 flex items-center gap-2">
              <i className="ri-line-chart-line text-foreground-500"></i>
              趋势提醒
            </h3>
            <div className="rounded-lg bg-background-50 border border-background-200/70 p-4 space-y-2.5">
              {stats.trends.map((item) => (
                <div key={item.keyword} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-body ${
                      item.trend === 'up' ? 'text-accent-600' : item.trend === 'down' ? 'text-secondary-600' : 'text-foreground-500'
                    }`}>#{item.keyword}</span>
                    <i className={`text-xs ${
                      item.trend === 'up' ? 'ri-arrow-up-line text-accent-500' :
                      item.trend === 'down' ? 'ri-arrow-down-line text-secondary-500' :
                      'ri-subtract-line text-foreground-400'
                    }`}></i>
                  </div>
                  <span className="text-xs font-semibold text-foreground-700 font-label">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Corrections */}
          <div>
            <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-3 flex items-center gap-2">
              <i className="ri-loop-left-line text-foreground-500"></i>
              AI 纠偏记录
            </h3>
            <div className="rounded-lg bg-background-50 border border-background-200/70 p-4 space-y-2.5">
              {stats.recentCorrections.map((corr) => (
                <div key={corr.caseId} className="text-xs space-y-1">
                  <p className="text-foreground-700 font-medium font-body truncate">{corr.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-accent-50 text-accent-600 font-label text-[10px]">{corr.original}</span>
                    <i className="ri-arrow-right-line text-foreground-400 text-[10px]"></i>
                    <span className="px-1.5 py-0.5 rounded bg-secondary-50 text-secondary-600 font-label text-[10px]">{corr.corrected}</span>
                    <span className="text-foreground-400">— {corr.by}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { mockCases } from '@/mocks/cases';

const riskConfig: Record<string, { bg: string; text: string }> = {
  P0: { bg: 'bg-accent-100', text: 'text-accent-700' },
  P1: { bg: 'bg-accent-50', text: 'text-accent-600' },
  P2: { bg: 'bg-primary-50', text: 'text-primary-700' },
  P3: { bg: 'bg-secondary-50', text: 'text-secondary-700' },
};

const reviewCases = mockCases.filter((c) => c.needsReview);

const decisionOptions = [
  { value: 'escalate', label: '确认进入处理', icon: 'ri-arrow-up-circle-line', color: 'text-accent-600' },
  { value: 'downgrade', label: '降级为持续观察', icon: 'ri-arrow-down-circle-line', color: 'text-secondary-600' },
  { value: 'more_evidence', label: '要求补充证据', icon: 'ri-file-search-line', color: 'text-primary-600' },
  { value: 'transfer', label: '转交其他团队', icon: 'ri-share-forward-line', color: 'text-foreground-600' },
  { value: 'mark_false_positive', label: '标记为误判', icon: 'ri-close-circle-line', color: 'text-foreground-600' },
];

export default function ReviewCenter() {
  return (
    <div className="p-6">
      <div className="mb-5">
        <h1 className="text-base font-semibold text-foreground-900 font-heading">人工复核</h1>
        <p className="text-xs text-foreground-500 mt-1 font-body">
          AI 判断需要人工确认的信号。涉及对外回应、赔偿、认责、法律结论等动作必须人工确认后方可执行。
        </p>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-xs text-foreground-500 font-body">
            共 <span className="font-semibold text-foreground-700">{reviewCases.length}</span> 条待复核信号
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-accent-50 text-accent-600 text-[11px] font-semibold font-label">
            P0/P1 优先
          </span>
        </div>
      </div>

      {/* Review Cases */}
      <div className="space-y-3">
        {reviewCases.map((c) => {
          const rc = riskConfig[c.riskLevel] || riskConfig.P3;
          return (
            <Link
              key={c.id}
              to={`/triage/${c.id}`}
              className="block rounded-lg bg-background-50 border border-background-200/70 p-5 hover:border-accent-300 transition-all duration-150 cursor-pointer no-underline"
            >
              <div className="flex items-start gap-4">
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${rc.bg} flex-shrink-0`}>
                  <span className={`text-sm font-bold font-label ${rc.text}`}>{c.riskLevel}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs text-foreground-500 font-mono font-body">{c.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${rc.bg} ${rc.text} font-label`}>
                      {c.riskLevel === 'P0' ? '重大' : c.riskLevel === 'P1' ? '高' : c.riskLevel === 'P2' ? '中' : '低'}
                    </span>
                    {c.isPublic && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent-50 text-accent-600 font-label">公开传播</span>
                    )}
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-accent-50/50 text-accent-600 font-label">
                      待人工确认
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-foreground-800 mb-2 font-heading">{c.title}</h4>
                  <p className="text-xs text-foreground-600 leading-relaxed mb-3 line-clamp-2 font-body">{c.content}</p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-foreground-500 font-label">AI 判断依据</span>
                      <p className="text-foreground-700 mt-0.5 font-body">{c.reviewReason?.slice(0, 80)}...</p>
                    </div>
                    <div>
                      <span className="text-foreground-500 font-label">涉及对外动作</span>
                      <p className="text-accent-600 mt-0.5 font-body font-medium">待人工确认</p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <span className="text-xs text-foreground-500 font-body">SLA: <span className={`font-semibold ${c.riskLevel === 'P0' ? 'text-accent-600' : 'text-foreground-700'}`}>{c.sla}</span></span>
                  <i className="ri-arrow-right-s-line text-foreground-400 text-lg self-end"></i>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {reviewCases.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-shield-check-line text-4xl text-secondary-400 block mb-3"></i>
          <p className="text-sm text-foreground-500 font-body">暂无待复核信号</p>
        </div>
      )}

      {/* Review Process Guide */}
      <div className="mt-8 rounded-lg bg-background-50 border border-background-200/70 p-5">
        <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-4">复核流程说明</h3>
        <div className="grid grid-cols-5 gap-4">
          {[
            { step: 1, title: 'AI 生成判断', desc: '系统自动降噪、聚合、分析并生成判断', icon: 'ri-brain-line', color: 'text-primary-600' },
            { step: 2, title: '复核包创建', desc: '收集证据、历史事件和AI分析摘要', icon: 'ri-file-list-3-line', color: 'text-primary-600' },
            { step: 3, title: '进入待办', desc: '复核信号在待办事项中高亮显示', icon: 'ri-notification-3-line', color: 'text-accent-600' },
            { step: 4, title: '人工决策', desc: '确认、降级、补证、转交或标记误判', icon: 'ri-user-star-line', color: 'text-foreground-600' },
            { step: 5, title: '进入处理', desc: '复核完成后信号进入业务处理流程', icon: 'ri-file-text-line', color: 'text-secondary-600' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-background-100 flex items-center justify-center mb-2">
                <i className={`${item.icon} text-lg ${item.color}`}></i>
              </div>
              <p className="text-xs font-semibold text-foreground-700 mb-1 font-label">{item.title}</p>
              <p className="text-[11px] text-foreground-500 font-body">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
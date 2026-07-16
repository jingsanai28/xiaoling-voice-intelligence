import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { mockCaseById, mockCases } from '@/mocks/cases';
import { simStages, type SimVerdict } from '@/mocks/pipelineSim';
import type { RiskCase } from '@/types/risk';

const riskLevelConfig: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  P0: { bg: 'bg-accent-100', text: 'text-accent-700', dot: 'bg-accent-500', label: '重大' },
  P1: { bg: 'bg-accent-50', text: 'text-accent-600', dot: 'bg-accent-500', label: '高' },
  P2: { bg: 'bg-primary-50', text: 'text-primary-700', dot: 'bg-primary-500', label: '中' },
  P3: { bg: 'bg-secondary-50', text: 'text-secondary-700', dot: 'bg-secondary-500', label: '低' },
};

const statusLabels: Record<string, string> = {
  pending_review: '待人工复核',
  pending_evidence: '待补充证据',
  assigned: '已分派',
  closed: '已关闭',
  reviewing: '复核中',
};

const scenarioLabels: Record<string, string> = {
  brand: '品牌舆情',
  cs: '客服质检',
  ops: '运营反馈',
  mixed: '混合场景',
};

const decisionOptions = [
  { value: 'escalate', label: '确认进入处理', icon: 'ri-arrow-up-circle-line', color: 'text-accent-600' },
  { value: 'downgrade', label: '降级为观察', icon: 'ri-arrow-down-circle-line', color: 'text-secondary-600' },
  { value: 'more_evidence', label: '要求补充证据', icon: 'ri-file-search-line', color: 'text-primary-600' },
  { value: 'transfer', label: '转交其他团队', icon: 'ri-share-forward-line', color: 'text-foreground-600' },
  { value: 'mark_false_positive', label: '标记为误判', icon: 'ri-close-circle-line', color: 'text-foreground-600' },
];

const stageLabels: Record<string, string> = {
  data_integrity_check: '检查数据完整性',
  permission_check: '检查数据权限',
  dedup_noise_reduction: '去除重复和低信息内容',
  topic_clustering: '聚合相似反馈主题',
  agent_analysis: '调用专业 Agent 分析',
  memory_rule_match: '匹配历史事件和业务规则',
  signal_valuation: '判断信号价值与优先级',
  human_review_gate: '判断是否需要人工复核',
  generate_result: '生成分析结果',
};

const verdictToneClass: Record<SimVerdict['tone'], string> = {
  primary: 'bg-primary-50 text-primary-700 border-primary-200',
  accent: 'bg-accent-50 text-accent-700 border-accent-200',
  secondary: 'bg-secondary-50 text-secondary-700 border-secondary-200',
  neutral: 'bg-background-100 text-foreground-600 border-background-300/70',
};

const kindNodeClass: Record<string, string> = {
  system: 'bg-secondary-100 text-secondary-600',
  agent: 'bg-primary-100 text-primary-600',
  gate: 'bg-accent-100 text-accent-600',
  output: 'bg-background-200 text-foreground-600',
};

const subToneClass: Record<string, string> = {
  accent: 'bg-accent-50 text-accent-600 border-accent-200',
  secondary: 'bg-secondary-50 text-secondary-600 border-secondary-200',
  primary: 'bg-primary-50 text-primary-600 border-primary-200',
};

type StageState = 'waiting' | 'running' | 'done';
type TabKey = 'summary' | 'evidence' | 'progress' | 'history' | 'review' | 'report' | 'log';

// ============================================================
// Live pipeline — 9-stage analysis progress
// ============================================================
function PipelineProgress() {
  const total = simStages.length;
  const [statuses, setStatuses] = useState<StageState[]>(() => simStages.map(() => 'waiting'));
  const [lineCounts, setLineCounts] = useState<number[]>(() => simStages.map(() => 0));
  const [verdicts, setVerdicts] = useState<SimVerdict[]>([]);
  const [openStages, setOpenStages] = useState<Set<number>>(() => new Set());
  const [complete, setComplete] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const completeRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const push = (t: ReturnType<typeof setTimeout>) => timers.current.push(t);

    const runStage = (i: number) => {
      if (cancelled) return;
      if (i >= total) {
        completeRef.current = true;
        setComplete(true);
        push(setTimeout(() => !cancelled && setShowResult(true), 1600));
        return;
      }
      const stage = simStages[i];
      setStatuses((prev) => prev.map((s, idx) => (idx < i ? 'done' : idx === i ? 'running' : 'waiting')));
      setOpenStages((prev) => {
        const n = new Set(prev);
        n.add(i);
        return n;
      });
      setLineCounts((prev) => {
        const n = [...prev];
        n[i] = 0;
        return n;
      });

      const lineTotal = stage.logLines.length;
      const step = Math.max(300, Math.floor(stage.duration / (lineTotal + 1)));
      for (let k = 1; k <= lineTotal; k++) {
        push(
          setTimeout(() => {
            if (cancelled) return;
            setLineCounts((prev) => {
              const n = [...prev];
              n[i] = k;
              return n;
            });
          }, k * step),
        );
      }

      push(
        setTimeout(() => {
          if (cancelled) return;
          setStatuses((prev) => prev.map((s, idx) => (idx <= i ? 'done' : idx === i + 1 ? 'waiting' : s)));
          if (stage.verdicts && stage.verdicts.length) {
            setVerdicts((prev) => [...prev, ...stage.verdicts!]);
          }
          setOpenStages((prev) => {
            const n = new Set(prev);
            n.delete(i);
            return n;
          });
          runStage(i + 1);
        }, stage.duration),
      );
    };

    runStage(0);

    const interval = setInterval(() => {
      if (completeRef.current) return;
      setElapsed((e) => e + 0.1);
    }, 100);

    return () => {
      cancelled = true;
      timers.current.forEach((t) => clearTimeout(t));
      timers.current = [];
      clearInterval(interval);
    };
  }, [total]);

  const doneCount = statuses.filter((s) => s === 'done').length;
  const runningIdx = statuses.findIndex((s) => s === 'running');
  const runningFrac =
    runningIdx >= 0 ? lineCounts[runningIdx] / (simStages[runningIdx].logLines.length + 1) : 0;
  const progress = Math.min(100, Math.round(((doneCount + runningFrac) / total) * 100));

  const toggle = (i: number) => {
    setOpenStages((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };

  if (showResult) {
    return (
      <div className="pl-emerge">
        <div className="rounded-lg bg-background-50 border border-background-200/70 p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center pl-pulse-ring">
            <i className="ri-check-double-line text-3xl text-primary-500"></i>
          </div>
          <h2 className="text-lg font-semibold text-foreground-800 font-heading mb-2">AI 分析已完成</h2>
          <p className="text-sm text-foreground-500 font-body mb-4 max-w-md mx-auto">
            9 个阶段全部通过，累计耗时约 {elapsed.toFixed(1)} 秒。当前为浏览器模拟模式，您可以从预置案例中查看包含完整结构化结果的分析详情。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {verdicts.map((v, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold font-label ${verdictToneClass[v.tone]}`}
              >
                <span className="opacity-70">{v.label}</span>
                <span>{v.value}</span>
              </span>
            ))}
          </div>
          <Link
            to={`/triage/${mockCases[0].id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-500 text-sm font-medium text-background-50 hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap no-underline font-label"
          >
            <i className="ri-eye-line"></i>
            <span>查看示例信号</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-background-50 border border-background-200/70 overflow-hidden">
        <div className="p-5 border-b border-background-200/70">
          <div className="flex items-center gap-2.5 mb-3">
            <span className="relative flex w-2.5 h-2.5">
              <span className={`absolute inline-flex h-full w-full rounded-full ${complete ? 'bg-secondary-400' : 'bg-primary-400 animate-ping'} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full w-2.5 h-2.5 ${complete ? 'bg-secondary-500' : 'bg-primary-500'}`}></span>
            </span>
            <h3 className="text-sm font-semibold text-foreground-800 font-heading">
              {complete ? '分析流水线 · 已完成' : 'AI 分析进度 · 实时执行中'}
            </h3>
            <span className="ml-auto flex items-center gap-3 text-[11px] font-mono text-foreground-500 font-body">
              <span className="flex items-center gap-1">
                <i className="ri-time-line"></i>
                {elapsed.toFixed(1)}s
              </span>
              <span>{doneCount} / {total} 阶段</span>
            </span>
          </div>

          <div className="relative w-full h-2 rounded-full bg-background-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
            {!complete && (
              <div
                className="absolute top-0 h-full w-24 pl-shimmer"
                style={{ left: `calc(${progress}% - 96px)` }}
              ></div>
            )}
          </div>
          <div className="flex justify-end mt-1">
            <span className="text-[10px] font-mono text-foreground-400">{progress}%</span>
          </div>

          {verdicts.length > 0 && (
            <div className="mt-4 pt-3 border-t border-dashed border-background-300/60">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-flashlight-line text-[13px] text-primary-500"></i>
                <span className="text-[11px] font-semibold text-foreground-600 font-label">实时判定结果</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {verdicts.map((v, i) => (
                  <span
                    key={i}
                    className={`pl-emerge inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-semibold font-label ${verdictToneClass[v.tone]}`}
                  >
                    <span className="opacity-70">{v.label}</span>
                    <span>{v.value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-5">
          <div className="space-y-0">
            {simStages.map((stage, idx) => {
              const st = statuses[idx];
              const isLast = idx === total - 1;
              const isOpen = openStages.has(idx);
              const visibleLines = lineCounts[idx];
              const flowing = st === 'done' && !isLast && statuses[idx + 1] !== 'waiting';
              const isGate = stage.kind === 'gate';

              const nodeCls =
                st === 'running'
                  ? `${isGate ? 'bg-accent-500 pl-pulse-ring-accent' : 'bg-primary-500 pl-pulse-ring'} text-background-50`
                  : st === 'done'
                    ? kindNodeClass[stage.kind]
                    : 'bg-background-200/70 text-foreground-400';

              return (
                <div key={stage.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => toggle(idx)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 cursor-pointer ${nodeCls}`}
                    >
                      {st === 'done' ? (
                        <i className="ri-check-line text-base"></i>
                      ) : st === 'running' ? (
                        <i className="ri-loader-4-line text-base animate-spin"></i>
                      ) : (
                        <i className={`text-base ${stage.icon}`}></i>
                      )}
                    </button>
                    {!isLast && (
                      <div className="relative w-0.5 flex-1 min-h-[28px] overflow-hidden bg-background-200">
                        <div
                          className={`absolute inset-0 transition-colors duration-500 ${
                            st === 'done' ? (isGate ? 'bg-accent-200' : 'bg-primary-200') : 'bg-background-200'
                          }`}
                        ></div>
                        {flowing && (
                          <>
                            <span className={`pl-flow-dot absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isGate ? 'bg-accent-500' : 'bg-primary-500'}`}></span>
                            <span className={`pl-flow-dot absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isGate ? 'bg-accent-500' : 'bg-primary-500'}`} style={{ animationDelay: '0.55s' }}></span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-4'}`}>
                    <button
                      type="button"
                      onClick={() => toggle(idx)}
                      className="w-full flex items-center gap-2 mb-1.5 text-left cursor-pointer group"
                    >
                      <span className="text-[11px] font-mono text-foreground-400 font-body">#{idx + 1}</span>
                      <span
                        className={`text-sm font-semibold transition-colors font-label ${
                          st === 'running' ? (isGate ? 'text-accent-600' : 'text-primary-600') : st === 'done' ? 'text-foreground-800' : 'text-foreground-400'
                        }`}
                      >
                        {stage.name}
                      </span>
                      {st === 'running' && (
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-label animate-pulse ${isGate ? 'bg-accent-100 text-accent-700' : 'bg-primary-100 text-primary-700'}`}>
                          执行中
                        </span>
                      )}
                      {st === 'done' && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-secondary-50 text-secondary-600 font-label">
                          完成
                        </span>
                      )}
                      {st !== 'waiting' && (
                        <i className={`ml-auto text-foreground-400 text-sm transition-transform group-hover:text-foreground-600 ${isOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}`}></i>
                      )}
                    </button>

                    {st !== 'waiting' && (
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className="text-[10px] text-foreground-500 font-label">调用</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded font-mono ${
                            stage.kind === 'agent' ? 'bg-primary-50 text-primary-700' : stage.kind === 'gate' ? 'bg-accent-50 text-accent-700' : 'bg-secondary-50 text-secondary-700'
                          }`}
                        >
                          {stage.calledObject}
                        </span>
                        {stage.tools.map((t) => (
                          <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-background-100 border border-background-200/70 text-foreground-500 font-body">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {st !== 'waiting' && isOpen && (
                      <div className="pl-emerge rounded-lg bg-background-100 border border-background-200/70 overflow-hidden">
                        <div className="px-3 py-2.5 border-b border-background-200/70 bg-background-200/40">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="w-2 h-2 rounded-full bg-accent-300"></span>
                            <span className="w-2 h-2 rounded-full bg-primary-300"></span>
                            <span className="w-2 h-2 rounded-full bg-secondary-300"></span>
                            <span className="ml-1.5 text-[10px] font-mono text-foreground-400">runtime · {stage.calledObject}</span>
                          </div>
                          <div className="space-y-1">
                            {stage.logLines.map((line, li) => {
                              const revealed = st === 'done' || li < visibleLines;
                              const active = st === 'running' && li === visibleLines - 1;
                              if (!revealed) return null;
                              return (
                                <div key={li} className="pl-stream-in flex items-start gap-1.5 text-[11px] font-mono leading-relaxed">
                                  <span className={`${active ? 'text-primary-500' : 'text-foreground-400'} flex-shrink-0`}>›</span>
                                  <span className={active ? 'text-foreground-800' : 'text-foreground-600'}>
                                    {line}
                                    {active && <span className="pl-caret ml-0.5 text-primary-500">▍</span>}
                                  </span>
                                </div>
                              );
                            })}
                            {st === 'running' && visibleLines < stage.logLines.length && (
                              <div className="flex items-center gap-1.5 text-[11px] font-mono text-foreground-400">
                                <span className="pl-caret text-primary-500">▍</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {st === 'done' && (
                          <div className="p-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <i className="ri-corner-down-right-line text-[13px] text-primary-500"></i>
                              <span className="text-[11px] font-semibold text-foreground-700 font-label">{stage.outputTitle}</span>
                            </div>
                            <p className="text-[11px] text-foreground-600 leading-relaxed font-body">{stage.outputDetail}</p>

                            {stage.subAgents && stage.subAgents.length > 0 && (
                              <div className="mt-2.5 space-y-1.5">
                                {stage.subAgents.map((sub, si) => (
                                  <div key={si} className="pl-2.5 border-l-2 border-primary-200">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="text-[11px] font-semibold text-foreground-700 font-label">{sub.name}</span>
                                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border font-label ${subToneClass[sub.tone]}`}>
                                        {sub.role}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-foreground-600 leading-relaxed font-body">{sub.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {st === 'done' && !isOpen && (
                      <p className="text-[11px] text-foreground-500 leading-relaxed font-body">{stage.outputTitle} · 点击展开查看细节</p>
                    )}
                    {st === 'waiting' && (
                      <p className="text-[11px] text-foreground-400 font-body">等待上游阶段传递数据...</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function PipelineSection({ pipeline, needsReview }: { pipeline: RiskCase['pipeline']; needsReview: boolean }) {
  return (
    <section className="rounded-lg bg-background-50 border border-background-200/70 p-5">
      <div className="flex items-center gap-2 mb-5">
        <i className="ri-node-tree text-lg text-primary-500"></i>
        <h3 className="text-sm font-semibold text-foreground-800 font-heading">AI 分析进度 · 9 阶段</h3>
        <span className="text-[11px] text-foreground-500 font-body ml-auto">{pipeline.length} / {pipeline.length} 已完成</span>
      </div>

      <div className="space-y-0">
        {pipeline.map((stage, idx) => {
          const isLast = idx === pipeline.length - 1;
          const isReviewGate = stage.key === 'human_review_gate';
          const reviewTriggered = isReviewGate && needsReview;
          const isAgentAnalysis = stage.key === 'agent_analysis';

          return (
            <div key={stage.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                  reviewTriggered ? 'bg-accent-100 text-accent-600 ring-2 ring-accent-200' :
                  stage.key === 'data_integrity_check' || stage.key === 'permission_check' ? 'bg-secondary-100 text-secondary-600' :
                  stage.key === 'dedup_noise_reduction' || stage.key === 'topic_clustering' ? 'bg-secondary-50 text-secondary-500' :
                  isAgentAnalysis ? 'bg-primary-100 text-primary-600' :
                  stage.key === 'memory_rule_match' ? 'bg-secondary-50 text-secondary-500' :
                  stage.key === 'signal_valuation' ? 'bg-accent-50 text-accent-500' :
                  stage.key === 'generate_result' ? 'bg-background-200 text-foreground-600' :
                  'bg-background-100 text-foreground-500'
                }`}>
                  <i className={`text-sm ${stage.icon}`}></i>
                </div>
                {!isLast && (
                  <div className={`w-0.5 flex-1 min-h-[40px] ${
                    reviewTriggered ? 'bg-accent-200' : 'bg-background-200'
                  }`}></div>
                )}
              </div>

              <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-mono text-foreground-400 font-body">#{idx + 1}</span>
                  <span className="text-sm font-semibold text-foreground-800 font-label">{stageLabels[stage.key] || stage.stageName}</span>
                  {reviewTriggered && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-accent-100 text-accent-700 font-label animate-pulse">
                      已触发
                    </span>
                  )}
                  {isReviewGate && !needsReview && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-secondary-50 text-secondary-600 font-label">
                      未触发
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 mb-2">
                  <div className="flex items-start gap-2">
                    <span className="text-[11px] text-foreground-500 font-label whitespace-nowrap mt-0.5 w-[72px] flex-shrink-0">调用对象</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      stage.calledObject.includes('Agent') ? 'bg-primary-50 text-primary-700' :
                      stage.calledObject.includes('Gate') || stage.calledObject.includes('Review') ? 'bg-accent-50 text-accent-700' :
                      'bg-secondary-50 text-secondary-700'
                    } font-mono`}>{stage.calledObject}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[11px] text-foreground-500 font-label whitespace-nowrap mt-0.5 w-[72px] flex-shrink-0">工具/规则</span>
                    <span className="text-[11px] text-foreground-600 font-body">{stage.tools}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-background-100 border border-background-200/70">
                  <p className="text-xs text-foreground-700 leading-relaxed font-body">{stage.output}</p>
                </div>

                {isAgentAnalysis && stage.subAgents && stage.subAgents.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {stage.subAgents.map((sub, si) => (
                      <div key={si} className="flex items-start gap-2 pl-3 border-l-2 border-primary-200">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] font-semibold text-foreground-700 font-label">{sub.agentName}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold font-label ${
                              sub.agentType === 'brand' ? 'bg-accent-50 text-accent-600' :
                              sub.agentType === 'cs' ? 'bg-accent-50/50 text-accent-500' :
                              sub.agentType === 'ops' ? 'bg-secondary-50 text-secondary-600' :
                              'bg-primary-50 text-primary-600'
                            }`}>
                              {sub.agentType === 'brand' ? '品牌' : sub.agentType === 'cs' ? '客服' : sub.agentType === 'ops' ? '运营' : '监管'}
                            </span>
                          </div>
                          <p className="text-[11px] text-foreground-600 leading-relaxed font-body">{sub.conclusion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-background-200/70 flex flex-wrap gap-3">
        <span className="text-[11px] text-foreground-500 font-body flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-secondary-100 inline-block"></span> 系统节点
        </span>
        <span className="text-[11px] text-foreground-500 font-body flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-primary-100 inline-block"></span> Agent 节点
        </span>
        <span className="text-[11px] text-foreground-500 font-body flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-accent-100 inline-block ring-1 ring-accent-200"></span> 人工复核 Gate
        </span>
        <span className="text-[11px] text-foreground-500 font-body flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-background-200 inline-block"></span> 生成节点
        </span>
      </div>
    </section>
  );
}

export default function TriageDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('summary');

  const foundCase = id ? mockCaseById[id] : undefined;

  if (!foundCase || !id) {
    try {
      const stored = localStorage.getItem('triage_cases');
      if (stored) {
        const cases = JSON.parse(stored);
        const localCase = cases.find((c: { id: string }) => c.id === id);
        if (localCase) {
          return (
            <div className="p-6 max-w-5xl">
              <div className="rounded-lg bg-background-50 border border-background-200/70 p-6 mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-foreground-500 font-mono font-body">{localCase.id}</span>
                  <span className="px-2 py-0.5 rounded text-xs bg-primary-50 text-primary-600 font-label inline-flex items-center gap-1">
                    <i className="ri-loader-4-line animate-spin text-[11px]"></i>
                    分析中
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground-900 font-heading mb-1">
                  客户声音分析
                </h2>
                <p className="text-xs text-foreground-500 font-body">{localCase.scenario || '未知场景'} · {localCase.source || '未知来源'}</p>
              </div>
              <PipelineProgress />
            </div>
          );
        }
      }
    } catch {
      // ignore
    }
    return (
      <div className="p-6 text-center">
        <p className="text-foreground-500 font-body">信号未找到</p>
      </div>
    );
  }

  const risk = riskLevelConfig[foundCase.riskLevel] || riskLevelConfig.P3;
  const isP0 = foundCase.riskLevel === 'P0';

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'summary', label: '信号摘要', icon: 'ri-flashlight-line' },
    { key: 'evidence', label: '证据与原文', icon: 'ri-file-text-line' },
    { key: 'progress', label: 'AI 分析进度', icon: 'ri-node-tree' },
    { key: 'history', label: '历史相似事件', icon: 'ri-history-line' },
    { key: 'review', label: '人工复核', icon: 'ri-shield-check-line' },
    { key: 'report', label: '完整报告', icon: 'ri-file-chart-line' },
    { key: 'log', label: '事件日志', icon: 'ri-timeline-view' },
  ];

  return (
    <div className="p-6 max-w-5xl space-y-6">
      {/* Signal Header */}
      <section className="rounded-lg bg-background-50 border border-background-200/70 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-foreground-500 font-mono font-body">{foundCase.id}</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${risk.bg} ${risk.text} font-label`}>
                {foundCase.riskLevel} · {risk.label}
              </span>
              <span className="px-2 py-0.5 rounded text-xs bg-secondary-50 text-secondary-700 font-label">
                {scenarioLabels[foundCase.scenario]}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-foreground-900 font-heading">{foundCase.title}</h2>
          </div>
          <span className={`px-3 py-1 rounded-lg text-xs font-semibold font-label ${
            foundCase.status === 'pending_review' ? 'bg-accent-50 text-accent-600' :
            foundCase.status === 'assigned' ? 'bg-primary-50 text-primary-600' :
            'bg-secondary-50 text-secondary-600'
          }`}>
            {statusLabels[foundCase.status]}
          </span>
        </div>

        <div className="grid grid-cols-5 gap-4 text-sm">
          <div>
            <span className="text-xs text-foreground-500 font-label block mb-0.5">来源渠道</span>
            <span className="text-foreground-800 font-body">{foundCase.source}</span>
          </div>
          <div>
            <span className="text-xs text-foreground-500 font-label block mb-0.5">频道</span>
            <span className="text-foreground-800 font-body">{foundCase.channel}</span>
          </div>
          <div>
            <span className="text-xs text-foreground-500 font-label block mb-0.5">置信度</span>
            <span className="text-foreground-800 font-mono font-body">{Math.round(foundCase.confidence * 100)}%</span>
          </div>
          <div>
            <span className="text-xs text-foreground-500 font-label block mb-0.5">责任团队</span>
            <div className="flex flex-wrap gap-1">
              {foundCase.assignedTeams.map((team) => (
                <span key={team} className="px-2 py-0.5 rounded bg-secondary-50 text-secondary-700 text-xs font-label">{team}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-foreground-500 font-label block mb-0.5">SLA</span>
            <span className={`font-mono font-body ${isP0 ? 'text-accent-600 font-semibold' : 'text-foreground-800'}`}>
              {foundCase.sla || '—'}
            </span>
          </div>
        </div>
      </section>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 px-1 py-1 rounded-full bg-background-50 border border-background-200/70 w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap font-label ${
              activeTab === tab.key
                ? 'bg-primary-500 text-background-50'
                : 'text-foreground-600 hover:text-foreground-800'
            }`}
          >
            <i className={`${tab.icon} text-[13px]`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'summary' && (
        <section className="rounded-lg bg-background-50 border border-background-200/70 p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-2">信号名称</h3>
                <p className="text-sm text-foreground-700 font-body">{foundCase.title}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[11px] text-foreground-500 font-label">信号类型</span>
                  <p className="text-sm font-semibold text-foreground-800 mt-0.5 font-body">{foundCase.scenario === 'brand' ? '品牌风险' : foundCase.scenario === 'cs' ? '服务信号' : foundCase.scenario === 'ops' ? '产品信号' : '混合信号'}</p>
                </div>
                <div>
                  <span className="text-[11px] text-foreground-500 font-label">优先级</span>
                  <p className={`text-sm font-semibold mt-0.5 font-body ${isP0 ? 'text-accent-600' : foundCase.riskLevel === 'P1' ? 'text-accent-500' : 'text-foreground-800'}`}>{foundCase.riskLevel} · {risk.label}</p>
                </div>
                <div>
                  <span className="text-[11px] text-foreground-500 font-label">置信度</span>
                  <p className="text-sm font-semibold text-foreground-800 mt-0.5 font-mono font-body">{Math.round(foundCase.confidence * 100)}%</p>
                </div>
                <div>
                  <span className="text-[11px] text-foreground-500 font-label">来源渠道</span>
                  <p className="text-sm text-foreground-700 mt-0.5 font-body">{foundCase.source}</p>
                </div>
                <div>
                  <span className="text-[11px] text-foreground-500 font-label">核心证据</span>
                  <p className="text-sm text-foreground-700 mt-0.5 font-body truncate">{foundCase.evidence[0]?.content || '—'}</p>
                </div>
                <div>
                  <span className="text-[11px] text-foreground-500 font-label">变化趋势</span>
                  <p className={`text-sm font-semibold mt-0.5 font-body ${isP0 ? 'text-accent-600' : 'text-foreground-700'}`}>
                    {foundCase.isPublic ? '上升中' : '稳定'}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-2">下一步行动</h3>
                <p className="text-sm text-foreground-600 font-body">
                  {foundCase.needsReview
                    ? '建议先完成人工复核，确认后再根据复核决定执行后续处理。'
                    : '已自动分派至责任团队，建议团队在 SLA 内完成处理并关闭。'}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg bg-background-100 border border-background-200/70 p-4">
                <span className="text-[11px] text-foreground-500 font-label">建议责任团队</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {foundCase.assignedTeams.map((team) => (
                    <span key={team} className="px-2.5 py-1 rounded-full bg-secondary-50 text-secondary-700 text-[11px] font-label">{team}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-background-100 border border-background-200/70 p-4">
                <span className="text-[11px] text-foreground-500 font-label">是否需要人工复核</span>
                <p className={`text-sm font-semibold mt-1 font-body ${foundCase.needsReview ? 'text-accent-600' : 'text-secondary-600'}`}>
                  {foundCase.needsReview ? '需要 · 已生成复核包' : '不需要 · 自动分派'}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'evidence' && (
        <>
          <section className="rounded-lg bg-background-50 border border-background-200/70 p-5">
            <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-4">证据列表</h3>
            <div className="space-y-2">
              {foundCase.evidence.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 p-3 rounded-lg bg-background-100 border border-background-200/70">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap font-label ${
                    ev.severity === 'high' ? 'bg-accent-100 text-accent-700' :
                    ev.severity === 'medium' ? 'bg-primary-50 text-primary-700' :
                    'bg-secondary-50 text-secondary-700'
                  }`}>
                    {ev.severity === 'high' ? '高' : ev.severity === 'medium' ? '中' : '低'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground-700 font-body">{ev.content}</p>
                    <p className="text-[11px] text-foreground-500 mt-1 font-body">{ev.source} · {ev.type === 'keyword' ? '关键词' : ev.type === 'quote' ? '原文引用' : ev.type === 'pattern' ? '模式识别' : '历史关联'}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg bg-background-50 border border-background-200/70 p-5">
            <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-4">原始反馈内容</h3>
            <div className="p-4 rounded-lg bg-background-100 border border-background-200/70">
              <p className="text-sm text-foreground-700 leading-relaxed whitespace-pre-wrap font-body">{foundCase.content}</p>
            </div>
          </section>
        </>
      )}

      {activeTab === 'progress' && (
        <PipelineSection pipeline={foundCase.pipeline} needsReview={foundCase.needsReview} />
      )}

      {activeTab === 'history' && (
        <section className="rounded-lg bg-background-50 border border-background-200/70 p-5">
          <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-4">历史相似事件</h3>
          {foundCase.relatedEvents.length > 0 ? (
            <div className="space-y-2">
              {foundCase.relatedEvents.map((ev) => {
                const histRisk = riskLevelConfig[ev.riskLevel];
                return (
                  <div key={ev.id} className="flex items-center justify-between p-3 rounded-lg bg-background-100 border border-background-200/70">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${histRisk?.bg || ''} ${histRisk?.text || ''} font-label`}>
                        {ev.riskLevel}
                      </span>
                      <div>
                        <p className="text-sm text-foreground-700 font-body">{ev.title}</p>
                        <p className="text-[11px] text-foreground-500 mt-0.5 font-body">{ev.outcome} · {ev.date}</p>
                      </div>
                    </div>
                    <span className="text-xs text-foreground-500 font-mono font-body">相似度 {Math.round(ev.similarity * 100)}%</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="ri-history-line text-3xl text-foreground-300 block mb-2"></i>
              <p className="text-sm text-foreground-500 font-body">没有找到高度相似的历史事件</p>
            </div>
          )}
        </section>
      )}

      {activeTab === 'review' && (
        <>
          <section className={`rounded-lg border p-5 ${foundCase.needsReview ? 'bg-accent-50/50 border-accent-200/70' : 'bg-background-50 border-background-200/70'}`}>
            <div className="flex items-center gap-2 mb-4">
              <i className={`text-lg ${foundCase.needsReview ? 'ri-shield-check-line text-accent-600' : 'ri-check-double-line text-secondary-500'}`}></i>
              <h3 className="text-sm font-semibold text-foreground-800 font-heading">人工复核</h3>
              {foundCase.needsReview ? (
                <span className="px-2 py-0.5 rounded bg-accent-100 text-accent-700 text-[11px] font-label">待处理</span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-secondary-50 text-secondary-600 text-[11px] font-label">无需复核</span>
              )}
            </div>

            {foundCase.needsReview ? (
              <>
                <p className="text-sm text-foreground-600 mb-2 font-body">
                  触发原因：<span className="font-semibold text-foreground-700">{foundCase.reviewReason}</span>
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="rounded-lg border border-accent-200/50 bg-background-50 p-4">
                    <p className="text-[11px] font-semibold text-accent-600 mb-2 font-label">AI 判断</p>
                    <p className="text-xs text-foreground-700 leading-relaxed font-body">
                      {foundCase.agentCalls[foundCase.agentCalls.length - 1]?.conclusion || '分析完成，建议人工确认'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-primary-200/50 bg-background-50 p-4">
                    <p className="text-[11px] font-semibold text-primary-600 mb-2 font-label">AI 建议动作</p>
                    <ul className="space-y-1">
                      {foundCase.agentCalls[foundCase.agentCalls.length - 1]?.keyFindings.slice(0, 3).map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-foreground-700 font-body">
                          <i className="ri-arrow-right-s-line text-foreground-400 text-[11px] mt-0.5"></i>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-4">
                  {decisionOptions.map((opt) => (
                    <button
                      key={opt.value}
                      className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-background-200/70 bg-background-50 hover:border-primary-300 hover:bg-primary-50/30 transition-all duration-150 cursor-pointer"
                    >
                      <i className={`${opt.icon} text-lg ${opt.color}`}></i>
                      <span className="text-xs font-medium text-foreground-700 font-label text-center">{opt.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground-500 font-label block mb-1">复核备注</label>
                    <textarea
                      placeholder="填写复核理由、决策依据或补充说明..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-800 placeholder:text-foreground-400 resize-none hover:border-background-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent-500 text-sm font-medium text-background-50 hover:bg-accent-600 transition-all duration-150 cursor-pointer whitespace-nowrap font-label">
                    <i className="ri-check-line"></i>
                    <span>确认复核决定</span>
                  </button>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-accent-50 border border-accent-200/70">
                  <div className="flex items-start gap-2">
                    <i className="ri-alert-line text-accent-500 text-sm mt-0.5"></i>
                    <div className="text-xs text-foreground-600 font-body">
                      <p className="font-semibold mb-1 text-accent-700">待人工确认</p>
                      <p className="text-foreground-600">
                        涉及对外回应、赔偿、认责、法律结论等动作，必须经人工确认后方可执行。
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-foreground-500 font-body">
                该信号置信度较高（{Math.round(foundCase.confidence * 100)}%），未触发人工复核规则。已自动分派至责任团队。
              </p>
            )}
          </section>
        </>
      )}

      {activeTab === 'report' && (
        <section className="rounded-lg bg-background-50 border border-background-200/70 p-6">
          <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-4">
            <i className="ri-file-chart-line text-primary-500 mr-2"></i>
            客户声音分析报告
          </h3>
          <div className="space-y-4">
            <div className="rounded-lg bg-background-100 border border-background-200/70 p-4">
              <h4 className="text-xs font-semibold text-foreground-700 font-label mb-2">摘要</h4>
              <p className="text-sm text-foreground-600 leading-relaxed font-body">
                经 9 阶段 AI 分析，识别为{foundCase.scenario === 'brand' ? '品牌风险信号' : foundCase.scenario === 'cs' ? '服务信号' : foundCase.scenario === 'ops' ? '产品信号' : '混合信号'}，
                优先级 {foundCase.riskLevel}，置信度 {Math.round(foundCase.confidence * 100)}%。
                建议责任团队：{foundCase.assignedTeams.join('、')}。
                {foundCase.needsReview ? '该分析结果已暂存，等待人工复核确认后发布。' : '该分析结果已自动分派。'}
              </p>
            </div>
            <div className="rounded-lg bg-background-200/50 border border-background-200/70 p-4">
              <h4 className="text-xs font-semibold text-foreground-700 font-label mb-2">禁止自动执行的动作</h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-foreground-600 font-body">
                <li>未经确认自动赔偿或退款</li>
                <li>未经确认对外发布回应或声明</li>
                <li>未经确认代表企业认责</li>
                <li>绕过权限查看敏感数据</li>
                <li>自动关闭高风险信号</li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'log' && (
        <section className="rounded-lg bg-background-50 border border-background-200/70 p-5">
          <h3 className="text-sm font-semibold text-foreground-800 font-heading mb-4">事件日志</h3>
          <div className="space-y-0">
            {foundCase.eventLog.map((log, idx) => (
              <div key={log.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    log.actor === 'agent' ? 'bg-primary-400' :
                    log.actor === 'system' ? 'bg-foreground-400' :
                    'bg-secondary-400'
                  }`}></div>
                  {idx < foundCase.eventLog.length - 1 && (
                    <div className="w-0.5 flex-1 min-h-[16px] bg-background-200"></div>
                  )}
                </div>
                <div className="pb-3">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-foreground-800 font-label">{log.node}</span>
                    <span className="text-[11px] text-foreground-500 font-mono font-body">{log.timestamp}</span>
                  </div>
                  <p className="text-xs text-foreground-600 font-body">
                    <span className="font-medium">{log.action}</span> — {log.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
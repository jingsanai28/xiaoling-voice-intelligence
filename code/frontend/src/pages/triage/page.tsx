import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ScenarioType } from '@/types/risk';

const scenarios: { key: ScenarioType; label: string; desc: string; icon: string }[] = [
  { key: 'brand', label: '品牌舆情', desc: '社媒帖子、投诉平台、新闻报道、品牌搜索', icon: 'ri-megaphone-line' },
  { key: 'cs', label: '客服质检', desc: '客服回复、用户对话、售后沟通记录', icon: 'ri-customer-service-2-line' },
  { key: 'ops', label: '运营反馈', desc: '批量评论、App 反馈、社群吐槽、工单摘要', icon: 'ri-bar-chart-grouped-line' },
];

const sourceOptions: Record<string, string[]> = {
  brand: ['小红书帖子', '投诉平台记录', '新闻报道', '社媒评论', '品牌关键词搜索'],
  cs: ['客服回复', '用户与客服对话', '售后沟通记录'],
  ops: ['批量评论', 'App 反馈', '社群吐槽', '问卷开放题', '工单摘要'],
};

export default function NewTriage() {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState<ScenarioType>('brand');
  const [source, setSource] = useState('');
  const [channel, setChannel] = useState('');
  const [content, setContent] = useState('');
  const [background, setBackground] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [hasSensitive, setHasSensitive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const maxContentLength = 3000;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!source.trim()) newErrors.source = '请选择反馈来源';
    if (!content.trim()) newErrors.content = '请输入反馈内容';
    if (content.length > maxContentLength) newErrors.content = `内容不能超过 ${maxContentLength} 字符`;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = useCallback(() => {
    if (!validate()) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      const newId = `CASE-2026-${Date.now().toString().slice(-3)}`;
      try {
        const stored = localStorage.getItem('triage_cases');
        const cases = stored ? JSON.parse(stored) : [];
        cases.unshift({
          id: newId,
          scenario,
          source,
          channel,
          content,
          background,
          isPublic,
          hasSensitive,
          timestamp: new Date().toISOString(),
          status: 'pending',
        });
        localStorage.setItem('triage_cases', JSON.stringify(cases.slice(0, 50)));
      } catch {
        // ignore
      }
      navigate(`/triage/${newId}`);
    }, 2400);
  }, [scenario, source, channel, content, background, isPublic, hasSensitive, navigate]);

  const handleClear = () => {
    setSource('');
    setChannel('');
    setContent('');
    setBackground('');
    setIsPublic(false);
    setHasSensitive(false);
    setErrors({});
  };

  return (
    <div className="p-6 max-w-3xl">
      {/* Page intro */}
      <div className="mb-6">
        <h1 className="text-base font-semibold text-foreground-900 font-heading mb-1">新建分析</h1>
        <p className="text-xs text-foreground-500 font-body">
          上传评论、客服对话、投诉或工单，开始提炼高价值客户声音。
        </p>
      </div>

      {/* Scenario Selector */}
      <div className="mb-6">
        <label className="text-xs font-semibold text-foreground-500 uppercase tracking-wider font-label mb-3 block">
          分析范围
        </label>
        <div className="grid grid-cols-3 gap-3">
          {scenarios.map((s) => {
            const active = scenario === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setScenario(s.key)}
                className={`flex flex-col items-start gap-2 p-4 rounded-lg border transition-all duration-150 cursor-pointer text-left ${
                  active
                    ? 'border-primary-400 bg-primary-50'
                    : 'border-background-200/70 bg-background-50 hover:border-background-300'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-lg ${active ? 'bg-primary-500 text-background-50' : 'bg-background-100 text-foreground-500'}`}>
                  <i className={`${s.icon} text-sm`}></i>
                </div>
                <div>
                  <p className={`text-sm font-semibold font-label ${active ? 'text-primary-700' : 'text-foreground-700'}`}>
                    {s.label}
                  </p>
                  <p className="text-[11px] text-foreground-500 mt-0.5 font-body">{s.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-background-200/70 mb-6"></div>

      {/* Source + Channel */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground-500 uppercase tracking-wider font-label">数据来源</label>
          <div className="relative">
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm appearance-none cursor-pointer font-body transition-colors ${
                errors.source ? 'border-accent-400 bg-accent-50/50' : 'border-background-200/70 bg-background-50 text-foreground-800 hover:border-background-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20'
              } outline-none`}
            >
              <option value="">选择来源...</option>
              {(sourceOptions[scenario] || []).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <i className="ri-arrow-down-s-line text-foreground-400 text-sm"></i>
            </div>
          </div>
          {errors.source && <p className="text-xs text-accent-600 font-body">{errors.source}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-foreground-500 uppercase tracking-wider font-label">渠道</label>
          <input
            type="text"
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="如：小红书、微博、在线客服..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-800 placeholder:text-foreground-400 hover:border-background-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 mb-5">
        <label className="text-xs font-semibold text-foreground-500 uppercase tracking-wider font-label">反馈内容</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请粘贴或输入完整的反馈内容...&#10;&#10;提示：越详细的内容越有助于 AI 准确判断信号类型和优先处理。"
          rows={10}
          className={`w-full px-4 py-3 rounded-lg border text-sm resize-none outline-none transition-colors font-body leading-relaxed ${
            errors.content ? 'border-accent-400 bg-accent-50/50' : 'border-background-200/70 bg-background-50 text-foreground-800 placeholder:text-foreground-400 hover:border-background-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20'
          }`}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-foreground-400 font-body">
            AI 将自动识别关键信息、高价值信号和历史相似事件
          </span>
          <span className={`text-xs font-mono tabular-nums font-body ${content.length > maxContentLength ? 'text-accent-500' : 'text-foreground-400'}`}>
            {content.length}/{maxContentLength}
          </span>
        </div>
      </div>

      {/* Background */}
      <div className="flex flex-col gap-1.5 mb-5">
        <label className="text-xs font-semibold text-foreground-500 uppercase tracking-wider font-label">
          补充背景 <span className="text-foreground-400 font-normal">（选填）</span>
        </label>
        <textarea
          value={background}
          onChange={(e) => setBackground(e.target.value)}
          placeholder="补充任何有助于 AI 判断的背景信息，如已知的产品问题、历史投诉、相关公告等..."
          rows={3}
          className="w-full px-4 py-3 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-800 placeholder:text-foreground-400 resize-none hover:border-background-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
        />
      </div>

      {/* Toggle row */}
      <div className="flex items-center gap-6 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${isPublic ? 'bg-accent-500' : 'bg-background-300'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background-50 transition-transform duration-200 ${isPublic ? 'left-5' : 'left-0.5'}`}></span>
          </button>
          <span className="text-sm text-foreground-600 font-body">该反馈已在公开平台传播</span>
          {isPublic && (
            <span className="px-2 py-0.5 rounded text-[11px] bg-accent-50 text-accent-600 font-label">
              需关注扩散风险
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasSensitive(!hasSensitive)}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${hasSensitive ? 'bg-accent-500' : 'bg-background-300'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-background-50 transition-transform duration-200 ${hasSensitive ? 'left-5' : 'left-0.5'}`}></span>
          </button>
          <span className="text-sm text-foreground-600 font-body">包含敏感数据</span>
          {hasSensitive && (
            <span className="px-2 py-0.5 rounded text-[11px] bg-accent-50 text-accent-600 font-label">
              自动脱敏处理
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSubmit}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary-500 text-sm font-medium text-background-50 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer whitespace-nowrap font-label"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-background-50/30 border-t-background-50 animate-spin"></div>
              <span>AI 分析中...</span>
            </>
          ) : (
            <>
              <i className="ri-play-circle-line text-base"></i>
              <span>开始分析</span>
            </>
          )}
        </button>
        <button
          onClick={handleClear}
          disabled={isAnalyzing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-600 hover:bg-background-200/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer whitespace-nowrap font-label"
        >
          <i className="ri-delete-back-line text-base"></i>
          <span>清空</span>
        </button>
      </div>

      {/* Upload hint */}
      <div className="mt-5 mb-2 p-4 rounded-lg bg-background-50 border border-dashed border-background-300/60 text-center">
        <i className="ri-upload-cloud-2-line text-2xl text-foreground-400 block mb-2"></i>
        <p className="text-sm text-foreground-500 font-body">
          拖拽文件到此处上传，或 <span className="text-primary-600 cursor-pointer hover:text-primary-700 font-medium">点击选择文件</span>
        </p>
        <p className="text-[11px] text-foreground-400 mt-1 font-body">
          支持 Excel、CSV、JSON 格式的评论、客服记录、投诉、工单或问卷数据
        </p>
      </div>

      {/* Safety Notice */}
      <div className="p-3 rounded-lg bg-background-200/50 border border-background-200/70">
        <div className="flex items-start gap-2">
          <i className="ri-information-line text-sm text-foreground-500 mt-0.5"></i>
          <div className="text-xs text-foreground-500 font-body">
            <p className="font-semibold text-foreground-600 mb-0.5">安全提示</p>
            <p>AI 仅负责分析、降噪和判断建议。高风险结果不会自动对外执行。涉及认责、赔偿、公开发布等敏感动作均需人工确认。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
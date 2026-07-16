import { useState, useRef, useEffect, useCallback } from 'react';
import EventPanel from '@/pages/workspace/components/EventPanel';
import TaskModal from '@/pages/workspace/components/TaskModal';
import { statusSteps, quickQuestions } from '@/mocks/conversation';
import { toEventCard, triageApi } from '@/services/triageApi';
import type { TriageResult } from '@/services/triageApi';
import type { AnalysisPlan, ConversationMessage, EventCardData, StatusLine } from '@/types/conversation';

const exampleCases = [
  { label: '产品质量争议', text: '在小红书上看到某博主发布了关于XX品牌羽绒服的帖子，声称产品宣传的"90%白鹅绒"实际检测只有不到50%，帖子已获得超过2万点赞和3000多条评论...' },
  { label: '客服对话激化', text: '用户在在线客服渠道投诉产品使用过程中出现数据丢失问题。客服回复："这个我们也没办法，建议您等待系统更新。"用户将对话截图发布到微博，已有500+转发。' },
  { label: '支付故障批量投诉', text: '近三天共有87条来自App内反馈和客服工单的用户投诉，均反映在支付环节出现"支付失败，请稍后重试"错误。' },
];

const analysisPlan: AnalysisPlan = {
  title: '本次分析计划',
  summary: '先确认输入和权限，再调用需要的专业 Agent，最后结合企业知识、历史事件和复核规则输出结果。',
  steps: [
    { key: 'input', label: '确认输入与权限', detail: '检查来源、渠道、敏感信息和访问范围', object: '系统节点' },
    { key: 'route', label: '判断分析方向', detail: '由 Supervisor 选择品牌、客服或运营 Agent', object: 'Supervisor Agent' },
    { key: 'signal', label: '提炼高价值信号', detail: '降噪、聚合主题、识别证据和影响范围', object: '业务 Agent' },
    { key: 'context', label: '补充企业依据', detail: '检索知识库、联网资料和相似历史事件', object: 'Knowledge / Memory' },
    { key: 'decision', label: '校准并决定下一步', detail: '判断风险，必要时生成 Human Review 复核包', object: 'Risk Gate' },
  ],
};

let msgCounter = 0;
function nextMsgId() {
  msgCounter += 1;
  return `msg-${Date.now()}-${msgCounter}`;
}

function nowISO() {
  return new Date().toISOString();
}

export default function WorkspacePage() {
  const [messages, setMessages] = useState<ConversationMessage[]>(() => [
    {
      id: nextMsgId(),
      type: 'welcome',
      content: '把一段评论、投诉、客服对话或社媒反馈发给我。我会先生成事件分析，然后我们可以继续追问。',
      timestamp: nowISO(),
      sender: 'xiao-ling',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'result' | 'conversing'>('idle');
  const [eventData, setEventData] = useState<EventCardData | null>(null);
  const [analysisResult, setAnalysisResult] = useState<TriageResult | null>(null);
  const [taskAdded, setTaskAdded] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskAssignee, setTaskAssignee] = useState('');
  const [pendingImages, setPendingImages] = useState<{ url: string; label: string }[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const pushTimer = (t: ReturnType<typeof setTimeout>) => timersRef.current.push(t);

  const addMessage = useCallback((msg: ConversationMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const handleSubmitAnalysis = async () => {
    const text = inputText.trim();
    if (!text) return;

    // Add user message
    const userMsg: ConversationMessage = {
      id: nextMsgId(),
      type: 'user-text',
      content: text,
      timestamp: nowISO(),
      sender: 'user',
    };
    addMessage(userMsg);
    setInputText('');
    setPhase('analyzing');

    addMessage({
      id: nextMsgId(),
      type: 'analysis-plan',
      plan: analysisPlan,
      timestamp: nowISO(),
      sender: 'xiao-ling',
    });

    // Add status message
    const statusMsg: ConversationMessage = {
      id: nextMsgId(),
      type: 'system-status',
      statusLines: [{ text: statusSteps[0], done: false }],
      timestamp: nowISO(),
      sender: 'xiao-ling',
    };
    addMessage(statusMsg);

    // Simulate status steps appearing one by one
    const stepDelay = 1000;
    statusSteps.forEach((step, i) => {
      if (i === 0) return; // first one already shown
      pushTimer(
        setTimeout(() => {
          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== statusMsg.id) return m;
              const lines = [...(m.statusLines || [])];
              // mark previous as done
              if (lines.length > 0) lines[lines.length - 1] = { ...lines[lines.length - 1], done: true };
              lines.push({ text: step, done: false });
              return { ...m, statusLines: lines };
            }),
          );
        }, i * stepDelay),
      );
    });

    try {
      // 首次分析直接调用 Python LangGraph API，前端不再用本地规则生成结果。
      const result = await triageApi.analyze({ taskId: `playground-${Date.now()}`, rawInput: text, userRole: 'admin' });
      const card = toEventCard(result);
      setAnalysisResult(result);
      setEventData(card);
      setMessages((prev) => prev.map((m) => m.id === statusMsg.id ? { ...m, statusLines: (m.statusLines || []).map((l) => ({ ...l, done: true })) } : m));
      addMessage({ id: nextMsgId(), type: 'event-card', eventData: card, timestamp: nowISO(), sender: 'xiao-ling' });
      setPhase('result');
    } catch (error) {
      setMessages((prev) => prev.map((m) => m.id === statusMsg.id ? { ...m, statusLines: (m.statusLines || []).map((l) => ({ ...l, done: false })) } : m));
      addMessage({
        id: nextMsgId(),
        type: 'system-response',
        content: `真实分析服务暂时不可用：${error instanceof Error ? error.message : '请确认小聆 API 已启动。'}`,
        timestamp: nowISO(),
        sender: 'xiao-ling',
      });
      setPhase('idle');
    }
  };

  const sendFollowUp = async (question: string, attachments: Array<Record<string, string>> = []) => {
    // Add user question
    const userMsg: ConversationMessage = {
      id: nextMsgId(),
      type: 'user-text',
      content: question,
      timestamp: nowISO(),
      sender: 'user',
    };
    addMessage(userMsg);

    try {
      const response = await triageApi.followUp({ taskId: eventData?.caseId || '', message: question, attachments });
      addMessage({ id: nextMsgId(), type: 'system-response', content: response.answer, timestamp: nowISO(), sender: 'xiao-ling' });
    } catch (error) {
      addMessage({ id: nextMsgId(), type: 'system-response', content: `继续分析失败：${error instanceof Error ? error.message : '请稍后重试。'}`, timestamp: nowISO(), sender: 'xiao-ling' });
    }

    if (phase === 'result') setPhase('conversing');
  };

  const handleQuickQuestion = (question: string) => {
    void sendFollowUp(question);
  };

  const handleFreeTextSubmit = () => {
    const text = inputText.trim();
    if (!text && pendingImages.length === 0) return;

    if (pendingImages.length > 0) {
      // Add image messages
      pendingImages.forEach((img) => {
        const imgMsg: ConversationMessage = {
          id: nextMsgId(),
          type: 'user-image',
          imageUrl: img.url,
          imageLabel: img.label,
          timestamp: nowISO(),
          sender: 'user',
        };
        addMessage(imgMsg);
      });

      setPendingImages([]);

      void sendFollowUp(text || '请结合我补充的图片证据，重新判断当前事件的风险和下一步动作。', pendingImages.map((img) => ({ name: img.label, type: 'image' })));
      return;
    }

    // Regular text follow-up
    setInputText('');

    void sendFollowUp(text);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const url = URL.createObjectURL(files[i]);
      setPendingImages((prev) => [...prev, { url, label: `已补充图片证据 · ${files[i].name}` }]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingImage = (index: number) => {
    setPendingImages((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const handleTaskConfirm = async (data: { title: string; team: string; assignee: string; priority: string; deadline: string; description: string }) => {
    setTaskAdded(true);
    setTaskAssignee(data.assignee || data.team);
    setShowTaskModal(false);

    try {
      await triageApi.createTask(eventData?.caseId || '');
      addMessage({ id: nextMsgId(), type: 'system-info', content: `该事件已添加到任务，当前负责人为${data.assignee || data.team}，优先级为 ${data.priority}。`, timestamp: nowISO(), sender: 'xiao-ling' });
    } catch (error) {
      setTaskAdded(false);
      addMessage({ id: nextMsgId(), type: 'system-response', content: `任务创建失败：${error instanceof Error ? error.message : '请稍后重试。'}`, timestamp: nowISO(), sender: 'xiao-ling' });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (phase === 'idle') {
        handleSubmitAnalysis();
      } else {
        handleFreeTextSubmit();
      }
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* ========== LEFT: Conversation ========== */}
      <div className="flex-[3] flex flex-col min-w-0 bg-background-50">
        {/* Header bar — compact title */}
        <div className="px-5 pt-4 pb-2 flex-shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-base font-semibold text-foreground-900 font-heading">与小聆持续分析一条客户声音</h1>
          </div>
          <p className="text-[11px] text-foreground-500 font-body">
            提交客户评论、投诉、客服记录或社媒反馈。小聆会先生成事件分析，你可以继续追问或补充证据。
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.map((msg) => {
            if (msg.type === 'welcome') {
              return (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-sound-module-line text-xs text-primary-600"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground-700 leading-relaxed font-body">{msg.content}</p>
                  </div>
                </div>
              );
            }

            if (msg.type === 'user-text') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-md bg-primary-500 text-background-50">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap font-body">{msg.content}</p>
                  </div>
                </div>
              );
            }

            if (msg.type === 'user-image') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div className="max-w-[75%] rounded-2xl rounded-br-md overflow-hidden border border-background-200/70 bg-background-50">
                    <img src={msg.imageUrl} alt="uploaded evidence" className="w-full max-h-48 object-cover" />
                    <div className="px-3 py-2 bg-background-100 border-t border-background-200/70">
                      <p className="text-[11px] text-foreground-600 font-body flex items-center gap-1.5">
                        <i className="ri-image-add-line text-foreground-400"></i>
                        {msg.imageLabel || '已补充图片证据'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            if (msg.type === 'analysis-plan' && msg.plan) {
              return (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-route-line text-xs text-primary-600"></i>
                  </div>
                  <div className="flex-1 min-w-0 max-w-[500px]">
                    <div className="rounded-xl border border-primary-200/70 bg-primary-50/40 p-4">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <p className="text-xs font-semibold text-foreground-800 font-label">{msg.plan.title}</p>
                        <span className="text-[10px] text-primary-600 font-label">{msg.plan.steps.length} 步</span>
                      </div>
                      <p className="text-[11px] text-foreground-600 leading-relaxed font-body mb-3">{msg.plan.summary}</p>
                      <div className="space-y-2">
                        {msg.plan.steps.map((step, index) => (
                          <div key={step.key} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-background-50 border border-primary-200 text-[9px] text-primary-600 flex items-center justify-center flex-shrink-0 font-mono">{index + 1}</span>
                            <div className="min-w-0">
                              <p className="text-[11px] text-foreground-700 font-label">{step.label} <span className="text-foreground-400 font-body">· {step.object}</span></p>
                              <p className="text-[10px] text-foreground-500 font-body">{step.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-foreground-400 font-body mt-3 pt-2 border-t border-primary-200/50">执行后可在右侧展开每一步的 Agent、工具、依据和产出摘要。</p>
                    </div>
                  </div>
                </div>
              );
            }

            if (msg.type === 'system-status') {
              const lines = msg.statusLines || [];
              return (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="relative flex w-3 h-3">
                      <span className="absolute inline-flex w-full h-full rounded-full bg-primary-400 animate-ping opacity-60"></span>
                      <span className="relative inline-flex rounded-full w-3 h-3 bg-primary-500"></span>
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="space-y-1.5">
                      {lines.map((line, i) => (
                        <div key={i} className="flex items-center gap-2">
                          {line.done ? (
                            <i className="ri-check-line text-[13px] text-secondary-500 flex-shrink-0"></i>
                          ) : (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-primary-400 border-t-transparent animate-spin flex-shrink-0"></span>
                          )}
                          <span className={`text-xs font-body ${line.done ? 'text-foreground-500' : 'text-foreground-700'}`}>
                            {line.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            if (msg.type === 'event-card' && msg.eventData) {
              const ed = msg.eventData;
              const riskBg =
                ed.riskLevel === 'P0' ? 'bg-accent-100 text-accent-700' :
                ed.riskLevel === 'P1' ? 'bg-accent-50 text-accent-600' :
                'bg-primary-50 text-primary-700';
              return (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-sound-module-line text-xs text-primary-600"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="rounded-xl border border-background-200/70 bg-background-50 overflow-hidden max-w-[420px]">
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-mono text-foreground-400">{ed.id}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold font-label ${riskBg}`}>
                            {ed.riskLevel}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary-50 text-secondary-700 font-label">
                            {ed.signalLabel}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-foreground-800 font-heading leading-snug mb-2">{ed.title}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {ed.teams.map((team) => (
                            <span key={team} className="px-2 py-0.5 rounded-full bg-secondary-50 text-secondary-700 text-[10px] font-label">{team}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="text-foreground-500 font-body">置信度 {Math.round(ed.confidence * 100)}%</span>
                          {ed.needsReview && (
                            <span className="text-accent-600 font-semibold font-label">待人工复核</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            if (msg.type === 'system-response') {
              return (
                <div key={msg.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-sound-module-line text-xs text-primary-600"></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground-700 leading-relaxed font-body">{msg.content}</p>
                  </div>
                </div>
              );
            }

            if (msg.type === 'system-info') {
              return (
                <div key={msg.id} className="flex justify-center">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary-50 border border-secondary-200/70 text-[11px] text-secondary-700 font-body">
                    <i className="ri-information-line"></i>
                    {msg.content}
                  </div>
                </div>
              );
            }

            return null;
          })}
          <div ref={messagesEndRef}></div>
        </div>

        {/* Input Area */}
        <div className="px-5 py-3 border-t border-background-200/70 flex-shrink-0">
          {phase === 'idle' && inputText.trim() && (
            <div className="mb-3 rounded-lg border border-primary-200/70 bg-primary-50/40 px-3 py-2.5">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-semibold text-foreground-700 font-label">开始前预览 · {analysisPlan.steps.length} 步</span>
                <span className="text-[10px] text-primary-600 font-label">可调整输入后再开始</span>
              </div>
              <p className="text-[10px] text-foreground-500 font-body leading-relaxed">{analysisPlan.summary}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {analysisPlan.steps.map((step, index) => (
                  <span key={step.key} className="text-[10px] text-foreground-600 font-body"><span className="text-primary-600 font-mono">{index + 1}</span> {step.label}</span>
                ))}
              </div>
            </div>
          )}

          {/* Quick questions */}
          {phase !== 'idle' && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuickQuestion(q)}
                  className="px-2.5 py-1 rounded-full border border-background-200/70 bg-background-100 text-[11px] text-foreground-600 hover:border-primary-300 hover:text-primary-700 transition-all cursor-pointer whitespace-nowrap font-body"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Pending images preview */}
          {pendingImages.length > 0 && (
            <div className="flex gap-2 mb-2 flex-wrap">
              {pendingImages.map((img, idx) => (
                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-background-200/70 group">
                  <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePendingImage(idx)}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-foreground-800/60 text-background-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <i className="ri-close-line text-[10px]"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="flex items-end gap-2">
            {/* Image upload button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 flex items-center justify-center rounded-lg border border-background-200/70 bg-background-50 text-foreground-400 hover:text-foreground-600 hover:border-background-300 transition-colors cursor-pointer flex-shrink-0"
              title="上传图片证据"
            >
              <i className="ri-image-add-line text-base"></i>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Text input */}
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                phase === 'idle'
                  ? '粘贴一段客户评论、投诉、客服对话或社媒反馈...'
                  : '继续追问，或者补充新的证据和背景……'
              }
              rows={2}
              className="flex-1 px-3.5 py-2 rounded-lg border border-background-200/70 bg-background-50 text-sm text-foreground-800 placeholder:text-foreground-400 resize-none hover:border-background-300 focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 outline-none font-body"
            />

            {/* Submit button */}
            <button
              type="button"
              onClick={phase === 'idle' ? handleSubmitAnalysis : handleFreeTextSubmit}
              disabled={phase === 'analyzing' || (!inputText.trim() && pendingImages.length === 0)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-500 text-sm font-medium text-background-50 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer whitespace-nowrap flex-shrink-0 font-label"
            >
              {phase === 'idle' ? (
                <>
                  <i className="ri-play-circle-line text-base"></i>
                  <span>开始分析</span>
                </>
              ) : (
                <>
                  <i className="ri-send-plane-line text-base"></i>
                  <span>发送</span>
                </>
              )}
            </button>
          </div>

          {/* Example cases - only before first analysis */}
          {phase === 'idle' && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-[10px] text-foreground-400 font-body self-center mr-1">试试：</span>
              {exampleCases.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => setInputText(ex.text)}
                  className="px-2.5 py-1 rounded-full border border-background-200/70 bg-background-100 text-[10px] text-foreground-500 hover:border-primary-300 hover:text-primary-700 transition-all cursor-pointer whitespace-nowrap font-body"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========== RIGHT: Event Panel ========== */}
      <div className="flex-[2] border-l border-background-200/70 min-w-0 hidden lg:flex flex-col">
        <EventPanel
          eventData={eventData}
          analysis={analysisResult}
          onAddToTask={() => setShowTaskModal(true)}
          onContinue={() => inputRef.current?.focus()}
          onAddEvidence={() => fileInputRef.current?.click()}
          taskAdded={taskAdded}
        />
      </div>

      {/* Task Modal */}
      {showTaskModal && eventData && (
        <TaskModal
          eventData={eventData}
          onConfirm={handleTaskConfirm}
          onClose={() => setShowTaskModal(false)}
        />
      )}
    </div>
  );
}

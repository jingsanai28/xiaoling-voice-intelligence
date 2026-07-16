import type { EventCardData } from '@/types/conversation';

export const statusSteps: string[] = [
  '正在检查输入...',
  '正在调用专业 Agent...',
  '正在匹配历史事件...',
  '正在生成事件分析...',
];

const eventCards: Record<string, EventCardData> = {
  brand: {
    id: 'EVT-001',
    signalType: 'brand_risk',
    signalLabel: '品牌风险',
    title: '用户公开发布售后聊天截图，争议正在评论区扩散，同时涉及客服承诺变化和品牌处理透明度问题',
    riskLevel: 'P0',
    confidence: 0.87,
    needsReview: true,
    teams: ['品牌/公关', '法务'],
    summary: '小红书博主发布检测报告质疑产品材质，已获2万赞3000评论，评论区出现"12315投诉"关键词，多家自媒体转发，存在品牌危机和监管介入风险。',
    caseId: 'CASE-2026-101',
  },
  cs: {
    id: 'EVT-002',
    signalType: 'service_signal',
    signalLabel: '服务信号',
    title: '客服回复"我们也没办法"引发用户情绪激化，对话截图已被发布到微博',
    riskLevel: 'P1',
    confidence: 0.91,
    needsReview: true,
    teams: ['客服', '品牌/公关'],
    summary: '客服在用户投诉数据丢失时回应"我们也没办法"，未提供升级路径。用户将对话截图发布到微博，已获500+转发，同时涉及产品核心链路问题。',
    caseId: 'CASE-2026-102',
  },
  ops: {
    id: 'EVT-003',
    signalType: 'product_signal',
    signalLabel: '产品信号',
    title: 'App 支付模块连续三天大量用户反馈支付失败',
    riskLevel: 'P1',
    confidence: 0.76,
    needsReview: false,
    teams: ['运营/产品', '技术'],
    summary: '近三天87条反馈指向同一支付故障，影响全支付方式和双端用户。部分用户放弃购买，工单量上升，虽未公开传播但核心链路风险不可忽视。',
    caseId: 'CASE-2026-103',
  },
  mixed: {
    id: 'EVT-004',
    signalType: 'brand_risk',
    signalLabel: '品牌与客服混合事件',
    title: '直播间"限时优惠"结束后仍以同价销售，用户投诉虚假宣传',
    riskLevel: 'P1',
    confidence: 0.83,
    needsReview: true,
    teams: ['客服', '品牌/公关', '运营/产品'],
    summary: '直播营销话术"最后100单"与实际持续同价销售不符，客服回复回避用户核心质疑。微博约200条讨论，用户向平台举报虚假宣传，涉及合规风险。',
    caseId: 'CASE-2026-104',
  },
  security: {
    id: 'EVT-005',
    signalType: 'product_signal',
    signalLabel: '产品信号',
    title: '用户反馈个人信息在App内被其他用户可见，疑似数据泄露',
    riskLevel: 'P0',
    confidence: 0.92,
    needsReview: true,
    teams: ['运营/产品', '技术', '法务'],
    summary: '用户在App内可看到其他用户的收货地址和手机号码，已截图保存证据。虽仅1条反馈，但涉及数据安全和个人信息保护法合规风险，属于安全事故级别。',
    caseId: 'CASE-2026-105',
  },
};

export function matchEventCard(input: string): EventCardData {
  const lower = input.toLowerCase();
  if (lower.includes('材质') || lower.includes('检测报告') || lower.includes('宣传不符') || lower.includes('白鹅绒') || lower.includes('羽绒服')) {
    return { ...eventCards.brand };
  }
  if ((lower.includes('客服') && lower.includes('没办法')) || (lower.includes('客服') && lower.includes('截图')) || lower.includes('话术')) {
    return { ...eventCards.cs };
  }
  if (lower.includes('支付失败') || lower.includes('支付模块') || lower.includes('批量')) {
    return { ...eventCards.ops };
  }
  if (lower.includes('数据泄露') || lower.includes('个人信息') || lower.includes('隐私')) {
    return { ...eventCards.security };
  }
  if ((lower.includes('直播') && lower.includes('优惠')) || lower.includes('虚假宣传') || lower.includes('诈骗')) {
    return { ...eventCards.mixed };
  }
  if (lower.includes('客服') || lower.includes('对话') || lower.includes('投诉')) {
    return { ...eventCards.cs };
  }
  return { ...eventCards.brand };
}

export const quickQuestions: string[] = [
  '为什么是这个优先级？',
  '最关键的证据是什么？',
  '下一步应该先做什么？',
  '还缺少哪些信息？',
];

export const quickAnswers: Record<string, string> = {
  '为什么是这个优先级？': '当前主要依据三个维度综合判定：1）公开平台扩散程度（传播量已超阈值）；2）证据可信度（实物证据/截图佐证）；3）投诉关键词匹配（涉及监管/合规风险信号）。综合评定为当前等级。如果需要调整，可以在人工复核阶段修改。',
  '最关键的证据是什么？': '最关键的证据有两项：1）实物证据/原始截图——可信度最高，能够直接佐证用户反馈；2）公开传播数据——高互动量表明话题正在扩散，不是孤立反馈。两项证据结合，说明这是一个正在发酵的事件而非单次投诉。',
  '下一步应该先做什么？': '建议三步并行：1）相应责任团队先核对原始记录和事实；2）品牌/公关团队同步观察公开传播趋势；3）如涉及法律或合规风险，法务团队评估是否需要提前介入。具体行动顺序可在任务中标记。',
  '还缺少哪些信息？': '目前可能缺少：1）是否有更多用户在私下渠道投诉（客服工单、邮件等）未纳入分析；2）相关方的完整性和权威性需要验证；3）品牌方是否有过往类似事件的处理记录可供参考。建议补充这些信息后再做最终决策。',
};

export const contextualResponses: string[] = [
  '基于当前事件的分析，我注意到你提到的这个角度确实值得深入关注。让我基于已有的分析结果，给你一个更详细的解读：从目前掌握的证据来看，这个维度与现有分析结论是一致的，不需要重新校准优先级。',
  '这是一个很好的追问。从已有证据来看，你提到的这一点在最初的分析中已经有所覆盖，但我可以展开讲讲——目前的判断主要基于已确认的证据，如果你有新的材料可以补充，我会重新评估。',
  '感谢补充这个背景信息。让我确认一下：你提到的这个情况如果属实，可能会影响当前的评估结论。建议你在右侧面板中补充这一条作为证据，或者直接在任务中备注给责任团队。',
];

export function getContextualResponse(): string {
  return contextualResponses[Math.floor(Math.random() * contextualResponses.length)];
}
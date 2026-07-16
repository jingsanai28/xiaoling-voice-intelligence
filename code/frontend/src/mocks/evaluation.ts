import type { RiskLevel, BadCaseType } from '@/types/risk';

export interface BadCaseEntry {
  id: string;
  caseId: string;
  caseTitle: string;
  errorType: BadCaseType;
  errorLabel: string;
  originalJudgment: string;
  correctedJudgment: string;
  correctedBy: string;
  correctedAt: string;
  status: 'pending_review' | 'confirmed' | 'in_eval_set' | 'fixed';
  notes: string;
  scenario: string;
  originalRisk: RiskLevel;
  correctedRisk: RiskLevel;
}

export interface EvalSetItem {
  id: string;
  name: string;
  description: string;
  caseCount: number;
  scenarios: string[];
  createdAt: string;
  updatedAt: string;
  passRate?: string;
  cases: {
    caseId: string;
    title: string;
    expectedRisk: RiskLevel;
    expectedScenario: string;
    expectedReview: boolean;
    addedFrom: 'bad_case' | 'real_case' | 'edge_case';
  }[];
}

export interface IterationRecord {
  id: string;
  version: string;
  date: string;
  type: 'prompt' | 'rule' | 'calibration' | 'agent_selection';
  description: string;
  changes: string[];
  evalSetId: string;
  evalSetName: string;
  beforePassRate: string;
  afterPassRate: string;
  regressions: string[];
  approvedBy: string;
  status: 'draft' | 'testing' | 'deployed' | 'rolled_back';
}

export const mockBadCases: BadCaseEntry[] = [
  {
    id: 'BC-001',
    caseId: 'CASE-2026-201',
    caseTitle: '用户投诉品牌参数标注与实际不符',
    errorType: 'risk_too_low',
    errorLabel: '风险等级过低',
    originalJudgment: 'P3 低风险 — 单条投诉，未公开传播，参数争议属常见问题',
    correctedJudgment: 'P2 中风险 — 参数标注问题涉及虚假宣传合规红线，即使单条也应标记观察，若同类投诉增多需立即升级',
    correctedBy: '张明（风险管理员）',
    correctedAt: '2026-07-08T15:20:00Z',
    status: 'in_eval_set',
    notes: 'P3→P2 修正。参数类投诉不能仅凭传播量判低，需叠加合规维度。已加入评估集 v2.1',
    scenario: 'brand',
    originalRisk: 'P3',
    correctedRisk: 'P2',
  },
  {
    id: 'BC-002',
    caseId: 'CASE-2026-202',
    caseTitle: 'App 支付页面白屏，用户连续5次下单失败',
    errorType: 'risk_too_low',
    errorLabel: '风险等级过低',
    originalJudgment: 'P3 低风险 — 技术类反馈，单用户问题',
    correctedJudgment: 'P1 高风险 — 支付链路故障即使仅1人反馈也影响核心转化，且用户描述"连续5次"说明非偶发，应排查是否存在更大范围影响',
    correctedBy: '李婷（运营负责人）',
    correctedAt: '2026-07-09T10:05:00Z',
    status: 'in_eval_set',
    notes: 'P3→P1 修正。支付相关反馈不能轻判，核心链路每次故障都是高优先级。已加入评估集 v2.1',
    scenario: 'ops',
    originalRisk: 'P3',
    correctedRisk: 'P1',
  },
  {
    id: 'BC-003',
    caseId: 'CASE-2026-203',
    caseTitle: '客服说"这是公司规定"拒绝退款，用户发微博吐槽',
    errorType: 'review_false_negative',
    errorLabel: '人工复核漏触发',
    originalJudgment: 'P2 中风险 — 客服拒绝退款合规，未触发人工复核',
    correctedJudgment: 'P1 高风险 — 用户已发微博公开吐槽，客服拒绝话术可能被截图二次传播，应触发人工复核评估公关风险',
    correctedBy: '王强（品牌总监）',
    correctedAt: '2026-07-09T16:40:00Z',
    status: 'in_eval_set',
    notes: 'P2→P1 + 复核漏触发修正。公开传播+客服争议话术组合必须触发复核 Gate。已加入评估集 v2.1',
    scenario: 'cs',
    originalRisk: 'P2',
    correctedRisk: 'P1',
  },
  {
    id: 'BC-004',
    caseId: 'CASE-2026-204',
    caseTitle: '批量用户反馈无法绑定银行卡，疑似SDK故障',
    errorType: 'wrong_task_type',
    errorLabel: '任务类型判断错误',
    originalJudgment: 'Supervisor 判为客服质检场景，路由至客服 Agent',
    correctedJudgment: '应为运营反馈 + 技术故障。批量用户+核心功能不可用属于运营反馈场景，应路由至运营 Agent 并建议技术排查',
    correctedBy: '张明（风险管理员）',
    correctedAt: '2026-07-10T09:15:00Z',
    status: 'confirmed',
    notes: '场景分类修正。批量用户+功能不可用应优先运营反馈 Agent 而非客服 Agent。已确认，待进入评估集',
    scenario: 'ops',
    originalRisk: 'P2',
    correctedRisk: 'P1',
  },
  {
    id: 'BC-005',
    caseId: 'CASE-2026-205',
    caseTitle: '小红书 KOL 发帖批评产品减配不降价',
    errorType: 'risk_too_high',
    errorLabel: '风险等级过高',
    originalJudgment: 'P0 重大风险 — KOL 负面内容，建议立即启动危机响应',
    correctedJudgment: 'P2 中风险 — 该 KOL 粉丝量不足5万，内容以产品测评为主而非维权曝光型，且帖子互动量未超过1000。不需要立即危机响应，但应在品牌监测中标记观察',
    correctedBy: '王强（品牌总监）',
    correctedAt: '2026-07-10T14:30:00Z',
    status: 'confirmed',
    notes: 'P0→P2 修正。KOL 负面不能一刀切判 P0，需要叠加粉丝量、内容类型和传播规模。已确认，待进入评估集',
    scenario: 'brand',
    originalRisk: 'P0',
    correctedRisk: 'P2',
  },
  {
    id: 'BC-006',
    caseId: 'CASE-2026-206',
    caseTitle: '用户投诉客服承诺"明天一定解决"但7天未处理',
    errorType: 'insufficient_evidence',
    errorLabel: '证据解释不充分',
    originalJudgment: 'P2 中风险 — 客服承诺未兑现，判断依据仅为"承诺未兑现"',
    correctedJudgment: 'P1 高风险 — 证据解释不充分导致级别偏低。应补充：①客服过度承诺"明天一定"违反话术规范第5条 ②7天未处理触发 SLA 超时 ③用户明确表示"你们说话不算话"存在情绪升级信号',
    correctedBy: '李婷（运营负责人）',
    correctedAt: '2026-07-11T11:00:00Z',
    status: 'pending_review',
    notes: '证据链不完整导致风险判定偏低。需完善客服过度承诺+SLA超时+用户情绪三维证据。待确认',
    scenario: 'cs',
    originalRisk: 'P2',
    correctedRisk: 'P1',
  },
  {
    id: 'BC-007',
    caseId: 'CASE-2026-207',
    caseTitle: '运营反馈 Agent 建议"发优惠券补偿全体用户"',
    errorType: 'unactionable_suggestion',
    errorLabel: '建议动作不可执行',
    originalJudgment: 'P1 高风险 — Agent 建议向全体用户发放50元优惠券作为补偿',
    correctedJudgment: '建议不可执行 — 未考虑预算约束、用户分级和ROI，应向运营负责人建议"受影响用户定向补偿+评估预算"，而非给出具体金额的全体方案',
    correctedBy: '张明（风险管理员）',
    correctedAt: '2026-07-11T16:00:00Z',
    status: 'in_eval_set',
    notes: '建议动作需要约束检查。Agent 给出的具体补偿方案超出建议边界，应在系统节点层面加"不可执行建议"过滤。已加入评估集 v2.1',
    scenario: 'ops',
    originalRisk: 'P1',
    correctedRisk: 'P1',
  },
  {
    id: 'BC-008',
    caseId: 'CASE-2026-208',
    caseTitle: '用户反馈 App 闪退，实际为运营反馈场景被误判品牌舆情',
    errorType: 'wrong_agent',
    errorLabel: 'Agent 选择错误',
    originalJudgment: 'Supervisor 判为品牌舆情（因用户同时提到"再也不用了"），路由至品牌 Agent',
    correctedJudgment: '应为运营反馈 — "再也不用了"是用户情绪表达而非品牌传播，核心是 App 闪退功能问题。应路由至运营反馈 Agent 优先处理',
    correctedBy: '李婷（运营负责人）',
    correctedAt: '2026-07-12T09:45:00Z',
    status: 'confirmed',
    notes: 'Agent 选择修正。情绪化表达≠品牌舆情，Supervisor 需要区分用户情绪和品牌传播。已确认，待进入评估集',
    scenario: 'ops',
    originalRisk: 'P2',
    correctedRisk: 'P2',
  },
];

export const mockEvalSets: EvalSetItem[] = [
  {
    id: 'EVAL-001',
    name: '评估集 v2.1 — 风险等级校准',
    description: '收集风险等级误判案例，覆盖 P0→P2 降低、P3→P2 提升、P3→P1 严重低估等典型错误模式',
    caseCount: 4,
    scenarios: ['brand', 'ops', 'cs'],
    createdAt: '2026-07-08T10:00:00Z',
    updatedAt: '2026-07-12T16:00:00Z',
    passRate: '78%',
    cases: [
      { caseId: 'BC-001', title: '品牌参数标注不符被误判 P3', expectedRisk: 'P2', expectedScenario: 'brand', expectedReview: false, addedFrom: 'bad_case' },
      { caseId: 'BC-002', title: '支付页面白屏被误判 P3', expectedRisk: 'P1', expectedScenario: 'ops', expectedReview: true, addedFrom: 'bad_case' },
      { caseId: 'BC-003', title: '客服拒退款+公开传播漏复核', expectedRisk: 'P1', expectedScenario: 'cs', expectedReview: true, addedFrom: 'bad_case' },
      { caseId: 'BC-007', title: '建议动作不可执行案例', expectedRisk: 'P1', expectedScenario: 'ops', expectedReview: true, addedFrom: 'bad_case' },
    ],
  },
  {
    id: 'EVAL-002',
    name: '评估集 v2.2 — 场景分类与 Agent 路由',
    description: '收集场景分类错误和 Agent 路由偏差案例，覆盖混合场景、情绪干扰、批量问题等边界',
    caseCount: 2,
    scenarios: ['ops', 'cs'],
    createdAt: '2026-07-10T14:00:00Z',
    updatedAt: '2026-07-12T10:00:00Z',
    passRate: '85%',
    cases: [
      { caseId: 'BC-004', title: '批量绑卡故障误判客服场景', expectedRisk: 'P1', expectedScenario: 'ops', expectedReview: true, addedFrom: 'bad_case' },
      { caseId: 'BC-008', title: 'App闪退被情绪误导判品牌', expectedRisk: 'P2', expectedScenario: 'ops', expectedReview: false, addedFrom: 'bad_case' },
    ],
  },
  {
    id: 'EVAL-003',
    name: '边缘案例集 — 真实案例候选',
    description: '采集真实/脱敏企业反馈案例作为候选评估集。当前包含4条已脱敏案例，用于验证系统对真实场景的覆盖度',
    caseCount: 4,
    scenarios: ['brand', 'cs', 'ops', 'mixed'],
    createdAt: '2026-07-12T09:00:00Z',
    updatedAt: '2026-07-12T09:00:00Z',
    cases: [
      { caseId: 'REAL-001', title: '电商大促物流延迟集体投诉', expectedRisk: 'P1', expectedScenario: 'mixed', expectedReview: true, addedFrom: 'real_case' },
      { caseId: 'REAL-002', title: 'App更新后会员权益丢失', expectedRisk: 'P2', expectedScenario: 'ops', expectedReview: false, addedFrom: 'real_case' },
      { caseId: 'REAL-003', title: '客服误将用户标记为恶意用户', expectedRisk: 'P1', expectedScenario: 'cs', expectedReview: true, addedFrom: 'real_case' },
      { caseId: 'REAL-004', title: '品牌联名产品文案引发争议', expectedRisk: 'P0', expectedScenario: 'brand', expectedReview: true, addedFrom: 'real_case' },
    ],
  },
];

export const mockIterations: IterationRecord[] = [
  {
    id: 'ITER-001',
    version: 'v2.1',
    date: '2026-07-12T16:00:00Z',
    type: 'calibration',
    description: '风险等级校准：提升参数争议类、支付链路类和公开传播类反馈的风险敏感度',
    changes: [
      '参数标注争议类反馈默认等级从 P3 提升至 P2',
      '支付链路反馈（即使仅1条）默认等级从 P3 提升至 P1',
      '公开传播 + 客服争议话术组合增加强制人工复核触发',
    ],
    evalSetId: 'EVAL-001',
    evalSetName: '评估集 v2.1 — 风险等级校准',
    beforePassRate: '62%',
    afterPassRate: '78%',
    regressions: ['直播营销合规评估耗时增加15%，待优化'],
    approvedBy: '张明（风险管理员）',
    status: 'deployed',
  },
  {
    id: 'ITER-002',
    version: 'v2.2',
    date: '2026-07-10T14:00:00Z',
    type: 'agent_selection',
    description: 'Agent 路由优化：减少 Supervisor 对用户情绪化表达的过度反应，优化批量问题的场景判断',
    changes: [
      'Supervisor 增加"情绪化表达 vs 品牌传播"区分规则',
      '批量用户反馈（≥5条同类）优先路由至运营反馈 Agent',
      '混合场景增加多 Agent 协同触发阈值调整',
    ],
    evalSetId: 'EVAL-002',
    evalSetName: '评估集 v2.2 — 场景分类与 Agent 路由',
    beforePassRate: '71%',
    afterPassRate: '85%',
    regressions: [],
    approvedBy: '张明（风险管理员）',
    status: 'deployed',
  },
  {
    id: 'ITER-003',
    version: 'v2.3-draft',
    date: '2026-07-13T09:00:00Z',
    type: 'prompt',
    description: '客服质检 Agent Prompt 优化：增加同理心表达维度，减少机械引用条款的话术模式',
    changes: [
      '在客服质检维度中新增"同理心表达"评分项',
      '增加"过度依赖条款引用"检测规则',
      '优化替代回复模板，减少机械感',
    ],
    evalSetId: 'EVAL-001',
    evalSetName: '评估集 v2.1 — 风险等级校准',
    beforePassRate: '78%',
    afterPassRate: '—',
    regressions: [],
    approvedBy: '待审批',
    status: 'draft',
  },
  {
    id: 'ITER-004',
    version: 'v2.0',
    date: '2026-07-05T11:00:00Z',
    type: 'rule',
    description: 'Human Review Gate 规则细化：明确 P0 强制复核、P1+低置信度复核、P2+公开传播可选复核',
    changes: [
      'P0 案件一律强制触发人工复核，不可自动关闭',
      'P1 + 置信度 < 0.7 触发人工复核',
      'P2 + 公开传播 + 敏感关键词 触发可选复核',
      'P3 默认不触发复核，但管理员可手动触发',
      '所有复核决策（升级/降级/补证/转交）需记录复核人',
    ],
    evalSetId: 'EVAL-001',
    evalSetName: '评估集 v2.1 — 风险等级校准',
    beforePassRate: '58%',
    afterPassRate: '62%',
    regressions: [],
    approvedBy: '张明（风险管理员）',
    status: 'deployed',
  },
];
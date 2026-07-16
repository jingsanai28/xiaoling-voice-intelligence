// Live pipeline simulation data for the analysis progress area.
// Drives the immersive step-by-step "AI is thinking" experience shown
// right after a new case is submitted (browser simulation mode).

export interface SimVerdict {
  label: string;
  value: string;
  tone: 'primary' | 'accent' | 'secondary' | 'neutral';
}

export interface SimStage {
  key: string;
  icon: string;
  name: string;
  kind: 'system' | 'agent' | 'gate' | 'output';
  duration: number;
  calledObject: string;
  tools: string[];
  logLines: string[];
  outputTitle: string;
  outputDetail: string;
  subAgents?: { name: string; role: string; tone: 'accent' | 'secondary' | 'primary'; text: string }[];
  verdicts?: SimVerdict[];
}

export const simStages: SimStage[] = [
  {
    key: 'data_integrity_check',
    icon: 'ri-file-search-line',
    name: '检查数据完整性',
    kind: 'system',
    duration: 1600,
    calledObject: 'Data Integrity Check',
    tools: ['内容解析器', '格式校验器', '字段完整性检测'],
    logLines: [
      '接收原始反馈文本，长度 287 字符',
      '解析文本结构 → 检测到平台关键词、用户情绪标识',
      '字段完整性校验 → 来源、渠道、内容均已提供',
      '识别为中文社交媒体内容 ✓',
      '数据完整性检查通过 ✓',
    ],
    outputTitle: '数据完整性检查完成',
    outputDetail: '输入数据格式完整，识别为中文社交媒体内容，检测到平台关键词、投诉信号和传播标识。',
    verdicts: [{ label: '数据质量', value: '完整', tone: 'secondary' }],
  },
  {
    key: 'permission_check',
    icon: 'ri-shield-check-line',
    name: '检查数据权限',
    kind: 'system',
    duration: 1200,
    calledObject: 'Permission Check',
    tools: ['角色校验规则', '数据访问控制策略', '敏感数据脱敏器'],
    logLines: [
      '当前角色 → 风险管理员',
      '校验数据访问权 ✓',
      '校验分析结果查看权 ✓',
      '校验复核与决策权 ✓',
      '敏感信息自动脱敏已就绪',
    ],
    outputTitle: '权限检查通过',
    outputDetail: '当前角色拥有全量数据访问、分析执行、结果查看和复核决策权限，无权限限制。',
    verdicts: [{ label: '权限', value: '全量授权', tone: 'secondary' }],
  },
  {
    key: 'dedup_noise_reduction',
    icon: 'ri-filter-3-line',
    name: '去除重复和低信息内容',
    kind: 'system',
    duration: 1800,
    calledObject: 'Dedup & Noise Filter',
    tools: ['语义去重器', '信息密度评分', '垃圾内容过滤器'],
    logLines: [
      '扫描输入内容，评估信息密度...',
      '信息密度评分 → 0.83（高信息量）',
      '未检测到重复或模板化内容',
      '识别到有效反馈信号：产品质疑、投诉关键词',
      '降噪完成，保留完整信息 ✓',
    ],
    outputTitle: '降噪完成',
    outputDetail: '信息密度评分 0.83，未检测到重复内容或低信息量片段，保留全部原始信息进入下一阶段。',
    verdicts: [{ label: '信息密度', value: '0.83 高', tone: 'neutral' }],
  },
  {
    key: 'topic_clustering',
    icon: 'ri-bubble-chart-line',
    name: '聚合相似反馈主题',
    kind: 'system',
    duration: 1700,
    calledObject: 'Topic Clustering',
    tools: ['主题提取器', '语义聚类引擎', '热点识别模型'],
    logLines: [
      '提取反馈主题特征...',
      '识别主题簇：「产品质量争议」+「传播扩散」+「监管投诉」',
      '关联性分析：三个主题高度相关，触发信号增强',
      '主题聚类完成，形成 1 个主信号集群 ✓',
    ],
    outputTitle: '主题聚合完成',
    outputDetail: '识别到 3 个相关主题：「产品质量争议」「公开传播扩散」「监管投诉风险」，聚合为 1 个主信号集群。',
    verdicts: [{ label: '主题簇', value: '3 个相关', tone: 'primary' }],
  },
  {
    key: 'agent_analysis',
    icon: 'ri-brain-line',
    name: '调用专业 Agent 分析',
    kind: 'agent',
    duration: 2600,
    calledObject: '品牌舆情 Agent',
    tools: ['信号评级规则 v2.1', '传播监测器', '证据可信度评估', '情绪分析器'],
    logLines: [
      '品牌舆情 Agent 启动信号评级...',
      '证据可信度评估 → 0.87',
      '传播量核算 → 2万赞 / 3000评论',
      '命中监管投诉信号，风险加权 +1',
      '客服 Agent 同步：监测到用户投诉关键词',
      '汇总子 Agent 结论，形成协同判断...',
    ],
    outputTitle: 'Agent 分析完成',
    outputDetail: '品牌舆情 Agent 判定 P0 重大风险（置信度 87%），建议立即启动品牌危机响应；客服 Agent 同步准备统一应对话术。',
    subAgents: [
      { name: '品牌舆情 Agent', role: '品牌', tone: 'accent', text: 'P0 重大风险。检测报告 + 2万赞传播 + 监管投诉风险，建议公关主导、法务同步。' },
      { name: '客服质检 Agent', role: '客服', tone: 'secondary', text: '（通知模式）监测到用户投诉关键词，建议准备统一应对话术。' },
    ],
    verdicts: [{ label: '初判等级', value: 'P0 重大', tone: 'accent' }],
  },
  {
    key: 'memory_rule_match',
    icon: 'ri-database-2-line',
    name: '匹配历史事件和业务规则',
    kind: 'system',
    duration: 1900,
    calledObject: 'Memory & Rule Match',
    tools: ['语义向量检索', '事件相似度评分', '历史结果关联器'],
    logLines: [
      '构建案件语义向量...',
      '检索历史事件库（12,480 条）',
      '命中：竞品羽绒服材质造假事件 · 相似度 0.82',
      '命中：虚假种草被罚事件 · 相似度 0.65',
      '关联历史处置结果至本案 ✓',
    ],
    outputTitle: '历史匹配完成',
    outputDetail: '召回 2 条相似历史事件（相似度 82% / 65%），历史处置结果和业务规则已关联至本案，供后续参考。',
    verdicts: [{ label: '历史召回', value: '2 条相似', tone: 'secondary' }],
  },
  {
    key: 'signal_valuation',
    icon: 'ri-scales-3-line',
    name: '判断信号价值与优先级',
    kind: 'agent',
    duration: 2000,
    calledObject: 'Signal Valuation',
    tools: ['价值评估引擎', '优先级排序器', '交叉验证器', '影响范围评估'],
    logLines: [
      '交叉验证 Agent 初判与业务规则阈值...',
      '证据可信度 0.87 > 0.80 阈值 ✓',
      '传播量 2万 > 5000 阈值 ✓',
      '存在监管投诉信号，建议优先处理',
      '影响范围评估：品牌声誉 + 合规风险',
      '优先级判定 → P0 维持',
    ],
    outputTitle: '信号价值评估完成',
    outputDetail: '确认为 P0 高价值信号：证据可信度与传播量均超阈值，影响品牌声誉和合规风险，优先级最高。',
    verdicts: [{ label: '信号等级', value: 'P0 优先', tone: 'accent' }],
  },
  {
    key: 'human_review_gate',
    icon: 'ri-user-voice-line',
    name: '判断是否需要人工复核',
    kind: 'gate',
    duration: 1700,
    calledObject: 'Human Review Gate',
    tools: ['复核触发规则矩阵', '风险-传播矩阵', '置信度阈值检测'],
    logLines: [
      '匹配复核触发规则矩阵...',
      '规则命中：P0 + 公开传播',
      '规则命中：置信度 0.87 < 0.90 高置信阈值',
      '规则命中：监管投诉信号',
      '触发人工复核 → 分析结果暂存',
      '生成复核包，等待管理员决策',
    ],
    outputTitle: '需人工复核确认',
    outputDetail: '匹配 P0 + 公开传播 + 低于高置信阈值规则，分析暂存并生成复核包，等待管理员确认后继续处理。',
    verdicts: [{ label: '复核状态', value: '待人工确认', tone: 'accent' }],
  },
  {
    key: 'generate_result',
    icon: 'ri-file-chart-line',
    name: '生成分析结果',
    kind: 'output',
    duration: 1800,
    calledObject: 'Result Generator',
    tools: ['分析报告模板', '复核包生成器', '事件日志序列化器'],
    logLines: [
      '组装信号摘要与评估结论...',
      '写入 Agent 判断链路与证据列表...',
      '附加历史关联与建议动作...',
      '生成禁止自动执行动作清单...',
      '分析报告与复核包已就绪 ✓',
    ],
    outputTitle: '分析结果生成完成',
    outputDetail: '已生成完整客户声音分析报告与人工复核包，包含信号摘要、判断链路、证据、历史关联与行动建议。',
    verdicts: [{ label: '产出', value: '报告 + 复核包', tone: 'primary' }],
  },
];
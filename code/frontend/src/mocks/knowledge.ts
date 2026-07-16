import type {
  KnowledgeSpace,
  KnowledgeDocument,
  KnowledgeOverviewStats,
  RetrievalTestResult,
  Citation,
  UsageRecord,
} from '@/types/knowledge';

export const mockSpaces: KnowledgeSpace[] = [
  {
    id: 'space-product',
    name: '产品知识',
    description: '产品功能、使用限制、版本差异和已知问题',
    knowledgeType: 'product',
    owner: '产品运营 · 张明',
    visibleTeams: ['产品', '客服', '运营'],
    documentCount: 46,
    publishedCount: 40,
    updatedAt: '2026-07-14 09:20',
    status: 'active',
  },
  {
    id: 'space-policy',
    name: '客服政策与 SOP',
    description: '退款、售后、赔偿边界、客服处理流程',
    knowledgeType: 'policy_sop',
    owner: '客服质检 · 李婷',
    visibleTeams: ['客服', '运营', '品牌/公关'],
    documentCount: 31,
    publishedCount: 25,
    updatedAt: '2026-07-13 14:30',
    status: 'active',
  },
  {
    id: 'space-compliance',
    name: '品牌与合规规则',
    description: '品牌、公关、数据安全和升级处理标准',
    knowledgeType: 'risk_compliance',
    owner: '品牌合规 · 王蕾',
    visibleTeams: ['品牌/公关', '客服', '产品'],
    documentCount: 22,
    publishedCount: 20,
    updatedAt: '2026-07-12 11:00',
    status: 'active',
  },
  {
    id: 'space-history',
    name: '历史事件案例',
    description: '已确认的客户声音事件、处理动作和复盘结论',
    knowledgeType: 'historical_case',
    owner: '客户体验 · 陈刚',
    visibleTeams: ['客服', '品牌/公关', '产品', '运营'],
    documentCount: 29,
    publishedCount: 25,
    updatedAt: '2026-07-14 10:15',
    status: 'active',
  },
];

export const mockOverviewStats: KnowledgeOverviewStats = {
  publishedCount: 128,
  pendingReviewCount: 6,
  parseFailedCount: 2,
  expiringSoonCount: 4,
  recentCitations7d: 386,
  spaces: mockSpaces,
};

export const mockDocuments: KnowledgeDocument[] = [
  {
    id: 'doc-001',
    title: '售后退款与赔偿处理规范',
    content: `# 售后退款与赔偿处理规范

## 适用范围
本标准适用于所有通过官方渠道购买产品的用户退款与赔偿请求。

## 退款条件
1. 购买后 7 天内且使用时长不超过 2 小时，可全额退款
2. 产品存在严重功能缺陷且确认非用户操作导致，可全额退款
3. 用户误购且未激活使用，可全额退款（需人工审核）
4. 续费订阅在扣费后 24 小时内可取消并退款

## 赔偿标准
1. 因平台故障导致用户无法使用超过 4 小时 → 补偿 3 天会员时长
2. 因平台原因导致用户数据丢失且无法恢复 → 补偿 1 个月会员 + 人工道歉
3. 涉及金额超过 500 元 → 需要客服主管 + 财务双审
4. 全部退款赔偿记录存档备查

## 客服处理流程
1. 核对用户订单信息和退款申请理由
2. 对照退款条件进行初步判断
3. 符合条件 → 直接发起退款；不符合 → 升级至客服主管
4. 涉及金额超过 500 元 → 需要客服主管 + 财务双审

## AI 使用说明
- AI 可建议退款方向，不可自动执行退款
- 涉及退款金额的结论必须标记「待人工确认」
- 违背退款政策的问题应触发合规规则检查`,
    summary: '定义退款适用范围、赔偿标准、双审流程和 AI 使用边界。涉及金额超过 500 元需双审，赔偿需人工确认。',
    spaceId: 'space-policy',
    spaceName: '客服政策与 SOP',
    knowledgeType: 'policy_sop',
    productLine: '全线产品',
    source: '内部制定',
    owner: '李婷',
    reviewer: '王蕾',
    scope: '客服、运营团队',
    sensitivity: 'restricted',
    effectiveDate: '2026-07-10',
    expiryDate: '2026-12-31',
    currentVersion: 2.3,
    versions: [
      {
        version: 2.3,
        title: '售后退款与赔偿处理规范 v2.3',
        content: '当前版本内容',
        changeSummary: '细化赔偿标准，新增平台故障和数据丢失赔偿场景',
        status: 'published',
        createdAt: '2026-07-10 14:00',
        createdBy: '李婷',
      },
      {
        version: 2.2,
        title: '售后退款规范 v2.2',
        content: '上一版本内容',
        changeSummary: '新增超过 500 元双审流程',
        status: 'published',
        createdAt: '2026-06-15 10:00',
        createdBy: '李婷',
      },
      {
        version: 2.1,
        title: '退款政策与处理标准 v2.1',
        content: '早期版本内容',
        changeSummary: '增加误购场景处理流程',
        status: 'published',
        createdAt: '2026-05-01 10:00',
        createdBy: '李婷',
      },
    ],
    status: 'published',
    chunkCount: 14,
    recentCitationCount: 27,
    updatedAt: '2026-07-10 14:00',
    tags: ['退款', '赔偿', '处理流程', '双审'],
    reviewHistory: [
      { id: 'rv-001', action: 'approve', reviewer: '王蕾', comment: '赔偿标准清晰，流程符合合规要求', timestamp: '2026-07-10 14:30' },
      { id: 'rv-002', action: 'approve', reviewer: '张明', comment: '产品线覆盖完整', timestamp: '2026-07-10 15:00' },
    ],
  },
  {
    id: 'doc-002',
    title: '客服公开承诺风险话术清单',
    content: `# 客服公开承诺风险话术清单

## 高风险话术（禁止使用）
以下话术在客服沟通中明确禁止，一旦使用即触发「客服推责」信号：

1. "这是产品的限制，我们也没办法" — 推责
2. "你可以去投诉，这是公司规定" — 激化矛盾
3. "我不清楚，这不是我的工作范围" — 踢皮球
4. "我们保证 100% 解决问题" — 过度承诺
5. "退款肯定能到账，放心" — 模糊承诺（退款审批需要流程，不能保证）

## 中风险话术（谨慎使用）
以下话术可能引发用户误解，需结合实际场景判断：

1. "我们会尽快处理" — 缺少时间承诺，易引发二次投诉
2. "帮你反馈给技术" — 未明确反馈时效和结果通知方式
3. "之前可能是同事说错了" — 暗示内部管理混乱

## 低风险话术（建议规范用语）
1. 统一使用："我已经记录了您的诉求，预计 X 小时内给您回复"
2. 退款场景："您的退款申请已提交，客服主管将在 2 小时内审核并通知您结果"
3. 投诉升级："我来帮您升级为优先处理，稍后会有专人联系您"

## 违规处理
- 高风险话术：质检发现后立即整改，记入客服绩效考核
- 中风险话术：月度培训中重点复盘，连续出现需单独沟通`,
    summary: '定义了客服沟通中的高中低三类风险话术和规范用语，高风险话术触发推责信号。',
    spaceId: 'space-policy',
    spaceName: '客服政策与 SOP',
    knowledgeType: 'policy_sop',
    productLine: '客服',
    source: '客服质控团队制定',
    owner: '李婷',
    reviewer: '李婷',
    scope: '客服团队',
    sensitivity: 'internal',
    effectiveDate: '2026-07-20',
    currentVersion: 1.1,
    versions: [
      {
        version: 1.1,
        title: '客服公开承诺风险话术清单 v1.1',
        content: '当前版本内容',
        changeSummary: '新增 5 条高风险话术和规范用语对照表',
        status: 'draft',
        createdAt: '2026-07-13 16:00',
        createdBy: '李婷',
      },
      {
        version: 1.0,
        title: '客服风险话术清单 v1.0',
        content: '初版内容',
        changeSummary: '初始草稿',
        status: 'draft',
        createdAt: '2026-07-10 09:00',
        createdBy: '李婷',
      },
    ],
    status: 'pending_review',
    chunkCount: 5,
    recentCitationCount: 0,
    updatedAt: '2026-07-13 16:00',
    tags: ['客服', '话术', '风险', '质检'],
    reviewHistory: [],
  },
  {
    id: 'doc-003',
    title: 'App 支付失败应急处理 SOP',
    content: `# App 支付失败应急处理 SOP

## 适用范围
当 App 端出现大规模支付失败时，按本 SOP 执行。

## 触发条件
- 5 分钟内收到 10 条以上支付失败投诉
- 支付渠道官方发布故障公告
- 内部监控发现支付接口错误率超过 5%

## 分级响应
### P0 级（全渠道瘫痪）
- 所有支付方式不可用
- 响应：立即通知 CTO 和运营总监 → 15 分钟内推送 App 内公告 → 客服统一口径

### P1 级（单一渠道故障）
- 微信支付或支付宝单一渠道不可用
- 响应：切换备选支付渠道 → 客服引导用户使用备用方式

### P2 级（偶发失败）
- 个别用户支付失败，非系统性故障
- 响应：客服协助排查 → 提供手动补单入口

## 用户沟通口径
1. "我们已注意到支付异常，技术团队正在紧急处理中"
2. "建议您稍后再试，或联系客服获取手动补单帮助"
3. 不要承诺具体恢复时间，仅说"尽快恢复"

## 事后复盘
- 每次 P0/P1 事件结束后 48 小时内完成复盘
- 复盘结论收入「历史事件案例」空间`,
    summary: '定义了 App 支付失败的三级应急响应（P0/P1/P2）、用户沟通口径和复盘流程。',
    spaceId: 'space-product',
    spaceName: '产品知识',
    knowledgeType: 'product',
    productLine: 'App',
    source: '产品团队制定',
    owner: '张明',
    reviewer: '张明',
    scope: '客服、产品、技术',
    sensitivity: 'internal',
    effectiveDate: '2026-06-01',
    currentVersion: 3.0,
    versions: [
      {
        version: 3.0,
        title: 'App 支付失败应急处理 SOP v3.0',
        content: '当前版本内容',
        changeSummary: '新增 P2 级响应和手动补单流程',
        status: 'published',
        createdAt: '2026-06-20 10:00',
        createdBy: '张明',
      },
      {
        version: 2.0,
        title: 'App 支付失败应急处理 SOP v2.0',
        content: '上一版本',
        changeSummary: '完善 P0/P1 响应流程',
        status: 'published',
        createdAt: '2026-04-15 09:00',
        createdBy: '张明',
      },
    ],
    status: 'published',
    chunkCount: 10,
    recentCitationCount: 33,
    updatedAt: '2026-06-20 10:00',
    tags: ['支付', '应急', 'SOP', 'P0'],
    reviewHistory: [
      { id: 'rv-010', action: 'approve', reviewer: '张明', comment: '流程完整，可直接执行', timestamp: '2026-06-20 10:30' },
    ],
  },
  {
    id: 'doc-004',
    title: '小红书投诉扩散升级规则',
    content: `# 小红书投诉扩散升级规则

## 监控触发
- 单条笔记点赞 + 收藏 + 评论超过 200 互动 → 自动加入监控
- 评论中出现 @官方账号 或 "避雷""差评""退款" 等关键词 → 提升监控权重
- 同品牌相关笔记 24 小时内超过 3 条 → 标记为集中爆发

## 升级标准
### P0（品牌危机）
- 单条笔记互动量 1 小时内突破 5000
- 被官方推荐或入选热门话题
- 主流媒体引用小红书内容进行报道

### P1（扩散风险）
- 单条笔记互动量 4 小时内突破 1000
- 评论区形成明确负面共识
- 多篇笔记同时提及同一问题

### P2（局部舆情）
- 笔记互动量 24 小时内突破 500
- 评论区存在争议但未形成共识
- 相关话题在同品类社区同步传播

## 处理动作
1. P0：品牌总监 + 公关团队成立应急小组，24 小时内形成对外回应
2. P1：品牌团队纳入监控重点，客服团队准备统一口径
3. P2：持续观察 48 小时，如趋势上升则升级为 P1

## 禁止动作
- 删除用户笔记（除非违反平台规则并由平台处理）
- 水军控评
- 私信威胁或利诱用户`,
    summary: '定义了小红书上品牌舆情的 P0-P1-P2 三级扩散标准、处理动作和禁止动作。',
    spaceId: 'space-compliance',
    spaceName: '品牌与合规规则',
    knowledgeType: 'risk_compliance',
    productLine: '品牌',
    source: '品牌团队',
    owner: '王蕾',
    reviewer: '王蕾',
    scope: '品牌、公关、客服',
    sensitivity: 'sensitive',
    effectiveDate: '2026-05-01',
    currentVersion: 1.4,
    versions: [
      {
        version: 1.4,
        title: '小红书投诉扩散升级规则 v1.4',
        content: '当前版本内容',
        changeSummary: '新增禁止动作章节，调整 P2 互动阈值',
        status: 'published',
        createdAt: '2026-06-01 09:00',
        createdBy: '王蕾',
      },
      {
        version: 1.3,
        title: '小红书投诉扩散升级规则 v1.3',
        content: '上一版本',
        changeSummary: '增加关键词监控逻辑',
        status: 'published',
        createdAt: '2026-05-15 11:00',
        createdBy: '王蕾',
      },
    ],
    status: 'published',
    chunkCount: 8,
    recentCitationCount: 45,
    updatedAt: '2026-06-01 09:00',
    tags: ['小红书', '舆情', '扩散', '升级', '品牌'],
    reviewHistory: [
      { id: 'rv-011', action: 'approve', reviewer: '王蕾', comment: '平台规则与品牌策略一致', timestamp: '2026-06-01 09:30' },
    ],
  },
  {
    id: 'doc-005',
    title: '2026-06 支付故障复盘',
    content: `# 2026-06 支付故障复盘

## 事件概述
2026 年 6 月 18 日 15:20 - 16:05，支付渠道系统升级导致微信支付渠道中断 45 分钟，影响约 3200 名用户。

## 时间线
- 15:20：微信支付返回 500 错误，系统自动切换备用渠道失败
- 15:22：客服开始收到用户投诉
- 15:28：技术定位为支付渠道方异常
- 15:35：通过 App 内公告告知用户
- 15:45：联系支付渠道方确认恢复时间
- 16:05：微信支付恢复，手动补偿受影响用户

## 影响范围
- 受影响用户：约 3200 人
- 未完成订单：约 850 笔
- 后续补偿发放：按 SOP 补发 3 天会员（涉及约 1800 人）

## 复盘结论
1. 支付渠道切换自动化需要在 30 秒内完成（当前为手动切换，耗时 3 分钟）
2. 用户通知应在故障确认后 5 分钟内发出（实际耗时 15 分钟）
3. 客服口径应与应急处理 SOP 保持一致（部分客服自行承诺了恢复时间）

## 改进措施
- 技术：支付渠道自动切换排入 Q3 规划
- 运营：完善 App 内公告触发机制
- 客服：支付故障口径纳入月度培训

## 参考价值
- 该事件进入 Bad Case 评估集，用于后续模型迭代
- 所有涉及支付中断的客户反馈，Agent 应参照本事件的处理路径`,
    summary: '2026年6月18日支付故障全流程复盘，影响3200用户，总结三条改进措施。',
    spaceId: 'space-history',
    spaceName: '历史事件案例',
    knowledgeType: 'historical_case',
    productLine: '支付',
    source: '历史事件复盘',
    owner: '陈刚',
    reviewer: '张明',
    scope: '产品、客服、技术',
    sensitivity: 'internal',
    effectiveDate: '2026-06-25',
    currentVersion: 1.0,
    versions: [
      {
        version: 1.0,
        title: '2026-06 支付故障复盘',
        content: '当前版本内容',
        changeSummary: '初始录入',
        status: 'published',
        createdAt: '2026-06-25 14:00',
        createdBy: '陈刚',
      },
    ],
    status: 'published',
    chunkCount: 6,
    recentCitationCount: 19,
    updatedAt: '2026-06-25 14:00',
    tags: ['支付', '故障', '复盘', '案例'],
    reviewHistory: [
      { id: 'rv-012', action: 'approve', reviewer: '张明', comment: '复盘全面，改进措施可落地', timestamp: '2026-06-25 15:00' },
    ],
  },
  {
    id: 'doc-006',
    title: '旧版会员退款说明',
    content: `# 旧版会员退款说明

## 适用范围
本说明仅适用于 2026 年 3 月前开通的旧版会员体系。

## 旧版退款政策
- 购买后 30 天内可全额退款
- 已使用时长不限制
- 退款直接由客服确认，无需主管审核

## 说明
以上政策已于 2026 年 4 月 1 日停用。新版退款政策参见《售后退款与赔偿处理规范》v2.0+。

如在历史客服记录中出现引用旧版政策的情况，Agent 应标记为「政策已过期」并引导参照最新政策。`,
    summary: '旧版会员退款政策记录，已于 2026 年 4 月 1 日停用，仅保留作为历史参考。',
    spaceId: 'space-policy',
    spaceName: '客服政策与 SOP',
    knowledgeType: 'policy_sop',
    productLine: '会员',
    source: '内部制定（已停用）',
    owner: '李婷',
    scope: '客服',
    sensitivity: 'internal',
    effectiveDate: '2026-01-01',
    expiryDate: '2026-04-01',
    currentVersion: 1.8,
    versions: [
      {
        version: 1.8,
        title: '旧版会员退款说明 v1.8',
        content: '当前版本内容',
        changeSummary: '标注已过期',
        status: 'published',
        createdAt: '2026-04-01 00:00',
        createdBy: '李婷',
      },
    ],
    status: 'expired',
    chunkCount: 3,
    recentCitationCount: 0,
    updatedAt: '2026-04-01 00:00',
    tags: ['退款', '会员', '已过期'],
    reviewHistory: [],
  },
  {
    id: 'doc-007',
    title: '数据泄露应急口径',
    content: '',
    summary: '',
    spaceId: 'space-compliance',
    spaceName: '品牌与合规规则',
    knowledgeType: 'risk_compliance',
    productLine: '全产品',
    source: '法务团队',
    owner: '王蕾',
    reviewer: '王蕾',
    scope: '全体团队',
    sensitivity: 'sensitive',
    effectiveDate: '',
    currentVersion: 0,
    versions: [],
    status: 'parse_failed',
    chunkCount: 0,
    recentCitationCount: 0,
    updatedAt: '2026-07-13 11:00',
    tags: ['数据安全', '应急', '口径'],
    reviewHistory: [],
  },
  {
    id: 'doc-008',
    title: '产品已知问题清单（2026Q3）',
    content: `# 产品已知问题清单（2026Q3）

## 已修复
- 批量分析时偶发超时 → 已修复于 v2.3.1
- 导出 PDF 中文乱码 → 已修复于 v2.3.0

## 处理中
- 移动端右侧面板在某些机型下不显示（iOS Safari 16.4）
- 图片证据上传偶尔压缩失败

## 已知待处理
- 超过 1000 条反馈的分析时间超过 5 分钟
- 夜间模式部分组件颜色对比度不足`,
    summary: 'Q3 产品已知问题追踪清单，包含已修复、处理中和待处理三类。',
    spaceId: 'space-product',
    spaceName: '产品知识',
    knowledgeType: 'product',
    productLine: '小聆平台',
    source: '产品团队维护',
    owner: '张明',
    scope: '全体团队',
    sensitivity: 'internal',
    effectiveDate: '2026-07-01',
    currentVersion: 1.0,
    versions: [
      {
        version: 1.0,
        title: '产品已知问题清单（2026Q3）',
        content: '当前版本内容',
        changeSummary: '初始发布',
        status: 'published',
        createdAt: '2026-07-01 09:00',
        createdBy: '张明',
      },
    ],
    status: 'published',
    chunkCount: 3,
    recentCitationCount: 15,
    updatedAt: '2026-07-01 09:00',
    tags: ['产品', '已知问题', 'Bug', '追踪'],
    reviewHistory: [
      { id: 'rv-016', action: 'approve', reviewer: '张明', comment: '信息准确', timestamp: '2026-07-01 09:30' },
    ],
  },
  {
    id: 'doc-009',
    title: '客服推责判定规则',
    content: `# 客服推责判定规则

## 判定标准
出现以下任一情况即标记为「客服推责」信号：

1. **明确推诿**：客服声称"这是产品的限制，我们也没办法"
2. **踢皮球**：将用户问题在不同部门间反复转接超过 2 次
3. **承诺变化**：用户记录显示客服曾承诺某项功能或优惠，但后续否认
4. **过度承诺**：承诺超出产品实际能力或公司政策范围的内容

## 处理流程
1. 系统识别推责特征 → 标记为客服推责信号
2. 自动提取原始对话中的关键证据片段
3. 推送给客服主管进行人工复核

## AI 使用限制
- AI 标记后必须人工确认，不可自动判定客服责任`,
    summary: '定义了客服推责的 5 种判定特征和人工复核流程。',
    spaceId: 'space-policy',
    spaceName: '客服政策与 SOP',
    knowledgeType: 'policy_sop',
    productLine: '客服',
    source: '客服质控团队',
    owner: '李婷',
    scope: '客服、运营',
    sensitivity: 'internal',
    effectiveDate: '2026-05-15',
    currentVersion: 1.0,
    versions: [
      {
        version: 1.0,
        title: '客服推责判定规则',
        content: '当前版本内容',
        changeSummary: '初始发布',
        status: 'published',
        createdAt: '2026-05-15 10:00',
        createdBy: '李婷',
      },
    ],
    status: 'published',
    chunkCount: 5,
    recentCitationCount: 18,
    updatedAt: '2026-05-15 10:00',
    tags: ['客服', '推责', '判定', '质控'],
    reviewHistory: [
      { id: 'rv-017', action: 'approve', reviewer: '李婷', comment: '标准清晰', timestamp: '2026-05-15 10:30' },
    ],
  },
  {
    id: 'doc-010',
    title: '数据安全与合规红线',
    content: `# 数据安全与合规红线

## 红线行为（触发 P0 自动升级）
1. 疑似数据泄露（包括内部讨论提及用户数据外泄）
2. 未授权第三方共享用户数据
3. 绕过隐私政策收集用户信息
4. 未脱敏的用户敏感信息出现在系统日志

## 处理要求
- 触发红线 → 立即通知数据安全官和法务
- 2 小时内形成初步影响评估
- 24 小时内完成初步调查`,
    summary: '定义了数据安全红线行为和处理流程。',
    spaceId: 'space-compliance',
    spaceName: '品牌与合规规则',
    knowledgeType: 'risk_compliance',
    productLine: '全产品',
    source: '法务与安全团队',
    owner: '王蕾',
    scope: '全体团队',
    sensitivity: 'sensitive',
    effectiveDate: '2026-03-01',
    currentVersion: 1.0,
    versions: [
      {
        version: 1.0,
        title: '数据安全与合规红线',
        content: '当前版本内容',
        changeSummary: '初始发布',
        status: 'published',
        createdAt: '2026-03-01 08:00',
        createdBy: '王蕾',
      },
    ],
    status: 'published',
    chunkCount: 6,
    recentCitationCount: 12,
    updatedAt: '2026-03-01 08:00',
    tags: ['数据安全', '合规', '红线'],
    reviewHistory: [
      { id: 'rv-018', action: 'approve', reviewer: '王蕾', comment: '已与法务确认', timestamp: '2026-03-01 09:00' },
    ],
  },
  {
    id: 'doc-011',
    title: '历史案例：退款争议扩散事件',
    content: `# 历史案例：退款争议扩散事件

## 事件背景
2026 年 3 月，用户公开截图称客服承诺"随时退款"但实际被拒，24 小时内获 1200+ 转发。

## 处理过程
1. 品牌 Agent 检测到公开扩散，初始评级 P1
2. 客服主管调取历史对话确认客服曾做模糊承诺
3. 品牌团队评估升级为 P0
4. 公关统一回应并同步退款

## 复盘结论
- 客服话术模糊是根因
- 建议加入「客服承诺边界」知识文档
- 从检测到回应耗时 6 小时，目标压缩至 4 小时`,
    summary: '2026年3月退款争议扩散事件复盘，P1升级至P0，处理耗时6小时。',
    spaceId: 'space-history',
    spaceName: '历史事件案例',
    knowledgeType: 'historical_case',
    productLine: '客服',
    source: '历史事件',
    owner: '陈刚',
    scope: '品牌、客服、运营',
    sensitivity: 'internal',
    effectiveDate: '2026-04-10',
    currentVersion: 1.0,
    versions: [
      {
        version: 1.0,
        title: '历史案例：退款争议扩散事件',
        content: '当前版本内容',
        changeSummary: '初始录入',
        status: 'published',
        createdAt: '2026-04-10 16:00',
        createdBy: '陈刚',
      },
    ],
    status: 'published',
    chunkCount: 4,
    recentCitationCount: 31,
    updatedAt: '2026-04-10 16:00',
    tags: ['退款', '品牌', '扩散', '案例'],
    reviewHistory: [
      { id: 'rv-019', action: 'approve', reviewer: '李婷', comment: '具有参考价值', timestamp: '2026-04-10 17:00' },
    ],
  },
];

export const mockDocumentById: Record<string, KnowledgeDocument> = {};
mockDocuments.forEach((d) => { mockDocumentById[d.id] = d; });

// Most recent citations for overview "最近被Agent引用"
export const mockRecentCitations: { id: string; eventId: string; eventTitle: string; documentTitle: string; documentId: string; citationCount: number; lastCitedAt: string }[] = [
  { id: 'rc-1', eventId: 'CASE-2026-101', eventTitle: '用户投诉退款被拒并在社媒扩散', documentTitle: '售后退款与赔偿处理规范', documentId: 'doc-001', citationCount: 4, lastCitedAt: '2026-07-14 09:23' },
  { id: 'rc-2', eventId: 'CASE-2026-101', eventTitle: '用户投诉退款被拒并在社媒扩散', documentTitle: '小红书投诉扩散升级规则', documentId: 'doc-004', citationCount: 2, lastCitedAt: '2026-07-14 09:24' },
  { id: 'rc-3', eventId: 'CASE-2026-103', eventTitle: '支付失败批量投诉', documentTitle: 'App 支付失败应急处理 SOP', documentId: 'doc-003', citationCount: 3, lastCitedAt: '2026-07-13 14:20' },
  { id: 'rc-4', eventId: 'CASE-2026-102', eventTitle: '客服推责导致用户投诉升级', documentTitle: '客服推责判定规则', documentId: 'doc-009', citationCount: 2, lastCitedAt: '2026-07-13 11:00' },
  { id: 'rc-5', eventId: 'CASE-2026-104', eventTitle: '品牌负面话题在社媒扩散', documentTitle: '小红书投诉扩散升级规则', documentId: 'doc-004', citationCount: 3, lastCitedAt: '2026-07-12 16:45' },
  { id: 'rc-6', eventId: 'CASE-2026-105', eventTitle: '疑似用户数据泄露反馈', documentTitle: '数据安全与合规红线', documentId: 'doc-010', citationCount: 1, lastCitedAt: '2026-07-12 09:10' },
];

export const mockRetrievalTestResults: RetrievalTestResult[] = [
  {
    chunkId: 'chk-001',
    documentTitle: '售后退款与赔偿处理规范',
    documentId: 'doc-001',
    version: 2.3,
    section: '退款条件',
    snippet: '购买后 7 天内且使用时长不超过 2 小时，可全额退款。产品存在严重功能缺陷且确认非用户操作导致，可全额退款。',
    score: 0.94,
  },
  {
    chunkId: 'chk-002',
    documentTitle: '售后退款与赔偿处理规范',
    documentId: 'doc-001',
    version: 2.3,
    section: '赔偿标准',
    snippet: '因平台故障导致用户无法使用超过 4 小时 → 补偿 3 天会员时长。因平台原因导致用户数据丢失且无法恢复 → 补偿 1 个月会员。',
    score: 0.87,
  },
  {
    chunkId: 'chk-003',
    documentTitle: '客服推责判定规则',
    documentId: 'doc-009',
    version: 1.0,
    section: '判定标准 · 承诺变化',
    snippet: '用户记录显示客服曾承诺某项功能或优惠，但后续否认即触发「推责」信号。',
    score: 0.78,
  },
  {
    chunkId: 'chk-004',
    documentTitle: '客服公开承诺风险话术清单',
    documentId: 'doc-002',
    version: 1.1,
    section: '高风险话术',
    snippet: '"退款肯定能到账，放心" — 模糊承诺，退款审批需要流程，不能保证。属于高风险话术。',
    score: 0.72,
    filterReason: '该文档当前为待审核状态，建议发布后纳入 Agent 检索范围',
  },
  {
    chunkId: 'chk-005',
    documentTitle: '历史案例：退款争议扩散事件',
    documentId: 'doc-011',
    version: 1.0,
    section: '复盘结论',
    snippet: '客服话术中的模糊承诺是根因。建议在知识库中加入「客服承诺边界」文档。',
    score: 0.61,
  },
];

export const mockCitations: Citation[] = [
  {
    id: 'cit-001',
    eventId: 'CASE-2026-101',
    documentId: 'doc-001',
    documentTitle: '售后退款与赔偿处理规范',
    version: 2.3,
    section: '退款条件',
    snippet: '购买后 7 天内且使用时长不超过 2 小时，可全额退款。',
    citationReason: '该客户反馈涉及退款申请，需参照退款条件判断。',
    retrievedAt: '2026-07-14 09:23:15',
    relevanceScore: 0.94,
  },
  {
    id: 'cit-002',
    eventId: 'CASE-2026-101',
    documentId: 'doc-004',
    documentTitle: '小红书投诉扩散升级规则',
    version: 1.4,
    section: '升级标准 · P2',
    snippet: '笔记互动量 24 小时内突破 500，评论区存在争议但未形成共识 → P2 局部舆情。',
    citationReason: '客户已在公开平台发布截图，当前互动量触发 P2 阈值。',
    retrievedAt: '2026-07-14 09:23:16',
    relevanceScore: 0.88,
  },
  {
    id: 'cit-003',
    eventId: 'CASE-2026-101',
    documentId: 'doc-009',
    documentTitle: '客服推责判定规则',
    version: 1.0,
    section: '判定标准',
    snippet: '用户记录显示客服曾承诺某项功能但后续否认 → 触发「承诺变化」信号。',
    citationReason: '对话记录中客服承诺与后续处理不一致，触发推责判定。',
    retrievedAt: '2026-07-14 09:23:17',
    relevanceScore: 0.82,
  },
  {
    id: 'cit-004',
    eventId: 'CASE-2026-101',
    documentId: 'doc-011',
    documentTitle: '历史案例：退款争议扩散事件',
    version: 1.0,
    section: '可复用经验',
    snippet: '客服承诺变化 → 品牌舆情是常见升级路径。',
    citationReason: '当前事件模式与历史退款扩散事件高度相似。',
    retrievedAt: '2026-07-14 09:23:18',
    relevanceScore: 0.76,
  },
  {
    id: 'cit-005',
    eventId: 'CASE-2026-103',
    documentId: 'doc-003',
    documentTitle: 'App 支付失败应急处理 SOP',
    version: 3.0,
    section: '触发条件',
    snippet: '5 分钟内收到 10 条以上支付失败投诉 → 触发应急处理。',
    citationReason: '支付失败投诉集中爆发，需参照应急处理 SOP。',
    retrievedAt: '2026-07-13 14:20:10',
    relevanceScore: 0.91,
  },
];

export const mockUsageRecords: UsageRecord[] = [
  {
    id: 'log-001',
    eventId: 'CASE-2026-101',
    eventTitle: '用户投诉退款被拒并在社媒扩散',
    documentId: 'doc-001',
    documentTitle: '售后退款与赔偿处理规范',
    version: 2.3,
    snippet: '购买后 7 天内且使用时长不超过 2 小时，可全额退款。',
    user: '品牌 Agent',
    timestamp: '2026-07-14 09:23:15',
    action: 'cited',
  },
  {
    id: 'log-002',
    eventId: 'CASE-2026-101',
    eventTitle: '用户投诉退款被拒并在社媒扩散',
    documentId: 'doc-004',
    documentTitle: '小红书投诉扩散升级规则',
    version: 1.4,
    snippet: '笔记互动量触发 P2 阈值。',
    user: '品牌 Agent',
    timestamp: '2026-07-14 09:23:16',
    action: 'cited',
  },
  {
    id: 'log-003',
    eventId: 'CASE-2026-103',
    eventTitle: '支付失败批量投诉',
    documentId: 'doc-003',
    documentTitle: 'App 支付失败应急处理 SOP',
    version: 3.0,
    snippet: '触发支付失败应急处理 SOP。',
    user: '客服 Agent',
    timestamp: '2026-07-13 14:20:10',
    action: 'cited',
  },
  {
    id: 'log-004',
    eventId: 'CASE-2026-101',
    eventTitle: '用户投诉退款被拒并在社媒扩散',
    documentId: 'doc-001',
    documentTitle: '售后退款与赔偿处理规范',
    version: 2.3,
    snippet: '退款政策引用查看。',
    user: '管理员 · 李婷',
    timestamp: '2026-07-14 10:05:00',
    action: 'viewed',
  },
  {
    id: 'log-005',
    eventId: 'CASE-2026-101',
    eventTitle: '用户投诉退款被拒并在社媒扩散',
    documentId: 'doc-001',
    documentTitle: '售后退款与赔偿处理规范',
    version: 2.3,
    snippet: '退款政策引用有误，建议更新赔偿标准。',
    user: '管理员 · 张明',
    timestamp: '2026-07-14 11:30:00',
    action: 'feedback',
  },
  {
    id: 'log-006',
    eventId: 'CASE-2026-105',
    eventTitle: '疑似用户数据泄露反馈',
    documentId: 'doc-010',
    documentTitle: '数据安全与合规红线',
    version: 1.0,
    snippet: '数据安全红线触发。',
    user: '品牌 Agent',
    timestamp: '2026-07-12 09:10:00',
    action: 'cited',
  },
  {
    id: 'log-007',
    eventId: 'CASE-2026-102',
    eventTitle: '客服推责导致用户投诉升级',
    documentId: 'doc-009',
    documentTitle: '客服推责判定规则',
    version: 1.0,
    snippet: '推责判定规则引用。',
    user: '客服 Agent',
    timestamp: '2026-07-13 11:00:00',
    action: 'cited',
  },
];
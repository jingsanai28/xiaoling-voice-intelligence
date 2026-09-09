# 小聆 | Xiaoling Voice Intelligence

**客户声音智能分析平台：一个基于 LangGraph 的 Supervisor 编排型 Multi-Agent 个人项目。**

项目覆盖产品定义、AI Native 交互、Agent 架构、SQLite 数据闭环、RAG/Memory、Human-in-the-Loop 与评测迭代。核心工程判断是：哪些环节适合交给 Agent 做语义理解和专业判断，哪些必须下沉为确定、可测试、不能被模型绕过的系统节点。

`Supervisor 编排` `3 个专业 Agent` `Human-in-the-Loop` `RAG + Memory` `可审计执行` `Xiaoling VoiceBench`

> 这是经过脱敏的公开展示仓库，用于呈现产品思路、关键架构、代码片段、评测方法和真实界面。仓库不包含 API Key、SQLite 运行数据库、完整模型连接器、核心商业规则或可直接部署的全部实现，因此不能一键运行完整产品。

---

## 这个项目在做什么

客户声音分散在评论、客服对话、投诉、社交媒体、问卷和工单中。它们数量大、重复多、上下文不完整，真正影响品牌、服务和产品决策的少量信号很容易被淹没。人工可以处理单条投诉，却很难持续完成跨渠道降噪、聚合、判断、跟进和复盘。

小聆把这些原始声音转化为可持续处理的事件：

```text
接入文字 / 图片 / 文件
  -> 完整性与权限检查
  -> Supervisor 判断任务类型
  -> 专业 Agent 提炼高价值信号
  -> 补充企业知识与历史事件
  -> 风险校准与人工复核
  -> 输出证据、优先级、责任团队和下一步动作
  -> 进入任务、归档或 Bad Case 迭代
```

当前 MVP 验证三类业务场景：

| 场景 | 关注重点 | 主要使用者 |
| --- | --- | --- |
| 品牌舆情 | 传播线索、扩散程度、证据可信度与公关风险 | 品牌、公关、风险团队 |
| 客服质检 | 推责、过度承诺、升级风险与 SOP 依据 | 客服主管、质检团队 |
| 运营反馈 | 重复问题、核心链路、影响范围与处理优先级 | 运营、产品团队 |

风险分诊是底层处理能力，不是产品对外主张。产品真正解决的是：**从海量噪声中提炼值得企业行动的客户声音。**

## 产品界面

### 客户声音工作台

工作台汇总 SQLite 中的真实分析记录、高价值信号、待人工复核、当前任务、Agent 使用情况和 VoiceBench 状态，帮助团队先处理最值得关注的事件。

![小聆客户声音工作台](screenshots/01-workbench.png)

### 可解释的 Agent 分析过程

第一轮分析先展示计划，再展示系统节点、Supervisor、专业 Agent、工具、知识与历史匹配等执行摘要。界面只呈现可审计的调用对象、依据、状态和产出，不暴露模型隐藏思维过程；事件结果在主链路完成后才出现。

每次工具调用遵循统一契约，记录调用 Agent、工具、权限级别、执行状态、耗时和输入/输出摘要。这样既能让管理员理解系统做了什么，也能让 Bad Case 回放定位到具体工具，而不是只看到一段难以复现的模型结论。

![小聆 Agent 分析进度](screenshots/02-analysis-progress.png)

### 多轮对话、事件预览与人工复核

同一工作区支持持续追问、补充图片或文件证据、查看右侧事件结论，并在高风险动作前完成受控人工判断。对话、事件、任务、知识引用和复核决定通过同一个事件 ID 关联。

首次分析结束后，系统会固化事件上下文快照，保存已确认事实、证据、风险判断、知识/历史依据、未决问题和复核状态。后续对话优先沿用这份快照，新证据以补充方式进入事件，避免多轮追问把首轮判断悄悄覆盖。

![小聆分析结果与人工复核](screenshots/03-analysis-result-review.png)

<details>
<summary><strong>事件处置与生命周期</strong></summary>

#### 任务中心

![小聆任务中心](screenshots/04-task-center.png)

#### 事件详情

![小聆事件详情](screenshots/05-event-detail.png)

#### 人工复核队列

![小聆人工复核队列](screenshots/06-human-review.png)

#### 历史事件记录

![小聆历史事件记录](screenshots/10-event-history.png)

</details>

<details>
<summary><strong>知识库、RAG 与权限</strong></summary>

#### 知识空间概览

![小聆知识空间概览](screenshots/07-knowledge-overview.png)

#### RAG 检索测试

![小聆 RAG 检索测试](screenshots/08-retrieval-test.png)

#### 知识发布审核

![小聆知识发布审核](screenshots/09-knowledge-review.png)

#### 角色与权限边界

![小聆角色与权限管理](screenshots/11-permissions.png)

</details>

<details>
<summary><strong>VoiceBench 评测与 Bad Case 迭代</strong></summary>

#### 多模型评测概览

![小聆多模型评测概览](screenshots/12-evaluation-overview.png)

#### 1000 条 VoiceBench 候选案例

![小聆 VoiceBench 案例管理](screenshots/13-voicebench-cases.png)

#### Bad Case 回归

![小聆 Bad Case 管理](screenshots/14-bad-cases.png)

</details>

## 为什么不是一个万能 Agent

品牌舆情看传播与媒体，客服质检看推责与承诺，运营反馈看核心链路与影响范围。三类任务的证据、风险边界和输出动作不同，把它们塞进一个大 Prompt 会让职责、工具和评测标准变得模糊。

因此，Supervisor 只负责任务识别与路由，三个专业 Agent 分别完成业务判断；确定性和高风险环节保留为系统节点。

| 模块 | 类型 | 设计原因 |
| --- | --- | --- |
| Input Gate、Permission Check | 系统节点 | 输入与权限必须确定、可测试、不能被模型绕过 |
| Supervisor、三个业务 Agent | Agent | 需要语义理解、专业判断和按需工具调用 |
| Knowledge Retrieval、Memory Match | 工具/系统节点 | 需要发布状态、权限、来源和版本过滤 |
| Risk Calibration | 系统节点 | 风险边界必须稳定、可审计、可回归 |
| Human Review | 系统节点 + 人 | 认责、赔偿、合规和对外动作不可自动执行 |
| Trace、报告格式化、SQLite 留存 | 系统节点 | 保证结构、关联关系与审计完整性 |

## LangGraph 架构

```text
Input Gate                     输入结构化与完整性检查
    |
Permission Check               角色与场景权限
    |
Supervisor Agent               任务类型与 Agent 路由
    |-------------------|-------------------|
Brand Risk Agent   Customer Service QA   Operation Feedback
    |-------------------|-------------------|
Knowledge Retrieval + Memory Match       企业知识 + 历史事件
    |
Risk Calibration              确定性风险边界
    |
Human Review Gate             是否暂停等待人工
    |                         |
Final Report          Checkpoint + Interrupt
                              |
                      人工决定后恢复执行
    |
SQLite Records + Trace        分析、对话、任务与审计
```

Agent 的建议不是最终依据。系统会结合输入证据、已发布企业知识、历史相似事件和风险规则，再决定是否生成复核包。Agent 可以分析、分级和建议，但不能代表企业认责、承诺赔偿、公开回应或自动联系用户。

## 三个 Agent 的工具与执行流程

三个业务 Agent 不是换名字复用同一段逻辑，而是拥有不同的工具事件和判断重点：

| Agent | 工具 | 主要产出 |
| --- | --- | --- |
| Brand Risk | `propagation_scan`、`evidence_quality` | 传播线索、证据密度、品牌风险建议 |
| Customer Service QA | `dialogue_parser`、`tone_compliance_check` | 对话结构、话术风险、升级与复核建议 |
| Operation Feedback | `issue_clusterer`、`impact_estimator` | 问题聚类、影响范围、产品/运营优先级 |

工具调用会形成结构化事件，进入同一条分析 Trace 和前端执行进度。当前工具是为验证 Agent 边界设计的可解释 MVP；联网舆情搜索、企业工单和生产数据源属于后续集成范围。

统一工具记录包含：`tool_call_id`、调用 Agent、工具名、权限级别、状态、耗时、输入/输出摘要和错误码。公开仓库保留脱敏契约示例，不包含完整工具执行器、商业规则或数据库写入实现。

## 连续上下文与动作权限

小聆没有把“能分析”直接等同于“能执行”。系统把动作分成三级：

| 级别 | 典型动作 | MVP 行为 |
| --- | --- | --- |
| 只读分析 | 分析反馈、检索知识、匹配历史 | 可自动执行并记录 Trace |
| 内部写入 | 创建任务、更新状态、提交复核 | 具备权限的用户明确操作后执行 |
| 高风险动作 | 承诺赔偿、公开发布、联系用户、法律结论 | 默认拒绝，不提供自动执行入口 |

权限判定由确定性系统规则完成，未知动作按高风险处理，不让模型自行解释“自己有没有权限”。事件上下文快照与完整聊天记录分开保存：快照负责稳定事实和判断，聊天负责保留沟通过程，两者通过事件 ID 关联。

## RAG 知识库与历史记忆

知识库不是附件管理，而是 Agent 的判断依据层。当前分为两类：

- **公司产品知识**：产品规则、客服 SOP、品牌与合规口径；
- **其他公司案例**：公开或脱敏案例，用于比较历史处置模式。

知识使用遵循：

```text
当前证据 -> 已授权且已发布的企业知识 -> 已确认历史事件
-> 风险规则 -> Agent 建议 -> 人工复核
```

当前 MVP 已实现 SQLite-backed 知识空间、文档版本、草稿/审核/发布/归档、有效期与权限过滤、轻量检索、片段引用和检索反馈。Memory Match 使用历史事件和已发布外部案例补充相似事件依据。

这里刻意不把轻量检索写成生产级向量 RAG：当前实现用于验证知识生命周期、引用和 Agent grounding；企业级向量库、复杂召回排序和 SSO/RBAC 集成尚未实现。

## Human-in-the-Loop 与数据留存

高风险、证据不足、低置信度，或涉及赔偿、认责、公开回应、联系用户和法律判断的场景，会生成结构化人工复核包，包括负责人、优先级、复核问题、证据、允许/禁止动作和受控决策选项。

创建任务、更新事件状态和提交复核属于内部写入，必须来自有权限用户的明确操作；赔偿、对外发布、联系用户和法律结论属于高风险动作，在当前 MVP 中即使管理员主动触发也不会自动执行。

项目包含两层状态能力：

- 分析、事件、对话、任务、知识和评测标注写入本地 SQLite，页面切换或服务重启后可以恢复业务记录；
- LangGraph 人工复核暂停/恢复当前使用 `MemorySaver` Checkpointer，只保证同一服务进程内的工作流恢复，尚未替换为生产级持久化 Checkpointer。

图片和文件会作为事件输入材料保存。配置豆包 Responses 视觉路径时可发送图片进行识别；其他模型路径未配置视觉能力时会明确提示人工确认，不会伪装成已经完成识图。

## 评测体系：不是跑几个 Demo 看着顺眼

**Xiaoling VoiceBench** 当前包含 1000 条候选案例，按事件族去重后划分为 700 条迭代集与 300 条锁定验证集。锁定集不参与 Prompt、Few-shot、规则或 RAG 调优，降低验证集泄漏风险。

公开基准样本保留来源信息并提供中文阅读字段；自动标签是银标，只有完成人工复核的标签才能作为业务金标准。因此，这 1000 条是评测资产规模，不等同于 1000 条已人工确认的生产案例。

评测集先定义 Voice Universe，再做分层抽样：产品体验、产品链路、客服 SOP、客服语气、公关舆情和品牌高风险分别覆盖，不用一个平均分掩盖某类场景退化。评测报告同时关注路由、Agent 选择、风险校准、Human Review、RAG Recall@K / Precision@K、Citation Quality、多轮一致性和 Trace 完整性。

所有评测结论都保留可复核证据：样本来源、脱敏说明、模型和 Prompt 版本、知识库版本、期望输出、实际输出、错误类型和回归记录。没有对照实验时，只表达观察到的效率变化，不把相关性包装成因果结论。

### 同一任务契约下的五模型横评

首轮横评使用同一套 11 条企业反馈用例、Prompt、Schema、Memory、Human Review 和报告逻辑。结果用于定位路由、风险和结构化输出边界，不代表模型的通用能力或生产准确率。

| 模型 | 端到端通过率 | 路由准确率 | 风险等级准确率 | Schema 有效率 |
| --- | ---: | ---: | ---: | ---: |
| 通义千问 | 7/11 | 80% | 100% | 100% |
| Kimi | 6/11 | 90% | 100% | 100% |
| 智谱 GLM | 4/11 | 80% | 45% | 94% |
| DeepSeek | 2/11 | 70% | 27% | 100% |
| 豆包 Seed Evolving | 2/11 | 60% | 18% | 31% |

风险等级在不同模型间波动明显，这是 Risk Calibration 必须独立于模型输出的直接依据。当前记录的工程回归结果包括：规则基线 11/11、真实案例诊断 6/6、中文卡片配送路由回归 20/20；这些结果只对应各自固定用例，不能外推为业务准确率。

### Bad Case 闭环

```text
运行评测
  -> 记录错误类型、输入、期望和实际输出
  -> 定位 Prompt / 路由 / 知识 / 风险边界 / 标签问题
  -> 只在 700 条迭代集上修改
  -> 用 300 条锁定验证集回归
  -> 通过后更新规则、文档和版本
```

## 公开仓库结构

```text
xiaoling-voice-intelligence/
├── README.md                  项目介绍与产品界面
├── docs/                      产品、架构、上下文、评测和边界文档
├── code/
│   ├── app/                   脱敏后的 State、Graph、Schema、复核和 Trace 骨架
│   ├── evals/                 评测契约、示例用例和 Bad Case 方法
│   └── prompts/               公开的职责与输出约束模板
├── src/                       六个关键设计的独立阅读片段
├── screenshots/               14 张脱敏产品截图
└── validate_showcase.py       公开边界与敏感材料校验
```

### 公开内容

- 产品定位、用户角色、业务场景与 AI Native 交互；
- LangGraph 图结构、共享 State、系统节点和 Human Review 设计；
- Agent 工具契约、事件快照、三级动作权限、RAG、Memory 与评测方法；
- 脱敏代码片段、多模型评测数字和真实产品截图。

### 未公开内容

- API Key、`.env`、SQLite 数据库、真实客户数据和原始运行 Trace；
- 完整 HTTP API、模型连接器、搜索工具和知识库存储实现；
- 核心商业 Prompt、风险阈值、检索排序和生产部署配置；
- 可以直接安装运行的依赖文件与完整商业源码。

## 技术栈

`LangGraph` `Python` `Pydantic Schema` `SQLite` `RAG` `LangSmith` `React` `TypeScript`

LangSmith 通过可选的 `traceable` 集成观察模型调用和多轮对话；未配置追踪环境变量时不影响本地规则链路运行。公开仓库不包含账号配置或运行 Trace。

## 当前边界

MVP 阶段有意不做以下事情：

- 不做生产级爬虫、企业 SSO/LDAP、完整 RBAC 或生产级向量数据库；
- 不自动发布公告、联系用户、修改外部工单或代表企业承担法律责任；
- 不把模型隐藏思维过程展示给管理员，只展示可审计的执行摘要；
- 不把公开基准、自动银标或 11 条模型横评包装成生产准确率；
- 不声称公开仓库可以直接部署，它的目标是证明产品判断、Agent 架构与评测迭代能力。

## 延伸阅读

- [产品与业务定位](docs/01-product-positioning.md)
- [Agent 与工作流架构](docs/02-agent-architecture.md)
- [上下文、Memory 与知识库](docs/03-context-memory-knowledge.md)
- [评测与迭代方法](docs/04-evaluation-iteration.md)
- [项目职责与关键决策](docs/05-project-ownership.md)
- [公开仓库边界](docs/06-repo-boundary.md)
- [核心代码阅读说明](code/README.md)
- [关键设计片段](src/README.md)
- [产品截图索引](screenshots/README.md)

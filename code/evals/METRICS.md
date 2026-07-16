# Evaluation Metrics

本项目的评估目标不是证明模型“看起来会回答”，而是证明 Agent 产品可以被持续改进。

第一版评分维度如下。

## 1. Case Pass Rate

含义：

- 每条评估样例的关键断言是否全部通过。

为什么重要：

- 这是最基本的回归测试；
- 每次改路由、规则、Prompt 或 Memory，都不能破坏已有关键行为。

## 2. Task Type Accuracy

含义：

- Supervisor 判断出的 `task_type` 是否符合预期。

为什么重要：

- 这是多 Agent 系统的入口质量；
- 路由错了，后面的专家 Agent 再强也会分析错方向。

## 3. Agent Selection Accuracy

含义：

- 系统实际调用的 Agent 列表是否符合预期。

为什么重要：

- 它检验系统有没有正确识别单场景和混合场景；
- 它能证明本项目不是把所有请求都交给一个万能 Agent。

## 4. Risk Level Accuracy

含义：

- 输出风险等级是否符合评估样例的预期。

为什么重要：

- 风险等级直接影响业务优先级和是否需要升级；
- 过高会造成误报，过低会造成漏报。

## 5. Human Review Accuracy

含义：

- 是否正确触发人工复核。

为什么重要：

- 企业级 Agent 的关键不是自动化到底，而是知道哪些地方不能自动化；
- 赔偿、法律、媒体、安全、P1/P0 等场景必须保留人工确认。

## 6. Explanation Coverage

含义：

- 最终报告是否包含预期的关键解释信息。

为什么重要：

- AI 产品不能只给结论；
- 它必须解释证据、风险原因、建议动作和人工复核原因；
- 这也是作品集和面试中展示产品判断的核心。

## 7. Memory Match Accuracy

含义：

- 当样例声明了预期历史事件时，系统是否匹配到对应历史事件。

为什么重要：

- 企业 Agent 不应该只看当前输入，还要能参考历史相似案例；
- Memory 能让风险判断更可解释，也方便复盘和知识沉淀；
- 这能体现系统从 Demo 走向长期运营产品。

## 8. Review Packet Quality

含义：

- 需要人工复核的样例是否生成结构化复核包；
- 复核包是否包含负责人、复核问题、禁止动作等核心字段。

为什么重要：

- 企业级 Agent 不能只说“需要人工复核”；
- 它必须告诉人工看什么、判断什么、哪些动作不能自动执行；
- 这能体现 Human-in-the-loop 的产品设计能力，而不是停留在口号。

## 9. Trace Event Coverage

含义：

- 关键样例是否留下足够的节点事件。

为什么重要：

- 可回放 trace 是 Agent 工程化的核心能力；
- 它能帮助定位路由、风险分级、Memory、Human Review 的问题；
- 它也能把作品集从“结果展示”升级为“决策链路展示”。

## 当前阶段合格线

MVP 阶段目标：

- Case Pass Rate：100%
- Task Type Accuracy：100%
- Agent Selection Accuracy：100%
- Risk Level Accuracy：100%
- Human Review Accuracy：100%
- Explanation Coverage：100%
- Memory Match Accuracy：100%
- Review Packet Quality：100%
- Trace Event Coverage：100%

注意：

- 这是规则版 MVP 的小样本评估，不代表真实生产准确率；
- 后续接入真实 LLM、更多样例和真实数据后，应降低单次满分执念，转向持续观察趋势和 Bad Case 质量。

## VoiceBench 1000 条评估口径

VoiceBench 不把所有公开样本当作同一种准确率问题，而是按来源原生任务和小聆业务能力分层：

| 维度 | 计算方式 | 适用数据 | 备注 |
|---|---|---|---|
| 中文可读率 | 有 `raw_input_zh` 且包含中文字符的样本数 / 总样本数 | 全集 | 机器翻译只改善可读性，不改变英文原文证据 |
| 路由准确率 | `task_type` 命中银标或人工金标 | Banking77、TweetEval、CFPB | 银标只能用于开发趋势 |
| Agent 选择准确率 | 实际 Agent 集合与标签集合的集合级 F1 | 全集 | 混合任务不能只看单标签命中 |
| 风险校准 | P1-P4 的 macro-F1、混淆矩阵、P1 漏报率 | 有业务标签的样本 | P1 漏报优先于平均准确率 |
| 人工复核门准确率 | 复核触发的 precision、recall、P1 recall | 高风险/证据不足样本 | 不允许高风险自动执行 |
| 证据与行动覆盖 | 证据、责任团队、下一步动作三个字段的覆盖率 | 全集 | 缺任一项记为不完整 |
| 历史匹配准确率 | 命中人工指定历史事件的 Recall@K | 历史案例子集 | 不能用相似文本泄漏验证答案 |
| RAG 支撑率 | 引用存在、与结论相关、无越权扩展的比例 | 知识库子集 | 需要人工抽查 |
| 多轮一致性 | 追问后的事件、风险、证据 ID 保持率 | 对话子集 | 不能只测首轮 |
| Trace 完整率 | 必需 Agent、工具、路由、结果事件齐全的比例 | 全集 | 便于回放和定位 Bad Case |

### 防过拟合规则

1. 700 条 `dev_iteration` 只用于 Prompt、规则、RAG 和 Agent 行为迭代。
2. 300 条 `holdout_validation` 不进入 Few-shot、错误修正、知识库构造和人工提示词示例。
3. 规范化原文生成 `dedupe_key`，同一重复内容组必须整体进入同一 split。
4. 公开数据的 `silver_auto_needs_human_review` 标签只用于开发趋势；正式结论只使用 `human_verified`。
5. 每次迭代同时报告总体分数、各来源分数、各风险等级分数和 P1 漏报率，防止平均分掩盖局部退化。

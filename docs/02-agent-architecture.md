# 02｜Agent 与工作流架构

## 架构总览

```text
Input Gate                 系统节点：输入完整性
    |
Permission Check           系统节点：用户/场景权限
    |
Supervisor Agent           专业判断：任务类型与 Agent 路由
    |-------------------|-------------------|
Brand Risk Agent   Customer Service QA   Operation Feedback
    |-------------------|-------------------|
Knowledge Retrieval + Memory Match       工具/系统节点
    |
Risk Calibration          系统节点：校准风险边界
    |
Human Review Gate         系统节点：是否暂停等待人工
    |                         |
Final Report          Checkpoint + Interrupt
                              |
                      人工决定后恢复执行
```

## 为什么不是一个万能 Agent

品牌舆情、客服质检和运营反馈的判断标准不同：传播风险看扩散与媒体，客服质检看推责与过度承诺，运营反馈看核心链路与影响范围。Supervisor 负责分工，专业 Agent 负责判断，系统节点负责边界和审计。

## Agent / 系统节点边界

| 模块 | 类型 | 原因 |
| --- | --- | --- |
| 输入校验、权限校验 | 系统节点 | 必须确定、可测试、不能由模型绕过 |
| Supervisor、业务 Agent | Agent | 需要语义理解、专业判断或工具调用 |
| 知识检索、历史匹配 | 工具/系统节点 | 需要权限过滤、来源和版本可追溯 |
| 风险校准 | 系统节点 | 高风险边界必须稳定、可回归 |
| Human Review | 系统节点 + 人 | 认责、赔偿、合规和对外动作不可自动执行 |
| Trace、报告格式化 | 系统节点 | 保证输出结构与审计完整性 |

## 多轮对话

第一轮分析生成事件上下文，后续追问沿用同一个 `task_id`，并把问题限制在已有证据、知识引用、历史匹配和分析结论范围内。用户可以追问：

- 为什么是这个风险等级？
- 哪些证据支持这个判断？
- 有没有相似历史事件？
- 下一步由哪个团队处理？
- 还缺什么证据？

## Harness 工程

项目使用 `AGENTS.md`、`tasks.json`、`progress.md` 和 `docs/` 形成可持续维护的 Harness：任务先登记、变更同步文档、完成后执行验证、Bad Case 回流评测，避免 Agent 项目只停留在一次性 Demo。

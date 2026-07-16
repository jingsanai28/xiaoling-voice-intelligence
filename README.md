# 小聆｜客户声音智能分析平台

> 一个以 Agent 设计、工作流治理和评测迭代为重点的 AI 产品作品集。

小聆从评论、客服对话、投诉记录和社媒反馈中提炼真正影响业务的声音，完成路由、证据整理、风险校准、人工复核和持续对话。

## 这个仓库展示什么

- **Agent 架构**：Supervisor + 品牌舆情 Agent + 客服质检 Agent + 运营反馈 Agent；
- **工作流工程**：LangGraph StateGraph、共享 State、条件路由、Checkpoint、Interrupt 和可回放 Trace；
- **上下文设计**：事件上下文、历史事件 Memory、知识库引用、多轮追问和权限过滤；
- **安全治理**：Permission Check、Risk Calibration、Human Review Gate，禁止 Agent 自动执行高风险对外动作；
- **评测闭环**：多模型对比、700 条迭代集、300 条锁定验证集、Bad Case、回归评测和反馈迭代；
- **产品设计**：AI Native 管理员工作台、知识库、待办、历史事件、人工复核和权限管理。

## 快速阅读

1. [项目与产品定位](docs/01-product-positioning.md)
2. [Agent 与工作流架构](docs/02-agent-architecture.md)
3. [上下文、Memory 与知识库](docs/03-context-memory-knowledge.md)
4. [评测、Bad Case 与反馈迭代](docs/04-evaluation-iteration.md)
5. [产品界面截图清单](screenshots/README.md)
6. [简历可直接使用的表达](docs/05-resume-copy.md)
7. [可读代码片段](src/README.md)

## 作品集边界

这里是脱敏后的展示仓库，不包含完整后端源码、完整前端源码、SQLite 数据库、原始公开数据集、API Key、真实客户数据或可直接部署的生产配置。代码片段用于解释设计，不承诺单独运行。

## 面试演示主线

```text
海量高噪声声音
  -> 输入/权限检查
  -> Supervisor 路由
  -> 专业 Agent 分析
  -> 知识与历史事件匹配
  -> 风险校准
  -> 人工复核或生成行动材料
  -> 多轮追问、任务沉淀、Bad Case 回流
```

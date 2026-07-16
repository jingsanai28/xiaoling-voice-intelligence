# 代码目录说明

这里保留项目的核心 Agent、LangGraph 节点、前端页面、Prompt 和评测契约，用真实设计说明产品如何完成路由、分析、复核和迭代。

## 有意移除的部分

- 本地 API 启动入口和服务端适配层；
- 知识库数据库实现、SQLite 文件和初始化数据；
- 搜索、模型连接器、外部工具和完整工具调用实现；
- 模型 API 运行时、环境配置和依赖安装文件；
- 原始公开数据、真实/脱敏案例原文和运行 Trace；
- 前端构建配置、`node_modules`、构建产物和部署配置。

因此这个目录可以阅读核心设计，但下载后不能直接启动成完整产品。完整运行环境、商业实现和真实数据不属于公开仓库范围。

## 保留的核心代码

### Python / Agent

- `app/graph.py`：LangGraph 主图和条件路由；
- `app/state.py`：事件级共享 State；
- `app/agents/`：Supervisor 与三个业务 Agent；
- `app/nodes/`：输入、权限、知识、Memory、风险校准、人工复核和报告节点；
- `app/review_workflow.py`：暂停、人工决定和恢复执行；
- `app/events.py`、`app/tracing.py`：可回放事件和 Trace 摘要；

### Frontend / Product

- `frontend/src/pages/`：工作台、分析、待办、历史、复核、权限、知识库和评估页面；
- `frontend/src/pages/workspace/components/EventPanel.tsx`：Agent 进度、工具调用和事件预览；
- `frontend/src/types/`：对话、知识和风险类型契约；
- `frontend/src/mocks/`：脱敏的界面演示数据；

### Evaluation / Prompt

- `evals/`：指标、Bad Case、基线案例和 VoiceBench 分层契约；
- `prompts/`：四类 Agent 的 Prompt 设计参考。

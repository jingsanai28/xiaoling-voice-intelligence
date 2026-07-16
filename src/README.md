# 可读代码片段

这里放的是经过删减和脱敏的设计片段，不是完整源码。每个文件聚焦一个核心设计，不包含 API Key、企业数据、数据库文件或完整运行依赖。

- `01_workflow.py`：LangGraph 工作流边界；
- `02_state_contract.py`：事件级共享 State；
- `03_human_review.py`：Human-in-the-loop 的暂停与恢复；
- `04_context_policy.py`：多轮上下文和知识引用边界；
- `05_evaluation_loop.py`：评测集、锁定验证集与 Bad Case 回流；
- `06_tool_contract.py`：知识检索与历史事件工具契约。

阅读顺序建议：State -> Workflow -> Context -> Tool -> Human Review -> Evaluation。

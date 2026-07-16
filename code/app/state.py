from __future__ import annotations

from typing import Any, Literal, TypedDict


RiskLevel = Literal["P0", "P1", "P2", "P3", "unknown"]
TaskType = Literal["brand_risk", "customer_service_qa", "operation_feedback", "mixed", "clarify"]
HumanReviewStatus = Literal["not_required", "pending", "resolved"]


# Event 是本项目的“可回放轨迹”最小单位。
# 每个节点处理完关键动作后都会 append 一个 Event，最后 trace/report 就靠它还原链路。
class Event(TypedDict, total=False):
    node: str
    action: str
    message: str
    data: dict[str, Any]


# HumanReviewPacket 是给人工复核人的结构化材料。
# 注意它不是最终对外话术，而是内部复核清单：谁看、看什么、哪些动作禁止。
class HumanReviewPacket(TypedDict, total=False):
    required: bool
    owner: str
    priority: str
    questions: list[str]
    evidence_to_review: list[str]
    allowed_actions: list[str]
    blocked_actions: list[str]
    decision_options: list[str]


class HumanReviewDecision(TypedDict, total=False):
    decision: str
    reviewer: str
    note: str


# RiskTriageState 是整张 LangGraph 图共享的“工作台”。
# 每个节点都读写这个 state，而不是互相直接调用。这样做的好处是：
# 1. 每一步的输入输出可追踪；
# 2. 规则版 Agent、LLM Agent、系统节点可以安全组合；
# 3. 评估脚本可以直接检查最终 state 是否符合预期。
class RiskTriageState(TypedDict, total=False):
    # 原始请求信息。
    task_id: str
    user_id: str
    user_role: str
    raw_input: str
    input_items: list[dict[str, Any]]

    # Supervisor 的路由结果：这次属于什么任务、该调用哪些业务 Agent。
    task_type: TaskType
    selected_agents: list[str]
    missing_fields: list[str]

    # 从输入中抽取出来的业务上下文，当前 MVP 只用了其中一部分。
    brand_name: str | None
    product_names: list[str]
    channels: list[str]

    # 业务 Agent、Memory Match 和工具层沉淀的中间证据。
    extracted_facts: list[dict[str, Any]]
    clusters: list[dict[str, Any]]
    evidence: list[dict[str, Any]]
    historical_matches: list[dict[str, Any]]
    knowledge_citations: list[dict[str, Any]]

    # 风险判断结果。risk_level 会先由 Agent 给出，再由 Risk Calibration 校准。
    risk_level: RiskLevel
    risk_reasons: list[str]
    recommended_owner: str | None
    recommended_actions: list[str]

    # Human Review 相关状态。高风险动作不能由 Agent 自动执行，必须进入这里。
    needs_human_review: bool
    human_review_reasons: list[str]
    human_review_packet: HumanReviewPacket
    human_review_status: HumanReviewStatus
    human_review_decision: HumanReviewDecision

    # 运行时与可观测性信息。
    confidence: float
    graph_runtime: Literal["langgraph", "langgraph_checkpointed", "local_fallback"]
    llm_enabled: bool
    llm_provider: str
    llm_model: str
    llm_failure_policy: Literal["fallback", "fail"]
    llm_calls: list[dict[str, Any]]
    current_node: str
    final_report: str | None

    # 事件日志和错误列表是最终报告、trace 和评估脚本的重要依据。
    events: list[Event]
    errors: list[dict[str, Any]]

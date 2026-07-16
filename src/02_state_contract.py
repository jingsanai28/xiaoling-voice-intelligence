"""事件级 State：让多轮对话、Trace 和人工复核共享同一上下文。"""

class XiaolingState(TypedDict, total=False):
    task_id: str
    raw_input: str
    input_items: list[dict]

    task_type: Literal["brand_risk", "customer_service_qa", "operation_feedback", "mixed"]
    selected_agents: list[str]
    extracted_facts: list[dict]
    evidence: list[dict]

    risk_level: Literal["P0", "P1", "P2", "P3", "unknown"]
    risk_reasons: list[str]
    recommended_owner: str | None
    recommended_actions: list[str]

    historical_matches: list[dict]
    knowledge_citations: list[dict]
    human_review_status: Literal["not_required", "pending", "resolved"]
    events: list[dict]


# 不把所有对话文本拼成一个超长 Prompt，而是按用途管理结构化上下文。

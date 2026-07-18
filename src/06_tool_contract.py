"""脱敏契约示例：展示审计字段和权限边界，不包含完整执行器。"""

from typing import Literal, TypedDict


class ToolCallRecord(TypedDict, total=False):
    tool_call_id: str
    agent: str
    tool_name: str
    permission_level: Literal["read_only", "internal_write", "high_risk"]
    status: Literal["completed", "failed"]
    duration_ms: float
    input_summary: str
    output_summary: str
    error_code: str


def retrieve_knowledge(query: str, user_id: str, agent_name: str) -> list[dict]:
    documents = repository.search(query)
    return [
        {
            "document_id": doc.id,
            "title": doc.title,
            "version": doc.version,
            "snippet": doc.snippet,
            "authorized": policy.can_read(user_id, agent_name, doc),
            "status": doc.status,
        }
        for doc in documents
        if doc.status == "published"
    ]


def match_historical_events(facts: list[dict]) -> list[dict]:
    # Memory 是参考证据，不替代当前事件的判断。
    return event_index.similar(facts, limit=3)


def action_decision(level: str, user_confirmed: bool) -> str:
    """实际角色映射和 API 拦截属于未公开商业实现。"""
    if level == "read_only":
        return "allow"
    if level == "internal_write":
        return "allow" if user_confirmed else "confirm"
    return "deny"

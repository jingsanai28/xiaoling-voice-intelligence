from __future__ import annotations

from app.events import add_event
from app.knowledge_base import get_knowledge_repository
from app.state import RiskTriageState


def knowledge_retrieval(state: RiskTriageState) -> RiskTriageState:
    """Retrieve published enterprise knowledge before the business conclusion is finalized."""
    state["current_node"] = "knowledge_retrieval"
    raw_input = str(state.get("raw_input", "")).strip()
    if not raw_input or state.get("errors") or state.get("missing_fields"):
        state["knowledge_citations"] = []
        return state

    citations = get_knowledge_repository().citations_for_analysis(
        str(state.get("task_id") or "analysis"),
        raw_input,
        limit=3,
    )
    state["knowledge_citations"] = citations
    if citations:
        add_event(
            state,
            "knowledge_retrieval",
            "knowledge_matched",
            f"已匹配 {len(citations)} 条已发布企业知识。",
            {
                "citations": [
                    {
                        "document_id": item["documentId"],
                        "version": item["version"],
                        "section": item["section"],
                        "score": item["relevanceScore"],
                    }
                    for item in citations
                ]
            },
        )
    else:
        add_event(
            state,
            "knowledge_retrieval",
            "knowledge_not_found",
            "未找到可靠的已发布企业知识，后续判断需明确证据不足。",
        )
    return state

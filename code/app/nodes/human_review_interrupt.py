from __future__ import annotations

from typing import Any

from langgraph.types import interrupt

from app.events import add_event
from app.state import HumanReviewDecision, RiskTriageState


ALLOWED_REVIEW_DECISIONS = {
    "确认升级处理",
    "降级为观察",
    "要求补充证据",
    "转交其他团队复核",
}


def wait_for_human_review(state: RiskTriageState) -> RiskTriageState:
    """Pause a high-risk thread until a reviewer provides a controlled decision."""
    response = interrupt(
        {
            "task_id": state.get("task_id"),
            "risk_level": state.get("risk_level"),
            "review_packet": state.get("human_review_packet", {}),
        }
    )
    decision = normalize_review_decision(response)
    state["human_review_decision"] = decision
    state["human_review_status"] = "resolved"
    state["current_node"] = "human_review_interrupt"
    add_event(
        state,
        "human_review_interrupt",
        "decision_received",
        "已收到人工复核决定，允许工作流继续生成报告。",
        {"decision": decision["decision"], "reviewer": decision["reviewer"]},
    )
    return state


def normalize_review_decision(response: Any) -> HumanReviewDecision:
    if not isinstance(response, dict):
        raise ValueError("人工复核决定必须是包含 decision、reviewer、note 的对象。")

    decision = response.get("decision")
    reviewer = response.get("reviewer")
    note = response.get("note", "")
    if decision not in ALLOWED_REVIEW_DECISIONS:
        allowed = "、".join(sorted(ALLOWED_REVIEW_DECISIONS))
        raise ValueError(f"不支持的人工复核决定：{decision!r}。允许值：{allowed}。")
    if not isinstance(reviewer, str) or not reviewer.strip():
        raise ValueError("人工复核决定必须记录 reviewer。")
    if not isinstance(note, str):
        raise ValueError("人工复核决定的 note 必须是字符串。")

    return HumanReviewDecision(decision=decision, reviewer=reviewer.strip(), note=note.strip())

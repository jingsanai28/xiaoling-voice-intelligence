from __future__ import annotations

from app.events import add_event
from app.state import RiskTriageState


def input_gate(state: RiskTriageState) -> RiskTriageState:
    raw_input = state.get("raw_input", "").strip()
    missing_fields: list[str] = []

    if not raw_input:
        missing_fields.append("raw_input")

    state["missing_fields"] = missing_fields
    state["current_node"] = "input_gate"

    if missing_fields:
        state["task_type"] = "clarify"
        state["risk_level"] = "unknown"
        state["confidence"] = 0.0
        add_event(state, "input_gate", "blocked", "输入缺少必要字段。", {"missing_fields": missing_fields})
        return state

    add_event(state, "input_gate", "passed", "输入完整性检查通过。")
    return state


from __future__ import annotations

from typing import Any

from app.state import RiskTriageState


def apply_supervisor_output(state: RiskTriageState, payload: dict[str, Any]) -> RiskTriageState:
    state["task_type"] = payload["task_type"]
    state["selected_agents"] = payload["selected_agents"]
    state["current_node"] = "supervisor"
    return state


def apply_business_output(state: RiskTriageState, agent_name: str, payload: dict[str, Any]) -> RiskTriageState:
    state["risk_level"] = higher_risk(state.get("risk_level", "unknown"), payload["risk_level"])
    state["confidence"] = max(state.get("confidence", 0.0), float(payload["confidence"]))
    state.setdefault("risk_reasons", []).extend(str(item) for item in payload["risk_reasons"])
    state.setdefault("recommended_actions", []).extend(str(item) for item in payload["recommended_actions"])
    state["recommended_owner"] = state.get("recommended_owner") or payload["recommended_owner"]
    for item in payload["evidence"]:
        value = dict(item) if isinstance(item, dict) else {"value": str(item)}
        value["agent"] = agent_name
        state.setdefault("evidence", []).append(value)
    if agent_name == "operation_feedback":
        state.setdefault("clusters", []).extend(payload.get("clusters", []))
    if agent_name == "customer_service_qa" and payload.get("problematic_phrases"):
        state.setdefault("extracted_facts", []).append({"agent": agent_name, "problematic_phrases": payload["problematic_phrases"]})
    return state


def higher_risk(current: str, candidate: str) -> str:
    order = {"P0": 0, "P1": 1, "P2": 2, "P3": 3, "unknown": 4}
    return candidate if order[candidate] < order.get(current, 4) else current

from __future__ import annotations

from app.events import add_event
from app.state import RiskTriageState


ALLOWED_ROLES = {"admin", "brand", "customer_service", "operation", "product", "viewer"}


def permission_check(state: RiskTriageState) -> RiskTriageState:
    role = state.get("user_role") or "viewer"
    state["user_role"] = role
    state["current_node"] = "permission_check"

    if role not in ALLOWED_ROLES:
        errors = state.setdefault("errors", [])
        errors.append({"code": "permission_denied", "message": f"用户角色 {role} 无权分析企业反馈。"})
        state["risk_level"] = "unknown"
        state["confidence"] = 0.0
        add_event(state, "permission_check", "blocked", "权限检查未通过。", {"role": role})
        return state

    add_event(state, "permission_check", "passed", "权限检查通过。", {"role": role})
    return state


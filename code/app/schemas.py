from __future__ import annotations

from dataclasses import dataclass
from typing import Any


RISK_LEVELS = {"P0", "P1", "P2", "P3", "unknown"}
TASK_TYPES = {"brand_risk", "customer_service_qa", "operation_feedback", "mixed", "clarify"}
AGENT_NAMES = {"brand_risk", "customer_service_qa", "operation_feedback"}


@dataclass(frozen=True)
class ValidationResult:
    ok: bool
    errors: list[str]


def validate_supervisor_output(payload: dict[str, Any]) -> ValidationResult:
    errors: list[str] = []

    task_type = payload.get("task_type")
    if task_type not in TASK_TYPES:
        errors.append(f"task_type must be one of {sorted(TASK_TYPES)}, got {task_type!r}")

    selected_agents = payload.get("selected_agents")
    if not isinstance(selected_agents, list):
        errors.append("selected_agents must be a list")
    else:
        unknown_agents = [agent for agent in selected_agents if agent not in AGENT_NAMES]
        if unknown_agents:
            errors.append(f"selected_agents contains unknown agents: {unknown_agents!r}")
        if task_type == "mixed" and len(selected_agents) < 2:
            errors.append("mixed task_type requires at least two selected_agents")
        if task_type in AGENT_NAMES and selected_agents != [task_type]:
            errors.append("single task_type must select exactly the matching agent")

    require_string(payload, "routing_reason", errors)
    return ValidationResult(ok=not errors, errors=errors)


def validate_brand_risk_output(payload: dict[str, Any]) -> ValidationResult:
    return validate_business_agent_output(payload, agent_name="brand_risk")


def validate_customer_service_qa_output(payload: dict[str, Any]) -> ValidationResult:
    errors = validate_business_agent_output(payload, agent_name="customer_service_qa").errors
    optional_list(payload, "problematic_phrases", errors)
    return ValidationResult(ok=not errors, errors=errors)


def validate_operation_feedback_output(payload: dict[str, Any]) -> ValidationResult:
    errors = validate_business_agent_output(payload, agent_name="operation_feedback").errors
    optional_list(payload, "clusters", errors)
    return ValidationResult(ok=not errors, errors=errors)


def validate_business_agent_output(payload: dict[str, Any], agent_name: str) -> ValidationResult:
    errors: list[str] = []

    risk_level = payload.get("risk_level")
    if risk_level not in RISK_LEVELS:
        errors.append(f"{agent_name}.risk_level must be one of {sorted(RISK_LEVELS)}, got {risk_level!r}")

    confidence = payload.get("confidence")
    if not isinstance(confidence, int | float) or not 0 <= float(confidence) <= 1:
        errors.append(f"{agent_name}.confidence must be a number between 0 and 1")

    require_string(payload, "recommended_owner", errors)
    require_list(payload, "risk_reasons", errors)
    require_list(payload, "evidence", errors)
    require_list(payload, "recommended_actions", errors)

    review_hint = payload.get("needs_human_review_hint")
    if not isinstance(review_hint, bool):
        errors.append(f"{agent_name}.needs_human_review_hint must be boolean")

    return ValidationResult(ok=not errors, errors=errors)


def require_string(payload: dict[str, Any], field: str, errors: list[str]) -> None:
    value = payload.get(field)
    if not isinstance(value, str) or not value.strip():
        errors.append(f"{field} must be a non-empty string")


def require_list(payload: dict[str, Any], field: str, errors: list[str]) -> None:
    value = payload.get(field)
    if not isinstance(value, list) or not value:
        errors.append(f"{field} must be a non-empty list")


def optional_list(payload: dict[str, Any], field: str, errors: list[str]) -> None:
    value = payload.get(field)
    if value is not None and not isinstance(value, list):
        errors.append(f"{field} must be a list when provided")


VALID_EXAMPLES = {
    "supervisor": {
        "task_type": "mixed",
        "selected_agents": ["brand_risk", "customer_service_qa"],
        "routing_reason": "输入同时涉及公开平台传播和客服承诺风险。",
    },
    "brand_risk": {
        "risk_level": "P2",
        "confidence": 0.7,
        "risk_reasons": ["小红书出现负面讨论并开始扩散。"],
        "evidence": [{"type": "keyword_or_fact", "value": "小红书"}],
        "recommended_owner": "品牌/公关团队",
        "recommended_actions": ["收集传播证据并观察扩散速度。"],
        "needs_human_review_hint": False,
    },
    "customer_service_qa": {
        "risk_level": "P2",
        "confidence": 0.72,
        "risk_reasons": ["客服存在推责表达。"],
        "problematic_phrases": ["不归我们管"],
        "evidence": [{"type": "dialogue_or_phrase", "value": "不归我们管"}],
        "recommended_owner": "客服主管",
        "recommended_actions": ["复核原始对话并替换推责话术。"],
        "needs_human_review_hint": False,
    },
    "operation_feedback": {
        "risk_level": "P1",
        "confidence": 0.76,
        "clusters": [{"name": "支付失败", "priority": "high", "signals": ["支付失败"]}],
        "risk_reasons": ["支付失败影响核心链路。"],
        "evidence": [{"type": "feedback_signal", "value": "支付失败"}],
        "recommended_owner": "运营/产品团队",
        "recommended_actions": ["进入高优先级排查。"],
        "needs_human_review_hint": True,
    },
}


INVALID_EXAMPLES = {
    "supervisor": {
        "task_type": "mixed",
        "selected_agents": ["brand_risk"],
        "routing_reason": "",
    },
    "brand_risk": {
        "risk_level": "high",
        "confidence": 2,
        "risk_reasons": [],
        "evidence": [],
        "recommended_owner": "",
        "recommended_actions": [],
        "needs_human_review_hint": "yes",
    },
}


VALIDATORS = {
    "supervisor": validate_supervisor_output,
    "brand_risk": validate_brand_risk_output,
    "customer_service_qa": validate_customer_service_qa_output,
    "operation_feedback": validate_operation_feedback_output,
}


def main() -> None:
    for name, payload in VALID_EXAMPLES.items():
        result = VALIDATORS[name](payload)
        print(f"valid {name}: {'PASS' if result.ok else 'FAIL'}")
        if not result.ok:
            raise SystemExit(f"valid example failed: {name}: {result.errors}")

    for name, payload in INVALID_EXAMPLES.items():
        result = VALIDATORS[name](payload)
        print(f"invalid {name}: {'PASS' if not result.ok else 'FAIL'}")
        if result.ok:
            raise SystemExit(f"invalid example unexpectedly passed: {name}")


if __name__ == "__main__":
    main()


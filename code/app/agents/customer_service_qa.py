from __future__ import annotations

from app.events import add_event
from app.llm_apply import apply_business_output
from app.llm_runtime import maybe_get_llm_output
from app.state import RiskTriageState


ESCALATION_KEYWORDS = ("不归我们管", "无法处理", "你自己", "投诉", "赔偿", "态度差", "截图", "承诺", "售后", "诱导")


def customer_service_qa_agent(state: RiskTriageState) -> RiskTriageState:
    llm_output = maybe_get_llm_output(state, "customer_service_qa")
    if llm_output:
        state = apply_business_output(state, "customer_service_qa", llm_output)
        add_event(state, "customer_service_qa_agent", "analyzed", "客服质检 Agent 已完成 LLM 分析。")
        return state
    if state.get("llm_enabled") and state.get("llm_failure_policy") == "fail":
        return state
    text = state.get("raw_input", "")
    facts = state.setdefault("extracted_facts", [])
    evidence = state.setdefault("evidence", [])
    reasons = state.setdefault("risk_reasons", [])
    actions = state.setdefault("recommended_actions", [])

    hits = [keyword for keyword in ESCALATION_KEYWORDS if keyword in text]
    facts.append({"agent": "customer_service_qa", "fact": "输入包含客服沟通或售后处理线索。"})
    evidence.append({"agent": "customer_service_qa", "type": "keyword_match", "value": hits})

    if hits:
        state["risk_level"] = max_risk(state.get("risk_level", "unknown"), "P2")
        state["confidence"] = max(state.get("confidence", 0.0), 0.72)
        reasons.append(f"客服沟通存在升级风险词：{', '.join(hits)}。")
        actions.append("请客服主管复核原始对话，并替换推责、冷漠或过度承诺话术。")
    else:
        state["risk_level"] = max_risk(state.get("risk_level", "unknown"), "P3")
        state["confidence"] = max(state.get("confidence", 0.0), 0.56)
        reasons.append("暂未发现明显客服话术升级风险。")
        actions.append("抽样复核客服回复，确认是否存在上下文遗漏。")

    state["recommended_owner"] = state.get("recommended_owner") or "客服主管"
    add_event(state, "customer_service_qa_agent", "analyzed", "客服质检 Agent 已完成规则版分析。")
    return state


def max_risk(current: str, candidate: str) -> str:
    order = {"P0": 0, "P1": 1, "P2": 2, "P3": 3, "unknown": 4}
    return candidate if order[candidate] < order.get(current, 4) else current

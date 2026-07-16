from __future__ import annotations

from app.events import add_event
from app.llm_apply import apply_business_output
from app.llm_runtime import maybe_get_llm_output
from app.state import RiskTriageState


HIGH_PRIORITY_KEYWORDS = ("无法登录", "支付失败", "闪退", "数据丢失", "安全", "大面积")
FEEDBACK_KEYWORDS = ("bug", "卡顿", "慢", "不好用", "建议", "需求", "体验", "高频", "很多人", "App", "付款", "支付方式", "下载", "不友好")


def operation_feedback_agent(state: RiskTriageState) -> RiskTriageState:
    llm_output = maybe_get_llm_output(state, "operation_feedback")
    if llm_output:
        state = apply_business_output(state, "operation_feedback", llm_output)
        add_event(state, "operation_feedback_agent", "analyzed", "运营反馈 Agent 已完成 LLM 分析。")
        return state
    if state.get("llm_enabled") and state.get("llm_failure_policy") == "fail":
        return state
    text = state.get("raw_input", "")
    clusters = state.setdefault("clusters", [])
    evidence = state.setdefault("evidence", [])
    reasons = state.setdefault("risk_reasons", [])
    actions = state.setdefault("recommended_actions", [])

    high_hits = [keyword for keyword in HIGH_PRIORITY_KEYWORDS if keyword in text]
    feedback_hits = [keyword for keyword in FEEDBACK_KEYWORDS if keyword in text]

    clusters.append(
        {
            "agent": "operation_feedback",
            "cluster": "用户体验/产品反馈",
            "signals": high_hits + feedback_hits,
            "priority": "high" if high_hits else "medium",
        }
    )
    evidence.append({"agent": "operation_feedback", "type": "keyword_match", "value": high_hits + feedback_hits})

    if high_hits:
        state["risk_level"] = max_risk(state.get("risk_level", "unknown"), "P1")
        state["confidence"] = max(state.get("confidence", 0.0), 0.76)
        reasons.append(f"存在高优先级产品/运营问题：{', '.join(high_hits)}。")
        actions.append("将问题进入产品/研发高优先级排查，并补充影响范围数据。")
    elif feedback_hits:
        state["risk_level"] = max_risk(state.get("risk_level", "unknown"), "P2")
        state["confidence"] = max(state.get("confidence", 0.0), 0.64)
        reasons.append(f"存在产品体验或运营反馈信号：{', '.join(feedback_hits)}。")
        actions.append("聚合同类反馈，判断是否进入需求池或运营优化列表。")
    else:
        state["risk_level"] = max_risk(state.get("risk_level", "unknown"), "P3")
        state["confidence"] = max(state.get("confidence", 0.0), 0.52)
        reasons.append("反馈信息较弱，建议补充样本量和具体用户影响。")
        actions.append("补充更多反馈样本后再做优先级判断。")

    state["recommended_owner"] = state.get("recommended_owner") or "运营/产品团队"
    add_event(state, "operation_feedback_agent", "analyzed", "运营反馈 Agent 已完成规则版分析。")
    return state


def max_risk(current: str, candidate: str) -> str:
    order = {"P0": 0, "P1": 1, "P2": 2, "P3": 3, "unknown": 4}
    return candidate if order[candidate] < order.get(current, 4) else current

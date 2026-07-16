from __future__ import annotations

from app.events import add_event
from app.llm_apply import apply_business_output
from app.llm_runtime import maybe_get_llm_output
from app.state import RiskTriageState


HIGH_RISK_KEYWORDS = ("热搜", "媒体", "大规模", "群体", "维权", "违法", "欺骗", "安全")
MEDIUM_RISK_KEYWORDS = ("小红书", "微博", "曝光", "公开平台", "质疑", "误导宣传", "投诉", "差评", "传播", "扩散", "评论区", "截图")


def brand_risk_agent(state: RiskTriageState) -> RiskTriageState:
    llm_output = maybe_get_llm_output(state, "brand_risk")
    if llm_output:
        state = apply_business_output(state, "brand_risk", llm_output)
        add_event(state, "brand_risk_agent", "analyzed", "品牌舆情 Agent 已完成 LLM 分析。")
        return state
    if state.get("llm_enabled") and state.get("llm_failure_policy") == "fail":
        return state
    text = state.get("raw_input", "")
    facts = state.setdefault("extracted_facts", [])
    evidence = state.setdefault("evidence", [])
    reasons = state.setdefault("risk_reasons", [])
    actions = state.setdefault("recommended_actions", [])

    high_hits = [keyword for keyword in HIGH_RISK_KEYWORDS if keyword in text]
    medium_hits = [keyword for keyword in MEDIUM_RISK_KEYWORDS if keyword in text]

    facts.append({"agent": "brand_risk", "fact": "输入包含公开传播或品牌声誉相关线索。"})
    evidence.append({"agent": "brand_risk", "type": "keyword_match", "value": high_hits + medium_hits})

    if high_hits:
        state["risk_level"] = "P1"
        state["confidence"] = max(state.get("confidence", 0.0), 0.78)
        reasons.append(f"存在高传播风险关键词：{', '.join(high_hits)}。")
    elif medium_hits:
        state["risk_level"] = max_risk(state.get("risk_level", "unknown"), "P2")
        state["confidence"] = max(state.get("confidence", 0.0), 0.66)
        reasons.append(f"存在公开平台或投诉扩散线索：{', '.join(medium_hits)}。")
    else:
        state["risk_level"] = max_risk(state.get("risk_level", "unknown"), "P3")
        state["confidence"] = max(state.get("confidence", 0.0), 0.55)
        reasons.append("暂未发现强品牌扩散信号，但建议持续观察。")

    state["recommended_owner"] = state.get("recommended_owner") or "品牌/公关团队"
    actions.append("整理公开传播证据，评估是否需要品牌或公关团队介入。")
    add_event(state, "brand_risk_agent", "analyzed", "品牌舆情 Agent 已完成规则版分析。")
    return state


def max_risk(current: str, candidate: str) -> str:
    order = {"P0": 0, "P1": 1, "P2": 2, "P3": 3, "unknown": 4}
    return candidate if order[candidate] < order.get(current, 4) else current

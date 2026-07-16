from __future__ import annotations

from app.events import add_event
from app.state import RiskTriageState


REVIEW_RISK_LEVELS = {"P0", "P1"}
REVIEW_KEYWORDS = ("赔偿", "法律", "违法", "媒体", "热搜", "群体", "安全", "诱导", "欺骗")


def human_review_gate(state: RiskTriageState) -> RiskTriageState:
    """决定是否需要人工复核，并生成复核包。

    这里是高风险安全边界：即使前面的 Agent 给出了建议，也不能自动认责、
    承诺赔偿或对外发布。这个节点只生成“交给人看的材料”。
    """
    text = state.get("raw_input", "")
    risk_level = state.get("risk_level", "unknown")
    confidence = state.get("confidence", 0.0)
    reasons: list[str] = []

    if risk_level in REVIEW_RISK_LEVELS:
        reasons.append(f"风险等级为 {risk_level}，需要人工复核。")
    if confidence < 0.6:
        reasons.append("置信度低于 0.6，需要人工补充判断。")

    # 关键词触发是兜底：即便风险等级没有升高，只要涉及赔偿/法律/媒体等，也应交给人看。
    keyword_hits = [keyword for keyword in REVIEW_KEYWORDS if keyword in text]
    if keyword_hits:
        reasons.append(f"涉及高风险关键词：{', '.join(keyword_hits)}。")

    state["needs_human_review"] = bool(reasons)
    state["human_review_reasons"] = reasons
    state["human_review_packet"] = build_review_packet(state, reasons)
    state["human_review_status"] = "pending" if reasons else "not_required"
    state["current_node"] = "human_review_gate"

    add_event(
        state,
        "human_review_gate",
        "review_required" if reasons else "review_not_required",
        "已完成人工复核门槛判断。",
        {"reasons": reasons},
    )
    return state


def build_review_packet(state: RiskTriageState, reasons: list[str]) -> dict[str, object]:
    """把复核原因翻译成结构化复核包。

    复核包的重点不是“写一段好看的话”，而是让负责人知道：
    为什么要看、看哪些证据、能做什么、不能做什么。
    """
    if not reasons:
        return {
            "required": False,
            "owner": state.get("recommended_owner") or "业务负责人",
            "priority": "normal",
            "questions": [],
            "evidence_to_review": [],
            "allowed_actions": ["记录分析结果", "继续观察反馈变化", "补充样本后重新评估"],
            "blocked_actions": [],
            "decision_options": ["无需升级", "补充信息后再判断"],
        }

    selected_agents = state.get("selected_agents", [])
    owner = choose_review_owner(selected_agents, state.get("recommended_owner"))
    evidence_to_review = collect_evidence_to_review(state)

    return {
        "required": True,
        "owner": owner,
        "priority": "urgent" if state.get("risk_level") in {"P0", "P1"} else "normal",
        "questions": build_review_questions(state),
        "evidence_to_review": evidence_to_review,
        "allowed_actions": [
            "确认风险等级",
            "补充证据和影响范围",
            "指派责任团队跟进",
            "批准后再生成对外回应建议",
        ],
        "blocked_actions": [
            "未确认前不得代表企业认责",
            "未确认前不得承诺赔偿",
            "未确认前不得对外发布声明",
            "未确认前不得自动联系用户",
        ],
        "decision_options": [
            "确认升级处理",
            "降级为观察",
            "要求补充证据",
            "转交其他团队复核",
        ],
    }


def choose_review_owner(selected_agents: list[str], fallback_owner: str | None) -> str:
    """根据被调用的 Agent 推断复核负责人。混合场景通常需要多团队一起看。"""
    if "brand_risk" in selected_agents and "customer_service_qa" in selected_agents:
        return "品牌/公关负责人 + 客服主管"
    if "brand_risk" in selected_agents:
        return "品牌/公关负责人"
    if "customer_service_qa" in selected_agents:
        return "客服主管"
    if "operation_feedback" in selected_agents:
        return "运营/产品负责人"
    return fallback_owner or "业务负责人"


def build_review_questions(state: RiskTriageState) -> list[str]:
    """生成复核人需要回答的问题，避免人工复核只停留在“看一下”。"""
    questions = [
        f"当前风险等级 {state.get('risk_level', 'unknown')} 是否需要调整？",
        "证据是否足以支持当前判断？",
        "是否需要跨团队升级处理？",
    ]
    if state.get("historical_matches"):
        questions.append("历史相似事件是否适合作为本次处置参考？")
    return questions


def collect_evidence_to_review(state: RiskTriageState) -> list[str]:
    """收集 Agent 证据和历史相似事件，作为人工复核材料。"""
    evidence: list[str] = []
    for item in state.get("evidence", []):
        agent = item.get("agent", "unknown")
        value = item.get("value", [])
        if isinstance(value, list) and value:
            evidence.append(f"{agent}: {', '.join(str(part) for part in value)}")

    for match in state.get("historical_matches", [])[:2]:
        title = match.get("title", "未知历史事件")
        score = match.get("score", 0)
        evidence.append(f"历史事件：{title}（相似度 {score}）")

    if not evidence:
        evidence.append("暂无结构化证据，请人工补充原始材料。")
    return evidence

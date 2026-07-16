"""高风险场景的人工复核边界。"""

def human_review_gate(state: XiaolingState) -> XiaolingState:
    high_risk = state["risk_level"] in {"P0", "P1"}
    sensitive_action = has_sensitive_action(state["recommended_actions"])

    if high_risk or sensitive_action:
        state["human_review_status"] = "pending"
        state["human_review_packet"] = {
            "questions": ["证据是否足够支持升级？", "是否允许对外动作？"],
            "blocked_actions": ["自动认责", "自动赔偿", "自动公开回应"],
            "decision_options": ["确认升级", "要求补证据", "降级观察", "转交团队"],
        }
        return interrupt(state)  # 保存 checkpoint，等待人工决定

    state["human_review_status"] = "not_required"
    return state


def resume_after_review(state: XiaolingState, decision: dict) -> XiaolingState:
    state["human_review_decision"] = decision
    state["human_review_status"] = "resolved"
    return state

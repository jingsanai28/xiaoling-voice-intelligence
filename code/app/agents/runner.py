from __future__ import annotations

from app.agents.brand_risk import brand_risk_agent
from app.agents.customer_service_qa import customer_service_qa_agent
from app.agents.operation_feedback import operation_feedback_agent
from app.events import add_event
from app.state import RiskTriageState


AGENT_REGISTRY = {
    "brand_risk": brand_risk_agent,
    "customer_service_qa": customer_service_qa_agent,
    "operation_feedback": operation_feedback_agent,
}


def run_selected_agents(state: RiskTriageState) -> RiskTriageState:
    """按 Supervisor 选择的顺序运行业务 Agent。

    多 Agent 场景不是并行抢答，而是共享同一个 state：
    品牌、客服、运营 Agent 都把自己的事实、证据、建议写进去，
    后面的 Memory/Risk/Human Review 节点再统一处理。
    """
    selected_agents = state.get("selected_agents", [])
    state["current_node"] = "selected_agents"

    for agent_name in selected_agents:
        agent = AGENT_REGISTRY.get(agent_name)
        if agent is None:
            state.setdefault("errors", []).append({"code": "unknown_agent", "message": f"未知 Agent：{agent_name}"})
            add_event(state, "selected_agents", "skipped", "跳过未知 Agent。", {"agent": agent_name})
            continue
        state = agent(state)

    add_event(state, "selected_agents", "completed", "已完成选中业务 Agent 分析。", {"selected_agents": selected_agents})
    return state

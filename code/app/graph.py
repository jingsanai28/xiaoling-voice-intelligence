from __future__ import annotations

from typing import Any, Callable

from app.agents.runner import run_selected_agents
from app.agents.supervisor import supervisor_agent
from app.events import add_event
from app.llm_runtime import load_local_env
from app.nodes.final_report import final_report
from app.nodes.human_review_gate import human_review_gate
from app.nodes.human_review_interrupt import wait_for_human_review
from app.nodes.input_gate import input_gate
from app.nodes.knowledge_retrieval import knowledge_retrieval
from app.nodes.memory_match import memory_match
from app.nodes.permission_check import permission_check
from app.nodes.risk_calibration import risk_calibration
from app.state import RiskTriageState


def build_graph() -> Callable[[RiskTriageState], RiskTriageState]:
    """构建普通一键分析图。

    这个入口用于 CLI demo、批量评估和低风险场景：图会从输入一路跑到最终报告。
    如果运行环境没有安装 LangGraph，就退回到 run_without_langgraph，方便项目仍可演示。
    """
    load_local_env()
    try:
        from langgraph.graph import END, StateGraph
    except ModuleNotFoundError:
        return run_without_langgraph

    builder = StateGraph(RiskTriageState)
    # 系统节点：确定性控制，不交给模型自由发挥。
    builder.add_node("input_gate", input_gate)
    builder.add_node("permission_check", permission_check)
    # Agent 节点：负责不确定的业务判断和专业分析。
    builder.add_node("supervisor", supervisor_agent)
    builder.add_node("selected_agents", run_selected_agents)
    # 复核前的解释和安全边界。
    builder.add_node("knowledge_retrieval", knowledge_retrieval)
    builder.add_node("memory_match", memory_match)
    builder.add_node("risk_calibration", risk_calibration)
    builder.add_node("human_review_gate", human_review_gate)
    builder.add_node("final_report", final_report)

    builder.set_entry_point("input_gate")
    # 早停分支：缺输入或无权限时，不继续调用后续 Agent。
    builder.add_conditional_edges("input_gate", route_after_input_gate, {"continue": "permission_check", "final": "final_report"})
    builder.add_conditional_edges("permission_check", route_after_permission_check, {"continue": "supervisor", "final": "final_report"})
    # 主链路：Supervisor 选 Agent，业务 Agent 写入风险和证据，再进入系统兜底。
    builder.add_edge("supervisor", "selected_agents")
    builder.add_edge("selected_agents", "knowledge_retrieval")
    builder.add_edge("knowledge_retrieval", "memory_match")
    # Risk Calibration 必须放在 Human Review Gate 前：
    # 先校准风险等级，再决定是否需要人工复核。
    builder.add_edge("memory_match", "risk_calibration")
    builder.add_edge("risk_calibration", "human_review_gate")
    builder.add_edge("human_review_gate", "final_report")
    builder.add_edge("final_report", END)

    compiled = builder.compile()

    def invoke_with_langgraph(state: RiskTriageState) -> RiskTriageState:
        state["graph_runtime"] = "langgraph"
        add_event(state, "graph", "runtime_selected", "使用 LangGraph StateGraph 编排执行。")
        return compiled.invoke(state)

    return invoke_with_langgraph


def build_review_graph(checkpointer: Any) -> Any:
    """构建可暂停/恢复的人工复核图。

    和普通图的区别在于：Human Review Gate 判断需要复核后，会进入 interrupt。
    ReviewWorkflow 可以拿着同一个 thread_id 恢复执行，把人工决定写回 state。
    """
    load_local_env()
    from langgraph.graph import END, StateGraph

    builder = StateGraph(RiskTriageState)
    builder.add_node("input_gate", input_gate)
    builder.add_node("permission_check", permission_check)
    builder.add_node("supervisor", supervisor_agent)
    builder.add_node("selected_agents", run_selected_agents)
    builder.add_node("knowledge_retrieval", knowledge_retrieval)
    builder.add_node("memory_match", memory_match)
    builder.add_node("risk_calibration", risk_calibration)
    builder.add_node("human_review_gate", human_review_gate)
    builder.add_node("human_review_interrupt", wait_for_human_review)
    builder.add_node("final_report", final_report)

    builder.set_entry_point("input_gate")
    builder.add_conditional_edges("input_gate", route_after_input_gate, {"continue": "permission_check", "final": "final_report"})
    builder.add_conditional_edges("permission_check", route_after_permission_check, {"continue": "supervisor", "final": "final_report"})
    builder.add_edge("supervisor", "selected_agents")
    builder.add_edge("selected_agents", "knowledge_retrieval")
    builder.add_edge("knowledge_retrieval", "memory_match")
    builder.add_edge("memory_match", "risk_calibration")
    builder.add_edge("risk_calibration", "human_review_gate")
    # 只有需要人工复核时才暂停；不需要复核时直接生成报告。
    builder.add_conditional_edges(
        "human_review_gate",
        route_after_human_review_gate,
        {"interrupt": "human_review_interrupt", "final": "final_report"},
    )
    builder.add_edge("human_review_interrupt", "final_report")
    builder.add_edge("final_report", END)
    return builder.compile(checkpointer=checkpointer)


def run_without_langgraph(state: RiskTriageState) -> RiskTriageState:
    """本地兼容执行器。

    它按同样顺序手动调用节点，主要用于没有安装 LangGraph 时的降级演示。
    真实项目判断是否用了 LangGraph，可以看 state["graph_runtime"]。
    """
    state["graph_runtime"] = "local_fallback"
    add_event(state, "graph", "runtime_selected", "LangGraph 未安装，使用本地兼容执行器。")
    state = input_gate(state)
    if route_after_input_gate(state) == "final":
        return final_report(state)

    state = permission_check(state)
    if route_after_permission_check(state) == "final":
        return final_report(state)

    state = supervisor_agent(state)
    state = run_selected_agents(state)
    state = knowledge_retrieval(state)
    state = memory_match(state)
    state = risk_calibration(state)
    state = human_review_gate(state)
    return final_report(state)


def route_after_input_gate(state: RiskTriageState) -> str:
    """Input Gate 之后的分支：缺必填输入就直接生成“请补充信息”的报告。"""
    return "final" if state.get("missing_fields") else "continue"


def route_after_permission_check(state: RiskTriageState) -> str:
    """Permission Check 之后的分支：无权限时不进入业务 Agent。"""
    return "final" if state.get("errors") else "continue"


def route_after_human_review_gate(state: RiskTriageState) -> str:
    """Human Review Gate 之后的分支：需要人工复核时进入 interrupt。"""
    return "interrupt" if state.get("needs_human_review") else "final"


def run_triage(initial_state: RiskTriageState) -> RiskTriageState:
    graph = build_graph()
    return graph(initial_state)

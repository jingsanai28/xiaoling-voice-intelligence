"""小聆主图的可读版结构，仅用于展示 Agent / 系统节点边界。"""


def build_xiaoling_graph():
    graph = StateGraph(XiaolingState)

    # 确定性节点：不能被模型绕过。
    graph.add_node("input_gate", validate_input)
    graph.add_node("permission_check", check_permission)
    graph.add_node("risk_calibration", calibrate_risk)
    graph.add_node("human_review_gate", decide_human_review)

    # 需要语义判断或专业判断的模块才使用 Agent。
    graph.add_node("supervisor", supervisor_agent)
    graph.add_node("selected_agents", run_business_agents)

    graph.add_edge("input_gate", "permission_check")
    graph.add_edge("permission_check", "supervisor")
    graph.add_edge("supervisor", "selected_agents")
    graph.add_edge("selected_agents", "risk_calibration")
    graph.add_edge("risk_calibration", "human_review_gate")
    return graph.compile()


# 关键取舍：流程控制和风险边界是系统能力，业务理解才交给 Agent。

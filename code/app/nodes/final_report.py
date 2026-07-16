from __future__ import annotations

from app.events import add_event
from app.state import RiskTriageState


def final_report(state: RiskTriageState) -> RiskTriageState:
    state["current_node"] = "final_report"

    if state.get("missing_fields"):
        report = "\n".join(
            [
                "# 小聆客户声音分析报告",
                "",
                "状态：需要补充信息",
                f"缺少字段：{', '.join(state.get('missing_fields', []))}",
            ]
        )
        state["final_report"] = report
        add_event(state, "final_report", "generated", "已生成缺信息报告。")
        return state

    if state.get("errors"):
        error_messages = [error.get("message", "未知错误") for error in state.get("errors", [])]
        report = "\n".join(
            [
                "# 小聆客户声音分析报告",
                "",
                "状态：无法完成分析",
                *[f"- {message}" for message in error_messages],
            ]
        )
        state["final_report"] = report
        add_event(state, "final_report", "generated", "已生成错误报告。")
        return state

    review_label = "是" if state.get("needs_human_review") else "否"
    report_lines = [
        "# 小聆客户声音分析报告",
        "",
        f"任务类型：{state.get('task_type', 'unknown')}",
        f"调用 Agent：{', '.join(state.get('selected_agents', []))}",
        f"风险等级：{state.get('risk_level', 'unknown')}",
        f"置信度：{state.get('confidence', 0.0):.2f}",
        f"建议责任方：{state.get('recommended_owner') or '待确认'}",
        f"涉及团队：{format_agent_owners(state.get('selected_agents', []))}",
        f"是否需要人工复核：{review_label}",
        "",
        "## 风险理由",
        *format_list(state.get("risk_reasons", [])),
        "",
        "## 建议动作",
        *format_list(state.get("recommended_actions", [])),
    ]

    evidence_lines = format_evidence(state.get("evidence", []))
    if evidence_lines:
        report_lines.extend(["", "## 证据摘要", *evidence_lines])

    historical_match_lines = format_historical_matches(state.get("historical_matches", []))
    if historical_match_lines:
        report_lines.extend(["", "## 历史事件匹配", *historical_match_lines])

    knowledge_lines = format_knowledge_citations(state.get("knowledge_citations", []))
    if knowledge_lines:
        report_lines.extend(["", "## 企业知识依据", *knowledge_lines])
    else:
        report_lines.extend(["", "## 企业知识依据", "- 未找到可用企业知识，本次结论需结合原始证据人工核实。"])

    if state.get("human_review_reasons"):
        report_lines.extend(["", "## 人工复核原因", *format_list(state.get("human_review_reasons", []))])

    review_packet_lines = format_human_review_packet(state.get("human_review_packet", {}))
    if review_packet_lines:
        report_lines.extend(["", "## 人工复核包", *review_packet_lines])

    review_decision_lines = format_human_review_decision(state.get("human_review_decision", {}))
    if review_decision_lines:
        report_lines.extend(["", "## 人工复核决定", *review_decision_lines])

    state["final_report"] = "\n".join(report_lines)
    add_event(state, "final_report", "generated", "已生成最终分诊报告。")
    return state


def format_list(items: list[str]) -> list[str]:
    if not items:
        return ["- 暂无"]
    return [f"- {item}" for item in items]


def format_agent_owners(selected_agents: list[str]) -> str:
    owner_map = {
        "brand_risk": "品牌/公关团队",
        "customer_service_qa": "客服主管",
        "operation_feedback": "运营/产品团队",
    }
    owners = [owner_map[agent] for agent in selected_agents if agent in owner_map]
    return ", ".join(owners) if owners else "待确认"


def format_evidence(items: list[dict[str, object]]) -> list[str]:
    lines: list[str] = []
    for item in items:
        agent = item.get("agent", "unknown")
        value = item.get("value", [])
        if isinstance(value, list) and value:
            lines.append(f"- {agent}: {', '.join(str(part) for part in value)}")
    return lines


def format_historical_matches(items: list[dict[str, object]]) -> list[str]:
    lines: list[str] = []
    for item in items:
        title = item.get("title", "未知历史事件")
        score = item.get("score", 0)
        risk_level = item.get("risk_level", "unknown")
        summary = item.get("summary", "")
        lines.append(f"- {title}（相似度 {score}，历史风险 {risk_level}）：{summary}")
    return lines


def format_knowledge_citations(items: list[dict[str, object]]) -> list[str]:
    lines: list[str] = []
    for item in items:
        lines.append(
            "- "
            f"{item.get('documentTitle', '未知文档')} "
            f"v{item.get('version', '?')} / {item.get('section', '正文')}："
            f"{item.get('snippet', '')}"
        )
    return lines


def format_human_review_packet(packet: dict[str, object]) -> list[str]:
    if not packet or not packet.get("required"):
        return []

    lines = [
        f"- 复核负责人：{packet.get('owner', '待确认')}",
        f"- 复核优先级：{packet.get('priority', 'normal')}",
        "- 复核问题：",
        *indent_list(packet.get("questions", [])),
        "- 需要查看的证据：",
        *indent_list(packet.get("evidence_to_review", [])),
        "- 允许动作：",
        *indent_list(packet.get("allowed_actions", [])),
        "- 禁止动作：",
        *indent_list(packet.get("blocked_actions", [])),
        "- 决策选项：",
        *indent_list(packet.get("decision_options", [])),
    ]
    return lines


def format_human_review_decision(decision: dict[str, object]) -> list[str]:
    if not decision:
        return []
    return [
        f"- 决定：{decision.get('decision', '待确认')}",
        f"- 复核人：{decision.get('reviewer', '未记录')}",
        f"- 备注：{decision.get('note', '无')}",
    ]


def indent_list(items: object) -> list[str]:
    if not isinstance(items, list) or not items:
        return ["  - 暂无"]
    return [f"  - {item}" for item in items]

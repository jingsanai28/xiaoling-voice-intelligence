from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.state import RiskTriageState


TRACE_DIR = Path("traces")


def save_trace(state: RiskTriageState, trace_dir: Path = TRACE_DIR) -> tuple[Path, Path]:
    trace_dir.mkdir(parents=True, exist_ok=True)
    trace_id = build_trace_id(state)
    json_path = trace_dir / f"{trace_id}.json"
    markdown_path = trace_dir / f"{trace_id}.md"

    payload = build_trace_payload(state, trace_id)
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    markdown_path.write_text(build_markdown_trace(payload), encoding="utf-8")
    return json_path, markdown_path


def build_trace_id(state: RiskTriageState) -> str:
    task_id = sanitize_id(state.get("task_id", "run"))
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    return f"{timestamp}-{task_id}"


def sanitize_id(value: str) -> str:
    safe_chars = [char if char.isalnum() or char in {"-", "_"} else "-" for char in value]
    return "".join(safe_chars).strip("-") or "run"


def build_trace_payload(state: RiskTriageState, trace_id: str) -> dict[str, Any]:
    return {
        "trace_id": trace_id,
        "task_id": state.get("task_id"),
        "user_role": state.get("user_role"),
        "graph_runtime": state.get("graph_runtime", "unknown"),
        "input_summary": summarize_input(state.get("raw_input", "")),
        "task_type": state.get("task_type"),
        "selected_agents": state.get("selected_agents", []),
        "risk_level": state.get("risk_level"),
        "confidence": state.get("confidence"),
        "needs_human_review": state.get("needs_human_review"),
        "human_review_reasons": state.get("human_review_reasons", []),
        "human_review_packet": state.get("human_review_packet", {}),
        "human_review_status": state.get("human_review_status", "not_required"),
        "human_review_decision": state.get("human_review_decision", {}),
        "llm_provider": state.get("llm_provider"),
        "llm_model": state.get("llm_model"),
        "llm_calls": state.get("llm_calls", []),
        "historical_matches": state.get("historical_matches", []),
        "events": state.get("events", []),
        "errors": state.get("errors", []),
    }


def summarize_input(raw_input: str, limit: int = 120) -> str:
    normalized = " ".join(raw_input.split())
    if len(normalized) <= limit:
        return normalized
    return normalized[: limit - 3] + "..."


def build_markdown_trace(payload: dict[str, Any]) -> str:
    lines = [
        "# Agent Trace",
        "",
        f"Trace ID: `{payload['trace_id']}`",
        f"Task ID: `{payload.get('task_id')}`",
        f"User Role: `{payload.get('user_role')}`",
        f"Graph Runtime: `{payload.get('graph_runtime')}`",
        "",
        "## Summary",
        "",
        f"- Input Summary: {payload.get('input_summary') or '空输入'}",
        f"- Graph Runtime: {payload.get('graph_runtime')}",
        f"- Task Type: {payload.get('task_type')}",
        f"- Selected Agents: {', '.join(payload.get('selected_agents') or []) or '无'}",
        f"- Risk Level: {payload.get('risk_level')}",
        f"- Confidence: {payload.get('confidence')}",
        f"- Needs Human Review: {payload.get('needs_human_review')}",
        f"- Human Review Status: {payload.get('human_review_status')}",
        f"- LLM Provider: {payload.get('llm_provider') or '规则版'}",
        f"- LLM Model: {payload.get('llm_model') or '无'}",
        "",
        "## Events",
        "",
    ]

    events = payload.get("events", [])
    if events:
        for index, event in enumerate(events, start=1):
            lines.append(f"{index}. `{event.get('node')}` / `{event.get('action')}`：{event.get('message')}")
    else:
        lines.append("- 暂无事件")

    historical_matches = payload.get("historical_matches", [])
    if historical_matches:
        lines.extend(["", "## Historical Matches", ""])
        for match in historical_matches:
            lines.append(
                f"- {match.get('title')}（id: `{match.get('id')}`，score: {match.get('score')}，risk: {match.get('risk_level')}）"
            )

    review_packet = payload.get("human_review_packet", {})
    if review_packet and review_packet.get("required"):
        lines.extend(["", "## Human Review Packet", ""])
        lines.append(f"- Owner: {review_packet.get('owner')}")
        lines.append(f"- Priority: {review_packet.get('priority')}")
        lines.append("- Questions:")
        lines.extend(format_nested_list(review_packet.get("questions", [])))
        lines.append("- Blocked Actions:")
        lines.extend(format_nested_list(review_packet.get("blocked_actions", [])))

    review_decision = payload.get("human_review_decision", {})
    if review_decision:
        lines.extend(["", "## Human Review Decision", ""])
        lines.append(f"- Decision: {review_decision.get('decision')}")
        lines.append(f"- Reviewer: {review_decision.get('reviewer')}")
        lines.append(f"- Note: {review_decision.get('note') or '无'}")

    llm_calls = payload.get("llm_calls", [])
    if llm_calls:
        lines.extend(["", "## LLM Calls", ""])
        for call in llm_calls:
            lines.append(
                f"- {call.get('agent')} / {call.get('provider')} / {call.get('model')}: "
                f"{call.get('status')}，{call.get('latency_ms')}ms，tokens={call.get('usage', {}).get('total_tokens', 0)}"
            )

    if payload.get("errors"):
        lines.extend(["", "## Errors", ""])
        for error in payload["errors"]:
            lines.append(f"- {error}")

    return "\n".join(lines) + "\n"


def format_nested_list(items: object) -> list[str]:
    if not isinstance(items, list) or not items:
        return ["  - 无"]
    return [f"  - {item}" for item in items]

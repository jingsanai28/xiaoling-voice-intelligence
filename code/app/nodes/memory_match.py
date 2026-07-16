from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.events import add_event
from app.state import RiskTriageState


DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "historical_events.json"


def memory_match(state: RiskTriageState) -> RiskTriageState:
    text = state.get("raw_input", "")
    events = load_historical_events()
    matches = sorted(
        (build_match(event, text) for event in events),
        key=lambda item: item["score"],
        reverse=True,
    )
    matches = [match for match in matches if match["score"] > 0][:3]

    state["historical_matches"] = matches
    state["current_node"] = "memory_match"

    if matches:
        top_match = matches[0]
        state.setdefault("risk_reasons", []).append(
            f"历史相似事件：{top_match['title']}，相似关键词 {', '.join(top_match['matched_keywords'])}。"
        )
        state.setdefault("recommended_actions", []).append(str(top_match["recommended_action"]))
        add_event(state, "memory_match", "matched", "已匹配到历史相似事件。", {"top_match": top_match})
    else:
        add_event(state, "memory_match", "no_match", "未匹配到历史相似事件。")

    return state


def load_historical_events() -> list[dict[str, Any]]:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


def build_match(event: dict[str, Any], text: str) -> dict[str, Any]:
    keywords = event.get("keywords", [])
    matched_keywords = [keyword for keyword in keywords if keyword in text]
    score = len(matched_keywords) / len(keywords) if keywords else 0.0
    return {
        "id": event["id"],
        "title": event["title"],
        "scenario": event["scenario"],
        "risk_level": event["risk_level"],
        "summary": event["summary"],
        "recommended_action": event["recommended_action"],
        "matched_keywords": matched_keywords,
        "score": round(score, 2),
    }


from __future__ import annotations

from typing import Any

from app.state import Event, RiskTriageState


def add_event(state: RiskTriageState, node: str, action: str, message: str, data: dict[str, Any] | None = None) -> None:
    events = state.setdefault("events", [])
    events.append(
        Event(
            node=node,
            action=action,
            message=message,
            data=data or {},
        )
    )


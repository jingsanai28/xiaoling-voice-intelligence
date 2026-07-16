from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command

from app.events import add_event
from app.graph import build_review_graph
from app.state import RiskTriageState


@dataclass
class ReviewWorkflowResult:
    state: RiskTriageState
    waiting_for_human: bool
    interrupt_payload: dict[str, Any] | None = None


class ReviewWorkflow:
    """A checkpointed, in-process workflow for high-risk review decisions."""

    def __init__(self) -> None:
        self.checkpointer = MemorySaver()
        self.graph = build_review_graph(self.checkpointer)

    def start(self, initial_state: RiskTriageState) -> ReviewWorkflowResult:
        config = self._config(initial_state["task_id"])
        initial_state["graph_runtime"] = "langgraph_checkpointed"
        add_event(initial_state, "graph", "runtime_selected", "使用 LangGraph StateGraph + MemorySaver 执行可暂停复核流程。")
        output = self.graph.invoke(initial_state, config)
        return self._result(config, output)

    def resume(self, task_id: str, decision: dict[str, str]) -> ReviewWorkflowResult:
        config = self._config(task_id)
        output = self.graph.invoke(Command(resume=decision), config)
        return self._result(config, output)

    def get_state(self, task_id: str) -> RiskTriageState:
        return RiskTriageState(self.graph.get_state(self._config(task_id)).values)

    @staticmethod
    def _config(task_id: str) -> dict[str, dict[str, str]]:
        return {"configurable": {"thread_id": task_id}}

    def _result(self, config: dict[str, dict[str, str]], output: dict[str, Any]) -> ReviewWorkflowResult:
        interrupts = output.get("__interrupt__", ())
        interrupt_payload = None
        if interrupts:
            interrupt_payload = dict(interrupts[0].value)
        return ReviewWorkflowResult(
            state=RiskTriageState(self.graph.get_state(config).values),
            waiting_for_human=bool(interrupts),
            interrupt_payload=interrupt_payload,
        )

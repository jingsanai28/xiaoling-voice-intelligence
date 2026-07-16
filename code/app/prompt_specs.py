from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


PROMPTS_DIR = Path(__file__).resolve().parents[1] / "prompts"


@dataclass(frozen=True)
class PromptSpec:
    name: str
    path: Path
    content: str


PROMPT_FILES = {
    "supervisor": "supervisor.md",
    "brand_risk": "brand_risk.md",
    "customer_service_qa": "customer_service_qa.md",
    "operation_feedback": "operation_feedback.md",
}


def load_prompt_specs() -> dict[str, PromptSpec]:
    specs: dict[str, PromptSpec] = {}
    for name, filename in PROMPT_FILES.items():
        path = PROMPTS_DIR / filename
        specs[name] = PromptSpec(name=name, path=path, content=path.read_text(encoding="utf-8"))
    return specs


def main() -> None:
    specs = load_prompt_specs()
    for name, spec in specs.items():
        line_count = len(spec.content.splitlines())
        print(f"{name}: {spec.path} ({line_count} lines)")


if __name__ == "__main__":
    main()


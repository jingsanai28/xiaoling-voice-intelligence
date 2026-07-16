from pathlib import Path
import re


ROOT = Path(__file__).parent


def main() -> None:
    files = [path for path in ROOT.rglob("*") if path.is_file() and ".git" not in path.parts]
    names = {path.relative_to(ROOT).as_posix() for path in files}

    forbidden_suffixes = {".db", ".sqlite", ".sqlite3", ".pyc"}
    forbidden_names = {".env", "package.json", "pnpm-lock.yaml", "requirements.txt"}
    forbidden_paths = [
        path for path in files
        if path.suffix in forbidden_suffixes or path.name in forbidden_names or "node_modules" in path.parts
    ]
    assert not forbidden_paths, f"forbidden files: {forbidden_paths}"

    required_omissions = {
        "code/app/server.py",
        "code/app/knowledge_base.py",
        "code/app/llm_runtime.py",
        "code/frontend/package.json",
    }
    assert required_omissions.isdisjoint(names), "runtime boundary was not preserved"

    screenshot_readme = (ROOT / "screenshots/README.md").read_text(encoding="utf-8")
    screenshot_rows = re.findall(r"\| `\d{2}-[^`]+\.(?:png|jpg|jpeg)` \|", screenshot_readme)
    assert len(screenshot_rows) >= 10, f"need at least 10 screenshot slots, got {len(screenshot_rows)}"

    suspicious = []
    for path in files:
        if path == Path(__file__):
            continue
        if path.suffix not in {".py", ".ts", ".tsx", ".md", ".json"}:
            continue
        text = path.read_text(encoding="utf-8", errors="ignore")
        if re.search(r"-----BEGIN .*PRIVATE KEY-----|sk-[A-Za-z0-9]{20,}", text):
            suspicious.append(path)
    assert not suspicious, f"possible secret material: {suspicious}"

    print(f"showcase valid: {len(files)} files, {len(screenshot_rows)} screenshot slots")


if __name__ == "__main__":
    main()

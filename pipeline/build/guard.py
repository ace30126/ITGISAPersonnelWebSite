"""커밋 가드 — 문제 원문이 스테이징되면 커밋을 거부한다.

.gitignore 만으로는 부족하다. `git add -f` 나 새 경로로 산출물이 새어나가는 것을
막지 못한다. 이 스크립트를 pre-commit 훅에 걸어 기계적으로 강제한다.

설치: git config core.hooksPath .githooks
"""
from __future__ import annotations

import json
import subprocess
import sys

# 이 키를 가진 JSON = 문제 원문
FORBIDDEN_KEYS = {"stem", "choices", "stem_blocks"}
ALLOW_PREFIX = ("pipeline/overrides/",)   # 델타 패치는 원문이 아니라 교정값


def staged_files() -> list[str]:
    out = subprocess.run(
        ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM"],
        capture_output=True, text=True, encoding="utf-8", check=True,
    )
    return [l.strip() for l in out.stdout.splitlines() if l.strip()]


def staged_blob(path: str) -> str:
    out = subprocess.run(["git", "show", f":{path}"],
                         capture_output=True, text=True, encoding="utf-8")
    return out.stdout if out.returncode == 0 else ""


def main() -> int:
    bad: list[tuple[str, str]] = []
    for f in staged_files():
        low = f.lower()
        if low.endswith(".pdf"):
            bad.append((f, "PDF 원본은 커밋하지 않는다"))
            continue
        if not low.endswith(".json"):
            continue
        if any(f.startswith(p) for p in ALLOW_PREFIX):
            continue
        try:
            data = json.loads(staged_blob(f))
        except Exception:
            continue

        def probe(o) -> bool:
            if isinstance(o, dict):
                if FORBIDDEN_KEYS & set(o.keys()):
                    return True
                return any(probe(v) for v in o.values())
            if isinstance(o, list):
                return any(probe(v) for v in o[:200])
            return False

        if probe(data):
            bad.append((f, "문제 원문(stem/choices)이 들어 있다"))

    if bad:
        print("커밋 거부 — 저작권 경계 위반", file=sys.stderr)
        for f, why in bad:
            print(f"  {f}: {why}", file=sys.stderr)
        print("\n원문은 pipeline/interim/ 에 두고 배포는 pack.py 의 .enc 만 쓴다.",
              file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

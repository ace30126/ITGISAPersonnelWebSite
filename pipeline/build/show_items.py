"""문항 조회 — 집필자가 근거로 삼을 기출을 읽는다.

merged.json 은 2MB 라 통째로 열면 컨텍스트를 태운다. 필요한 것만 뽑아 준다.

  python pipeline/build/show_items.py q:2024-1:037 q:2023-2:044
  python pipeline/build/show_items.py --kw 정규화 --limit 8
  python pipeline/build/show_items.py --kw SQL --subject 3 --limit 5 --expl
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

import config as C  # noqa: E402

MARKS = "①②③④"


def show(it: dict, with_expl: bool) -> None:
    r = it.get("round", {})
    src = f"{r.get('year')}년{r.get('session')}회" if r.get("year") else r.get("date", "주제별")
    times = 1 + len(it.get("merged_from", []))
    kws = [t[3:] for t in it.get("tags", []) if t.startswith("kw:")]
    print("─" * 74)
    print(f"[{it['id']}] {src} · {it.get('subject')}과목 · 출제 {times}회 · {kws}")
    flags = it.get("flags", [])
    if flags:
        print(f"  ⚠ {flags}")
    print(f"  {it.get('stem', '')}")
    for k, c in enumerate(it.get("choices", [])):
        mark = "▶" if it.get("answer") == k + 1 else " "
        print(f"   {mark}{MARKS[k]} {c}")
    if with_expl:
        for e in it.get("explanations", [])[:2]:
            body = " ".join(e.get("body", "").split())[:400]
            print(f"  해설({e.get('author') or '?'}): {body}")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*")
    ap.add_argument("--kw")
    ap.add_argument("--subject", type=int)
    ap.add_argument("--limit", type=int, default=6)
    ap.add_argument("--expl", action="store_true")
    a = ap.parse_args()

    items = json.loads((C.INTERIM / "merged.json").read_text(encoding="utf-8"))["items"]
    by_id = {i["id"]: i for i in items}

    if a.ids:
        for i in a.ids:
            if i in by_id:
                show(by_id[i], a.expl)
            else:
                print(f"[{i}] 없음")
        return 0

    if not a.kw:
        print(__doc__)
        return 2

    tag = f"kw:{a.kw}"
    hits = [i for i in items if tag in i.get("tags", [])
            and (a.subject is None or i.get("subject") == a.subject)]
    # 출제 횟수 많은 것부터 — 그게 시험이 실제로 묻는 각도다
    hits.sort(key=lambda i: -(1 + len(i.get("merged_from", []))))
    print(f"'{a.kw}' 문항 {len(hits)}건 중 상위 {min(a.limit, len(hits))}건")
    for i in hits[:a.limit]:
        show(i, a.expl)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

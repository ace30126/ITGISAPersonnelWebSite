"""오케스트레이터 독립 검증 — 에이전트 보고를 믿지 않고 산출물만 본다.

파서가 자기 게이트를 통과했다는 보고는 근거가 아니다. 같은 코드가 같은 가정으로
자기를 검사한 것이기 때문이다. 여기서는 산출 JSON만 열어 **다른 경로로** 확인한다.

특히 정답 교차검증은 기출 정답표를 이 스크립트가 직접 다시 읽어서 대조한다.
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

import config as C  # noqa: E402
from common import pdfio  # noqa: E402
from common.qdetect import parse_answer_key  # noqa: E402

LEAK_RE = re.compile(r"\n\s*\d{1,3}\.\s")
POLLUTION = ["<문제 해설>", "[해설작성자", "본 해설집은", "www.comcbt.com", "[해설]"]

fail: list[str] = []


def load(name: str) -> list[dict]:
    p = C.INTERIM / name
    if not p.exists():
        print(f"  (없음: {name})")
        return []
    return json.loads(p.read_text(encoding="utf-8"))["items"]


def structural(items: list[dict], label: str) -> None:
    print(f"\n--- {label}: {len(items)}문항 ---")
    bad_ch = [i["id"] for i in items if len(i.get("choices", [])) != 4]
    empty_ch = [i["id"] for i in items
                if any(not c.strip() for c in i.get("choices", []))
                and "choices_image" not in i.get("flags", [])]
    short = [i["id"] for i in items if len(i.get("stem", "")) < 5]
    leak = [i["id"] for i in items
            if LEAK_RE.search(i.get("stem", ""))
            or any(LEAK_RE.search(c) for c in i.get("choices", []))]
    poll = [i["id"] for i in items
            if any(p in i.get("stem", "") for p in POLLUTION)
            or any(p in c for c in i.get("choices", []) for p in POLLUTION)]
    dup = [k for k, v in Counter(i["id"] for i in items).items() if v > 1]
    noans = [i["id"] for i in items if i.get("answer") is None]
    badans = [i["id"] for i in items
              if i.get("answer") is not None and i["answer"] not in (1, 2, 3, 4)]

    for name, lst in [("선택지≠4", bad_ch), ("빈 선택지", empty_ch), ("지문<5자", short),
                      ("문항 누수", leak), ("본문 오염", poll), ("id 중복", dup),
                      ("정답 범위 이탈", badans)]:
        flag = "OK" if not lst else f"**{len(lst)}건** {lst[:5]}"
        print(f"  {name:<14} {flag}")
        if lst:
            fail.append(f"{label} {name} {len(lst)}건")
    print(f"  {'정답 없음':<14} {len(noans)}건 {noans[:5]}")

    dist = Counter(i["answer"] for i in items if i.get("answer"))
    tot = sum(dist.values()) or 1
    print("  정답 분포     " + "  ".join(
        f"{k}:{dist.get(k, 0) * 100 / tot:.1f}%" for k in (1, 2, 3, 4)))

    blocks = sum(1 for i in items
                 if any(b.get("type") == "image" for b in i.get("stem_blocks", [])))
    print(f"  이미지 블록   {blocks}건")


def cross_check_answers(sol: list[dict]) -> None:
    """해설집 정답격자 vs 기출 정답표 — 이 스크립트가 직접 다시 읽어 대조한다."""
    print("\n=== G12 사전 교차검증 (오케스트레이터 독립 판독) ===")
    by_date: dict[str, dict[int, int]] = {}
    for i in sol:
        d = i.get("round", {}).get("date")
        if d and i.get("answer"):
            by_date.setdefault(d, {})[i["number"]] = i["answer"]

    for date, (year, sess) in C.SOLUTION_TO_PAST.items():
        rel = next(r for y, s, r in C.PAST_EXAMS if y == year and s == sess)
        doc = pdfio.open_pdf(C.src(rel))
        gold = parse_answer_key(doc)      # 기출 원본을 여기서 새로 읽는다
        doc.close()
        got = by_date.get(date, {})
        common = sorted(set(gold) & set(got))
        mismatch = [n for n in common if gold[n] != got[n]]
        only_sol = sorted(set(got) - set(gold))
        print(f"  {date} ↔ {year}-{sess}회: 공통 {len(common)}문항, "
              f"불일치 {len(mismatch)}건 {mismatch[:8]}")
        if only_sol:
            print(f"      기출에 없고 해설집만 가진 정답: {only_sol} "
                  f"→ {[got[n] for n in only_sol]}  (원본 공란 보완)")
        if mismatch:
            fail.append(f"G12 {date} 불일치 {len(mismatch)}건")


def main() -> int:
    print("=" * 78)
    print("Wave 1 독립 검증 — 산출 JSON만 보고 다른 경로로 확인")
    print("=" * 78)
    past = load("past_exam.json")
    sol = load("solution_book.json")
    topic = load("topic_book.json")

    if past:
        structural(past, "기출 원본")
    if sol:
        structural(sol, "해설집")
    if topic:
        structural(topic, "주제별")
    if sol:
        cross_check_answers(sol)

    print("\n" + "=" * 78)
    if fail:
        print("독립 검증 FAIL")
        for f in fail:
            print("  -", f)
        return 1
    print("독립 검증 PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

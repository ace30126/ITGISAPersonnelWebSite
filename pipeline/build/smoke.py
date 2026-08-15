"""Phase 0 스모크 — 파서를 쓰기 전에 '뽑을 수 있는가'만 확인한다.

검사 항목
  1. 12개 기출 PDF 전부에서 컬럼 거터가 탐지되는가 (2단 판정)
  2. 좌→우 정렬 추출 후 문항번호 1..100 이 기대번호 상태기계로 검출되는가
  3. 마지막 페이지 정답키 100개가 파싱되는가
  4. 해설집 8회 / 주제별 5종의 기본 신호(문항 수, 초록 마킹)가 잡히는가

파싱이 아니라 '검출'만 본다. 여기서 100/100 이 안 나오면 Wave 1 팬아웃을
시작하면 안 된다 — 세 에이전트가 같은 구멍을 세 번 통과한다.
"""
from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

import config as C  # noqa: E402
from common import pdfio  # noqa: E402
from common.normalize import pua_ratio  # noqa: E402
from common.qdetect import detect_numbers, parse_answer_key  # noqa: E402

# 원본 PDF 자체의 결함 (추출 버그가 아님 — 해당 영역을 크롭 렌더해 육안 확인했다).
# overrides/ 로 메우고, 여기 등록해 스모크가 영구 FAIL 하지 않게 한다.
KNOWN_SOURCE_DEFECTS: dict[tuple[int, int], list[int]] = {
    # 2022년 2회 정답표의 5번 칸이 원본에서 통째로 공란.
    # 동일 회차 해설집(20220424)의 해설 본문으로 보완한다.
    (2022, 2): [5],
}


def ordered_text(doc, pages=None) -> tuple[str, list[bool]]:
    """좌→우 정렬 텍스트 + 페이지별 2단 여부.

    거터는 페이지별이 아니라 **문서 전체 합의값**을 쓴다. 1페이지처럼 머리글이
    있는 페이지가 단독 판정에 실패해 통째로 뒤섞이는 것을 막는다.
    """
    gutter = pdfio.document_split_x(doc)
    chunks, two_col = [], []
    rng = range(doc.page_count) if pages is None else pages
    for i in rng:
        pg = doc[i]
        sx = gutter if gutter is not None else pdfio.column_split_x(pg)
        two_col.append(sx is not None)
        chunks.extend(pdfio.column_texts(pg, sx))
    return "\n".join(chunks), two_col


def check_past_exams() -> bool:
    print("=" * 78)
    print("기출 원본 12회 — 컬럼 분할 + 문항번호 검출 + 정답키")
    print("=" * 78)
    print(f"{'회차':<10}{'p':>3}{'2단':>6}{'검출':>8}{'정답키':>8}  {'첫결손':>8}")
    ok_all = True
    for year, sess, rel in C.PAST_EXAMS:
        doc = pdfio.open_pdf(C.src(rel))
        text, two_col = ordered_text(doc, range(doc.page_count - 1))
        found = detect_numbers(text)
        key = parse_answer_key(doc)
        n2 = sum(two_col)
        missing = [n for n in range(1, 101) if n not in set(found)]
        defect = KNOWN_SOURCE_DEFECTS.get((year, sess), [])
        key_missing = [n for n in range(1, 101) if n not in key]
        ok = len(found) == 100 and set(key_missing) <= set(defect)
        ok_all &= ok
        tail = "OK" if ok else "FAIL"
        if ok and defect:
            tail = f"OK(원본결함 {defect})"
        print(f"{year}-{sess:<8}{doc.page_count:>3}{n2:>4}/{len(two_col):<2}"
              f"{len(found):>7}{len(key):>8}  {(missing[0] if missing else '-'):>8}"
              f"  {tail}")
        doc.close()
    return ok_all


def check_solution_books() -> bool:
    print()
    print("=" * 78)
    print("해설집 8회 — 문항번호 검출 + 해설 마커")
    print("  ※ 해설집에는 정답 정보가 없다(span 색상·볼드 마킹 전무, '정답' 문자열 0건).")
    print("    2022년 2회분만 기출 원본과 동일 회차라 정답을 상속받는다.")
    print("    나머지 6회 600문항은 Phase 2에서 해시 매칭으로 정답을 회수해야 한다.")
    print("=" * 78)
    print(f"{'날짜':<12}{'p':>3}{'검출':>8}{'해설블록':>10}{'정답표기':>10}")
    ok_all = True
    for date, rel in C.SOLUTION_BOOKS:
        doc = pdfio.open_pdf(C.src(rel))
        # 해설집도 2단이다(거터 ≈ x291). 1단으로 뽑으면 좌우가 뒤섞인다.
        text, _ = ordered_text(doc)
        found = detect_numbers(text)
        n_expl = len(re.findall(r"<\s*문제\s*해설\s*>", text))
        n_ans = len(re.findall(r"정답\s*[:：]?\s*[①-④]", text))
        # 정답표기는 0이 정상이다. 게이트는 문항 100 + 해설블록 100.
        ok = len(found) == 100 and n_expl >= 95
        ok_all &= ok
        print(f"{date:<12}{doc.page_count:>3}{len(found):>8}{n_expl:>10}{n_ans:>10}"
              f"  {'OK' if ok else 'FAIL'}")
        doc.close()
    return ok_all


def check_topic_books() -> bool:
    print()
    print("=" * 78)
    print("주제별 5종 — 문항번호 검출 + 초록 정답 마킹")
    print("=" * 78)
    print(f"{'키':<10}{'p':>3}{'기대':>6}{'검출':>7}{'초록span':>10}{'PUA%':>8}")
    ok_all = True
    for key, expect, _has_expl, rel in C.TOPIC_BOOKS:
        doc = pdfio.open_pdf(C.src(rel))
        text_parts, green = [], 0
        for i in range(doc.page_count):
            pg = doc[i]
            text_parts.append(pg.get_text("text", sort=True))
            for col in pdfio.column_spans(pg, None):
                green += sum(1 for s in col if s.color == C.GREEN and s.text.strip())
        text = "\n".join(text_parts)
        found = detect_numbers(text, upto=expect)
        ratio = pua_ratio(text) * 100
        ok = len(found) == expect and green > 0
        ok_all &= ok
        print(f"{key:<10}{doc.page_count:>3}{expect:>6}{len(found):>7}{green:>10}"
              f"{ratio:>7.2f}%  {'OK' if ok else 'FAIL'}")
        doc.close()
    return ok_all


def main() -> int:
    a = check_past_exams()
    b = check_solution_books()
    c = check_topic_books()
    print()
    print("=" * 78)
    verdict = a and b and c
    print(f"PHASE 0 스모크: {'PASS' if verdict else 'FAIL'}"
          f"   (기출 {'O' if a else 'X'} / 해설집 {'O' if b else 'X'} / 주제별 {'O' if c else 'X'})")
    print("=" * 78)
    return 0 if verdict else 1


if __name__ == "__main__":
    raise SystemExit(main())

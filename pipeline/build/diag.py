"""스모크 실패 원인 진단 — 실제 줄이 어떻게 생겼는지 눈으로 본다."""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

import config as C  # noqa: E402
from common import pdfio  # noqa: E402

QNUM_RE = re.compile(r"^\s*(\d{1,3})\s*[.)]\s*")


def show(title: str) -> None:
    print("\n" + "=" * 78)
    print(title)
    print("=" * 78)


def dump_lines(text: str, n: int = 45, tag: str = "") -> None:
    for i, line in enumerate(text.splitlines()[:n]):
        m = QNUM_RE.match(line)
        mark = f"[Q{m.group(1)}]" if m else "     "
        print(f"{tag}{i:>3} {mark} {line[:88]!r}")


def diag_past(year: int, sess: int, page_idx: int = 1) -> None:
    rel = next(r for y, s, r in C.PAST_EXAMS if y == year and s == sess)
    doc = pdfio.open_pdf(C.src(rel))
    show(f"기출 {year}-{sess}회  p{page_idx + 1}/{doc.page_count}")
    pg = doc[page_idx]
    sx = pdfio.column_split_x(pg)
    print(f"page.rect = {pg.rect}, split_x = {sx}")
    cols = pdfio.column_texts(pg, sx)
    for ci, c in enumerate(cols):
        print(f"\n--- col {ci} ({len(c)} chars) ---")
        dump_lines(c, 26, tag=f"c{ci}|")
    doc.close()


def diag_solution(date: str) -> None:
    rel = next(r for d, r in C.SOLUTION_BOOKS if d == date)
    doc = pdfio.open_pdf(C.src(rel))
    show(f"해설집 {date}  ({doc.page_count}p)")
    pg = doc[1]
    print(f"split_x(p2) = {pdfio.column_split_x(pg)}")
    dump_lines(pg.get_text("text", sort=True), 40)

    full = "\n".join(doc[i].get_text("text", sort=True) for i in range(doc.page_count))
    print("\n--- '정답' 등장 컨텍스트 (앞 6건) ---")
    for m in list(re.finditer("정답", full))[:6]:
        print(repr(full[max(0, m.start() - 60):m.start() + 60]))
    doc.close()


def scan_all_past_first_break() -> None:
    show("기출 12회 — 검출이 끊기는 지점")
    for year, sess, rel in C.PAST_EXAMS:
        doc = pdfio.open_pdf(C.src(rel))
        chunks = []
        for i in range(doc.page_count - 1):
            pg = doc[i]
            chunks.extend(pdfio.column_texts(pg, pdfio.column_split_x(pg)))
        text = "\n".join(chunks)
        expected, last_ok = 1, 0
        for line in text.splitlines():
            m = QNUM_RE.match(line)
            if m and int(m.group(1)) == expected:
                last_ok = expected
                expected += 1
        # 끊긴 번호가 텍스트 어딘가에 다른 형태로 있는지
        nxt = last_ok + 1
        alt = [l for l in text.splitlines() if re.search(rf"(?<!\d){nxt}\s*[.)]", l)]
        print(f"{year}-{sess}: 연속검출 1..{last_ok}, 다음({nxt}) 후보 {len(alt)}건"
              f"  {alt[0][:70]!r}" if alt else
              f"{year}-{sess}: 연속검출 1..{last_ok}, 다음({nxt}) 후보 없음")
        doc.close()


if __name__ == "__main__":
    scan_all_past_first_break()
    diag_past(2022, 1, 0)
    diag_past(2024, 1, 0)
    diag_solution("20220424")

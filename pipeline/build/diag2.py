"""남은 기출 4건 정밀 진단 — 검출이 끊긴 지점의 실제 줄과 정답키 결손."""
from __future__ import annotations

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

import config as C  # noqa: E402
from common import pdfio  # noqa: E402
from common.normalize import MARK_TO_IDX  # noqa: E402

QNUM_RE = re.compile(r"^\s*(\d{1,3})\s*[.)]\s*")
ANSWER_RE = re.compile(r"(\d{1,3})\s*[.．]\s*([①-④1-4])")

TARGETS = [(2022, 2), (2023, 1), (2024, 2), (2025, 3)]


def per_page_split(doc):
    g = pdfio.document_split_x(doc)
    return [(i, pdfio.column_split_x(doc[i]), g) for i in range(doc.page_count)]


def run(year, sess):
    rel = next(r for y, s, r in C.PAST_EXAMS if y == year and s == sess)
    doc = pdfio.open_pdf(C.src(rel))
    g = pdfio.document_split_x(doc)
    print("\n" + "=" * 78)
    print(f"기출 {year}-{sess}회  {doc.page_count}p   문서거터={g}")
    print("페이지별 단독판정:", [None if x is None else round(x, 1)
                             for _i, x, _ in per_page_split(doc)])

    # 페이지별로 어떤 번호가 나오는지
    expected = 1
    for i in range(doc.page_count):
        cols = pdfio.column_texts(doc[i], g)
        nums_here = []
        for ci, c in enumerate(cols):
            for line in c.splitlines():
                m = QNUM_RE.match(line)
                if m:
                    nums_here.append((ci, int(m.group(1))))
        seq = [n for _c, n in nums_here]
        print(f"  p{i+1}: 줄머리 번호 {seq[:14]}{' …' if len(seq) > 14 else ''}")

    # 끊긴 지점 정밀 표시
    chunks = []
    for i in range(doc.page_count):
        chunks.extend(pdfio.column_texts(doc[i], g))
    text = "\n".join(chunks)
    expected = 1
    for line in text.splitlines():
        m = QNUM_RE.match(line)
        if m and int(m.group(1)) == expected:
            expected += 1
    brk = expected
    print(f"  -> 끊긴 번호: {brk}")
    for j, line in enumerate(text.splitlines()):
        if re.search(rf"(?<!\d){brk}\s*[.)]", line):
            print(f"     후보 line{j}: {line[:100]!r}")

    # 정답키 결손
    got = {}
    for i in range(doc.page_count):
        t = doc[i].get_text("text", sort=True)
        if "정답" not in t:
            continue
        for num, mark in ANSWER_RE.findall(t):
            n = int(num)
            if 1 <= n <= 100:
                got[n] = MARK_TO_IDX.get(mark) or (int(mark) if mark in "1234" else 0)
    miss = [n for n in range(1, 101) if n not in got]
    print(f"  정답키 {len(got)}/100, 결손 {miss}")
    if miss:
        for i in range(doc.page_count):
            t = doc[i].get_text("text", sort=True)
            if "정답" not in t:
                continue
            for n in miss:
                for mm in re.finditer(rf"(?<!\d){n}\s*[.．]?", t):
                    seg = t[mm.start():mm.start() + 14].replace("\n", "\\n")
                    print(f"     p{i+1} 결손{n} 주변: {seg!r}")
                    break
    doc.close()


if __name__ == "__main__":
    for y, s in TARGETS:
        run(y, s)

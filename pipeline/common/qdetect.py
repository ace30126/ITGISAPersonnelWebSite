"""문항 번호 / 선택지 마커 / 정답키 검출 — 파서 3종 공용.

여기의 규칙 두 개가 추출 정확도의 대부분을 결정한다. 각 파서가 따로 구현하면
같은 함정에 세 번 빠진다. Wave 1 에이전트는 이 모듈을 **읽기 전용으로 재사용**한다.
"""
from __future__ import annotations

import re

from .normalize import MARK_TO_IDX

# 줄머리 문항번호. 실제 매칭 승인은 expected 게이트를 통과해야 한다.
QNUM_RE = re.compile(r"^\s*(\d{1,3})\s*[.)]\s*")

# 정답키: '12.③'.
#
# 🔥 마커에 맨숫자(1-4)를 허용하면 안 된다.
#    '48.     49.④' 에서 '48.' + '4'(다음 번호의 첫 자리)를 정답으로 먹고
#    이후 전체가 밀린다. 2024-2회에서 정답 2개가 이렇게 사라졌다.
ANSWER_RE = re.compile(r"(\d{1,3})\s*[.．]\s*([①-④])")

# 선택지 마커
CHOICE_SPLIT_RE = re.compile(r"(?=[①-④])")


def _accepts(matched: str, expected: int, max_junk: int = 2) -> bool:
    """'434'는 34로, '551'은 51로 받아들인다.

    페이지 머리글/꼬리말 글리프가 문항번호 앞에 새어 붙는 회차가 있다
    (2023-1회 34→434, 2024-2회 51→551, 2025-3회 53→653).
    기대번호로 게이트되므로 이 관용은 오탐을 만들지 않는다.
    """
    exp = str(expected)
    if matched == exp:
        return True
    return (matched.endswith(exp)
            and 0 < len(matched) - len(exp) <= max_junk)


def detect_numbers(text: str, upto: int = 100) -> list[int]:
    """기대번호 상태기계. n == expected 일 때만 승인 → 코드/표 안 숫자 오탐 0."""
    found, expected = [], 1
    for line in text.splitlines():
        m = QNUM_RE.match(line)
        if m and _accepts(m.group(1), expected):
            found.append(expected)
            expected += 1
            if expected > upto:
                break
    return found


def split_questions(text: str, upto: int = 100) -> list[tuple[int, str]]:
    """(번호, 본문) 조각으로 자른다. 본문에는 지문 + 선택지가 함께 들어 있다."""
    lines = text.splitlines()
    starts: list[tuple[int, int]] = []   # (line_idx, number)
    expected = 1
    for i, line in enumerate(lines):
        m = QNUM_RE.match(line)
        if m and _accepts(m.group(1), expected):
            starts.append((i, expected))
            expected += 1
            if expected > upto:
                break

    out = []
    for k, (li, num) in enumerate(starts):
        end = starts[k + 1][0] if k + 1 < len(starts) else len(lines)
        body = "\n".join(lines[li:end])
        body = QNUM_RE.sub("", body, count=1)
        out.append((num, body))
    return out


def parse_choices(body: str) -> tuple[str, list[str]]:
    """본문 → (지문, 선택지 4개).

    선택지는 위치가 아니라 **마커 문자 자체를 키로 정렬**한다.
    sort=True 의 글리프 순서 뒤틀림에 면역이다.
    """
    parts = CHOICE_SPLIT_RE.split(body)
    stem = parts[0] if parts else body
    buckets: dict[int, list[str]] = {}
    for p in parts[1:]:
        if not p:
            continue
        idx = MARK_TO_IDX.get(p[0])
        if idx is None:
            stem += p
            continue
        buckets.setdefault(idx, []).append(p[1:])
    choices = ["".join(buckets.get(i, [])).strip() for i in (1, 2, 3, 4)]
    return stem.strip(), choices


def parse_answer_key(doc, limit: int = 100) -> dict[int, int]:
    """'정답'이 있는 페이지 전부에서 정답표를 수집한다.

    회차마다 정답표 위치가 다르다(2024-1회는 13페이지 구성). 마지막 2장으로
    한정하면 놓친다.
    """
    out: dict[int, int] = {}
    for i in range(doc.page_count):
        txt = doc[i].get_text("text", sort=True)
        if "정답" not in txt:
            continue
        for num, mark in ANSWER_RE.findall(txt):
            n = int(num)
            if 1 <= n <= limit:
                out[n] = MARK_TO_IDX[mark]
    return out

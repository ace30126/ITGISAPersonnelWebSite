"""텍스트 정규화 · 해시.

norm()의 출력은 **비교 전용**이다. 표시용으로 절대 쓰지 않는다.

주의: 불가시 문자(PUA / zero-width)는 반드시 \\u 이스케이프로 적는다.
소스에 리터럴로 넣으면 편집·전송 과정에서 조용히 사라진다.
"""
from __future__ import annotations

import hashlib
import re
import unicodedata

# 선택지 마커 (원문자)
CHOICE_MARKS = "①②③④⑤"  # ①②③④⑤
MARK_TO_IDX = {m: i + 1 for i, m in enumerate(CHOICE_MARKS)}
CHOICE_MARK_RE = re.compile("[①-④]")

_MARKER_RE = re.compile(
    r"[①-⑳⓵-⓾]|\(\s*[1-9]\s*\)|^\s*[1-9]\s*[.)]", re.M
)
_CTRL_RE = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_PUA_RE = re.compile("[-]")
_ZW_RE = re.compile("[​-‏‪-‮﻿­]")
_WS_RE = re.compile(r"\s+")


def strip_noise(s: str) -> str:
    """표시용 경량 정리 — 제어/PUA/zero-width 제거 + 공백 정돈. 내용은 보존한다."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", s)
    s = _CTRL_RE.sub("", s)
    s = _PUA_RE.sub("", s)
    s = _ZW_RE.sub("", s)
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def norm(s: str) -> str:
    """비교용 정규화: NFKC → 마커 제거 → 제어/PUA/ZW 제거 → 전 공백 삭제 → lower."""
    if not s:
        return ""
    s = unicodedata.normalize("NFKC", s)
    s = _CTRL_RE.sub("", s)
    s = _PUA_RE.sub("", s)
    s = _ZW_RE.sub("", s)
    s = _MARKER_RE.sub("", s)
    s = _WS_RE.sub("", s)
    return s.lower()


def _sha(*parts: str) -> str:
    h = hashlib.sha256()
    for p in parts:
        h.update(p.encode("utf-8"))
        h.update(b"\x1f")
    return h.hexdigest()[:16]


def item_hash(stem: str, choices: list[str]) -> str:
    """지문 + **정렬된** 선택지. 보기 순서만 섞은 재출제를 같은 문항으로 잡는다."""
    return _sha(norm(stem), "\x1e".join(sorted(norm(c) for c in choices)))


def stem_hash(stem: str) -> str:
    """지문만. 선택지가 바뀐 변형 출제를 한 그룹(variant_group)으로 묶는다."""
    return _sha(norm(stem))


def trigrams(s: str) -> set[str]:
    n = norm(s)
    return {n[i:i + 3] for i in range(max(0, len(n) - 2))}


def jaccard(a: str, b: str) -> float:
    ta, tb = trigrams(a), trigrams(b)
    if not ta or not tb:
        return 0.0
    return len(ta & tb) / len(ta | tb)


def pua_ratio(s: str) -> float:
    """PUA + 대체문자 비율. 폰트 깨짐 조기 탐지용 (G8)."""
    if not s:
        return 0.0
    bad = len(_PUA_RE.findall(s)) + s.count("�")
    return bad / len(s)

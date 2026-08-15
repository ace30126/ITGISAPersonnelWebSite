"""PDF 저수준 입출력 — 컬럼 분할 · 정렬 추출 · span 색상 · 도형 캡처.

핵심 사실 (정찰로 확정):
- 기출 원본은 2단. page.get_text() 순진 호출은 읽기순서가 붕괴한다.
  좌/우 clip + sort=True 로 뽑아야 한다.
- 거터(gutter) 위치는 회차마다 다를 수 있으므로 width/2 고정이 아니라
  "블록을 가장 적게 가르는 x"를 탐색해서 찾는다.
"""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import fitz  # PyMuPDF


@dataclass(frozen=True)
class Span:
    text: str
    font: str
    size: float
    color: int
    flags: int
    bbox: tuple[float, float, float, float]

    @property
    def is_mono(self) -> bool:
        f = self.font.lower()
        return any(k in f for k in ("mono", "courier", "consol", "gothic-code"))


def open_pdf(path: str | Path) -> fitz.Document:
    return fitz.open(str(path))


# --- 컬럼 분할 --------------------------------------------------------------

def _text_blocks(page: fitz.Page) -> list[tuple[float, float, float, float, str]]:
    out = []
    for b in page.get_text("blocks"):
        x0, y0, x1, y1, txt, _bno, btype = b
        if btype != 0:
            continue
        if not txt.strip():
            continue
        out.append((x0, y0, x1, y1, txt))
    return out


def column_split_x(page: fitz.Page, min_frac: float = 0.30,
                   max_frac: float = 0.70,
                   min_gutter_frac: float = 0.012) -> float | None:
    """2단 레이아웃이면 거터 x좌표를, 1단이면 None을 반환한다.

    거터 = 페이지 중앙부에서 **본문 블록이 전혀 없는 가장 넓은 세로 띠**.

    전폭 블록(머리글·꼬리말·저작권 안내)은 컬럼 판정에서 제외한다.
    이걸 교차로 세면 1페이지처럼 헤더가 있는 페이지가 통째로 1단 판정돼
    좌우 컬럼이 뒤섞인다 — Phase 0 스모크에서 이 증상으로 6/12 실패했다.
    """
    # 블록이 아니라 **단어** bbox를 쓴다. 기출 원본은 두 단의 같은 baseline이
    # 하나의 블록/라인으로 병합돼 나오기 때문에 블록 bbox로는 거터가 안 보인다.
    #
    # 그리고 거터는 '빈 띠'가 아니라 **저밀도 골**이다. 양쪽 본문 밀도가 20+일 때
    # 골은 0이 아니라 1~7 정도로 남는다(들여쓰기·문장부호가 걸친다).
    # 완전 공백을 요구하면 전 페이지가 1단으로 오판된다.
    r = page.rect
    y_lo, y_hi = r.y0 + r.height * 0.10, r.y0 + r.height * 0.94
    words = [w for w in page.get_text("words") if y_lo <= w[1] <= y_hi]
    if len(words) < 40:
        return None

    nbins = 200
    binw = r.width / nbins
    counts = [0] * nbins
    for x0, _y0, x1, _y1, *_rest in words:
        i0 = max(0, int((x0 - r.x0) / binw))
        i1 = min(nbins - 1, int((x1 - r.x0) / binw))
        for i in range(i0, i1 + 1):
            counts[i] += 1

    body_bins = [c for c in counts[int(nbins * 0.08):int(nbins * 0.92)] if c > 0]
    if len(body_bins) < 20:
        return None
    body_bins.sort()
    median = body_bins[len(body_bins) // 2]
    thresh = max(1.0, median * 0.35)

    lo, hi = int(nbins * min_frac), int(nbins * max_frac)
    best_run, run_start = None, None
    for i in range(lo, hi + 2):
        low = i <= hi and counts[i] <= thresh
        if low:
            if run_start is None:
                run_start = i
        elif run_start is not None:
            run = (run_start, i - 1)
            if best_run is None or (run[1] - run[0]) > (best_run[1] - best_run[0]):
                best_run = run
            run_start = None

    if best_run is None:
        return None
    if (best_run[1] - best_run[0] + 1) / nbins < min_gutter_frac:
        return None

    split = r.x0 + (best_run[0] + best_run[1] + 1) / 2 * binw
    left = sum(1 for w in words if w[2] <= split + 1)
    right = sum(1 for w in words if w[0] >= split - 1)
    if left < 20 or right < 20:
        return None
    return split


def document_split_x(doc: fitz.Document, tol: float = 12.0) -> float | None:
    """문서 전체의 거터 좌표.

    1페이지는 전폭 머리글·저작권 안내 때문에 단독 판정이 실패하기 쉽다.
    본문 페이지들이 합의한 값을 문서 전체에 적용하는 편이 훨씬 안정적이다.
    """
    cands = [x for x in (column_split_x(doc[i]) for i in range(doc.page_count))
             if x is not None]
    if len(cands) < max(2, doc.page_count * 0.3):
        return None
    cands.sort()
    med = cands[len(cands) // 2]
    agree = [x for x in cands if abs(x - med) <= tol]
    if len(agree) < max(2, doc.page_count * 0.3):
        return None
    return sum(agree) / len(agree)


def column_texts(page: fitz.Page, split_x: float | None) -> list[str]:
    """[좌, 우] 순서의 텍스트. 1단이면 길이 1 리스트."""
    r = page.rect
    if split_x is None:
        return [page.get_text("text", sort=True)]
    left = fitz.Rect(r.x0, r.y0, split_x, r.y1)
    right = fitz.Rect(split_x, r.y0, r.x1, r.y1)
    return [
        page.get_text("text", clip=left, sort=True),
        page.get_text("text", clip=right, sort=True),
    ]


def _spans_in(page: fitz.Page, clip: fitz.Rect | None) -> list[Span]:
    d = page.get_text("dict", clip=clip, sort=True)
    out: list[Span] = []
    for b in d["blocks"]:
        for line in b.get("lines", []):
            for s in line["spans"]:
                out.append(Span(
                    text=s["text"], font=s["font"], size=round(s["size"], 1),
                    color=s["color"], flags=s["flags"], bbox=tuple(s["bbox"]),
                ))
            out.append(Span("\n", "", 0.0, 0, 0, (0, 0, 0, 0)))
    return out


def column_spans(page: fitz.Page, split_x: float | None) -> list[list[Span]]:
    """색상/폰트/bbox 보존 span. 주제별 문제집의 초록 정답 마킹 추출용."""
    r = page.rect
    if split_x is None:
        return [_spans_in(page, None)]
    return [
        _spans_in(page, fitz.Rect(r.x0, r.y0, split_x, r.y1)),
        _spans_in(page, fitz.Rect(split_x, r.y0, r.x1, r.y1)),
    ]


def page_text_ordered(page: fitz.Page) -> str:
    """컬럼 자동 판정 후 좌→우 순서로 이어붙인 페이지 텍스트."""
    return "\n".join(column_texts(page, column_split_x(page)))


# --- 도형 캡처 --------------------------------------------------------------

def _pad(r: fitz.Rect, eps: float = 1.0) -> fitz.Rect:
    """빈 사각형을 1pt 부풀린다.

    🔥 fitz.Rect.intersects() 는 **빈 사각형(폭 0 또는 높이 0)에 대해 항상 False** 다.
    표 격자선·상자 테두리는 정확히 폭 0(수직선)/높이 0(수평선) path 로 들어오므로
    부풀리지 않으면 표가 있는 문항이 도형 0건으로 판정된다.
    이 버그로 주제별 문제집에서 도형 검출이 18/37 로 절반 누락돼 있었다.
    """
    if r.is_empty or r.width <= 0 or r.height <= 0:
        return fitz.Rect(r.x0 - eps, r.y0 - eps, r.x1 + eps, r.y1 + eps)
    return r


def watermark_boxes(page: fitz.Page, min_pages_frac: float = 0.8) -> list[fitz.Rect]:
    """페이지마다 같은 자리에 깔리는 배경 이미지(워터마크) bbox.

    이걸 빼지 않으면 거의 모든 문항이 density ≥ 1 을 받아 도형 판별이 무의미해진다.
    """
    doc = page.parent
    seen: dict[tuple[int, ...], int] = {}
    for i in range(doc.page_count):
        for info in doc[i].get_image_info():
            key = tuple(round(v) for v in info["bbox"])
            seen[key] = seen.get(key, 0) + 1
    need = max(2, int(doc.page_count * min_pages_frac))
    return [fitz.Rect(*k) for k, c in seen.items() if c >= need]


def graphic_density(page: fitz.Page, bbox: tuple[float, float, float, float],
                    ignore: list[fitz.Rect] | None = None) -> int:
    """bbox 안의 벡터 드로잉 + 이미지 개수. 도형 문항 판별 신호.

    ignore 에는 watermark_boxes() 결과를 넘겨 배경 이미지를 배제한다.
    """
    rect = fitz.Rect(*bbox)
    ignore = ignore or []

    def ignored(r: fitz.Rect) -> bool:
        return any(abs(r.x0 - g.x0) < 2 and abs(r.y0 - g.y0) < 2
                   and abs(r.x1 - g.x1) < 2 and abs(r.y1 - g.y1) < 2
                   for g in ignore)

    n = 0
    for d in page.get_drawings():
        dr = _pad(fitz.Rect(d["rect"]))
        if rect.intersects(dr) and not ignored(dr):
            n += 1
    for info in page.get_image_info():
        ir = fitz.Rect(info["bbox"])
        if rect.intersects(_pad(ir)) and not ignored(ir):
            n += 1
    return n


def crop_png(page: fitz.Page, bbox: tuple[float, float, float, float],
             dpi: int = 200) -> bytes:
    """문항 영역을 PNG로 캡처. 표·UML·순서도의 조용한 손실을 막는다."""
    zoom = dpi / 72.0
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom),
                          clip=fitz.Rect(*bbox))
    return pix.tobytes("png")

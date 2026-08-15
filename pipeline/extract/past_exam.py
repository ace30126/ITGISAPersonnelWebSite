"""기출 원본 12회 파서 — 2단 PDF → Item 1200개.

설계 요지 (정찰로 확정한 함정 4개와 그 대응)
--------------------------------------------
1. 거터는 **문서 전체 합의값**(`pdfio.document_split_x`). 1페이지는 전폭
   머리글·저작권 안내 때문에 단독 판정이 실패한다.

2. 🔥 텍스트는 char 단위로 뽑아 **y밴드로 묶고 x로 재정렬**한다.
   원본은 쉼표·괄호·조사를 별도 텍스트런으로 그려 넣은 조판이라
   `get_text(sort=True)`(=`pdfio.column_texts`)의 런 단위 순서가 무너진다.
       sort=True   : '설계 다이어그램원시,   코드,'   '제과목3 데이터베이스 구축'
       char 재정렬 : '설계 다이어그램, 원시 코드,'    '제3과목 데이터베이스 구축'
   문항 검출 자체는 양쪽 모두 100/100 이지만 **지문 품질이 다르다**.
   char 경로가 100문항을 못 채우면 검증된 `column_texts` 경로로 폴백한다.

3. 🔥 도형 판정은 **개수로 안 된다**. `pdfio.graphic_density()` 의 빈 사각형
   버그(수평/수직 괘선이 폭·높이 0이라 `Rect.intersects()` 가 항상 False)는
   공용 모듈에서 수정됐고 여기서도 그 수정본을 1차 신호로 쓴다. 다만
   보정 후에도 지문 테두리 상자(선 2+2)와 진짜 표(선 6+)가 실측 8~12 로
   겹친다. 그래서 `_gfx_scan()` 이 한 단계 더 본다 —
   **서로 다른 y 좌표의 수평선 수 / 서로 다른 x 좌표의 수직선 수**.

4. 🔥 워터마크·배너. 모든 페이지에 같은 bbox 로 깔린 시나공 로고,
   1페이지의 폭 3096pt 짜리(페이지 폭 595) 저작권 안내 이미지, 그리고
   과목 머리글 배너가 전부 도형으로 오인된다. 각각
   '동일 bbox 반복'(pdfio.watermark_boxes + 본문 페이지 재집계),
   '문항 bbox 안에 절반도 안 들어옴', '비문항 라인 위치에서 캡처 하한 절단'
   으로 걸러낸다. 포함 관계로 무시하면 워터마크 상자 안에 그려진 진짜
   그림까지 삼키니 반드시 **동일 bbox(±2pt)** 로만 판정한다.

5. 🔥 1페이지 발행처 배너가 **좌단 마지막 문항의 ④번 보기 꼬리에 실린다**
   (읽기순서 = 페이지→좌단 전체→우단 전체이므로 전폭 배너의 우단 조각이
   좌단 끝에 붙는다). 12회 전부에서 발생했고 형식 검증은 통과한다.
   BOILERPLATE_RES 로 걸러내고 같은 패턴을 검증 게이트에도 넣었다.

문항 분리/선택지/정답키/과목은 전부 `common/` 의 검증된 함수를 그대로 쓴다.
"""
from __future__ import annotations

import random
import re
import sys
from collections import Counter
from dataclasses import dataclass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

import fitz  # noqa: E402

import config as C  # noqa: E402
from common import pdfio, qdetect  # noqa: E402
from common.normalize import CHOICE_MARK_RE, item_hash, stem_hash, strip_noise  # noqa: E402
from common.schema import Block, Item, dump_items, past_exam_id, subject_from_number  # noqa: E402

# 원본 PDF 자체의 결함 — 추출 버그가 아니다(크롭 렌더로 육안 확인).
# 2022년 2회 정답표의 5번 칸이 통째로 공란.
SOURCE_DEFECT_ANSWERS: dict[tuple[int, int], set[int]] = {
    (2022, 2): {5},
}

# 선택지가 그림뿐이라 텍스트가 존재하지 않는 문항의 자리표시자.
IMG_CHOICE = "(보기 이미지 — stem_blocks 참조)"


def _repair_duplicate_marker(body: str) -> list[str] | None:
    """원본이 선택지 마커를 잘못 찍은 경우의 위치 기반 복구.

    2025년 3회 91번은 원본이 ④ 대신 ③ 을 한 번 더 찍었다(크롭 렌더로 확인).
    `parse_choices` 는 마커 문자를 키로 쓰므로 ③에 두 보기가 합쳐지고 ④가 빈다.

    마커가 정확히 4개인데 **중복이 있을 때만** 위치 순서로 다시 자른다.
    마커 4개가 전부 다르면(=그림 보기 문항 등) 손대지 않는다 — 검증된
    `parse_choices` 의 글리프 순서 면역을 깨지 않기 위해서다.
    """
    marks = [m.start() for m in CHOICE_MARK_RE.finditer(body)]
    if len(marks) != 4 or len({body[p] for p in marks}) == 4:
        return None
    out = []
    for i, p in enumerate(marks):
        e = marks[i + 1] if i + 1 < 4 else len(body)
        out.append(body[p + 1:e].strip())
    return out

# 구조 도형 판정: 서로 다른 좌표의 괘선 개수 (테두리 상자는 2+2)
GFX_LINE_LEVELS = 3
GFX_SHAPE_MIN = 3

MARGIN_TOP = 65.0
MARGIN_BOT = 45.0

# 본문에 항상 끼는 비문항 라인
JUNK_RES = [
    # 쪽번호 '- 3 -'. 좌우 대시 중 하나가 거터 반대편으로 넘어가 '- 3' 만
    # 남는 회차가 있어 한쪽 대시만 있어도 잡는다(맨숫자는 표 셀이라 제외).
    re.compile(r"^\s*(?:[-–—]\s*\d{1,3}|\d{1,3}\s*[-–—])\s*[-–—]?\s*$"),
    re.compile(r"^\s*제\s*\d?\s*과목\b"),                    # 과목 머리글
    re.compile(r"^\s*\d?\s*과목\s+[가-힣]"),                 # 글리프 뒤틀린 변형
    re.compile(r"^\s*(이름|학과|수험번호|성명)\s*$"),
]

# 🔥 1페이지 상단 발행처 배너·저작권 안내·응시 안내.
#    전폭이라 좌우 두 단으로 쪼개지는데, **우단 조각이 좌단 마지막 문항 뒤에
#    붙는다**(읽기순서 = 페이지→좌단 전체→우단 전체). 12회 전부에서 1페이지
#    마지막 문항의 ④번 보기 꼬리에 '기출문제 & 정답 및 해설 …' 이 실려 있었다.
#    선택지 개수·길이 검증은 통과하므로 조용히 지나간다 — 아래 GATE 로 못박는다.
BOILERPLATE_RES = [
    re.compile(r"기출문제\s*&\s*정답\s*및\s*해설"),
    re.compile(r"^\s*정보처리기사\s*필기\s*기출문제\s*$"),
    re.compile(r"^\s*\d?\s*회\s*정보처리기사\s*필기\s*$"),
    re.compile(r"저작권\s*안내"),
    re.compile(r"시나공"),
    re.compile(r"용도로만?\s*사용할\s*수"),
    re.compile(r"허락\s*없이\s*복제"),
    re.compile(r"다른\s*매체에\s*옮겨"),
    re.compile(r"답안카드의"),
    re.compile(r"표기하시오"),
    re.compile(r"^\s*없습니다\.?\s*$"),
    re.compile(r"^\s*\d{4}\s*년\s*$"),
    re.compile(r"^\s*\d{1,2}\s*회\s*$"),
]

MONO_FONTS = ("dotumche", "gulimche", "batangche", "gungsuhche",
              "courier", "consol", "mono")

CODE_KW = re.compile(
    r"(#include|#define|\bimport\b|\bpackage\b|\bpublic\b|\bprivate\b|"
    r"\bstatic\b|\bvoid\b|\bclass\b|\bstruct\b|\btypedef\b|\bprintf\b|"
    r"\bscanf\b|\bmalloc\b|\bsizeof\b|System\.out|\bprintln\b|\bdef \b|"
    r"\bprint\(|\breturn\b|\belse\b|\belif\b|\bswitch\b|\bcase\b|\bbreak\b|"
    r"\bmain\s*\(|\bString\b|\bchar\b|\bfloat\b|\bdouble\b|\bboolean\b|"
    r"\bint\b|\bfor\s*\(|\bwhile\s*\(|\bif\s*\()")

# 다음 문항 누수 탐지 게이트
LEAK_RE = re.compile(r"\n\s*\d{1,3}\.\s")


@dataclass
class Line:
    text: str
    page: int          # 0-based
    col: int           # 0=L, 1=R
    y0: float
    y1: float
    x0: float
    x1: float
    mono: bool


# --- char 재정렬 추출 -------------------------------------------------------

def _char_lines(page: fitz.Page, clip: fitz.Rect, page_idx: int, col: int,
                yband: float = 3.5) -> list[Line]:
    """clip 안의 글자를 y밴드로 묶고 x로 재정렬해 라인 목록을 만든다."""
    d = page.get_text("rawdict", clip=clip)
    items: list[tuple] = []
    for b in d["blocks"]:
        if b.get("type") != 0:
            continue
        for ln in b.get("lines", []):
            for sp in ln["spans"]:
                fl = sp["font"].lower()
                mono = any(k in fl for k in MONO_FONTS)
                size = sp.get("size") or 10.0
                for ch in sp["chars"]:
                    x0, y0, x1, y1 = ch["bbox"]
                    # 🔥 clip 은 '겹치기만 해도' 글자를 준다. 거터에 걸친 글자가
                    #    좌·우 양쪽에 중복으로 들어와 지문 중간에 고립 숫자
                    #    ('… 옳지 않은 것은? 6')를 남긴다. 실측: x 304.7~309.6,
                    #    거터 305.3. **글자 중심**으로 소속 단을 정한다.
                    if not (clip.x0 <= (x0 + x1) / 2 <= clip.x1):
                        continue
                    items.append(((y0 + y1) / 2, x0, x1, y0, y1, ch["c"], mono, size))
    if not items:
        return []

    items.sort(key=lambda t: (t[0], t[1]))
    groups: list[list] = []
    cur: list = [items[0]]
    for it in items[1:]:
        if it[0] - cur[-1][0] <= yband:
            cur.append(it)
        else:
            groups.append(cur)
            cur = [it]
    groups.append(cur)

    out: list[Line] = []
    for g in groups:
        g.sort(key=lambda t: t[1])
        buf: list[str] = []
        prev_x1: float | None = None
        for _ym, x0, x1, _y0, _y1, ch, _mono, size in g:
            if (prev_x1 is not None and x0 - prev_x1 > size * 0.28
                    and ch != " " and (not buf or buf[-1] != " ")):
                buf.append(" ")
            buf.append(ch)
            prev_x1 = x1 if prev_x1 is None else max(prev_x1, x1)
        text = "".join(buf).rstrip()
        if not text.strip():
            continue
        out.append(Line(
            text=text, page=page_idx, col=col,
            y0=min(t[3] for t in g), y1=max(t[4] for t in g),
            x0=min(t[1] for t in g), x1=max(t[2] for t in g),
            mono=any(t[6] for t in g),
        ))
    return out


def _col_rects(page: fitz.Page, gutter: float | None) -> list[fitz.Rect]:
    r = page.rect
    if gutter is None:
        return [fitz.Rect(r)]
    return [fitz.Rect(r.x0, r.y0, gutter, r.y1),
            fitz.Rect(gutter, r.y0, r.x1, r.y1)]


def _is_junk(text: str, page_idx: int = -1) -> bool:
    if any(rx.search(text) for rx in JUNK_RES):
        return True
    # 발행처 배너는 1페이지에만 있다. 다른 페이지까지 걸면 본문을 깎을 위험이 있다.
    return page_idx == 0 and any(rx.search(text) for rx in BOILERPLATE_RES)


def ordered_lines(doc: fitz.Document, gutter: float | None,
                  last_page: int) -> tuple[list[Line], list[Line]]:
    """본문 페이지 전체를 페이지→좌→우 순서의 (본문라인, 비문항라인)으로.

    비문항 라인(과목 머리글·쪽번호)은 버리지 않고 돌려준다. 마지막 문항의
    캡처 영역 하한을 여기서 끊어야 '제4과목 …' 배너가 앞 문항의 도형으로
    오인되지 않는다.
    """
    body: list[Line] = []
    junk: list[Line] = []
    for i in range(last_page):
        pg = doc[i]
        for ci, rect in enumerate(_col_rects(pg, gutter)):
            for ln in _char_lines(pg, rect, i, ci):
                (junk if _is_junk(ln.text, i) else body).append(ln)
    return body, junk


def _question_starts(lines: list[Line], upto: int = 100) -> list[tuple[int, int]]:
    """(line_idx, number). `qdetect.split_questions` 와 **동일한 상태기계**."""
    starts: list[tuple[int, int]] = []
    expected = 1
    for i, ln in enumerate(lines):
        m = qdetect.QNUM_RE.match(ln.text)
        if m and qdetect._accepts(m.group(1), expected):
            starts.append((i, expected))
            expected += 1
            if expected > upto:
                break
    return starts


# --- 도형 ------------------------------------------------------------------

def body_page_count(doc: fitz.Document) -> int:
    """본문(문제) 페이지 수.

    `doc.page_count - 1` 로 고정하면 안 된다. 2024년 1회는 13페이지 구성이고
    정답·해설 섹션이 8페이지째부터 시작한다. 이걸 본문으로 먹으면 100번 문항이
    정답표를 통째로 삼켜서 선택지에 '11. 12. 32. …' 가 누수된다.

    정답표 페이지는 'N.①' 패턴이 대량으로 나오는 페이지다.
    """
    for i in range(doc.page_count):
        txt = doc[i].get_text("text", sort=True)
        if len(qdetect.ANSWER_RE.findall(txt)) >= 10:
            return i
    return doc.page_count - 1


def _ignore_boxes(doc: fitz.Document, last_page: int) -> list[fitz.Rect]:
    """`pdfio.watermark_boxes` + 본문 페이지 기준 반복 이미지.

    pdfio 쪽은 '전 페이지의 80% 이상'을 요구한다. 이 PDF들은 정답표 페이지의
    이미지 구성이 달라 본문 워터마크가 그 문턱을 못 넘는 회차가 있어
    본문 페이지만 놓고 2회 이상 반복되는 것을 함께 무시 목록에 넣는다.
    """
    boxes = list(pdfio.watermark_boxes(doc[0]))
    c: Counter = Counter()
    for i in range(last_page):
        for info in doc[i].get_image_info():
            c[tuple(round(v, 1) for v in info["bbox"])] += 1
    boxes += [fitz.Rect(*k) for k, v in c.items() if v >= 2]
    return boxes


def _gfx_scan(page: fitz.Page, bbox: tuple[float, float, float, float],
              ignore: list[fitz.Rect]) -> tuple[bool, fitz.Rect | None, dict]:
    """(구조도형 여부, 도형 합집합 rect, 진단수치).

    `pdfio.graphic_density()`(빈 사각형 보정 완료본)를 1차 신호로 쓴다.
    다만 **개수만으로는 판별이 안 된다** — 지문 테두리 상자(선 2+2)와 진짜
    표(선 6+)가 실측 8~12 로 겹친다. 그래서 여기서 한 단계 더 본다:
      · 서로 다른 y 좌표의 수평선 / 서로 다른 x 좌표의 수직선 개수
        (테두리 상자는 각각 2, 표는 3 이상)
      · 문항 영역에 절반 이상 들어온 이미지 (1페이지 저작권 그림 배제)
    """
    rect = fitz.Rect(*bbox)
    W, H = page.rect.width, page.rect.height
    density = pdfio.graphic_density(page, bbox, ignore=ignore)

    hs: set[float] = set()
    vs: set[float] = set()
    shapes = 0
    imgs = 0
    union: fitz.Rect | None = None

    def add(r: fitz.Rect) -> None:
        nonlocal union
        union = fitz.Rect(r) if union is None else (union | r)

    for d in page.get_drawings():
        r = fitz.Rect(d["rect"])
        r.normalize()
        if r.y1 < MARGIN_TOP or r.y0 > H - MARGIN_BOT:
            continue
        if r.width > W * 0.85 or r.height > H * 0.6:   # 전폭 구분선 · 컬럼 경계
            continue
        if not rect.intersects(pdfio._pad(r)):
            continue
        if r.height <= 1.2:
            hs.add(round(r.y0))
        elif r.width <= 1.2:
            vs.add(round(r.x0))
        else:
            shapes += 1
        add(r)

    for info in page.get_image_info():
        r = fitz.Rect(info["bbox"])
        r.normalize()
        # ⚠ '포함 관계'로 무시하면 안 된다. 워터마크는 페이지 중앙의 큰 상자라
        #   그 안에 그려진 진짜 그림(트리·제어흐름 그래프)까지 삼킨다 —
        #   실제로 2022-3 24번, 2025-3 26번이 이 방식에서 사라졌다.
        #   pdfio.graphic_density 와 같은 ±2pt 동일 bbox 규칙만 쓴다.
        if r.is_empty or any(abs(r.x0 - g.x0) < 2 and abs(r.y0 - g.y0) < 2
                             and abs(r.x1 - g.x1) < 2 and abs(r.y1 - g.y1) < 2
                             for g in ignore):
            continue
        inter = fitz.Rect(r) & rect
        # 문항 영역에 '절반 이상 들어와 있는' 이미지만 이 문항의 그림이다.
        # 1페이지 저작권 안내(폭 3096pt)가 전 문항에 걸리는 것을 막는다.
        if inter.is_empty or (inter.get_area() / max(r.get_area(), 1e-6)) < 0.5:
            continue
        imgs += 1
        add(r)

    structured = (imgs > 0 or len(hs) >= GFX_LINE_LEVELS
                  or len(vs) >= GFX_LINE_LEVELS or shapes >= GFX_SHAPE_MIN)
    return structured, union, {"density": density, "h": len(hs), "v": len(vs),
                               "shape": shapes, "img": imgs}


# --- 코드 ------------------------------------------------------------------

# 괄호·연산자·숫자만 있는 줄 ('}', '++i;', '8'). 앞뒤 문맥을 따라간다 —
# 이걸 독립 판정하면 code 블록이 '}' 마다 조각난다.
NEUTRAL_RE = re.compile(r"^[\s{}()\[\]<>;:,.\d+\-*/=&|!'\"#]+$")


def _line_kind(t: str, mono: bool) -> str:
    s = t.strip()
    if not s:
        return "neutral"
    if NEUTRAL_RE.match(s) or len(s) <= 3:
        return "neutral"
    if CHOICE_MARK_RE.search(s):
        return "text"
    hangul = sum(1 for c in s if "가" <= c <= "힣")
    if hangul / len(s) > 0.15:
        return "text"
    if mono or re.search(r"[{};=<>\[\]]", s) or CODE_KW.search(s):
        return "code"
    return "text"


def _codeish(t: str) -> bool:
    return _line_kind(t, False) == "code"


def _stem_blocks(stem_lines: list[Line], imgs: list[str]) -> list[Block]:
    """지문 라인 → text/code 블록 시퀀스 (+도형 이미지)."""
    kinds = [_line_kind(l.text, l.mono) for l in stem_lines]
    # neutral 줄은 앞(없으면 뒤) 실제 종류를 물려받는다.
    for i, k in enumerate(kinds):
        if k != "neutral":
            continue
        prev = next((kinds[j] for j in range(i - 1, -1, -1)
                     if kinds[j] != "neutral"), None)
        nxt = next((kinds[j] for j in range(i + 1, len(kinds))
                    if kinds[j] != "neutral"), None)
        kinds[i] = prev or nxt or "text"

    blocks: list[Block] = []
    buf: list[str] = []
    mode = kinds[0] if kinds else "text"

    def flush() -> None:
        nonlocal buf
        if not buf:
            return
        body = ("\n".join(buf).rstrip() if mode == "code"
                else strip_noise("\n".join(buf)))
        if body.strip():
            blocks.append(Block(type=mode, value=body))
        buf = []

    for ln, k in zip(stem_lines, kinds):
        if k != mode:
            flush()
            mode = k
        buf.append(ln.text)
    flush()

    # 1줄짜리 code 오탐(수식·괄호 한 줄)은 앞 text 로 흡수한다.
    fixed: list[Block] = []
    for b in blocks:
        if b.type == "code" and len(b.value.splitlines()) < 2:
            if fixed and fixed[-1].type == "text":
                fixed[-1].value = (fixed[-1].value + "\n" + b.value).strip()
                continue
            b = Block(type="text", value=b.value)
        fixed.append(b)

    fixed.extend(Block(type="image", src=s) for s in imgs)
    return fixed


# --- 회차 파싱 -------------------------------------------------------------

def _segments(seg: list[Line]) -> list[tuple[tuple[int, int], list[Line]]]:
    """문항 라인을 (page, col) 별로 쪼갠다. 단·페이지를 넘는 문항 대응."""
    out: list[tuple[tuple[int, int], list[Line]]] = []
    for ln in seg:
        k = (ln.page, ln.col)
        if out and out[-1][0] == k:
            out[-1][1].append(ln)
        else:
            out.append((k, [ln]))
    return out


def parse_round(year: int, session: int, rel: str,
                verbose: bool = False) -> list[Item]:
    path = C.src(rel)
    doc = pdfio.open_pdf(path)
    gutter = pdfio.document_split_x(doc)
    last_page = body_page_count(doc)        # 정답표 직전까지가 본문
    key = qdetect.parse_answer_key(doc)
    defects = SOURCE_DEFECT_ANSWERS.get((year, session), set())
    ignore = _ignore_boxes(doc, last_page)

    lines, junk = ordered_lines(doc, gutter, last_page)
    starts = _question_starts(lines)
    path_used = "char"

    fallback: dict[int, str] | None = None
    if len(starts) != 100:
        # 검증된 경로로 폴백 (bbox 없음 → 도형 캡처·블록 불가)
        keep: list[str] = []
        for i in range(last_page):
            for chunk in pdfio.column_texts(doc[i], gutter):
                keep += [l for l in chunk.splitlines() if not _is_junk(l, i)]
        text = "\n".join(keep)
        fallback = dict(qdetect.split_questions(text))
        path_used = f"FALLBACK char={len(starts)} → col={len(fallback)}"

    asset_dir = C.ASSETS / "q" / f"{year}-{session}"
    items: list[Item] = []
    n_img = n_code = 0

    order: list[tuple[int, int]] = (starts if fallback is None
                                    else [(0, n) for n in sorted(fallback)])

    for k, (li, num) in enumerate(order):
        blocks: list[Block] = []
        if fallback is None:
            end = starts[k + 1][0] if k + 1 < len(starts) else len(lines)
            seg = lines[li:end]
            head = seg[0]
            seg = [Line(qdetect.QNUM_RE.sub("", head.text, count=1), head.page,
                        head.col, head.y0, head.y1, head.x0, head.x1,
                        head.mono)] + seg[1:]
            body = "\n".join(l.text for l in seg)
            page_no, col = head.page + 1, "LR"[head.col]

            # --- 도형 캡처 (단/페이지를 넘는 문항은 조각마다) ---------------
            srcs: list[str] = []
            nxt = lines[end] if end < len(lines) else None
            for si, ((pi, ci), part) in enumerate(_segments(seg)):
                pg = doc[pi]
                crect = _col_rects(pg, gutter)[ci]
                y_top = min(l.y0 for l in part) - 3
                y_txt = max(l.y1 for l in part) + 3
                y_lim = pg.rect.height - MARGIN_BOT
                if nxt is not None and (nxt.page, nxt.col) == (pi, ci):
                    y_lim = min(y_lim, nxt.y0 - 2)
                # 과목 머리글 배너·쪽번호에서 끊는다 (도형 오인 방지).
                # 배너의 둥근 캡 도형이 글자보다 위로 솟아 있어 10pt 여유를 둔다.
                stop = [j.y0 - 10 for j in junk
                        if (j.page, j.col) == (pi, ci) and j.y0 > y_txt]
                if stop:
                    y_lim = min(y_lim, min(stop))
                probe = (crect.x0 + 1, y_top, crect.x1 - 1, max(y_txt, y_lim))
                structured, union, _st = _gfx_scan(pg, probe, ignore)
                if not structured:
                    continue
                y_bot = min(max(y_txt, union.y1 + 3 if union else y_txt), y_lim)
                bb = (crect.x0 + 1, y_top, crect.x1 - 1, max(y_bot, y_top + 8))
                asset_dir.mkdir(parents=True, exist_ok=True)
                fp = asset_dir / f"{num:03d}{'' if si == 0 else chr(97 + si)}.png"
                fp.write_bytes(pdfio.crop_png(pg, bb))
                srcs.append(fp.relative_to(C.INTERIM).as_posix())
            n_img += len(srcs)
        else:
            body = fallback[num]
            seg, srcs = [], []
            page_no, col = 0, ""

        raw_stem, raw_choices = qdetect.parse_choices(body)
        marker_defect = False
        if any(not c.strip() for c in raw_choices):
            fixed = _repair_duplicate_marker(body)
            if fixed and all(c.strip() for c in fixed):
                raw_choices, marker_defect = fixed, True
        stem = strip_noise(raw_stem)
        choices = [strip_noise(c) for c in raw_choices]

        if fallback is None:
            stem_lines: list[Line] = []
            for l in seg:
                if CHOICE_MARK_RE.search(l.text):
                    break
                stem_lines.append(l)
            cand = _stem_blocks(stem_lines, srcs)
            if any(b.type in ("code", "image") for b in cand):
                blocks = cand
                n_code += sum(1 for b in cand if b.type == "code")

        ans = key.get(num)
        it = Item(
            id=past_exam_id(year, session, num),
            source="past_exam",
            stem=stem,
            choices=choices,
            answer=ans,
            answer_src="answer_key" if ans else None,
            subject=subject_from_number(num),
            subject_src="position",
            number=num,
            round={"year": year, "session": session},
            origin={"file": path.name, "page": page_no, "col": col},
            stem_blocks=blocks,
            hash=item_hash(stem, choices),
            stem_hash=stem_hash(stem),
        )

        # 보기가 그림뿐이라 텍스트가 없는 문항 — 손실을 조용히 넘기지 않고
        # 자리표시자 + flag 로 드러낸다. overrides/ 대상.
        if marker_defect:
            it.flag("source_defect_marker")
            it.confidence = min(it.confidence, 0.8)
        empty = [i for i, c in enumerate(choices, 1) if len(c.strip()) < 1]
        if empty:
            for i in empty:
                it.choices[i - 1] = IMG_CHOICE
            it.flag("choices_in_image" if srcs else "choices_lost")
            it.confidence = min(it.confidence, 0.4)
        if len(it.stem.strip()) < 5:
            it.flag("stem_short")
            it.confidence = min(it.confidence, 0.4)
        if ans is None:
            it.flag("source_defect_answer" if num in defects else "answer_missing")
            it.confidence = min(it.confidence, 0.5)
        items.append(it)

    if verbose:
        print(f"  [{year}-{session}] {path_used:<26} gutter={gutter:7.1f} "
              f"본문 {last_page}/{doc.page_count}p lines={len(lines):>4} "
              f"무시박스={len(ignore)} 도형={n_img} 코드={n_code}")
    doc.close()
    return items


def parse_all(verbose: bool = False) -> list[Item]:
    out: list[Item] = []
    for year, sess, rel in C.PAST_EXAMS:
        out.extend(parse_round(year, sess, rel, verbose=verbose))
    return out


# --- 자체 검증 --------------------------------------------------------------

def _violations(year: int, sess: int, items: list[Item]) -> list[str]:
    v: list[str] = []
    nums = [i.number for i in items]
    if len(items) != 100:
        v.append(f"문항수 {len(items)}")
    dup = [n for n, c in Counter(nums).items() if c > 1]
    if dup:
        v.append(f"중복 {dup}")
    miss = [n for n in range(1, 101) if n not in set(nums)]
    if miss:
        v.append(f"결손 {miss[:8]}")
    defects = SOURCE_DEFECT_ANSWERS.get((year, sess), set())
    for it in items:
        n = it.number
        if len(it.choices) != 4:
            v.append(f"#{n} choices 개수 {len(it.choices)}")
        for i, c in enumerate(it.choices, 1):
            if len(c.strip()) < 1:
                v.append(f"#{n} c{i} 공백")
        if len(it.stem.strip()) < 5:
            v.append(f"#{n} stem<5 {it.stem[:24]!r}")
        if it.answer is None:
            if n not in defects:
                v.append(f"#{n} answer=None")
        elif it.answer not in (1, 2, 3, 4):
            v.append(f"#{n} answer={it.answer}")
        for label, txt in ([("stem", it.stem)]
                           + [(f"c{i}", c) for i, c in enumerate(it.choices, 1)]):
            m = LEAK_RE.search("\n" + txt)
            if m:
                v.append(f"#{n} 누수 {label}: {m.group(0)!r} … {txt[:40]!r}")
            for rx in BOILERPLATE_RES[:10]:      # 발행처 배너 잔류
                b = rx.search(txt)
                if b:
                    v.append(f"#{n} 배너누수 {label}: {b.group(0)!r}")
                    break
    return v


def main() -> int:
    print("=" * 100)
    print("기출 원본 12회 파서 — pipeline/extract/past_exam.py")
    print("=" * 100)

    all_items: list[Item] = []
    rows: list[tuple] = []
    bad: dict[str, list[str]] = {}

    for year, sess, rel in C.PAST_EXAMS:
        items = parse_round(year, sess, rel, verbose=True)
        all_items.extend(items)
        tag = f"{year}-{sess}"
        v = _violations(year, sess, items)
        if v:
            bad[tag] = v
        dist = Counter(i.answer for i in items if i.answer)
        tot = sum(dist.values()) or 1
        pct = [dist.get(k, 0) / tot * 100 for k in (1, 2, 3, 4)]
        n_img = sum(1 for i in items for b in i.stem_blocks if b.type == "image")
        n_code = sum(1 for i in items for b in i.stem_blocks if b.type == "code")
        warn = "" if all(15 <= p <= 35 for p in pct) else "  <경고 분포"
        rows.append((tag, len(items), len(v), pct, n_img, n_code, warn))

    print()
    print("-" * 100)
    print(f"{'회차':<10}{'문항':>5}{'위반':>5}    "
          f"{'1':>5}{'2':>7}{'3':>7}{'4':>7}    {'도형':>5}{'코드':>6}")
    print("-" * 100)
    for tag, n, nv, pct, ni, nc, warn in rows:
        print(f"{tag:<10}{n:>5}{nv:>5}    "
              f"{pct[0]:>4.0f}%{pct[1]:>6.0f}%{pct[2]:>6.0f}%{pct[3]:>6.0f}%"
              f"    {ni:>5}{nc:>6}{warn}")
    print("-" * 100)
    print(f"{'합계':<10}{len(all_items):>5}{sum(len(v) for v in bad.values()):>5}")

    if bad:
        print()
        print("!! 위반 상세")
        for tag, v in bad.items():
            print(f"  [{tag}] {len(v)}건")
            for line in v[:25]:
                print(f"     - {line}")

    n = dump_items(all_items, C.INTERIM / "past_exam.json")
    print()
    print(f"dump → {C.INTERIM / 'past_exam.json'}  ({n} items)")

    flagged = [(i.id, i.flags) for i in all_items if i.flags]
    print()
    print(f"수동 override 대상 {len(flagged)}건")
    for fid, fl in flagged:
        print(f"   {fid}  {fl}")

    random.seed(7)
    print()
    print("=" * 100)
    print("무작위 표본 5문항 (육안 검수)")
    print("=" * 100)
    for it in random.sample(all_items, 5):
        print(f"\n[{it.id}] 과목{it.subject} p{it.origin['page']}{it.origin['col']}"
              f"  정답 {it.answer}")
        print(f"  Q. {it.stem}")
        for i, c in enumerate(it.choices, 1):
            print(f"   {'*' if i == it.answer else ' '}{i}) {c}")
        for b in it.stem_blocks:
            print(f"   <{b.type}> {(b.src or b.value)[:70]!r}")

    ok = not bad
    print()
    print("=" * 100)
    print(f"게이트: {'PASS' if ok else 'FAIL'}")
    print("=" * 100)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())

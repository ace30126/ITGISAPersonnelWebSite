"""해설집(comcbt) 8회 파서 — 문항 + 커뮤니티 해설 다중 추출.

정찰로 확정된 사실만 사용한다.

레이아웃
  - 2단(거터 ≈ x292~294). `pdfio.document_split_x` 의 문서 전체 합의값을 쓴다.
    1단으로 뽑으면 좌우가 뒤섞여 6문항밖에 안 잡힌다.
  - 머리글은 y∈[21,42], 꼬리말은 y≈821 의 **전폭** 줄이다. 전폭이라 거터에서
    두 동강 나 좌·우 컬럼 양쪽에 반쪽씩 박힌다("…프로젝트에 의" / "해서
    만들어진 자료입니다…"). 문자열 매칭으로 지우려 들면 반쪽 조각을 놓친다.
    → **y 밴드 [50, 815] 로 클립**해서 애초에 읽지 않는다.

색상 = 문항/해설 분리의 1차 신호
  - 문항 지문·선택지 = 검정(color 0), <문제 해설> 이하 = 파랑(color 255).
  - 800문항 전부에서 "청크 내 첫 파란 줄" == "<문제 해설> 줄" 로 일치했다.
    그래서 경계는 두 신호 중 어느 쪽으로 잡아도 같다(교차 확인용으로 둘 다 본다).
  - 문항번호 검출도 **검정 줄로 게이트**한다. 해설 본문에는 '1. …', '3.Prototype
    - 생성패턴' 같은 줄이 흔해서, 색 게이트 없이 기대번호 상태기계만 돌리면
    해설 안 목록을 다음 문항의 시작으로 오인한다.

끝머리(end matter)
  - 마지막 페이지 우단에 저작권 고지 + CBT 안내 + **100문항 정답 격자**가 있다.
    같은 페이지 좌단에는 99·100번 본문이 살아 있으므로 페이지 통째 제외는 안 된다.
    → 마지막 문항 시작 이후 첫 끝머리 마커 줄에서 잘라낸다.

정답 — 🔥 브리핑 전제 정정
  - "해설집에 정답 정보가 없다"는 사실이 아니다. 마지막 페이지 우단에
    **100문항 정답 격자**(숫자행/기호행 교대)가 있다. 스모크가 못 잡은 이유는
    `ANSWER_RE` 가 '12.③' 같은 인접 표기를 찾는데 격자는 표 셀로 분리돼 있어서다.
  - 격자 판독기는 기출 원본과 대조해 확증했다(2022-1 100/100, 2022-2 99/99,
    게다가 기출 정답표가 원본 공란인 2022-2 5번을 격자가 채워준다).
    그래서 `answer_src="solution_book"` 으로 **실제로 채운다**. 이 대조는
    게이트로 강제되어 있어, 판독이 어긋나면 즉시 종료코드 1 이다.

이미지로 날아간 지문·보기
  - 코드·표·관계대수 기호(σ π ⋈ ÷)가 **래스터 이미지**로 박혀 있다. 텍스트
    추출로는 영원히 복구할 수 없다. 해당 문항은 영역을 PNG 로 크롭해
    `interim/assets/s/{date}/{number}.png` 에 남기고 `stem_blocks` 로 잇는다.
    텍스트는 지우지 않는다 — 이미지는 손실분을 **보태는** 것이다.
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

import fitz  # noqa: E402  PyMuPDF

import config as C  # noqa: E402
from common import pdfio  # noqa: E402
from common.normalize import item_hash, stem_hash, strip_noise  # noqa: E402
from common.qdetect import (  # noqa: E402
    QNUM_RE, _accepts, parse_answer_key, parse_choices,
)
from common.schema import (  # noqa: E402
    Block, Explanation, Item, dump_items, solution_id, subject_from_number,
)

OUT = C.INTERIM / "solution_book.json"

# 본문 y 밴드 — 머리글(21~42) · 꼬리말(821~833) 제외
BODY_TOP, BODY_BOTTOM = 50.0, 815.0

EXPL_COLOR = 255          # 해설 본문 파랑
QUESTION_COLOR = 0        # 지문·선택지 검정

EXPL_HDR_RE = re.compile(r"<\s*문제\s*해설\s*>")
# 닫는 대괄호가 빠진 원본이 있다(20220424 63번: '[해설작성자 : 루니').
AUTHOR_RE = re.compile(r"\[\s*해설\s*작성자\s*[:：]\s*([^\]\n]{0,80}?)\s*(?:\]|$)", re.M)
SUBJECT_HDR_RE = re.compile(r"^\s*([1-5])\s*과목\s*[:：]\s*(.*)$")
END_MATTER_RE = re.compile(
    r"본\s*해설집의\s*저작권|전자문제집\s*CBT\s*홈페이지|"
    r"기출문제\s*및\s*해설집\s*다운로드|전자문제집\s*CBT란"
)
# 머리글·꼬리말 잔재 (y 클립이 실패했을 때의 2차 방어)
HEADER_JUNK_RE = re.compile(r"본 해설집은|www\.comcbt\.com|전자문제집")

NEXT_Q_LEAK_RE = re.compile(r"\n\s*\d{1,3}\.\s")


@dataclass
class Line:
    text: str
    color: int
    page: int
    col: int
    x0: float
    y0: float
    x1: float
    y1: float

    @property
    def key(self) -> tuple:
        return (self.page, round(self.x0, 1), round(self.y0, 1), self.text)


# --- 저수준 추출 -------------------------------------------------------------

def _column_clips(page: fitz.Page, gutter: float | None) -> list[fitz.Rect]:
    r = page.rect
    top, bot = BODY_TOP, min(BODY_BOTTOM, r.y1)
    if gutter is None:
        return [fitz.Rect(r.x0, top, r.x1, bot)]
    return [fitz.Rect(r.x0, top, gutter, bot),
            fitz.Rect(gutter, top, r.x1, bot)]


def _dominant_color(spans: list[dict]) -> int:
    c: Counter[int] = Counter()
    for s in spans:
        c[s["color"]] += len(s["text"].strip())
    return c.most_common(1)[0][0] if c else QUESTION_COLOR


@dataclass
class Img:
    page: int
    col: int
    x0: float
    y0: float
    x1: float
    y1: float


def doc_lines(doc: fitz.Document) -> tuple[list[Line], list[Img]]:
    """좌→우 컬럼 순서의 줄 목록 + 페이지별 이미지 bbox.

    같은 좌표에 **똑같은 줄이 두 번 그려진** 곳이 있다(20220424 56번의
    '[해설작성자 : 제발 한번에 합격하고 싶어욤]'). 좌표+본문이 같으면 중복 인쇄로
    보고 하나만 남긴다 — 안 그러면 해설 본문이 두 배로 늘어난다.
    """
    gutter = pdfio.document_split_x(doc)
    out: list[Line] = []
    seen: set[tuple] = set()
    images: list[Img] = []
    for pno in range(doc.page_count):
        page = doc[pno]
        sx = gutter if gutter is not None else pdfio.column_split_x(page)

        def _add(bb: tuple[float, float, float, float]) -> None:
            cx = (bb[0] + bb[2]) / 2
            images.append(Img(pno, 0 if (sx is None or cx < sx) else 1,
                              bb[0], bb[1], bb[2], bb[3]))

        for info in page.get_image_info():
            _add(tuple(info["bbox"]))
        for d in page.get_drawings():
            r = d["rect"]
            if r.width > 60 and r.height > 24:
                _add((r.x0, r.y0, r.x1, r.y1))
        for ci, clip in enumerate(_column_clips(page, sx)):
            d = page.get_text("dict", clip=clip, sort=True)
            for blk in d["blocks"]:
                for ln in blk.get("lines", []):
                    spans = ln["spans"]
                    txt = "".join(s["text"] for s in spans)
                    if not txt.strip():
                        continue
                    bb = ln["bbox"]
                    line = Line(txt, _dominant_color(spans), pno, ci,
                                bb[0], bb[1], bb[2], bb[3])
                    if line.key in seen:
                        continue
                    seen.add(line.key)
                    out.append(line)
    return out, images


def _wrap_edges(lines: list[Line]) -> dict[int, float]:
    """컬럼별 '오른쪽 끝' x 좌표.

    줄바꿈이 **되돌림(wrap)** 인지 **문단 끊김** 인지를 가르는 유일하게 믿을 만한
    신호다. 한글 PDF 는 어절 중간에서도 그냥 잘리기 때문에(“…대한 설” / “명으로
    옳은 것은?”) 끝 공백 유무만으로는 판정할 수 없다. 오른쪽 끝까지 꽉 찬 줄이면
    다음 줄은 그 줄의 연속이다.
    """
    edges: dict[int, float] = {}
    for col in {ln.col for ln in lines}:
        xs = sorted(ln.x1 for ln in lines if ln.col == col)
        if not xs:
            continue
        edges[col] = xs[int(len(xs) * 0.92)] if len(xs) > 10 else xs[-1]
    return edges


def _join(lines: list[Line], edges: dict[int, float], tol: float = 8.0) -> str:
    """줄 목록 → 텍스트. 되돌림 줄은 이어 붙이고, 문단 끊김은 개행으로 남긴다.

    되돌림 판정 = (오른쪽 끝까지 꽉 찬 줄) 또는 (줄 끝이 공백으로 끝나는 줄).
    후자는 어절 경계에서 줄이 바뀔 때 PDF 가 공백을 남기는 성질을 쓴다.
    컬럼·페이지가 바뀌어도 본문은 그대로 이어지므로 경계를 예외로 두지 않는다.
    """
    parts: list[str] = []
    for i, ln in enumerate(lines):
        parts.append(ln.text)
        if i == len(lines) - 1:
            break
        edge = edges.get(ln.col)
        wrapped = ((edge is not None and ln.x1 >= edge - tol)
                   or ln.text.endswith((" ", "\xa0")))
        parts.append("" if wrapped else "\n")
    return "".join(parts)


# --- 문항 절단 ---------------------------------------------------------------

def _question_starts(lines: list[Line], upto: int = 100) -> list[tuple[int, int]]:
    """(줄 인덱스, 문항번호). 검정 줄 + 기대번호 상태기계."""
    out: list[tuple[int, int]] = []
    expected = 1
    for i, ln in enumerate(lines):
        if ln.color == EXPL_COLOR:
            continue
        m = QNUM_RE.match(ln.text)
        if m and _accepts(m.group(1), expected):
            out.append((i, expected))
            expected += 1
            if expected > upto:
                break
    return out


def _end_matter_cut(lines: list[Line], after: int) -> int:
    for i in range(after, len(lines)):
        if END_MATTER_RE.search(lines[i].text):
            return i
    return len(lines)


def _regions(lines: list[Line]) -> dict[tuple[int, int], tuple[float, float]]:
    """줄들이 실제로 점유한 (페이지, 컬럼) → y 범위.

    문항이 컬럼/페이지를 넘어가면 **중간 컬럼은 통째로** 그 문항 영역이다.
    첫 컬럼은 첫 줄부터 단 끝까지, 마지막 컬럼은 단 머리부터 마지막 줄까지로
    넓혀야 한다. 이걸 빼먹으면 새 단 머리에 얹힌 지문 상자(이미지)를 놓친다
    (20220424 99번·71번 등: 보기만 새 단으로 넘어가고 상자는 그 위에 있다).
    """
    keys: list[tuple[int, int]] = []
    span: dict[tuple[int, int], list[float]] = {}
    for ln in lines:
        k = (ln.page, ln.col)
        if k not in span:
            span[k] = [ln.y0, ln.y1]
            keys.append(k)
        span[k][0] = min(span[k][0], ln.y0)
        span[k][1] = max(span[k][1], ln.y1)
    out: dict[tuple[int, int], tuple[float, float]] = {}
    for i, k in enumerate(keys):
        y0, y1 = span[k]
        if i > 0:
            y0 = BODY_TOP
        if i < len(keys) - 1:
            y1 = BODY_BOTTOM
        out[k] = (y0, y1)
    return out


def _region_has_image(lines: list[Line], images: list[Img]) -> bool:
    """문항 영역 안에 이미지/큰 도형이 있는가.

    컬럼 판정은 거터 기준으로 이미 끝나 있다. 좌우 컬럼을 x 여유로 대충 가르면
    맞은편 컬럼의 그림을 자기 문항 것으로 오인한다.
    """
    regions = _regions(lines)
    for im in images:
        rng = regions.get((im.page, im.col))
        if rng and im.y1 > rng[0] + 1 and im.y0 < rng[1] - 1:
            return True
    return False


_BARE_MARK_RE = re.compile(r"^[\s\xa0]*[①-④][\s\xa0]*$")


def _choice_marks_are_images(lines: list[Line], images: list[Img]) -> bool:
    """선택지가 '마커만 글자, 내용은 그림'인 문항인가.

    관계대수 기호(σ π ⋈ ÷)·SQL 결과표·코드 조각이 보기로 나오는 문항은
    ①②③④ 마커만 텍스트로 찍히고 보기 내용은 래스터 이미지다. 텍스트 추출로는
    영원히 복구할 수 없다 — 파서 버그와 구분해서 표시해야 한다.
    """
    marks = [l for l in lines if _BARE_MARK_RE.match(l.text)]
    if len(marks) < 3:
        return False
    return _region_has_image(marks, images)


def _images_in(lines: list[Line], images: list[Img]) -> list[Img]:
    regions = _regions(lines)
    out = []
    for im in images:
        rng = regions.get((im.page, im.col))
        if rng and im.y1 > rng[0] + 1 and im.y0 < rng[1] - 1:
            out.append(im)
    return out


def capture_blocks(doc: fitz.Document, date: str, num: int,
                   lines: list[Line], images: list[Img],
                   pad: float = 5.0, dpi: int = 200) -> list[str]:
    """문항 영역을 PNG 로 크롭해 저장하고 상대경로 목록을 돌려준다.

    크롭 범위는 **그 컬럼의 글줄 + 그림 bbox 합집합**이다. 컬럼 전체를 잡으면
    앞뒤 문항이 딸려 들어오고, 그림 bbox 만 잡으면 보기 마커(①②③④)가 잘려서
    무엇의 그림인지 알 수 없게 된다.
    """
    hits = _images_in(lines, images)
    if not hits:
        return []
    groups: dict[tuple[int, int], list[float]] = {}
    order: list[tuple[int, int]] = []
    for ln in lines:
        k = (ln.page, ln.col)
        if k not in groups:
            groups[k] = [ln.x0, ln.y0, ln.x1, ln.y1]
            order.append(k)
        b = groups[k]
        b[0], b[1] = min(b[0], ln.x0), min(b[1], ln.y0)
        b[2], b[3] = max(b[2], ln.x1), max(b[3], ln.y1)
    for im in hits:
        k = (im.page, im.col)
        b = groups.setdefault(k, [im.x0, im.y0, im.x1, im.y1])
        if k not in order:
            order.append(k)
        b[0], b[1] = min(b[0], im.x0), min(b[1], im.y0)
        b[2], b[3] = max(b[2], im.x1), max(b[3], im.y1)

    hit_cols = {(im.page, im.col) for im in hits}
    out_dir = C.ASSETS / "s" / date
    out_dir.mkdir(parents=True, exist_ok=True)
    rels: list[str] = []
    n = 0
    for k in order:
        if k not in hit_cols:
            continue
        pno, _col = k
        x0, y0, x1, y1 = groups[k]
        page = doc[pno]
        bbox = (max(page.rect.x0, x0 - pad), max(BODY_TOP, y0 - pad),
                min(page.rect.x1, x1 + pad), min(BODY_BOTTOM, y1 + pad))
        if bbox[2] - bbox[0] < 10 or bbox[3] - bbox[1] < 10:
            continue
        n += 1
        name = f"{num:03d}.png" if n == 1 else f"{num:03d}_{n}.png"
        (out_dir / name).write_bytes(pdfio.crop_png(page, bbox, dpi=dpi))
        rels.append(f"assets/s/{date}/{name}")
    return rels


def _split_explanations(text: str, src_file: str) -> list[Explanation]:
    """해설 영역 → 작성자별 Explanation 목록.

    한 문항에 해설이 여러 개 달린다. `[해설작성자 : 닉]` 마커가 각 해설의 **끝**에
    붙으므로, 마커 직전까지가 그 작성자의 본문이다. 마지막 마커 뒤에 남은 꼬리는
    작성자 미상 해설로 따로 담는다(버리면 손실).
    """
    text = EXPL_HDR_RE.sub("", text)
    out: list[Explanation] = []
    pos = 0
    for m in AUTHOR_RE.finditer(text):
        body = strip_noise(text[pos:m.start()])
        author = strip_noise(m.group(1)) or None
        pos = m.end()
        if body:
            out.append(Explanation(kind="community", body=body,
                                   author=author, src_file=src_file))
    tail = strip_noise(text[pos:])
    if tail:
        out.append(Explanation(kind="community", body=tail,
                               author=None, src_file=src_file))
    return out


# --- 파서 본체 ---------------------------------------------------------------

def parse_book(date: str, rel: str) -> list[Item]:
    src = C.src(rel)
    src_file = src.name
    doc = pdfio.open_pdf(src)
    try:
        return _parse_open(doc, date, src.name)
    finally:
        doc.close()


def _parse_open(doc: fitz.Document, date: str, src_file: str) -> list[Item]:
    lines, images = doc_lines(doc)
    grid = answer_grid_doc(doc)

    edges = _wrap_edges(lines)
    starts = _question_starts(lines)
    cut = _end_matter_cut(lines, starts[-1][0] if starts else 0)

    # 과목 헤더('3과목 : 데이터베이스 구축')의 마지막 등장 위치 → 문항별 헤더 과목
    hdr_at: dict[int, int] = {}
    for i, ln in enumerate(lines):
        m = SUBJECT_HDR_RE.match(ln.text.strip())
        if m:
            hdr_at[i] = int(m.group(1))

    past = C.SOLUTION_TO_PAST.get(date)
    items: list[Item] = []
    for k, (li, num) in enumerate(starts):
        end = starts[k + 1][0] if k + 1 < len(starts) else cut
        chunk = lines[li:end]

        # 경계: <문제 해설> 줄 = 첫 파란 줄 (800문항 전부 일치 확인)
        hdr_i = next((j for j, l in enumerate(chunk)
                      if EXPL_HDR_RE.search(l.text)), None)
        blue_i = next((j for j, l in enumerate(chunk)
                       if l.color == EXPL_COLOR), None)
        flags: list[str] = []
        if hdr_i is None:
            bnd = blue_i if blue_i is not None else len(chunk)
            flags.append("no_explanation_header")
        else:
            bnd = hdr_i
            if blue_i is not None and blue_i != hdr_i:
                bnd = min(hdr_i, blue_i)
                flags.append("expl_boundary_disagree")

        # 과목 헤더는 다음 문항 앞(=직전 문항 청크 끝)에 끼어든다. 두 영역 모두에서 뺀다.
        q_lines = [l for l in chunk[:bnd]
                   if not SUBJECT_HDR_RE.match(l.text.strip())
                   and not END_MATTER_RE.search(l.text)]
        e_lines = [l for l in chunk[bnd:]
                   if not SUBJECT_HDR_RE.match(l.text.strip())
                   and not END_MATTER_RE.search(l.text)]

        body = _join(q_lines, edges)
        body = QNUM_RE.sub("", body, count=1)
        stem, choices = parse_choices(body)
        stem = strip_noise(stem)
        choices = [strip_noise(c) for c in choices]

        # 🔥 코드·SQL·표 블록이 **래스터 이미지**로 박혀 있다. 텍스트로는 회수 불가.
        #    지문 영역 안에 이미지가 있으면 지문이 불완전하다는 뜻이므로 반드시 남긴다.
        blocks: list[Block] = []
        if q_lines and _region_has_image(q_lines, images):
            flags.append("stem_image_block")
        if _choice_marks_are_images(q_lines, images):
            flags.append("choices_image")
        if flags and {"stem_image_block", "choices_image"} & set(flags):
            # 텍스트는 지우지 않는다. 이미지는 사라진 부분을 **보태는** 것이다.
            rels = capture_blocks(doc, date, num, q_lines, images)
            if rels:
                blocks.append(Block(type="text", value=stem))
                blocks.extend(Block(type="image", src=r) for r in rels)
            else:
                flags.append("capture_failed")

        expls = _split_explanations(_join(e_lines, edges), src_file)

        subj_pos = subject_from_number(num)
        subj_hdr = None
        for hi, sv in hdr_at.items():
            if hi <= li:
                subj_hdr = sv
        if subj_hdr is not None and subj_hdr != subj_pos:
            flags.append("subject_header_mismatch")

        rnd: dict[str, object] = {"date": date}
        if past:
            rnd["year"], rnd["session"] = past

        ans = grid.get(num)
        it = Item(
            id=solution_id(date, num),
            source="solution_book",
            stem=stem,
            choices=choices,
            answer=ans,
            answer_src="solution_book" if ans else None,
            subject=subj_pos,
            subject_src="position",
            number=num,
            round=rnd,
            origin={"file": src_file, "page": chunk[0].page + 1 if chunk else None},
            stem_blocks=blocks,
            explanations=expls,
            hash=item_hash(stem, choices),
            stem_hash=stem_hash(stem),
            flags=flags,
        )
        if ans is None:
            it.flag("no_answer")
        if not expls:
            it.flag("no_explanation")
        if it.flags:
            it.confidence = 0.9
        items.append(it)
    return items


def parse_all() -> list[Item]:
    out: list[Item] = []
    for date, rel in C.SOLUTION_BOOKS:
        out.extend(parse_book(date, rel))
    return out


# --- 끝머리 정답 격자 --------------------------------------------------------

_NUM_ONLY = re.compile(r"^\d{1,3}$")
_MARK_ONLY = re.compile(r"^[①-④]$")


def answer_grid_doc(doc: fitz.Document) -> dict[int, int]:
    """마지막 페이지 정답 격자 → {문항번호: 1-based 정답}.

    격자는 **숫자행 / 기호행이 교대로** 쌓인 표다(1~10 / ①…, 11~20 / ②…).
    y 로 행을 묶고, '전부 숫자인 행' 바로 다음 '전부 기호이고 칸 수가 같은 행'을
    짝지어 x 순서로 대응시킨다. 셀 하나만 밀려도 칸 수가 안 맞아 그 행이 통째로
    버려지므로, 조용히 어긋나는 대신 검출 수가 줄어드는 쪽으로 실패한다.
    """
    cells: list[tuple[int, float, float, str]] = []
    for pno in range(max(0, doc.page_count - 2), doc.page_count):
        for s in doc[pno].get_text("dict", sort=True)["blocks"]:
            for ln in s.get("lines", []):
                for sp in ln["spans"]:
                    t = sp["text"].strip()
                    if _NUM_ONLY.match(t) or _MARK_ONLY.match(t):
                        cells.append((pno, round(sp["bbox"][1], 0),
                                      sp["bbox"][0], t))

    rows: dict[tuple[int, float], list[tuple[float, str]]] = {}
    for pno, y, x, t in cells:
        rows.setdefault((pno, y), []).append((x, t))
    ordered = [(k, sorted(v)) for k, v in sorted(rows.items())]

    out: dict[int, int] = {}
    for i in range(len(ordered) - 1):
        (p0, _), a = ordered[i]
        (p1, _), b = ordered[i + 1]
        if p0 != p1 or len(a) != len(b) or len(a) < 5:
            continue
        if not all(_NUM_ONLY.match(t) for _, t in a):
            continue
        if not all(_MARK_ONLY.match(t) for _, t in b):
            continue
        for (_, n), (_, mk) in zip(a, b):
            v = int(n)
            if 1 <= v <= 100:
                out[v] = "①②③④".index(mk) + 1
    return out


def answer_grid(date: str, rel: str) -> dict[int, int]:
    doc = pdfio.open_pdf(C.src(rel))
    try:
        return answer_grid_doc(doc)
    finally:
        doc.close()


def past_exam_key(year: int, session: int) -> dict[int, int]:
    """기출 원본 정답표. 격자 판독을 **외부 근거로** 검증하기 위한 것."""
    rel = next((r for y, s, r in C.PAST_EXAMS if (y, s) == (year, session)), None)
    if rel is None:
        return {}
    doc = pdfio.open_pdf(C.src(rel))
    try:
        return parse_answer_key(doc)
    finally:
        doc.close()


# --- 검증 -------------------------------------------------------------------

DIRTY_Q = ("<문제 해설>", "[해설작성자", "오답피하기")


def _audit(items: list[Item]) -> tuple[dict[str, dict], list[str]]:
    by_date: dict[str, list[Item]] = {}
    for it in items:
        by_date.setdefault(it.round["date"], []).append(it)

    stats: dict[str, dict] = {}
    errors: list[str] = []
    for date, group in by_date.items():
        nums = [i.number for i in group]
        dup = [n for n, c in Counter(nums).items() if c > 1]
        miss = [n for n in range(1, 101) if n not in set(nums)]
        if len(group) != 100:
            errors.append(f"{date}: 문항 {len(group)}개 (100 아님)")
        if dup:
            errors.append(f"{date}: 번호 중복 {dup}")
        if miss:
            errors.append(f"{date}: 번호 결손 {miss}")

        leak = dirty = hdr = badc = badstem = 0
        img_stem = img_choice = 0
        n_expl = 0
        with_expl = 0
        for it in group:
            fields = [it.stem] + it.choices
            if any(NEXT_Q_LEAK_RE.search(f) for f in fields):
                leak += 1
                errors.append(f"{it.id}: 다음 문항 누수")
            if any(k in f for f in fields for k in DIRTY_Q):
                dirty += 1
                errors.append(f"{it.id}: 지문/선택지에 해설 혼입")
            if HEADER_JUNK_RE.search(it.stem):
                hdr += 1
                errors.append(f"{it.id}: 지문에 머리글 오염")
            img_stem += "stem_image_block" in it.flags
            img_choice += "choices_image" in it.flags
            # 보기 내용이 이미지인 문항은 원본 결함이다(추출 버그 아님).
            # 그 경우에만 빈 보기를 허용하고, 그 외에는 즉시 FAIL 시킨다.
            empty = [i for i, c in enumerate(it.choices, 1) if len(c) < 1]
            if len(it.choices) != 4:
                badc += 1
                errors.append(f"{it.id}: 선택지 {len(it.choices)}개")
            elif empty and "choices_image" not in it.flags:
                badc += 1
                errors.append(f"{it.id}: 빈 선택지 {empty}")
            if len(it.stem) < 5:
                badstem += 1
                errors.append(f"{it.id}: 지문 {len(it.stem)}자")
            n_expl += len(it.explanations)
            with_expl += 1 if it.explanations else 0

        ratio = with_expl / len(group) if group else 0.0
        if ratio < 0.90:
            errors.append(f"{date}: 해설 보유율 {ratio:.1%} < 90%")

        # --- 정답 게이트 ---------------------------------------------------
        answered = [it for it in group if it.answer is not None]
        if len(answered) != 100:
            missing = sorted(it.number for it in group if it.answer is None)
            errors.append(f"{date}: answer 미충전 {len(group)-len(answered)}건 {missing}")
        for it in group:
            if it.answer is not None and not 1 <= it.answer <= 4:
                errors.append(f"{it.id}: answer 범위 이탈 {it.answer}")
            if (it.answer is None) != ("no_answer" in it.flags):
                errors.append(f"{it.id}: answer/no_answer 플래그 불일치")
        dist = Counter(it.answer for it in answered)
        # 한 보기에 정답이 쏠렸다면 격자 행 정렬이 밀린 것이다 — 조용히 통과시키지 않는다.
        share = {k: dist.get(k, 0) / max(1, len(answered)) for k in (1, 2, 3, 4)}
        for k, v in share.items():
            if not 0.15 <= v <= 0.35:
                errors.append(f"{date}: 정답 {k}번 비율 {v:.1%} (15~35% 밖)")

        # --- 2022 두 회차: 기출 원본 정답표와 강제 대조 ----------------------
        past = C.SOLUTION_TO_PAST.get(date)
        xcheck = None
        if past:
            key = past_exam_key(*past)
            bad = [(n, key[n], g.answer)
                   for n in sorted(key)
                   for g in [next((i for i in group if i.number == n), None)]
                   if g is not None and g.answer != key[n]]
            filled = [n for n in range(1, 101) if n not in key]
            xcheck = (len(key), len(bad), filled)
            if bad:
                errors.append(f"{date}: 기출 {past[0]}-{past[1]} 정답표와 불일치 {bad}")

        stats[date] = dict(n=len(group), expl=n_expl, with_expl=with_expl,
                           ratio=ratio, leak=leak, dirty=dirty, hdr=hdr,
                           badc=badc, badstem=badstem,
                           img_stem=img_stem, img_choice=img_choice,
                           ans=len(answered), dist=dist, xcheck=xcheck,
                           blocks=sum(1 for it in group if it.stem_blocks),
                           pngs=sum(len([b for b in it.stem_blocks
                                         if b.type == "image"]) for it in group),
                           authors=len({e.author for it in group
                                        for e in it.explanations if e.author}),
                           flags=sum(1 for it in group if it.flags))
    return stats, errors


def _sample(items: list[Item], k: int = 5, seed: int = 7) -> None:
    rnd = random.Random(seed)
    print()
    print("=" * 78)
    print(f"육안 검수 표본 {k}문항")
    print("=" * 78)
    for it in rnd.sample(items, k):
        print(f"\n[{it.id}]  {it.number}번 / {it.subject}과목 "
              f"({C.SUBJECT_NAMES[it.subject]})  해설 {len(it.explanations)}개")
        print(f"  지문: {it.stem[:300]}")
        for i, c in enumerate(it.choices, 1):
            print(f"    {'①②③④'[i-1]} {c[:120]}")
        for e in it.explanations[:2]:
            print(f"  해설[{e.author}]: {e.body[:220]}")


def main() -> int:
    items = parse_all()
    stats, errors = _audit(items)

    print("=" * 78)
    print("해설집 8회 추출 — 문항 · 해설 · 오염 검사")
    print("=" * 78)
    print(f"{'회차':<11}{'문항':>5}{'해설수':>7}{'해설보유':>9}{'작성자':>7}"
          f"{'누수':>6}{'해설혼입':>9}{'머리글':>7}{'선택지불량':>11}{'지문':>6}"
          f"{'지문그림':>9}{'보기그림':>9}")
    for date, _ in C.SOLUTION_BOOKS:
        s = stats.get(date)
        if not s:
            print(f"{date:<11}  (없음)")
            continue
        print(f"{date:<11}{s['n']:>5}{s['expl']:>7}"
              f"{s['with_expl']:>6}/{s['n']:<3}{s['authors']:>6}"
              f"{s['leak']:>6}{s['dirty']:>9}{s['hdr']:>7}"
              f"{s['badc']:>11}{s['badstem']:>6}"
              f"{s['img_stem']:>9}{s['img_choice']:>9}")
    tot_e = sum(s["expl"] for s in stats.values())
    print(f"{'합계':<11}{len(items):>5}{tot_e:>7}"
          f"{'':>15}{sum(s['leak'] for s in stats.values()):>6}"
          f"{sum(s['dirty'] for s in stats.values()):>9}"
          f"{sum(s['hdr'] for s in stats.values()):>7}"
          f"{sum(s['badc'] for s in stats.values()):>11}"
          f"{sum(s['badstem'] for s in stats.values()):>6}"
          f"{sum(s['img_stem'] for s in stats.values()):>9}"
          f"{sum(s['img_choice'] for s in stats.values()):>9}")

    fl = Counter(f for it in items for f in it.flags)
    print()
    print(f"과목: 전 문항 subject_src=position. 헤더('N과목 : …')와 불일치 "
          f"{fl.get('subject_header_mismatch', 0)}건.")
    print(f"플래그 집계: {dict(fl) or '없음'}")
    print("  stem_image_block / choices_image = 원본이 코드·표·기호를 **래스터 이미지**로"
          " 넣은 문항. 텍스트 추출로는 복구 불가 — 파서 결함이 아니다.")

    print()
    print("=" * 78)
    print("정답 충전 (끝머리 격자) + 캡처")
    print("=" * 78)
    print(f"{'회차':<11}{'answer':>9}{'①':>6}{'②':>6}{'③':>6}{'④':>6}"
          f"{'기출대조':>16}{'캡처문항':>10}{'PNG':>6}")
    for date, _ in C.SOLUTION_BOOKS:
        s = stats[date]
        d = s["dist"]
        xc = s["xcheck"]
        if xc is None:
            tag = "-"
        else:
            n_key, n_bad, filled = xc
            tag = f"{n_key - n_bad}/{n_key}" + (f" +{len(filled)}보완" if filled else "")
        print(f"{date:<11}{s['ans']:>6}/100{d.get(1,0):>6}{d.get(2,0):>6}"
              f"{d.get(3,0):>6}{d.get(4,0):>6}{tag:>16}"
              f"{s['blocks']:>10}{s['pngs']:>6}")
    print(f"{'합계':<11}{sum(s['ans'] for s in stats.values()):>6}/800"
          f"{'':>24}{'':>16}{sum(s['blocks'] for s in stats.values()):>10}"
          f"{sum(s['pngs'] for s in stats.values()):>6}")
    print("  기출대조 = 해설집 격자 vs 기출 원본 정답표 일치수 / 원본 정답표 보유수.")
    print("  '+N보완' = 기출 원본 정답표가 공란인 문항을 격자가 채워준 수"
          " (2022-2회 5번 = smoke.py KNOWN_SOURCE_DEFECTS).")

    _sample(items)

    print()
    if errors:
        print("=" * 78)
        print(f"위반 {len(errors)}건")
        for e in errors[:40]:
            print("  -", e)
        if len(errors) > 40:
            print(f"  ... 외 {len(errors)-40}건")
        print("=" * 78)
        print("SOLUTION_BOOK EXTRACT: FAIL")
        return 1

    n = dump_items(items, OUT)
    n_ans = sum(1 for it in items if it.answer is not None)
    n_png = sum(len([b for b in it.stem_blocks if b.type == "image"]) for it in items)
    print("=" * 78)
    print(f"SOLUTION_BOOK EXTRACT: PASS — {n}문항 · 정답 {n_ans} · 해설 {tot_e}개 "
          f"· 캡처 {n_png}장")
    print(f"  items → {OUT}")
    print(f"  assets → {C.ASSETS / 's'}")
    print("=" * 78)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

"""주제별 문제집 5종 파서 — 정답은 **초록(0x008000) 색상 마킹**이 진실이다.

이 파서의 존재 이유는 정답이다. 해설집 600문항에는 정답이 없고, Phase 2에서
해시 매칭으로 정답을 회수한다. 그 회수원이 여기서 뽑는 668개의 (지문, 정답) 쌍이다.
따라서 형식 통과보다 **정답이 한 칸 밀리지 않았는가**가 훨씬 중요하다.

--- 정찰로 확정한 사실 ------------------------------------------------------
1. 5종 전부 1단. `pdfio.column_split_x()` 는 None 을 준다(정상).

2. 🔥 텍스트는 `get_text("text", sort=True)` 대신 **rawdict 문자 단위 재조립**을 쓴다.
   이 PDF들은 한 줄을 여러 텍스트 오브젝트로 쪼개 그리는데, 괄호·쉼표가
   본문 span 의 bbox **안쪽** x좌표에 따로 놓인다. span/블록 단위로 정렬하면
       "서브타입상속받은(     하위 클래스은)"
   처럼 괄호가 엉뚱한 자리로 간다. 문자 origin.x 로 정렬하면
       "서브타입(상속받은 하위 클래스)은"
   가 되고, C 코드의 들여쓰기 공백도 그대로 살아난다.

3. 🔥 정답 = 선택지 **마커 글리프('①'~'④')의 색상**. 정답 선택지는 마커까지
   통째로 초록(32768)이다. 본문 텍스트 색만 보면 안 된다 —
   `wrong` 은 정답 선택지 문장 전체가 초록이고, `calc`/`code` 는 해설 본문
   곳곳이 초록이라 "초록 span 수 > 문항 수"가 된다(예: wrong 733개 vs 197문항).

4. 🔥 마커 판별은 **왼쪽 여백 x0≈56.6** 으로 게이트한다. 지문 안의 보기 인용
   (x0 65/74/82/89/100/187…)과 해설 안의 마커를 이걸로 전부 배제하면
   마커 수가 정확히 4×문항수가 된다(calc 164, code 228, wrong 788,
   keyword 1036, kinds 456). 게이트 없이 4개씩 끊으면 calc/code/wrong 이 밀린다.

5. 🔥 문항 시작 검출도 **줄 단위**여야 한다. span 단위로 하면 calc 5번이
   '5' + '. ' 두 span 으로 쪼개져 안 잡히고, qdetect._accepts 의 앞자리 관용
   때문에 9페이지의 '15.' 를 5번으로 오인해 이후 전체가 붕괴한다.
   그래서 여기서는 **정확 일치**만 승인한다(주제별 문제집은 머리글 글리프 누수가 없다).

6. 🔥 config 의 has_expl 플래그는 `wrong`/`kinds` 에서 틀렸다.
   실측: calc 41/41, code 57/57, wrong 197/197, kinds 114/114 문항에 `[해설]`이 있고
   해설이 진짜 없는 건 `keyword` 뿐이다. config 는 읽기 전용이므로 고치지 않고,
   **실측 기준으로 해설을 뽑되** 불일치를 리포트에 찍는다. 해설을 버리면
   409문항의 해설이 사라지고, 남겨두면 지문에 해설이 섞인다 — 둘 다 손해다.

7. 페이지마다 동일한 워터마크 이미지(bbox 187.8,296.6,407.4,516.8)가 깔려 있다.
   빼지 않으면 `graphic_density` 가 거의 모든 문항에서 1을 돌려줘 도형 판별이 무의미해진다.

8. 🔥 `code` 의 일부 문항은 선택지가 **테두리 상자**로 그려지고, 마커는 상자
   **바깥 왼쪽 아래**에 붙는다(여러 줄 콘솔 출력을 보기로 주는 문항).
   즉 보기 내용이 자기 마커보다 **위쪽 y** 에 있다. 마커→다음마커 구간으로
   자르면 보기가 통째로 한 칸씩 밀린다(정답 색은 맞는데 텍스트만 틀리는,
   형식 검증을 조용히 통과하는 최악의 오류다).
   테두리는 선분 4개로 따로 그려지므로 drawings 를 연결요소로 묶어 상자를 복원하고,
   **문자 x/y 를 상자에 넣어** 보기를 배정한다. 이때 줄바꿈은 보존해야 한다
   (① "대한민국" 과 ② "대\\n한\\n민\\n국" 을 붙여 쓰면 같은 보기가 된다).
"""
from __future__ import annotations

import re
import sys
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

import config as C  # noqa: E402
from common import pdfio  # noqa: E402
from common.normalize import (MARK_TO_IDX, item_hash, stem_hash,  # noqa: E402
                              strip_noise)
from common.qdetect import QNUM_RE  # noqa: E402
from common.schema import (Block, Explanation, Item, dump_items,  # noqa: E402
                           topic_id)

OUT = C.INTERIM / "topic_book.json"
ASSET_ROOT = C.ASSETS / "t"

MARKS = "①②③④"
EXPL_RE = re.compile(r"^\s*\[\s*해\s*설\s*\]\s*")
BULLET_RE = re.compile(r"^\s*[•·▪◦※∙❶-❿①-⑳●■•]")
LEAK_RE = re.compile(r"\n\s*\d{1,3}\.\s")

# 본문 좌측 여백. 문항번호와 선택지 마커만 여기서 시작한다.
MARGIN_X = 56.6
MARGIN_TOL = 2.0
LINE_H = 16.0          # 10pt 본문의 행간(실측 15.9~16.1)
SPACE_W = 4.8          # 위치 들여쓰기 → 공백 개수 환산용


# --- 문자 단위 줄 재조립 ----------------------------------------------------

@dataclass
class Line:
    page: int
    y: float
    x0: float
    top: float
    bot: float
    text: str
    chars: list = field(repr=False, default_factory=list)  # (x, ch, color)

    @property
    def mark(self) -> str | None:
        """왼쪽 여백에서 시작하는 선택지 마커면 그 문자."""
        if abs(self.x0 - MARGIN_X) > MARGIN_TOL:
            return None
        s = self.text.lstrip()
        return s[0] if s[:1] in MARKS else None

    @property
    def mark_is_green(self) -> bool:
        for _x, ch, color in self.chars:
            if ch in MARKS:
                return color == C.GREEN
        return False


def char_lines(page, pno: int, ytol: float = 3.0) -> list[Line]:
    """rawdict 문자 → baseline 클러스터링 → x 정렬 재조립."""
    d = page.get_text("rawdict")
    chars = []
    for b in d["blocks"]:
        for ln in b.get("lines", []):
            for s in ln["spans"]:
                for ch in s["chars"]:
                    chars.append((ch["origin"][1], ch["origin"][0], ch["c"],
                                  s["color"], ch["bbox"]))
    chars.sort(key=lambda c: (c[0], c[1]))

    groups: list[tuple[float, list]] = []
    for c in chars:
        if groups and abs(c[0] - groups[-1][0]) <= ytol:
            groups[-1][1].append(c)
        else:
            groups.append((c[0], [c]))

    out: list[Line] = []
    for y, cs in groups:
        cs.sort(key=lambda c: c[1])
        txt = "".join(c[2] for c in cs).rstrip()
        if not txt.strip():
            continue
        out.append(Line(
            page=pno, y=y, x0=cs[0][1],
            top=min(c[4][1] for c in cs), bot=max(c[4][3] for c in cs),
            text=txt, chars=[(c[1], c[2], c[3]) for c in cs],
        ))
    return out


# --- 텍스트 조립 ------------------------------------------------------------

def _wrap_join(a: str, b: str) -> str:
    """줄바꿈으로 끊긴 한 문장을 잇는다. 한글은 공백 없이, 라틴은 공백으로."""
    if not a:
        return b
    if not b:
        return a
    if a[-1].isascii() and a[-1].isalnum() and b[0].isascii() and b[0].isalnum():
        return a + " " + b
    return a + b


def paragraphs(lines: list[Line]) -> list[str]:
    """줄 목록 → 문단 목록.

    같은 들여쓰기로 이어지는 줄은 한 문장의 접힘(wrap)으로 보고 이어 붙이고,
    x0 이 바뀌거나 세로 간격이 벌어지거나 글머리표로 시작하면 새 문단으로 끊는다.
    이렇게 해야 `\\n` 이 '진짜 블록 경계'에만 남아 누수 검사가 의미를 갖는다.
    """
    paras: list[str] = []
    base_x: float | None = None
    prev: Line | None = None
    for ln in lines:
        new = (
            prev is None
            or ln.page != prev.page
            or (ln.top - prev.bot) > LINE_H * 0.75
            or base_x is None or abs(ln.x0 - base_x) > 3.0
            or BULLET_RE.match(ln.text) is not None
        )
        if new:
            paras.append(ln.text.strip())
            base_x = ln.x0
        else:
            paras[-1] = _wrap_join(paras[-1], ln.text.strip())
        prev = ln
    return [p for p in paras if p.strip()]


def _code_text(lines: list[Line]) -> str:
    """코드 블록 원문. 줄바꿈·들여쓰기를 절대 뭉개지 않는다."""
    base = min(ln.x0 for ln in lines)
    out = []
    for ln in lines:
        pad = int(round((ln.x0 - base) / SPACE_W)) if ln.x0 - base > 2.0 else 0
        out.append(" " * pad + ln.text)
    return "\n".join(out)


def _guess_lang(code: str) -> str | None:
    c = code
    if "#include" in c or re.search(r"\bprintf\s*\(", c):
        return "c"
    if "System.out" in c or re.search(r"\b(public|class)\s+\w", c):
        return "java"
    if re.search(r"\bdef\s+\w+\s*\(", c) or re.search(r"^\s*print\s*\(", c, re.M):
        return "python"
    if re.search(r"\b(SELECT|UPDATE|DELETE|CREATE|GRANT|REVOKE)\b", c, re.I):
        return "sql"
    return None


# --- 도형 · 표 --------------------------------------------------------------

def watermark_rects(doc) -> list[tuple[float, float, float, float]]:
    """모든 페이지에 반복되는 이미지 = 워터마크. 도형 판별에서 제외한다."""
    cnt: Counter = Counter()
    for i in range(doc.page_count):
        for info in doc[i].get_image_info():
            cnt[tuple(round(v, 1) for v in info["bbox"])] += 1
    half = max(2, doc.page_count // 2)
    return [b for b, n in cnt.items() if n >= half]


def graphic_score(page, bbox, wms) -> tuple[int, int, int]:
    """(그림 수, 선분 수, graphic_density 원값) — 워터마크는 뺀다.

    ⚠ `pdfio.graphic_density` 는 `fitz.Rect.intersects` 로 세는데, 표 테두리처럼
      폭·높이가 0인 선분 path 는 **빈 사각형**이라 intersects 가 항상 False 다.
      즉 표 격자선이 한 줄도 안 세어지고 머리행 음영('f') 만 잡힌다.
      그 값 하나로 문턱을 넘기려 하면 표 문항이 통째로 누락되므로,
      선분을 1pt 부풀려서 따로 센다.
    """
    import fitz
    r = fitz.Rect(*bbox)
    raw = pdfio.graphic_density(page, bbox)
    wm_hit = 0
    n_img = 0
    for info in page.get_image_info():
        b = tuple(round(v, 1) for v in info["bbox"])
        if not r.intersects(fitz.Rect(info["bbox"])):
            continue
        if b in wms:
            wm_hit += 1
        else:
            n_img += 1
    n_seg = 0
    for d in page.get_drawings():
        q = fitz.Rect(d["rect"])
        q.normalize()
        if r.intersects(fitz.Rect(q.x0 - 1, q.y0 - 1, q.x1 + 1, q.y1 + 1)):
            n_seg += 1
    return n_img, n_seg, raw - wm_hit


# 그림 1장이면 무조건, 선분은 단순 인용상자(테두리 4변 = 8 path)를 넘겨야 한다.
GRAPHIC_SEG_MIN = 10


# --- 테두리 상자 복원 -------------------------------------------------------

def page_boxes(page, min_w: float = 20.0, min_h: float = 18.0) -> list:
    """선분으로 흩어진 테두리를 연결요소로 묶어 사각형으로 되살린다.

    ⚠ 테두리는 폭 0(수직선)·높이 0(수평선)인 path 로 들어온다. PyMuPDF 의
      `Rect.intersects` 는 **빈 사각형에 대해 무조건 False** 라서, 그대로 묶으면
      아무것도 병합되지 않고 상자가 하나도 복원되지 않는다. 1pt 부풀려서 넣는다.
    """
    import fitz
    comps: list = []
    for d in page.get_drawings():
        r = fitz.Rect(d["rect"])
        r.normalize()
        comps.append(fitz.Rect(r.x0 - 1, r.y0 - 1, r.x1 + 1, r.y1 + 1))
    changed = True
    while changed:
        changed = False
        for i in range(len(comps)):
            for j in range(len(comps) - 1, i, -1):
                if comps[i].intersects(comps[j]):
                    comps[i].include_rect(comps.pop(j))
                    changed = True
    return [c for c in comps if c.width >= min_w and c.height >= min_h]


# --- 본체 ------------------------------------------------------------------

def parse_book(key: str, expect: int, has_expl: bool, rel: str) -> list[Item]:
    doc = pdfio.open_pdf(C.src(rel))
    wms = watermark_rects(doc)

    lines: list[Line] = []
    boxes: dict[int, list] = {}
    for i in range(doc.page_count):
        lines.extend(char_lines(doc[i], i))
        boxes[i] = page_boxes(doc[i])

    # 문항 시작 — 기대번호 상태기계 + 좌측 여백 게이트 + 정확 일치
    starts: list[tuple[int, int]] = []
    nxt = 1
    for idx, ln in enumerate(lines):
        if abs(ln.x0 - MARGIN_X) > MARGIN_TOL:
            continue
        m = QNUM_RE.match(ln.text)
        if m and m.group(1) == str(nxt):
            starts.append((idx, nxt))
            nxt += 1
            if nxt > expect:
                break

    bounds = [s[0] for s in starts] + [len(lines)]
    items: list[Item] = []

    for qi, (start, num) in enumerate(starts):
        seg = lines[start:bounds[qi + 1]]
        it = Item(id=topic_id(key, num), source="topic_book", stem="",
                  choices=[], number=num, subject=None,
                  tags=[f"topic:{key}"],
                  origin={"book": key, "pdf": rel, "page": seg[0].page + 1})

        mk = [j for j, ln in enumerate(seg) if ln.mark]
        if len(mk) != 4 or "".join(seg[j].mark for j in mk) != MARKS:
            it.flag("choice_marker_broken")
            mk = mk[:4]

        # 해설 경계 — 마지막 선택지 이후에서만 찾는다
        e_at = None
        scan_from = mk[-1] if mk else 0
        for j in range(scan_from, len(seg)):
            if EXPL_RE.match(seg[j].text):
                e_at = j
                break
        tail = e_at if e_at is not None else len(seg)

        # 🔥 상자형 보기 판정: 마커 4개가 각기 다른 테두리 상자의 y범위 안에
        #    들어가고 상자가 마커 오른쪽에 있으면, 보기 내용은 마커 '위쪽'이다.
        cboxes = _choice_boxes(seg, mk, boxes)
        consumed: set[int] = set()
        if cboxes:
            it.flag("boxed_choices")

        # --- 지문 -----------------------------------------------------------
        if cboxes:
            for bx in cboxes:
                for j, ln in enumerate(seg[:tail]):
                    if bx.y0 - 2 <= ln.y <= bx.y1 + 2 and ln.x0 >= bx.x0 - 3:
                        consumed.add(j)
        stem_end = mk[0] if mk else tail
        stem_lines = [ln for j, ln in enumerate(seg[:stem_end])
                      if j not in consumed]
        if stem_lines:
            first = stem_lines[0]
            stripped = QNUM_RE.sub("", first.text, count=1)
            stem_lines[0] = Line(first.page, first.y, first.x0, first.top,
                                 first.bot, stripped, first.chars)

        blocks: list[Block] = []
        if key == "code":
            # 좌측 여백(56.6)의 산문 / 들여쓴 블록(64.6+)의 코드로 나뉜다.
            run: list[Line] = []
            run_is_code = None
            for ln in stem_lines:
                is_code = ln.x0 > MARGIN_X + MARGIN_TOL
                if run_is_code is None or is_code == run_is_code:
                    run.append(ln)
                    run_is_code = is_code
                else:
                    blocks.append(_mkblock(run, run_is_code))
                    run, run_is_code = [ln], is_code
            if run:
                blocks.append(_mkblock(run, run_is_code))
        else:
            for p in paragraphs(stem_lines):
                blocks.append(Block(type="text", value=p))

        # 코드 블록은 정리 함수를 태우지 않는다 — 들여쓰기가 정답을 좌우한다.
        stem = "\n".join(b.value if b.type == "code" else _clean_stem(b.value)
                         for b in blocks if b.value.strip())

        # --- 선택지 ----------------------------------------------------------
        choices: list[str] = []
        if cboxes:
            for bx in cboxes:
                rows = []
                for ln in seg[:tail]:
                    if not (bx.y0 - 2 <= ln.y <= bx.y1 + 2):
                        continue
                    t = "".join(ch for x, ch, _c in ln.chars
                                if bx.x0 - 3 <= x <= bx.x1 + 3).strip()
                    if t:
                        rows.append(t)
                choices.append("\n".join(strip_noise(r) for r in rows))
        else:
            for i, j in enumerate(mk):
                end = mk[i + 1] if i + 1 < len(mk) else tail
                body = list(seg[j:end])
                body[0] = Line(body[0].page, body[0].y, body[0].x0, body[0].top,
                               body[0].bot, body[0].text.lstrip()[1:],
                               body[0].chars)
                txt = ""
                for ln in body:
                    txt = _wrap_join(txt, ln.text.strip())
                choices.append(strip_noise(txt))
        while len(choices) < 4:
            choices.append("")
        it.choices = choices[:4]

        # --- 정답: 초록 마커 ---------------------------------------------------
        greens = [seg[j].mark for j in mk if seg[j].mark_is_green]
        if len(greens) == 1:
            it.answer = MARK_TO_IDX[greens[0]]
            it.answer_src = "color_mark"
        else:
            it.answer = None
            it.flag("green_none" if not greens else "green_multi")
            it.confidence = 0.0

        # --- 해설 -------------------------------------------------------------
        if e_at is not None:
            body = list(seg[e_at:])
            body[0] = Line(body[0].page, body[0].y, body[0].x0, body[0].top,
                           body[0].bot, EXPL_RE.sub("", body[0].text), body[0].chars)
            body = [ln for ln in body if ln.text.strip()]
            expl = "\n".join(paragraphs(body))
            expl = strip_noise(expl)
            if expl:
                it.explanations = [Explanation(kind="topicbook", body=expl,
                                               src_file=rel)]
        if has_expl and not it.explanations:
            it.flag("expl_missing")

        # --- 표/도형 ----------------------------------------------------------
        if stem_lines and mk:
            top = stem_lines[0].top - 5
            # 상자형 보기는 내용이 마커보다 위에 있다 → 마커 y로 자르면 보기가 딸려 온다.
            bot = (min(b.y0 for b in cboxes) - 4 if cboxes
                   else seg[mk[0]].top - 4)
            pg_no = stem_lines[0].page
            if seg[mk[0]].page == pg_no and bot > top + 4:
                bbox = (45.0, top, 555.0, bot)
                n_img, n_seg, _raw = graphic_score(doc[pg_no], bbox, wms)
                if n_img >= 1 or n_seg >= GRAPHIC_SEG_MIN:
                    d = ASSET_ROOT / key
                    d.mkdir(parents=True, exist_ok=True)
                    f = d / f"{num:03d}.png"
                    f.write_bytes(pdfio.crop_png(doc[pg_no], bbox))
                    blocks.append(Block(type="image",
                                        src=str(f.relative_to(C.INTERIM)).replace("\\", "/")))
                    it.flag("has_graphic")

        it.stem = stem
        it.stem_blocks = blocks
        it.hash = item_hash(stem, it.choices)
        it.stem_hash = stem_hash(stem)
        items.append(it)

    doc.close()
    return items


def _choice_boxes(seg: list[Line], mk: list[int], boxes: dict[int, list]):
    """마커 4개가 각각 '오른쪽 테두리 상자'에 대응하면 그 상자 목록을 준다.

    대응이 하나라도 깨지면 None — 평범한 줄바탕 보기로 처리한다.
    """
    if len(mk) != 4:
        return None
    out = []
    for j in mk:
        ln = seg[j]
        cand = [b for b in boxes.get(ln.page, [])
                if b.y0 - 2 <= ln.y <= b.y1 + 2 and b.x0 > ln.x0 + 5
                and b.height < 300]
        if len(cand) != 1:
            return None
        out.append(cand[0])
    if len({(round(b.x0), round(b.y0)) for b in out}) != 4:
        return None
    return out


def _mkblock(run: list[Line], is_code: bool) -> Block:
    if is_code:
        code = _code_text(run)
        return Block(type="code", value=code, lang=_guess_lang(code))
    return Block(type="text", value="\n".join(paragraphs(run)))


def _clean_stem(stem: str) -> str:
    """줄 경계는 살리고 제어/PUA 문자만 걷어낸다."""
    return "\n".join(strip_noise(p) for p in stem.split("\n") if p.strip())


def parse_all() -> list[Item]:
    out: list[Item] = []
    for key, expect, has_expl, rel in C.TOPIC_BOOKS:
        out.extend(parse_book(key, expect, has_expl, rel))
    return out


# --- 자체 검증 --------------------------------------------------------------

def _report(items: list[Item]) -> bool:
    ok = True
    by: dict[str, list[Item]] = {}
    for it in items:
        by.setdefault(it.origin["book"], []).append(it)

    print("=" * 92)
    print("주제별 문제집 5종 — 추출 검증")
    print("=" * 92)
    print(f"{'키':<9}{'기대':>5}{'추출':>6}{'초록1개':>10}{'성공률':>8}"
          f"{'해설':>7}{'도형':>6}{'상자보기':>9}{'코드블록':>9}  판정")
    for key, expect, has_expl, _rel in C.TOPIC_BOOKS:
        its = by.get(key, [])
        good = sum(1 for i in its if i.answer is not None)
        rate = good / len(its) * 100 if its else 0.0
        nexp = sum(1 for i in its if i.explanations)
        ngfx = sum(1 for i in its if "has_graphic" in i.flags)
        nbox = sum(1 for i in its if "boxed_choices" in i.flags)
        ncode = sum(1 for i in its
                    if any(b.type == "code" and "\n" in b.value
                           for b in i.stem_blocks))
        good_cnt = len(its) == expect and rate >= 95.0
        ok &= good_cnt
        print(f"{key:<9}{expect:>5}{len(its):>6}{good:>10}{rate:>7.1f}%"
              f"{nexp:>7}{ngfx:>6}{nbox:>9}{ncode:>9}  {'OK' if good_cnt else 'FAIL'}")
        if has_expl != (nexp > 0):
            print(f"    ⚠ config.has_expl={has_expl} 인데 실측 해설 {nexp}건 "
                  f"— config 플래그가 실제와 다르다(코드는 실측을 따랐다).")

    # 정답 분포
    print()
    print("정답 분포 (15~35% 이탈 시 경고)")
    for key, _e, _h, _r in C.TOPIC_BOOKS:
        its = [i for i in by.get(key, []) if i.answer]
        c = Counter(i.answer for i in its)
        n = len(its) or 1
        line = "  ".join(f"{m}:{c.get(m,0):>4}({c.get(m,0)/n*100:4.1f}%)"
                         for m in (1, 2, 3, 4))
        warn = [m for m in (1, 2, 3, 4) if not 0.15 <= c.get(m, 0) / n <= 0.35]
        print(f"  {key:<9}{line}   {'⚠ 편중 '+str(warn) if warn else ''}")

    # 구조 검사
    print()
    bad_ch = [i.id for i in items
              if len(i.choices) != 4 or any(not c.strip() for c in i.choices)]
    bad_st = [i.id for i in items if len(i.stem.strip()) < 5]
    leak = [i.id for i in items
            if LEAK_RE.search("\n" + i.stem)
            or any(LEAK_RE.search("\n" + c) for c in i.choices)]
    expl_leak = [i.id for i in items
                 if EXPL_RE.search(i.stem) or "[해설" in i.stem
                 or any("[해설" in c or "[ 해설" in c for c in i.choices)]
    noans = [i.id for i in items if i.answer is None]
    print(f"선택지 4개·비어있지 않음 위반 : {len(bad_ch)}  {bad_ch[:8]}")
    print(f"지문 5자 미만               : {len(bad_st)}  {bad_st[:8]}")
    print(f"문항번호 누수(\\n\\d+\\.)      : {len(leak)}  {leak[:8]}")
    print(f"[해설] 잔류(지문/선택지)     : {len(expl_leak)}  {expl_leak[:8]}")
    print(f"정답 미확정                 : {len(noans)}  {noans[:20]}")
    ok &= not (bad_ch or bad_st or leak or expl_leak)

    # 코드 보존
    print()
    codeb = [b for i in items if i.origin["book"] == "code"
             for b in i.stem_blocks if b.type == "code"]
    print(f"code 파일 코드블록 {len(codeb)}개 / 개행 포함 "
          f"{sum(1 for b in codeb if chr(10) in b.value)}개 / "
          f"들여쓰기 보존 {sum(1 for b in codeb if re.search(r'^[ ]+\S', b.value, re.M))}개")
    return ok


def main() -> int:
    items = parse_all()
    ok = _report(items)
    n = dump_items(items, OUT)
    print()
    print(f"→ {OUT}  ({n} items)")
    print("=" * 92)
    print(f"TOPIC BOOK 파서: {'PASS' if ok else 'FAIL'}")
    print("=" * 92)
    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())

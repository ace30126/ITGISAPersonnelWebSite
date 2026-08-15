"""Phase 5 — 개념 노트 컴파일 · 검증 · 문항 연결.

content/s{1..5}/*.md  →  interim/shards/concepts/subject-{n}.json

집필자에게 "규약을 지켜라"라고 말하는 대신 **기계가 검사한다.**
에이전트에게는 "경고 0건이 될 때까지 고쳐라" 한 줄만 주면 된다.
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
from common.normalize import norm  # noqa: E402

CONTENT = C.REPO / "content"
OUT = C.INTERIM / "shards" / "concepts"

REQUIRED_SECTIONS = ["한 줄 정의", "왜 시험에 나오나", "핵심", "헷갈리는 지점", "기출 패턴"]
BANNED_WORDS = ["매우 중요", "반드시 알아두", "꼭 기억", "여러분", "명심"]
SPELLING = {"스케쥴링": "스케줄링", "트렌젝션": "트랜잭션", "어플리케이션": "애플리케이션",
            "알고리듬": "알고리즘", "트랜색션": "트랜잭션"}

problems: list[str] = []
# 실패시키지는 않지만 집필자가 봐야 하는 것. 게이트를 통과 못 하게 만들면
# 이미 쓴 노트를 손보게 되는데, 판단이 필요한 항목이라 기계가 강제할 일이 아니다.
notes: list[str] = []


def warn(cid: str, msg: str) -> None:
    problems.append(f"{cid}: {msg}")


def parse_front(text: str) -> tuple[dict, str]:
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        return {}, text
    raw, body = m.group(1), m.group(2)
    fm: dict = {}
    for line in raw.splitlines():
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        k, _, v = line.partition(":")
        k, v = k.strip(), v.strip()
        if v.startswith("[") and v.endswith("]"):
            fm[k] = [x.strip() for x in v[1:-1].split(",") if x.strip()]
        elif v.isdigit():
            fm[k] = int(v)
        else:
            fm[k] = v
    return fm, body


QUIZ_RE = re.compile(
    r"-\s*q:\s*(?P<q>.+?)\n\s*choices:\s*\[(?P<c>.+?)\]\n\s*a:\s*(?P<a>\d)\s*\n\s*why:\s*(?P<w>.+?)(?=\n\s*-\s*q:|\n##|\Z)",
    re.S)


def parse_quiz(body: str) -> tuple[list[dict], str]:
    m = re.search(r"\n##\s*퀴즈\s*\n(.*)$", body, re.S)
    if not m:
        return [], body
    block = m.group(1)
    out = []
    for q in QUIZ_RE.finditer(block):
        choices = [c.strip().strip("'\"") for c in q.group("c").split(",")]
        out.append({
            "q": " ".join(q.group("q").split()),
            "choices": choices,
            "a": int(q.group("a")),
            "why": " ".join(q.group("w").split()),
        })
    return out, body[:m.start()]


def extract_svg(cid: str, body: str) -> tuple[list[dict], str]:
    """SVG 를 본문에서 떼어내 diagrams 로 옮긴다.

    프론트의 마크다운 렌더러는 AST→React 라 원시 HTML 을 그리지 않는다.
    본문에 SVG 를 남겨 두면 화면에 아무것도 안 나온다(조용한 실패).
    떼어낸 자리에는 자리표시자를 남겨 순서를 보존한다.
    """
    out: list[dict] = []

    def repl(m: re.Match) -> str:
        out.append({"id": f"{cid}-fig{len(out) + 1}", "svg": m.group(0)})
        return f"\n[[fig:{len(out)}]]\n"

    return out, re.sub(r"<svg\b.*?</svg>", repl, body, flags=re.S)


def check_svg(cid: str, svgs_text: list[str]) -> int:
    for s in svgs_text:
        # 1차 저작 콘텐츠라 innerHTML 로 그린다. 그래서 여기서 막는다.
        if re.search(r"<script|\son\w+\s*=|javascript:|<foreignObject|<iframe", s, re.I):
            warn(cid, "SVG 에 스크립트/이벤트 핸들러가 있다 (렌더 시 차단 대상)")
        if "viewBox" not in s:
            warn(cid, "SVG 에 viewBox 가 없다 (반응형이 깨진다)")
        if re.search(r'<svg[^>]*\s(width|height)\s*=', s):
            warn(cid, "SVG 루트에 width/height 속성이 있다 (viewBox 만 쓴다)")
        if "aria-label" not in s:
            warn(cid, "SVG 에 aria-label 이 없다")
        for col in re.findall(r'(?:fill|stroke)\s*=\s*"([^"]+)"', s):
            if col not in ("none", "currentColor") and not col.startswith("url("):
                warn(cid, f"SVG 에 하드코딩 색 '{col}' (다크모드에서 안 보인다)")
        for fs in re.findall(r'font-size\s*=\s*"(\d+)', s):
            if int(fs) < 12:
                warn(cid, f"SVG font-size {fs} < 12 (폰에서 못 읽는다)")
    return len(svgs_text)


def main() -> int:
    plan_path = C.INTERIM / "authoring_targets.json"
    targets = json.loads(plan_path.read_text(encoding="utf-8")) if plan_path.exists() else {}
    items = json.loads((C.INTERIM / "merged.json").read_text(encoding="utf-8"))["items"]
    item_ids = {i["id"] for i in items}
    global by_id_tags
    by_id_tags = {i["id"]: i.get("tags", []) for i in items}

    # kw 태그 -> 문항 (관련 기출 자동 연결)
    #
    # 정렬·필터가 없으면 자동 연결이 망가진다:
    #  - 태그만 보면 **다른 과목 문항이 섞인다.** 3과목 DB 문항에 '객체지향'
    #    태그가 달려 있는 식이라, 1과목 노트에 3과목 문항이 붙는다.
    #  - 상한 40건을 파일 등장 순서로 자르면 고빈도 문항이 잘려 나간다.
    #    SQL 은 105건 중 40건만 붙는데, 그 40건이 중요한 40건이어야 한다.
    by_kw: dict[str, list[dict]] = {}
    for it in items:
        for t in it.get("tags", []):
            if t.startswith("kw:"):
                by_kw.setdefault(t[3:], []).append(it)

    def rank(it: dict, subj: int) -> tuple:
        times = 1 + len(it.get("merged_from", []))
        same_subject = it.get("subject") == subj
        # 보기가 이미지뿐인 문항은 뒤로. 못 푸는 건 아니지만 대표성이 떨어진다.
        imgish = "choices_image" in it.get("flags", [])
        return (not same_subject, imgish, -times)

    print("=" * 74)
    print("Phase 5 개념 노트 컴파일")
    print("=" * 74)

    all_concepts: dict[int, list[dict]] = {s: [] for s in range(1, 6)}
    seen_ids: Counter = Counter()

    for subj in range(1, 6):
        d = CONTENT / f"s{subj}"
        files = sorted(d.glob("*.md")) if d.exists() else []
        for f in files:
            text = f.read_text(encoding="utf-8")
            fm, body = parse_front(text)
            cid = fm.get("id") or f.stem
            seen_ids[cid] += 1

            for k in ("id", "subject", "title", "tier", "keywords"):
                if k not in fm:
                    warn(cid, f"프론트매터 '{k}' 누락")
            if fm.get("subject") != subj:
                warn(cid, f"subject={fm.get('subject')} 인데 s{subj}/ 에 있다")

            quiz, body_wo_quiz = parse_quiz(body)
            if not 2 <= len(quiz) <= 4:
                warn(cid, f"퀴즈 {len(quiz)}개 (2~3개여야 한다)")
            for q in quiz:
                if len(q["choices"]) != 4:
                    warn(cid, f"퀴즈 보기 {len(q['choices'])}개")
                if not 1 <= q["a"] <= 4:
                    warn(cid, f"퀴즈 정답 인덱스 {q['a']}")

            for sec in REQUIRED_SECTIONS:
                if f"## {sec}" not in body_wo_quiz:
                    warn(cid, f"'## {sec}' 절이 없다")

            plain = re.sub(r"<svg\b.*?</svg>", "", body_wo_quiz, flags=re.S)
            plain = re.sub(r"[#*`|\-\n]", "", plain)
            n = len(plain)
            if not 500 <= n <= 1400:
                warn(cid, f"본문 {n}자 (600~1100 권장 범위를 크게 벗어남)")

            if re.search(r"^#\s", body_wo_quiz, re.M):
                warn(cid, "h1(#) 사용 금지 — 제목은 프론트매터 title")
            for w in BANNED_WORDS:
                if w in body_wo_quiz:
                    warn(cid, f"금지 표현 '{w}'")
            for bad, good in SPELLING.items():
                if bad in text:
                    warn(cid, f"표기 오류 '{bad}' → '{good}'")

            diagrams, body_wo_quiz = extract_svg(cid, body_wo_quiz)
            n_svg = check_svg(cid, [d["svg"] for d in diagrams])

            # 관련 기출 연결
            pinned = [i for i in fm.get("items", []) if i in item_ids]
            for i in fm.get("items", []):
                if i not in item_ids:
                    warn(cid, f"pin 문항 '{i}' 이 존재하지 않는다")
            cand: list[dict] = []
            for kw in fm.get("keywords", []):
                hits = by_kw.get(kw, [])
                if not hits:
                    warn(cid, f"keywords '{kw}' 에 걸리는 문항이 0건 "
                              f"(배정표 개념명과 정확히 일치해야 한다)")
                cand += [x for x in hits if x["id"] not in pinned]
            uniq = {x["id"]: x for x in cand}
            ordered = sorted(uniq.values(), key=lambda x: rank(x, subj))
            auto = [x["id"] for x in ordered]
            same = sum(1 for x in ordered[:40] if x.get("subject") == subj)

            # pin 이 실재하기만 하면 통과하던 것을 보완 — 개념과 실제로 관련 있나
            kwset = set(fm.get("keywords", []))
            for pid in pinned:
                tags = {t[3:] for t in by_id_tags.get(pid, []) if t.startswith("kw:")}
                if kwset and not (kwset & tags):
                    notes.append(f"{cid}: pin '{pid}' 이 keywords {sorted(kwset)} 를 "
                                 f"갖고 있지 않다 (연결이 어색할 수 있다)")

            all_concepts[subj].append({
                "id": cid, "subject": subj, "title": fm.get("title", cid),
                "tier": fm.get("tier", "C"), "tags": fm.get("tags", []),
                "keywords": fm.get("keywords", []),
                "body": body_wo_quiz.strip(),
                # 집필 규약은 1-based(사람이 쓰기 편하다), 프론트는 0-based.
                # 변환을 여기서 한 번만 한다.
                "quiz": [{**q, "a": q["a"] - 1} for q in quiz],
                "items": pinned, "auto": auto[:40],
                "diagrams": diagrams,
                "svg": n_svg, "auto_same_subject": same, "auto_total": len(auto),
            })

    for cid, n in seen_ids.items():
        if n > 1:
            warn(cid, f"id 중복 {n}회")

    # 배정표 대비 진척
    print(f"\n  {'과목':<6}{'배정':>6}{'집필':>6}{'퀴즈':>6}{'그림':>6}{'자동연결':>8}")
    total_done = 0
    for subj in range(1, 6):
        cs = all_concepts[subj]
        assigned = len(targets.get(str(subj), []))
        total_done += len(cs)
        print(f"  {subj}과목{assigned:>7}{len(cs):>6}"
              f"{sum(len(c['quiz']) for c in cs):>6}"
              f"{sum(c['svg'] for c in cs):>6}"
              f"{sum(len(c['auto']) for c in cs):>8}")

    OUT.mkdir(parents=True, exist_ok=True)
    for subj in range(1, 6):
        (OUT / f"subject-{subj}.json").write_text(
            json.dumps(all_concepts[subj], ensure_ascii=False, separators=(",", ":")),
            encoding="utf-8")

    covered = {i for cs in all_concepts.values() for c in cs
               for i in c["items"] + c["auto"]}
    print(f"\n  개념 {total_done}개 / 연결된 문항 {len(covered)}"
          f" ({len(covered) * 100 / max(1, len(items)):.1f}%)")

    # 자동 연결이 같은 과목 문항으로 채워지고 있는지
    for subj in range(1, 6):
        cs = all_concepts[subj]
        if not cs:
            continue
        shown = sum(min(40, len(c["auto"])) for c in cs)
        same = sum(c["auto_same_subject"] for c in cs)
        if shown:
            print(f"  {subj}과목 자동연결 동일과목 비율 "
                  f"{same * 100 / shown:.0f}% ({same}/{shown})")

    if notes:
        print(f"\n  참고 {len(notes)}건 (실패 아님)")
        for n in notes[:12]:
            print(f"    {n}")
        if len(notes) > 12:
            print(f"    … 외 {len(notes) - 12}건")

    print(f"\n  규약 위반 {len(problems)}건")
    for p in problems[:40]:
        print(f"    {p}")
    if len(problems) > 40:
        print(f"    … 외 {len(problems) - 40}건")

    return 1 if problems else 0


if __name__ == "__main__":
    raise SystemExit(main())

"""Phase 2 — 병합 · 중복제거 · 과목 분류 · G12 교차검증.

우선순위: past_exam(원문 정확도 최고) > solution_book(해설·정답 공급) > topic_book(해설·태그)

해시는 **여기서 재계산한다.** 파서가 저장한 값을 믿지 않는다 —
norm() 이 곡선 따옴표 통일을 얻은 뒤라 파서 시점 해시와 달라졌다.
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

import config as C  # noqa: E402
from common.normalize import item_hash, jaccard, norm, stem_hash  # noqa: E402

PRIORITY = {"past_exam": 3, "solution_book": 2, "topic_book": 1}

# 주제별 문제집은 과목 정보가 없다. 병합으로도 못 채운 것에만 쓰는 최후 규칙.
SUBJECT_KEYWORDS: dict[int, list[str]] = {
    1: ["요구사항", "uml", "유스케이스", "디자인 패턴", "객체지향", "미들웨어",
        "ui", "인터페이스 설계", "럼바우", "애자일", "xp", "스크럼", "설계 원칙",
        "다이어그램", "모듈화", "결합도", "응집도", "소프트웨어 아키텍처"],
    2: ["테스트", "디버깅", "정렬", "탐색", "스택", "큐", "트리", "그래프",
        "해싱", "형상관리", "버전관리", "알고리즘", "복잡도", "블랙박스",
        "화이트박스", "통합 테스트", "인스펙션", "리팩토링", "자료 구조"],
    3: ["sql", "정규화", "릴레이션", "튜플", "속성", "기본키", "외래키",
        "트랜잭션", "인덱스", "e-r", "데이터베이스", "무결성", "정규형",
        "관계대수", "뷰", "스키마", "카디널리티", "로킹", "회복"],
    4: ["c언어", "파이썬", "python", "java", "포인터", "배열", "변수",
        "연산자", "프로세스", "스레드", "교착상태", "페이지 교체", "스케줄링",
        "ip", "tcp", "osi", "서브넷", "라우팅", "운영체제", "메모리",
        "상속", "오버로딩", "오버라이딩", "예외"],
    5: ["보안", "암호", "해시 함수", "인증", "접근통제", "공격", "취약점",
        "방화벽", "침입탐지", "cocomo", "put", "prototype", "나선형",
        "스크럼", "비용 산정", "네트워크 장비", "라우터", "스위치",
        "클라우드", "빅데이터", "블록체인", "aes", "rsa", "des", "ddos"],
}

report: list[str] = []


def log(s: str = "") -> None:
    print(s)
    report.append(s)


def load(name: str) -> list[dict]:
    p = C.INTERIM / name
    if not p.exists():
        log(f"  !! 없음: {name}")
        return []
    return json.loads(p.read_text(encoding="utf-8"))["items"]


# 페이지 가구(furniture) — 본문이 아니라 인쇄물의 틀.
# 2단 읽기순서 특성상 전폭 머리글·꼬리말 조각이 그 단 마지막 문항 꼬리에 실린다.
# 길이·개수 검증을 전부 통과하는 조용한 오염이라 여기서 기계적으로 걷어낸다.
_FURNITURE = [
    re.compile(r"\n?\s*-\s*\n?\s*\d{1,2}\s*회\s*$"),          # '- \n 1회'
    re.compile(r"\n\s*-\s*\d{1,2}\s*-\s*(\n|$)"),             # 페이지 번호 '- 7 -'
    re.compile(r"\n\s*\d{1,2}\s*회\s*(\n|$)"),
    re.compile(r"정보처리기사\s*필기\s*기출문제"),
    re.compile(r"기출문제\s*&\s*정답(\s*및\s*해설)?"),
    re.compile(r"\d{4}년\s*\d\s*회\s*정보처리기사\s*필기"),
    re.compile(r"저작권\s*안내?"),
    re.compile(r"이\s*자료는\s*시나공[^\n]*"),
    re.compile(r"다른\s*매체에\s*옮겨[^\n]*"),
    re.compile(r"허락\s*없이\s*복제[^\n]*"),
    re.compile(r"본\s*해설집은[^\n]*"),
    re.compile(r"기출문제\s*해설은[^\n]*"),
    re.compile(r"전자문제집\s*:?\s*CBT", re.I),
    re.compile(r"www\.comcbt\.com", re.I),
    re.compile(r"※\s*다음\s*문제를\s*읽고[^\n]*"),
    re.compile(r"답란\s*\([^)]*\)\s*에\s*표기하시오\.?"),
]


def strip_furniture(s: str) -> str:
    if not s:
        return s
    for rx in _FURNITURE:
        s = rx.sub("\n", s)
    s = re.sub(r"\n{2,}", "\n", s)
    return s.strip(" \n\t-")


def clean(items: list[dict]) -> int:
    n = 0
    for i in items:
        before = (i.get("stem", ""), tuple(i.get("choices", [])))
        i["stem"] = strip_furniture(i.get("stem", ""))
        i["choices"] = [strip_furniture(c) for c in i.get("choices", [])]
        if before != (i["stem"], tuple(i["choices"])):
            n += 1
    return n


def rehash(items: list[dict]) -> None:
    for i in items:
        i["hash"] = item_hash(i.get("stem", ""), i.get("choices", []))
        i["stem_hash"] = stem_hash(i.get("stem", ""))


# --- G12 -------------------------------------------------------------------

def g12(past: list[dict], sol: list[dict]) -> bool:
    log("\n" + "=" * 74)
    log("G12 — 동일 회차를 다룬 독립 두 발행처 대조")
    log("=" * 74)
    ok = True
    past_by = {(i["round"]["year"], i["round"]["session"], i["number"]): i
               for i in past if i.get("number")}
    sol_by = defaultdict(dict)
    for i in sol:
        d = i.get("round", {}).get("date")
        if d and i.get("number"):
            sol_by[d][i["number"]] = i

    for date, (year, sess) in C.SOLUTION_TO_PAST.items():
        pairs = [(past_by.get((year, sess, n)), sol_by[date].get(n))
                 for n in range(1, 101)]
        pairs = [(p, s) for p, s in pairs if p and s]
        ans_mis = [p["number"] for p, s in pairs
                   if p.get("answer") and s.get("answer")
                   and p["answer"] != s["answer"]]
        exact = [p["number"] for p, s in pairs if p["hash"] == s["hash"]]
        stem_eq = [p["number"] for p, s in pairs
                   if norm(p["stem"]) == norm(s["stem"])]
        img = [p["number"] for p, s in pairs
               if "stem_image_block" in s.get("flags", [])
               or "choices_image" in s.get("flags", [])]
        unexplained = sorted(set(p["number"] for p, s in pairs)
                             - set(stem_eq) - set(img))

        log(f"\n  {date} ↔ {year}년{sess}회  (대응 {len(pairs)}문항)")
        log(f"    정답 불일치      {len(ans_mis)}건 {ans_mis[:8]}")
        log(f"    지문 완전일치    {len(stem_eq)}/{len(pairs)}")
        log(f"    문항 해시일치    {len(exact)}/{len(pairs)}")
        log(f"    이미지 손실 문항 {len(img)}건 (해시 불일치가 당연)")
        log(f"    설명 안 되는 불일치 {len(unexplained)}건 {unexplained[:12]}")
        if ans_mis:
            ok = False
        for n in unexplained[:3]:
            p = past_by[(year, sess, n)]
            s = sol_by[date][n]
            log(f"      [{n}] jaccard={jaccard(p['stem'], s['stem']):.3f}")
            log(f"        기출 : {p['stem'][:88]!r}")
            log(f"        해설 : {s['stem'][:88]!r}")
    return ok


# --- 병합 -------------------------------------------------------------------

def answer_text(i: dict) -> str | None:
    """정답을 **인덱스가 아니라 보기 텍스트**로 본다.

    🔥 item_hash 는 보기를 정렬해서 넣는다(보기 순서만 섞은 재출제를 같은 문항으로
    잡기 위해). 그래서 같은 해시라도 보기 배열이 다르면 정답 인덱스가 정당하게
    달라진다. 인덱스로 비교하면 멀쩡한 재출제가 전부 '정답 충돌'로 잡힌다.
    """
    a, ch = i.get("answer"), i.get("choices", [])
    if not a or a > len(ch):
        return None
    t = norm(ch[a - 1])
    return t or None            # 보기가 이미지면 빈 문자열 → 비교 불가


def answer_index_for(base: dict, other: dict) -> int | None:
    """other 의 정답 보기 텍스트를 base 의 보기 배열에서 찾아 인덱스로 옮긴다."""
    t = answer_text(other)
    if not t:
        return None
    for k, c in enumerate(base.get("choices", []), start=1):
        if norm(c) == t:
            return k
    return None


def merge_group(group: list[dict]) -> dict:
    group = sorted(group, key=lambda i: -PRIORITY[i["source"]])
    base = json.loads(json.dumps(group[0]))
    base.setdefault("explanations", [])
    base.setdefault("tags", [])
    base.setdefault("flags", [])
    base["merged_from"] = [i["id"] for i in group[1:]]

    seen_expl = {norm(e.get("body", "")) for e in base["explanations"]}
    for other in group[1:]:
        for e in other.get("explanations", []):
            k = norm(e.get("body", ""))
            if k and k not in seen_expl:
                seen_expl.add(k)
                base["explanations"].append(e)
        for t in other.get("tags", []):
            if t not in base["tags"]:
                base["tags"].append(t)
        if base.get("answer") is None and other.get("answer") is not None:
            # 보기 배열이 다를 수 있으므로 텍스트로 찾아 base 기준 인덱스로 옮긴다
            k = answer_index_for(base, other)
            if k is not None:
                base["answer"] = k
                base["answer_src"] = other.get("answer_src")
                base["flags"].append("answer_recovered")
        if base.get("subject") is None and other.get("subject") is not None:
            base["subject"] = other["subject"]
            base["subject_src"] = "merge"
        # 이미지 블록은 손실 보완이므로 없는 쪽이 받아온다
        if not any(b.get("type") == "image" for b in base.get("stem_blocks", [])):
            imgs = [b for b in other.get("stem_blocks", [])
                    if b.get("type") == "image"]
            if imgs:
                base.setdefault("stem_blocks", []).extend(imgs)
    return base


def dedupe(items: list[dict]) -> tuple[list[dict], list[dict]]:
    conflicts: list[dict] = []

    by_hash: dict[str, list[dict]] = defaultdict(list)
    for i in items:
        by_hash[i["hash"]].append(i)

    merged: list[dict] = []
    for h, grp in by_hash.items():
        texts = {t for t in (answer_text(i) for i in grp) if t}
        if len(texts) > 1:
            conflicts.append({"hash": h, "ids": [i["id"] for i in grp],
                              "answers": sorted(t[:28] for t in texts)})
            merged.extend(grp)          # 병합하지 않고 전부 남긴다
            continue
        merged.append(merge_group(grp) if len(grp) > 1 else grp[0])

    # 근사 중복: 블로킹 후 버킷 안에서만 비교 (전수 비교 회피)
    buckets: dict[str, list[int]] = defaultdict(list)
    for idx, i in enumerate(merged):
        buckets[norm(i["stem"])[:12]].append(idx)

    absorbed: set[int] = set()
    for _k, idxs in buckets.items():
        if len(idxs) < 2:
            continue
        for a in range(len(idxs)):
            ia = idxs[a]
            if ia in absorbed:
                continue
            for b in range(a + 1, len(idxs)):
                ib = idxs[b]
                if ib in absorbed:
                    continue
                x, y = merged[ia], merged[ib]
                if x["hash"] == y["hash"]:
                    continue
                if jaccard(x["stem"], y["stem"]) < 0.95:
                    continue
                tx, ty = answer_text(x), answer_text(y)
                # 근사 중복인데 정답이 다르면 **다른 문항**이다(같은 주제의 다른 출제).
                # 충돌로 보고하지 않고 둘 다 남긴다. 실제 모순은 해시 완전일치일 때만이다.
                if tx and ty and tx != ty:
                    continue
                keep, drop = ((ia, ib) if PRIORITY[x["source"]] >= PRIORITY[y["source"]]
                              else (ib, ia))
                merged[keep] = merge_group([merged[keep], merged[drop]])
                absorbed.add(drop)

    out = [m for idx, m in enumerate(merged) if idx not in absorbed]
    return out, conflicts


def fill_subjects(items: list[dict]) -> None:
    """병합으로도 못 채운 과목을 키워드 규칙으로 채운다."""
    for i in items:
        if i.get("subject"):
            continue
        text = norm(i.get("stem", "") + " " + " ".join(i.get("choices", [])))
        score = Counter()
        for subj, kws in SUBJECT_KEYWORDS.items():
            for kw in kws:
                if norm(kw) in text:
                    score[subj] += 1
        if score:
            best, n = score.most_common(1)[0]
            runner = score.most_common(2)[1][1] if len(score) > 1 else 0
            if n > runner:
                i["subject"] = best
                i["subject_src"] = "keyword"


def main() -> int:
    log("=" * 74)
    log("Phase 2 — 병합 · 중복제거 · 과목 분류")
    log("=" * 74)

    past, sol, topic = (load("past_exam.json"), load("solution_book.json"),
                        load("topic_book.json"))
    cleaned = sum(clean(s) for s in (past, sol, topic))
    log(f"\n페이지 가구 제거: {cleaned}문항에서 머리글·꼬리말·배너 조각 삭제")
    for s in (past, sol, topic):
        rehash(s)
    log(f"\n입력: 기출 {len(past)} / 해설집 {len(sol)} / 주제별 {len(topic)} "
        f"= {len(past) + len(sol) + len(topic)}")

    g12_ok = g12(past, sol)

    allitems = past + sol + topic
    merged, conflicts = dedupe(allitems)
    fill_subjects(merged)

    log("\n" + "=" * 74)
    log("병합 결과")
    log("=" * 74)
    log(f"  고유 문항        {len(merged)}  (원본 {len(allitems)}, "
        f"중복제거 {len(allitems) - len(merged)})")
    src = Counter(i["source"] for i in merged)
    log(f"  대표 출처        {dict(src)}")
    log(f"  해설 보유        {sum(1 for i in merged if i.get('explanations'))}")
    log(f"  이미지 블록 보유  {sum(1 for i in merged if any(b.get('type') == 'image' for b in i.get('stem_blocks', [])))}")
    log(f"  정답 없음        {sum(1 for i in merged if i.get('answer') is None)}")
    log(f"  정답 충돌        {len(conflicts)}건")
    for c in conflicts[:10]:
        log(f"     {c['ids']} → 정답 {c['answers']}")

    subj = Counter(i.get("subject") for i in merged)
    log(f"  과목 분포        " + "  ".join(
        f"{k}과목:{subj.get(k, 0)}" for k in (1, 2, 3, 4, 5)))
    log(f"  과목 미정        {subj.get(None, 0)} "
        f"({subj.get(None, 0) * 100 / max(1, len(merged)):.1f}%)")
    log(f"  과목 출처        {dict(Counter(i.get('subject_src') for i in merged))}")

    vg = defaultdict(list)
    for i in merged:
        vg[i["stem_hash"]].append(i["id"])
    multi = {k: v for k, v in vg.items() if len(v) > 1}
    log(f"  변형출제 그룹    {len(multi)}개 "
        f"(지문 같고 보기 다른 문항 {sum(len(v) for v in multi.values())}개)")
    for i in merged:
        i["variant_group"] = f"vg:{i['stem_hash'][:8]}"

    out = C.INTERIM / "merged.json"
    out.write_text(json.dumps({"schema": 1, "items": merged},
                              ensure_ascii=False, indent=1), encoding="utf-8")
    (C.REPORTS / "merge.md").write_text("\n".join(report), encoding="utf-8")
    log(f"\n→ {out.name} ({out.stat().st_size / 1024 / 1024:.2f}MB)")

    hard_fail = (not g12_ok) or subj.get(None, 0) > len(merged) * 0.03
    log("\n" + ("Phase 2 FAIL" if hard_fail else "Phase 2 PASS"))
    return 1 if hard_fail else 0


if __name__ == "__main__":
    raise SystemExit(main())

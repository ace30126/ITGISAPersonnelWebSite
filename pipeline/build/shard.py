"""Phase 3-A — 샤딩.

원칙: **경량 인덱스만으로 필터·통계·SRS·모의고사 문항 선정이 전부 가능해야 한다.**
지문·보기(=무거운 것 + 저작권 민감한 것)는 세션을 시작할 때만 내려받는다.

산출 (평문, web/public/data/ 아래 — gitignore 됨. 배포본은 pack.py 가 암호화한다)
  index/items.min.json   경량 인덱스 (stem/choices 없음)
  items/subject-{1..5}.json  풀바디
  expl/subject-{1..5}.json   해설 (시험 모드에서 아예 안 받음)
  meta.json              과목·태그·통계
"""
from __future__ import annotations

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

import config as C  # noqa: E402

OUT = C.REPO / "web" / "public" / "data"

# 경량 인덱스 키 (짧게 — 1200줄 × 매 바이트)
#   i=id  s=subject  y=year  n=number  a=answer  v=variant_group
#   f=flags  t=tags  c=출제횟수  e=해설보유  g=이미지보유
LIGHT_FLAGS = {"choices_image": "ci", "stem_image_block": "si",
               "source_defect_answer": "sd", "source_defect_marker": "sm"}


def light(it: dict) -> dict:
    times = 1 + len(it.get("merged_from", []))
    r = it.get("round", {})
    out = {
        "i": it["id"],
        "s": it.get("subject"),
        "a": it.get("answer"),
        "v": it.get("variant_group", "")[3:11],
        "c": times,
    }
    if r.get("year"):
        out["y"] = r["year"]
    if it.get("explanations"):
        out["e"] = 1
    if any(b.get("type") == "image" for b in it.get("stem_blocks", [])):
        out["g"] = 1
    f = [LIGHT_FLAGS[x] for x in it.get("flags", []) if x in LIGHT_FLAGS]
    if f:
        out["f"] = f
    if it.get("tags"):
        out["t"] = it["tags"]
    return out


def body(it: dict) -> dict:
    return {
        "i": it["id"],
        "stem": it.get("stem", ""),
        "choices": it.get("choices", []),
        "blocks": [b for b in it.get("stem_blocks", []) if b.get("type") != "text"],
    }


def expl(it: dict) -> dict | None:
    es = it.get("explanations", [])
    if not es:
        return None
    return {"i": it["id"],
            "e": [{"b": e.get("body", ""), "a": e.get("author")} for e in es]}


def write(path: Path, obj) -> int:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, separators=(",", ":")),
                    encoding="utf-8")
    return path.stat().st_size


def main() -> int:
    src = C.INTERIM / "merged.json"
    items = json.loads(src.read_text(encoding="utf-8"))["items"]

    # 과목 미정은 0번 샤드로 몰아 별도 취급(퀴즈에는 쓰되 과목 탐색엔 안 나옴)
    by_subject: dict[int, list[dict]] = defaultdict(list)
    for it in items:
        by_subject[it.get("subject") or 0].append(it)

    print("=" * 70)
    print("Phase 3-A 샤딩")
    print("=" * 70)

    idx = [light(it) for it in items]
    n_idx = write(OUT / "index" / "items.min.json", idx)
    print(f"  경량 인덱스   {len(idx):>5}문항  {n_idx / 1024:>7.1f}KB")

    print(f"\n  {'샤드':<12}{'문항':>6}{'본문KB':>9}{'해설KB':>9}")
    total_b = total_e = 0
    shards = {}
    for s in sorted(by_subject):
        grp = by_subject[s]
        nb = write(OUT / "items" / f"subject-{s}.json", [body(i) for i in grp])
        es = [e for e in (expl(i) for i in grp) if e]
        ne = write(OUT / "expl" / f"subject-{s}.json", es) if es else 0
        total_b += nb
        total_e += ne
        shards[f"subject-{s}"] = {"n": len(grp), "expl": len(es)}
        label = f"{s}과목" if s else "미분류"
        print(f"  {label:<12}{len(grp):>6}{nb / 1024:>9.1f}{ne / 1024:>9.1f}")

    # 태그·통계 메타
    freq = Counter()
    for it in items:
        for t in it.get("tags", []):
            freq[t] += 1
    meta = {
        "subjects": {str(k): C.SUBJECT_NAMES.get(k, "미분류")
                     for k in sorted(by_subject)},
        "counts": {str(k): len(v) for k, v in sorted(by_subject.items())},
        "tags": freq.most_common(),
        "total": len(items),
        "with_expl": sum(1 for i in items if i.get("explanations")),
        "with_image": sum(1 for i in items
                          if any(b.get("type") == "image"
                                 for b in i.get("stem_blocks", []))),
        "choices_image": [i["id"] for i in items
                          if "choices_image" in i.get("flags", [])],
    }
    n_meta = write(OUT / "meta.json", meta)

    # 참조된 PNG 를 배포 트리로 복사한다. 이것도 저작물이므로 암호화 대상이다
    # (pack.py 가 *.json 뿐 아니라 이 디렉터리도 함께 암호화한다).
    import shutil
    adst = OUT / "assets"
    if adst.exists():
        shutil.rmtree(adst)
    copied = missing = 0
    for it in items:
        for b in it.get("stem_blocks", []):
            if b.get("type") != "image" or not b.get("src"):
                continue
            rel = b["src"].split("assets/", 1)[-1]
            s = C.ASSETS / rel
            if not s.exists():
                missing += 1
                b["_missing"] = True
                continue
            d = adst / rel
            d.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(s, d)
            copied += 1
    asset_bytes = sum(p.stat().st_size for p in adst.rglob("*") if p.is_file())
    print(f"\n  이미지 자산   {copied}장 복사 / 원본 없음 {missing}장 "
          f"({asset_bytes / 1024 / 1024:.2f}MB)")
    if missing:
        print("  ** 경고: stem_blocks 가 가리키는 PNG 가 없다. 파서 재실행 필요.")

    print(f"\n  본문 합계 {total_b / 1024:.1f}KB / 해설 합계 {total_e / 1024:.1f}KB "
          f"/ meta {n_meta / 1024:.1f}KB")
    print(f"  → 초기 로드는 인덱스 {n_idx / 1024:.1f}KB + meta 뿐 "
          f"(gzip 시 대략 {n_idx / 1024 * 0.28:.0f}KB)")

    # 예산 게이트
    bad = []
    if n_idx > 300 * 1024:
        bad.append(f"경량 인덱스 {n_idx / 1024:.0f}KB > 300KB")
    for s in sorted(by_subject):
        sz = (OUT / "items" / f"subject-{s}.json").stat().st_size
        if sz > 400 * 1024:
            bad.append(f"subject-{s} 본문 {sz / 1024:.0f}KB > 400KB")
    if bad:
        print("\n예산 초과:")
        for b in bad:
            print("  -", b)
        return 1
    print("\nPhase 3-A PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

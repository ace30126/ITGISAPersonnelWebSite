"""Phase 5 준비 — 집필할 개념 목록을 데이터로 정한다.

감으로 목차를 짜면 "중요해 보이는데 안 나오는 것"에 지면을 쓴다.
여기서는 실제 출제량으로 순위를 매기고, 그 값을 그대로 집필 지시서에 넣는다.

빈도 가중치
  w(item) = 출제 횟수(merged_from 포함)  ← 재출제가 곧 중요도다
  rec     = 0.5 ** ((2025 - year) / 2)   ← 반감기 2년. 최신 경향에 가중
  freq(개념) = Σ w × rec  (variant_group 당 1회만 계상)
"""
from __future__ import annotations

import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

import config as C  # noqa: E402

HALF_LIFE = 2.0
NOW_YEAR = 2025


def main() -> int:
    items = json.loads((C.INTERIM / "merged.json").read_text(encoding="utf-8"))["items"]

    # 개념별 집계 (과목 단위로 나눈다)
    agg: dict[int, dict[str, dict]] = defaultdict(lambda: defaultdict(
        lambda: {"freq": 0.0, "n": 0, "items": [], "vg": set()}))

    for it in items:
        subj = it.get("subject")
        if not subj:
            continue
        times = 1 + len(it.get("merged_from", []))
        year = it.get("round", {}).get("year")
        rec = 0.5 ** ((NOW_YEAR - year) / HALF_LIFE) if year else 0.6
        vg = it.get("variant_group", it["id"])
        for t in it.get("tags", []):
            if not t.startswith("kw:"):
                continue
            rep = t[3:]
            a = agg[subj][rep]
            if vg in a["vg"]:
                continue
            a["vg"].add(vg)
            a["freq"] += times * rec
            a["n"] += 1
            if len(a["items"]) < 12:
                a["items"].append(it["id"])

    # --- 소유 과목 선배정 -------------------------------------------------
    # 같은 개념이 여러 과목에 잡힌다(TCPIP 는 1·2·4·5 과목, SQL 은 2·3·5 과목).
    # 그대로 두면 팬아웃한 5명이 같은 개념을 각자 쓴다.
    # 락으로 못 푸는 종류의 충돌이라 **오케스트레이터가 미리 나눠 준다.**
    # 기준: 그 과목 안에서의 점유율이 가장 높은 곳이 임자다.
    share_by: dict[str, list[tuple[float, int]]] = defaultdict(list)
    for subj in (1, 2, 3, 4, 5):
        tot = sum(a["freq"] for a in agg[subj].values()) or 1.0
        for rep, a in agg[subj].items():
            share_by[rep].append((a["freq"] / tot, subj))

    owner: dict[str, int] = {}
    for rep, lst in share_by.items():
        lst.sort(reverse=True)
        owner[rep] = lst[0][1]

    shared = {r: sorted(s for _f, s in lst) for r, lst in share_by.items()
              if len(lst) > 1}
    print("=" * 74)
    print("소유 과목 선배정")
    print("=" * 74)
    print(f"  여러 과목에 걸친 개념 {len(shared)}종 → 점유율 최고 과목이 집필한다")
    for rep, subs in sorted(shared.items(),
                            key=lambda kv: -len(kv[1]))[:10]:
        print(f"    {rep:<16} {subs} → {owner[rep]}과목")

    out = {}
    print("\n" + "=" * 74)
    print("Phase 5 집필 계획 — 과목별 개념 우선순위")
    print("=" * 74)

    for subj in (1, 2, 3, 4, 5):
        rows = sorted(agg[subj].items(), key=lambda kv: -kv[1]["freq"])
        total = sum(r[1]["freq"] for r in rows) or 1.0
        print(f"\n### {subj}과목 {C.SUBJECT_NAMES[subj]} "
              f"— 개념 {len(rows)}종, 가중 출제 합 {total:.0f}")
        print(f"  {'개념':<16}{'가중빈도':>9}{'문항':>6}{'점유율':>8}  티어")
        plan = []
        for rank, (rep, a) in enumerate(rows):
            share = a["freq"] / total
            pct = 1 - rank / max(1, len(rows) - 1)
            tier = "S" if pct >= 0.85 else "A" if pct >= 0.60 else "B" if pct >= 0.30 else "C"
            plan.append({
                "id": rep, "subject": subj, "tier": tier,
                "owner": owner[rep], "mine": owner[rep] == subj,
                "freq": round(a["freq"], 1), "items": a["n"],
                "share": round(share * 100, 2), "sample_items": a["items"],
            })
            if rank < 12:
                print(f"  {rep:<16}{a['freq']:>9.1f}{a['n']:>6}{share * 100:>7.1f}%  {tier}")
        if len(rows) > 12:
            print(f"  … 외 {len(rows) - 12}종")
        out[str(subj)] = plan

    # 미분류 문항은 집필 대상이 아니지만 규모는 알려 준다
    n_unclassified = sum(1 for i in items if not i.get("subject"))
    n_untagged = sum(1 for i in items
                     if not any(t.startswith("kw:") for t in i.get("tags", [])))
    print(f"\n  과목 미분류 {n_unclassified}문항 / 개념태그 없음 {n_untagged}문항")

    dest = C.INTERIM / "concept_plan.json"
    dest.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

    # 집필 대상: 자기 소유 + S/A 티어. 중복 없이 정확히 한 번씩 배정된다.
    targets = {s: [c for c in v if c["mine"] and c["tier"] in ("S", "A")]
               for s, v in out.items()}
    print("\n" + "=" * 74)
    print("집필 배정 (소유 + S/A 티어) — 중복 0")
    for s, v in targets.items():
        print(f"\n  {s}과목 {C.SUBJECT_NAMES[int(s)]} — {len(v)}개")
        for c in v:
            print(f"    {c['id']:<18} 빈도 {c['freq']:>6.1f}  문항 {c['items']:>3}  "
                  f"{c['share']:>5.1f}%  {c['tier']}")
    allids = [c["id"] for v in targets.values() for c in v]
    print(f"\n  합계 {len(allids)}개 / 고유 {len(set(allids))}개 "
          f"{'(중복 없음)' if len(allids) == len(set(allids)) else '** 중복 있음 **'}")

    (C.INTERIM / "authoring_targets.json").write_text(
        json.dumps(targets, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"→ {dest.name}, authoring_targets.json")
    return 0 if len(allids) == len(set(allids)) else 1


if __name__ == "__main__":
    raise SystemExit(main())

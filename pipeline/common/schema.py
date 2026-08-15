"""문항 데이터 계약.

3종 파서 · merge · validate · shard 가 공유하는 단일 스키마.
여기를 바꾸면 파이프라인 전체가 영향을 받는다. 오케스트레이터만 수정한다.
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Any, Iterable, Literal

Source = Literal["past_exam", "solution_book", "topic_book"]
AnswerSrc = Literal["answer_key", "color_mark", "solution_book", "manual"]
SubjectSrc = Literal["position", "header", "keyword", "knn", "manual"]

SCHEMA_VERSION = 1


@dataclass
class Block:
    """지문 구조 보존 요소."""
    type: Literal["text", "code", "image"]
    value: str = ""
    lang: str | None = None
    src: str | None = None


@dataclass
class Explanation:
    kind: Literal["community", "topicbook", "authored"]
    body: str
    author: str | None = None
    src_file: str | None = None


@dataclass
class Item:
    id: str
    source: Source
    stem: str
    choices: list[str]
    answer: int | None = None                 # 1-based
    answer_src: AnswerSrc | None = None
    subject: int | None = None                # 1..5
    subject_src: SubjectSrc | None = None
    number: int | None = None
    round: dict[str, Any] = field(default_factory=dict)
    origin: dict[str, Any] = field(default_factory=dict)
    stem_blocks: list[Block] = field(default_factory=list)
    explanations: list[Explanation] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    hash: str = ""
    stem_hash: str = ""
    variant_group: str = ""
    flags: list[str] = field(default_factory=list)
    confidence: float = 1.0

    def flag(self, code: str) -> None:
        if code not in self.flags:
            self.flags.append(code)


def subject_from_number(n: int) -> int | None:
    """시험 규정상 1~20=1과목 … 81~100=5과목. 헤더보다 이쪽이 진실이다."""
    if not 1 <= n <= 100:
        return None
    return (n - 1) // 20 + 1


def past_exam_id(year: int, session: int, number: int) -> str:
    return f"q:{year}-{session}:{number:03d}"


def solution_id(date: str, number: int) -> str:
    return f"s:{date}:{number:03d}"


def topic_id(key: str, number: int) -> str:
    return f"t:{key}:{number:03d}"


# --- 직렬화 -----------------------------------------------------------------

def _clean(o: Any) -> Any:
    if isinstance(o, dict):
        return {k: _clean(v) for k, v in o.items() if v not in (None, [], {}, "")}
    if isinstance(o, list):
        return [_clean(v) for v in o]
    return o


def dump_items(items: Iterable[Item], path: str | Path) -> int:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    data = [_clean(asdict(i)) for i in items]
    path.write_text(
        json.dumps({"schema": SCHEMA_VERSION, "items": data},
                   ensure_ascii=False, indent=1),
        encoding="utf-8",
    )
    return len(data)


def load_items(path: str | Path) -> list[Item]:
    raw = json.loads(Path(path).read_text(encoding="utf-8"))
    out = []
    for d in raw["items"]:
        d = dict(d)
        d["stem_blocks"] = [Block(**b) for b in d.get("stem_blocks", [])]
        d["explanations"] = [Explanation(**e) for e in d.get("explanations", [])]
        out.append(Item(**d))
    return out

"""Phase 3-B — 배포본 암호화 패킹.

공개 GitHub Pages 저장소에 올리되 문제 원문이 평문으로 노출되지 않게 한다.
브라우저는 WebCrypto(PBKDF2 + AES-GCM)로 복호화한다. 서버가 필요 없다.

  평문 web/public/data/**.json   (gitignore)
    → 암호문 web/public/enc/**.enc + manifest.json (평문)

manifest.json 은 복호화 파라미터와 무결성 해시만 담는다. 문항 내용은 없다.

사용
  python pipeline/build/pack.py            # SECRETS.md 의 패스프레이즈 사용/생성
  python pipeline/build/pack.py --verify   # 복호화 왕복 + 해시 대조
"""
from __future__ import annotations

import base64
import hashlib
import json
import os
import re
import secrets
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

from cryptography.hazmat.primitives.ciphers.aead import AESGCM  # noqa: E402

import config as C  # noqa: E402

SRC = C.INTERIM / "shards"                    # 평문 — 배포 트리 밖
DST = C.REPO / "web" / "public" / "enc"       # 암호문만 배포된다
SECRETS_FILE = C.REPO / "SECRETS.md"

KDF_ITERS = 250_000
SALT_LEN = 16
IV_LEN = 12


def get_passphrase() -> str:
    """우선순위: --passphrase > 환경변수 > SECRETS.md > 새로 생성."""
    for i, a in enumerate(sys.argv):
        if a == "--passphrase" and i + 1 < len(sys.argv):
            return sys.argv[i + 1]
    if os.environ.get("GISA_PASSPHRASE"):
        return os.environ["GISA_PASSPHRASE"]
    if SECRETS_FILE.exists():
        # 기계가 읽는 줄은 이 형식 하나로 고정한다. 사람이 읽는 설명과 섞지 않는다.
        m = re.search(r"^passphrase:\s*`([^`]+)`\s*$",
                      SECRETS_FILE.read_text(encoding="utf-8"), re.M)
        if m:
            return m.group(1)
        raise SystemExit(
            "SECRETS.md 는 있는데 'passphrase: `...`' 줄을 못 찾았다.\n"
            "덮어써서 기존 패스프레이즈를 잃는 것을 막기 위해 중단한다.\n"
            "파일을 고치거나 --passphrase 로 직접 넘겨라.")
    # 폰에서 한 번 입력하면 IndexedDB에 남으므로 길이보다 오타 안 나는 게 중요
    pw = "-".join(secrets.token_hex(2) for _ in range(3))
    SECRETS_FILE.write_text(
        "# SECRETS — 저장소에 커밋되지 않는다(.gitignore)\n\n"
        f"passphrase: `{pw}`\n\n"
        "사이트 첫 접속 때 입력하는 값이다.\n\n"
        "- 두 사람이 첫 접속 때 한 번 입력한다. 이후 브라우저에 저장된다.\n"
        "- 바꾸려면 이 값을 고치고 `python pipeline/build/pack.py` 를 다시 돌린다.\n"
        "- 이 파일을 잃으면 배포본을 복호화할 수 없다.\n",
        encoding="utf-8")
    print(f"  ** 새 패스프레이즈를 생성해 SECRETS.md 에 기록했다: {pw}")
    return pw


def derive(pw: str, salt: bytes) -> bytes:
    return hashlib.pbkdf2_hmac("sha256", pw.encode("utf-8"), salt, KDF_ITERS, 32)


def b64(b: bytes) -> str:
    return base64.b64encode(b).decode("ascii")


def sources() -> list[Path]:
    """JSON 샤드 + 이미지 자산. PNG 도 저작물이므로 평문으로 배포하지 않는다."""
    return sorted(p for p in SRC.rglob("*")
                  if p.is_file() and p.suffix.lower() in (".json", ".png"))


def pack() -> int:
    if not SRC.exists():
        print("먼저 shard.py 를 돌려라.")
        return 1
    pw = get_passphrase()
    salt = secrets.token_bytes(SALT_LEN)
    key = derive(pw, salt)
    aes = AESGCM(key)

    DST.mkdir(parents=True, exist_ok=True)
    for old in DST.rglob("*.enc"):
        old.unlink()

    files, total_in, total_out = [], 0, 0
    print("=" * 70)
    print("Phase 3-B 암호화 패킹 (PBKDF2-SHA256 250k + AES-256-GCM)")
    print("=" * 70)
    for p in sources():
        rel = p.relative_to(SRC).as_posix()
        raw = p.read_bytes()
        iv = secrets.token_bytes(IV_LEN)
        ct = aes.encrypt(iv, raw, None)
        out = DST / (rel + ".enc")
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(iv + ct)
        files.append({
            "path": rel,
            "enc": rel + ".enc",
            "sha256": hashlib.sha256(raw).hexdigest(),
            "size": len(raw),
            "encSize": len(iv) + len(ct),
        })
        total_in += len(raw)
        total_out += len(iv) + len(ct)
        print(f"  {rel:<28}{len(raw) / 1024:>8.1f}KB → {(len(iv) + len(ct)) / 1024:>8.1f}KB")

    manifest = {
        "version": 1,
        "kdf": {"name": "PBKDF2", "hash": "SHA-256",
                "iterations": KDF_ITERS, "salt": b64(salt)},
        "cipher": {"name": "AES-GCM", "ivLength": IV_LEN, "tagLength": 128},
        "check": None,
        "files": files,
    }
    # 패스프레이즈 검증용 카나리 — 틀린 암호를 즉시 알려주기 위한 것
    civ = secrets.token_bytes(IV_LEN)
    manifest["check"] = {"iv": b64(civ),
                         "data": b64(aes.encrypt(civ, b"gisa-study-ok", None))}

    (C.REPO / "web" / "public" / "manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")

    print(f"\n  파일 {len(files)}개  평문 {total_in / 1024:.1f}KB "
          f"→ 암호문 {total_out / 1024:.1f}KB")
    print(f"  manifest.json 은 평문이지만 복호화 파라미터·무결성 해시만 담는다")
    return 0


def verify() -> int:
    mpath = C.REPO / "web" / "public" / "manifest.json"
    if not mpath.exists():
        print("manifest.json 이 없다. 먼저 pack 을 돌려라.")
        return 1
    man = json.loads(mpath.read_text(encoding="utf-8"))
    pw = get_passphrase()
    key = derive(pw, base64.b64decode(man["kdf"]["salt"]))
    aes = AESGCM(key)

    print("=" * 70)
    print("복호화 왕복 검증")
    print("=" * 70)

    chk = man["check"]
    try:
        assert aes.decrypt(base64.b64decode(chk["iv"]),
                           base64.b64decode(chk["data"]), None) == b"gisa-study-ok"
        print("  카나리        OK (패스프레이즈 일치)")
    except Exception:
        print("  카나리        FAIL — 패스프레이즈 불일치")
        return 1

    bad = []
    for f in man["files"]:
        blob = (DST / f["enc"]).read_bytes()
        try:
            plain = aes.decrypt(blob[:IV_LEN], blob[IV_LEN:], None)
        except Exception as e:
            bad.append(f"{f['path']}: 복호화 실패 {e}")
            continue
        if hashlib.sha256(plain).hexdigest() != f["sha256"]:
            bad.append(f"{f['path']}: 해시 불일치")
            continue
        if f["path"].endswith(".json"):
            json.loads(plain)                 # 파싱까지 확인
        elif not plain.startswith(b"\x89PNG"):
            bad.append(f"{f['path']}: PNG 시그니처 아님")
    print(f"  파일 {len(man['files'])}개  해시·JSON 파싱 "
          f"{'전부 OK' if not bad else '실패'}")

    # 평문 유출 점검 — 배포 트리(web/public)에 원문이 있으면 dist 로 실려 나간다
    pub = C.REPO / "web" / "public"
    leaked = [p.relative_to(C.REPO).as_posix()
              for p in pub.rglob("*")
              if p.is_file() and p.suffix.lower() in (".json", ".png")
              and "enc" not in p.relative_to(pub).parts
              and p.name != "manifest.json"]
    if leaked:
        bad.append(f"배포 트리에 평문 {len(leaked)}개: {leaked[:5]}")
    else:
        print("  평문 유출      없음 (web/public 에는 enc/ 와 manifest.json 뿐)")

    for b in bad:
        print("  -", b)
    print("\n" + ("Phase 3-B PASS" if not bad else "Phase 3-B FAIL"))
    return 1 if bad else 0


if __name__ == "__main__":
    raise SystemExit(verify() if "--verify" in sys.argv else pack())

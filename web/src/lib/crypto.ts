// 배포본 복호화 — WebCrypto(PBKDF2 + AES-GCM). 서버 없음.
// 파라미터는 pipeline/build/pack.py 와 짝을 이룬다. 한쪽만 바꾸면 복호화가 깨진다.
//
// 구현 메모: 바이트는 전부 ArrayBuffer 로 다룬다.
// TS 5.7 부터 Uint8Array<ArrayBufferLike> 는 BufferSource/BlobPart 에 대입되지
// 않는다(SharedArrayBuffer 가능성 때문). ArrayBuffer 를 직접 쓰면 그 문제가 없다.

export interface Manifest {
  version: number;
  kdf: { name: 'PBKDF2'; hash: 'SHA-256'; iterations: number; salt: string };
  cipher: { name: 'AES-GCM'; ivLength: number; tagLength: number };
  check: { iv: string; data: string };
  files: { path: string; enc: string; sha256: string; size: number }[];
}

function b64(s: string): ArrayBuffer {
  const bin = atob(s);
  const buf = new ArrayBuffer(bin.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i += 1) view[i] = bin.charCodeAt(i);
  return buf;
}

export async function deriveKey(passphrase: string, man: Manifest): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passphrase).buffer as ArrayBuffer,
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: b64(man.kdf.salt),
      iterations: man.kdf.iterations,
      hash: man.kdf.hash,
    },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );
}

/** 패스프레이즈가 맞는지 즉시 판별한다. 큰 샤드를 받기 전에 부른다. */
export async function checkKey(key: CryptoKey, man: Manifest): Promise<boolean> {
  try {
    const out = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: b64(man.check.iv) }, key, b64(man.check.data),
    );
    return new TextDecoder().decode(out) === 'gisa-study-ok';
  } catch {
    return false;
  }
}

async function fetchAndDecrypt(
  key: CryptoKey, man: Manifest, path: string, baseUrl: string,
): Promise<ArrayBuffer> {
  const entry = man.files.find((f) => f.path === path);
  if (!entry) throw new Error(`manifest 에 없는 경로: ${path}`);

  const res = await fetch(`${baseUrl}enc/${entry.enc}`);
  if (!res.ok) throw new Error(`샤드 로드 실패 ${path}: ${res.status}`);

  const blob = await res.arrayBuffer();
  const ivLen = man.cipher.ivLength;
  return crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: blob.slice(0, ivLen) }, key, blob.slice(ivLen),
  );
}

export async function decryptJson<T>(
  key: CryptoKey, man: Manifest, path: string, baseUrl = import.meta.env.BASE_URL,
): Promise<T> {
  const plain = await fetchAndDecrypt(key, man, path, baseUrl);
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}

/** 이미지 자산 복호화. PNG 도 저작물이라 평문으로 배포하지 않는다. */
export async function decryptBytes(
  key: CryptoKey, man: Manifest, path: string, baseUrl = import.meta.env.BASE_URL,
): Promise<ArrayBuffer> {
  return fetchAndDecrypt(key, man, path, baseUrl);
}

export async function loadManifest(baseUrl = import.meta.env.BASE_URL): Promise<Manifest> {
  const res = await fetch(`${baseUrl}manifest.json`);
  if (!res.ok) throw new Error(`manifest 로드 실패: ${res.status}`);
  return res.json();
}

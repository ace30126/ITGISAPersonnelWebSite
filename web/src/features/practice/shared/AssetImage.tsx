// 암호화된 PNG 를 objectURL 로 바꿔 그린다.
// 평범한 <img src="...png"> 로는 절대 안 보인다 — 자산도 AES-GCM 이다.

import { useEffect, useState } from 'react';
import { loadAsset } from '../../../lib/dataLoader';

export default function AssetImage({ src, alt }: { src: string; alt: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setUrl(null);
    setFailed(false);
    loadAsset(src)
      .then((u) => { if (alive) setUrl(u); })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [src]);

  if (failed) {
    return (
      <p className="rounded-xl border border-ink-700 bg-ink-800 p-3 text-xs text-[color:var(--fg-dim)]">
        이미지를 불러오지 못했다. ({src.split('/').pop()})
      </p>
    );
  }

  if (!url) return <div className="skeleton h-40 w-full" />;

  return (
    <div className="scroll-x rounded-xl bg-white p-2">
      {/* 원본이 흰 배경의 스캔 이미지라 다크 테마에서도 흰 판 위에 얹는다. */}
      <img src={url} alt={alt} className="mx-auto block h-auto max-w-full" />
    </div>
  );
}

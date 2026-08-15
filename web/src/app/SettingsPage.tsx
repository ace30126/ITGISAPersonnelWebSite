// 설정. 셸이 소유하고, AI 설정(B4)은 슬롯으로 끼운다.

import { useState } from 'react';
import AiSettings from '../features/ai/AiSettings';
import { useUnlock } from '../features/unlock/context';

export default function SettingsPage() {
  const { relock } = useUnlock();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-base font-bold">AI 도우미</h2>
        <div className="mt-2 overflow-hidden rounded-2xl border border-ink-700 bg-ink-800/70">
          {/* 슬롯 — B4 가 채운다. 셸은 자리와 테두리만 준다. */}
          <AiSettings />
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold">잠금</h2>
        <div className="card mt-2 space-y-3">
          <p className="text-sm text-[color:var(--fg-dim)]">
            패스프레이즈는 이 기기의 IndexedDB 에만 저장됩니다. 공용 기기에서 썼거나
            패스프레이즈가 바뀌었다면 초기화하세요.
          </p>
          {confirming ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn bg-bad text-ink-900"
                onClick={() => {
                  void relock();
                }}
              >
                정말 초기화
              </button>
              <button type="button" className="btn-ghost" onClick={() => setConfirming(false)}>
                취소
              </button>
            </div>
          ) : (
            <button type="button" className="btn-ghost" onClick={() => setConfirming(true)}>
              잠금 초기화
            </button>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-base font-bold">앱 정보</h2>
        <dl className="card mt-2 space-y-2 text-sm">
          <Row k="자료" v="정보처리기사 필기 기출 1,243문항" />
          <Row k="저장" v="학습 기록은 이 기기에만 저장됩니다(서버 없음)" />
          <Row k="오프라인" v="한 번 연 화면과 받아둔 샤드는 오프라인에서도 열립니다" />
        </dl>
      </section>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-3">
      <dt className="w-16 shrink-0 text-[color:var(--fg-dim)]">{k}</dt>
      <dd className="m-0 min-w-0 flex-1">{v}</dd>
    </div>
  );
}

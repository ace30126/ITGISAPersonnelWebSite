// 잠금 게이트.
//
// 배포본 전체가 AES-GCM 으로 암호화돼 있다. 열쇠가 없으면 라우터 자체를
// 마운트하지 않는다 — 하위 페이지들이 loadIndex() 를 부르며 예외를 던지는
// 상황을 원천 차단하기 위해서다.
//
// 패스프레이즈 판정은 manifest 의 카나리(checkKey)로 즉시 끝난다.
// 큰 샤드는 한 바이트도 받지 않는다.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { lock, unlock } from '../../lib/dataLoader';
import { UnlockContext } from './context';
import { clearPassphrase, getStoredPassphrase, savePassphrase } from './keyStore';

type Phase =
  | 'restoring' // 저장된 열쇠로 자동 해제 시도 중
  | 'form' // 입력 대기
  | 'verifying' // 사용자가 넣은 값 검증 중
  | 'ready'; // 해제됨

const HINTS: Record<Exclude<Phase, 'form' | 'ready'>, string> = {
  restoring: '저장된 열쇠로 여는 중…',
  verifying: '열쇠를 확인하는 중…',
};

export default function UnlockGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>('restoring');
  const [pass, setPass] = useState('');
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // 첫 진입: 저장된 패스프레이즈가 있으면 물어보지 않는다.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const stored = await getStoredPassphrase();
        if (!alive) return;
        if (!stored) {
          setPhase('form');
          return;
        }
        const ok = await unlock(stored);
        if (!alive) return;
        if (ok) {
          setPhase('ready');
        } else {
          // 패스프레이즈가 바뀌어 재빌드된 배포본 — 저장분을 버리고 다시 묻는다.
          await clearPassphrase();
          if (!alive) return;
          setNotice('저장된 열쇠가 더 이상 맞지 않습니다. 다시 입력해 주세요.');
          setPhase('form');
        }
      } catch (e) {
        if (!alive) return;
        setError(describe(e));
        setPhase('form');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (phase === 'form') inputRef.current?.focus();
  }, [phase]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const value = pass.trim();
      if (!value) return;
      setError(null);
      setNotice(null);
      setPhase('verifying');
      try {
        const ok = await unlock(value);
        if (!mounted.current) return;
        if (!ok) {
          setError('패스프레이즈가 맞지 않습니다.');
          setPhase('form');
          return;
        }
        await savePassphrase(value);
        if (!mounted.current) return;
        setPass('');
        setPhase('ready');
      } catch (err) {
        if (!mounted.current) return;
        setError(describe(err));
        setPhase('form');
      }
    },
    [pass],
  );

  const api = useMemo(
    () => ({
      relock: async () => {
        await clearPassphrase();
        lock();
        setPass('');
        setNotice('잠금이 초기화되었습니다.');
        setPhase('form');
      },
    }),
    [],
  );

  if (phase === 'ready') {
    return <UnlockContext.Provider value={api}>{children}</UnlockContext.Provider>;
  }

  const busy = phase === 'restoring' || phase === 'verifying';

  return (
    <div className="flex min-h-[100svh] flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-accent to-ink-600 text-2xl font-extrabold text-white">
            정
          </div>
          <h1 className="mt-4 text-xl font-bold">정보처리기사 필기</h1>
          <p className="mt-1 text-sm text-[color:var(--fg-dim)]">
            기출 1,243문항 · 개념 · 모의고사
          </p>
        </div>

        {busy ? (
          <Skeleton hint={HINTS[phase]} />
        ) : (
          <form onSubmit={onSubmit} className="card space-y-3" noValidate>
            <label htmlFor="passphrase" className="block text-sm font-semibold">
              패스프레이즈
            </label>
            <p className="text-xs leading-relaxed text-[color:var(--fg-dim)]">
              학습 자료가 암호화되어 있습니다. 처음 한 번만 입력하면 이 기기에
              저장되어 다음부터는 바로 열립니다.
            </p>

            <div className="relative">
              <input
                id="passphrase"
                ref={inputRef}
                type={reveal ? 'text' : 'password'}
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="go"
                placeholder="xxxx-xxxx-xxxx"
                aria-invalid={!!error}
                aria-describedby={error ? 'passphrase-error' : undefined}
                className="min-h-tap w-full rounded-xl border border-ink-600 bg-ink-900 px-3 py-2 pr-16 tracking-wider text-[color:var(--fg)] placeholder:text-ink-600 focus:border-accent focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setReveal((v) => !v)}
                className="absolute right-1 top-1/2 min-h-tap -translate-y-1/2 rounded-lg px-3 text-xs font-semibold text-[color:var(--fg-dim)] hover:text-[color:var(--fg)]"
                aria-pressed={reveal}
              >
                {reveal ? '숨김' : '표시'}
              </button>
            </div>

            {error && (
              <p id="passphrase-error" role="alert" className="text-sm font-semibold text-bad">
                {error}
              </p>
            )}
            {notice && !error && (
              <p role="status" className="text-sm text-[color:var(--fg-dim)]">
                {notice}
              </p>
            )}

            <button type="submit" disabled={!pass.trim()} className="btn-primary w-full">
              잠금 해제
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/** 폰에서 첫 해제는 PBKDF2 25만 회 때문에 수 초가 걸릴 수 있다 — 반드시 진행 표시. */
function Skeleton({ hint }: { hint: string }) {
  return (
    <div className="card" role="status" aria-live="polite">
      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700">
        <div className="h-full w-1/3 animate-[gisa-slide_1.1s_ease-in-out_infinite] rounded-full bg-accent" />
      </div>
      <p className="mt-3 text-sm text-[color:var(--fg-dim)]">{hint}</p>
      <div className="mt-4 space-y-2">
        <div className="skeleton h-4 w-4/5" />
        <div className="skeleton h-4 w-3/5" />
        <div className="skeleton h-4 w-2/5" />
      </div>
      <style>{`@keyframes gisa-slide{0%{transform:translateX(-100%)}100%{transform:translateX(300%)}}`}</style>
    </div>
  );
}

function describe(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  if (/manifest/i.test(msg)) {
    return '자료 목록(manifest)을 불러오지 못했습니다. 네트워크를 확인해 주세요.';
  }
  return `열기에 실패했습니다: ${msg}`;
}

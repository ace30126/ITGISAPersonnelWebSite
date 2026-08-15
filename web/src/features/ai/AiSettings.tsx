// AI 설정 — BYOK 키 입력. 라우터에서 페이지로 써도 되고, WhyPanel 안에서
// compact 로 접어 넣어도 된다.

import { useCallback, useEffect, useState } from 'react';
import { GEMINI_KEY_URL, GEMINI_MODEL } from './constants';
import { clearAnswers, listAnswers } from './cache';
import {
  clearKey,
  getKey,
  getSendItemText,
  looksLikeKey,
  maskKey,
  setKey,
  setSendItemText,
} from './keyStore';

export interface AiSettingsProps {
  compact?: boolean;
  onKeyChange?: (hasKey: boolean) => void;
}

export default function AiSettings({ compact = false, onKeyChange }: AiSettingsProps) {
  const [saved, setSaved] = useState(getKey());
  const [draft, setDraft] = useState('');
  const [reveal, setReveal] = useState(false);
  const [sendItems, setSendItems] = useState(getSendItemText());
  const [cacheCount, setCacheCount] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const refreshCache = useCallback(() => {
    void listAnswers().then((rows) => setCacheCount(rows.length));
  }, []);

  useEffect(refreshCache, [refreshCache]);

  const save = useCallback(() => {
    const v = draft.trim();
    if (!v) return;
    setKey(v);
    setSaved(v);
    setDraft('');
    setMsg(
      looksLikeKey(v)
        ? '저장했습니다. 개념 페이지에서 [이건 왜 그럴까요?] 를 눌러 보세요.'
        : '저장은 했지만 키 형식이 평소와 다릅니다(보통 AIza… 로 시작합니다). 한 번 확인해 주세요.',
    );
    onKeyChange?.(true);
  }, [draft, onKeyChange]);

  const remove = useCallback(() => {
    clearKey();
    setSaved('');
    setMsg('키를 지웠습니다.');
    onKeyChange?.(false);
  }, [onKeyChange]);

  return (
    // 설정 페이지(셸)가 이미 테두리를 그려 준다. compact 로 다른 화면에 끼울 때만
    // 스스로 테두리를 갖는다 — 이중 테두리를 만들지 않기 위해서다.
    <section
      className={compact ? 'rounded-xl border border-ink-700 bg-ink-900/40 p-3' : 'p-4'}
    >
      {!compact && <h2 className="text-lg font-bold">AI 설명 설정</h2>}

      <p className="mt-1 text-xs leading-relaxed opacity-75" style={{ wordBreak: 'keep-all' }}>
        키는 이 브라우저에만 저장되고 서버로 보내지지 않습니다(중계 서버가 없습니다).
        요청은 브라우저에서 구글로 바로 갑니다. 공용 PC 에서는 쓰고 나서 지워 주세요.
      </p>

      <div className="mt-3">
        <label className="block text-xs font-semibold opacity-80" htmlFor="gemini-key">
          Google AI Studio API 키
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="gemini-key"
            type={reveal ? 'text' : 'password'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={saved ? maskKey(saved) : 'AIza…'}
            autoComplete="off"
            spellCheck={false}
            className="min-h-tap w-full rounded-lg bg-ink-900 px-3 py-2 text-sm ring-1 ring-ink-600 outline-none focus:ring-accent"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="min-h-tap shrink-0 rounded-lg px-2 text-xs opacity-70 ring-1 ring-ink-600"
          >
            {reveal ? '가림' : '보기'}
          </button>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={save}
            disabled={draft.trim().length === 0}
            className="btn-primary text-sm"
          >
            저장
          </button>
          {saved && (
            <button
              type="button"
              onClick={remove}
              className="btn-ghost text-sm"
            >
              키 삭제
            </button>
          )}
        </div>

        <p className="mt-2 text-xs opacity-70">
          {saved ? (
            <>
              저장됨: <span className="font-mono">{maskKey(saved)}</span>
            </>
          ) : (
            <>아직 키가 없습니다. 아래 순서로 1분이면 발급됩니다.</>
          )}
        </p>
        {msg && <p className="mt-1 text-xs text-accent-soft">{msg}</p>}
      </div>

      {!saved && (
        <ol
          className="mt-3 list-decimal space-y-1 pl-5 text-xs leading-relaxed opacity-80"
          style={{ wordBreak: 'keep-all' }}
        >
          <li>
            <a
              href={GEMINI_KEY_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent underline underline-offset-2"
            >
              Google AI Studio (aistudio.google.com/app/apikey)
            </a>{' '}
            에 구글 계정으로 로그인
          </li>
          <li>[Create API key] → 프로젝트 선택 → 생성</li>
          <li>AIza… 로 시작하는 문자열을 복사해 위에 붙여넣고 저장</li>
          <li>무료 등급으로 충분합니다. 한 개념당 한 번만 호출하고 결과는 저장됩니다.</li>
        </ol>
      )}

      <label className="mt-4 flex items-start gap-2 text-xs opacity-80">
        <input
          type="checkbox"
          checked={sendItems}
          onChange={(e) => {
            setSendItems(e.target.checked);
            setSendItemText(e.target.checked);
          }}
          className="mt-0.5"
        />
        <span style={{ wordBreak: 'keep-all' }}>
          기출 문항 원문을 프롬프트에 함께 보내기 — <b>기본 꺼짐</b>. 문제 원문은 저작물이라
          외부 API 로 보내지 않는 것이 안전합니다. 꺼져 있어도 개념 노트만으로 설명은 나옵니다.
        </span>
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ink-700 pt-3 text-xs opacity-75">
        <span>모델 {GEMINI_MODEL}</span>
        <span aria-hidden>·</span>
        <span>저장된 답변 {cacheCount ?? '…'}개</span>
        <button
          type="button"
          onClick={() => {
            void clearAnswers().then(() => {
              refreshCache();
              setMsg('저장된 AI 답변을 모두 지웠습니다.');
            });
          }}
          className="min-h-tap rounded-lg px-2 py-1 underline underline-offset-2"
        >
          캐시 비우기
        </button>
      </div>
    </section>
  );
}

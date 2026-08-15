import { useState } from 'react';
import { backupFileName, exportBackup, importBackup, type ImportReport } from './backup';

/**
 * 백업 UI. attempts + notes 만 담는다 — SRS·통계는 가져오기 직후 재계산된다.
 * 두 사람이 각자 로컬에 쓰고 자동 동기화는 하지 않는다. 파일을 주고받는 방식이라
 * 같은 기록을 여러 번 넣어도 안전해야 한다 (같은 itemId+ts 는 건너뛴다).
 */
export function BackupPanel() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onExport() {
    setBusy(true); setErr(null); setMsg(null);
    try {
      const data = await exportBackup();
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backupFileName();
      a.click();
      // 즉시 revoke 하면 사파리에서 저장이 끊긴다. 한 틱 뒤에 정리한다.
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMsg(`${data.attempts.length}건의 기록과 메모 ${data.notes.length}건을 내보냈다.`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : '내보내기에 실패했다.');
    } finally {
      setBusy(false);
    }
  }

  async function onImport(file: File) {
    setBusy(true); setErr(null); setMsg(null);
    try {
      const raw: unknown = JSON.parse(await file.text());
      const r: ImportReport = await importBackup(raw);
      setMsg(
        `기록 ${r.attemptsAdded}건 추가, ${r.attemptsSkipped}건은 이미 있어 건너뛰었다. ` +
        `메모 ${r.notesAdded + r.notesUpdated}건 반영. 복습 일정은 다시 계산했다.`,
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : '가져오기에 실패했다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-ink-700 bg-ink-800/60 p-4">
      <h2 className="mb-1 text-sm font-semibold text-white/80">백업</h2>
      <p className="mb-3 text-[11px] leading-relaxed text-white/40">
        푼 기록과 메모만 JSON 으로 저장한다. 복습 일정·통계는 기록에서 다시 계산되므로
        넣지 않는다. 같은 파일을 두 번 넣어도 기록이 중복되지 않는다.
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onExport}
          disabled={busy}
          className="min-h-tap rounded-xl border border-ink-600 bg-ink-700 px-4 text-sm font-medium text-white disabled:opacity-40"
        >
          내보내기
        </button>
        <label className="min-h-tap flex cursor-pointer items-center rounded-xl border border-ink-600 bg-ink-700 px-4 text-sm font-medium text-white">
          가져오기
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = ''; // 같은 파일을 연속으로 고를 수 있게 비운다
              if (f) void onImport(f);
            }}
          />
        </label>
      </div>
      {msg ? <p className="mt-3 text-xs text-ok">{msg}</p> : null}
      {err ? <p className="mt-3 text-xs text-bad">{err}</p> : null}
    </section>
  );
}

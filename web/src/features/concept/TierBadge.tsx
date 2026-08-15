import type { ConceptFreq } from './freq';
import type { Tier } from './types';

const STYLE: Record<Tier, string> = {
  S: 'bg-bad/20 text-bad ring-bad/50',
  A: 'bg-accent/20 text-accent-soft ring-accent/50',
  B: 'bg-ok/15 text-ok ring-ok/40',
  C: 'bg-ink-700 text-white/60 ring-ink-600',
};

const LABEL: Record<Tier, string> = {
  S: '거의 매 회차',
  A: '자주',
  B: '가끔',
  C: '드묾',
};

/** 티어 계산 근거를 그대로 title 에 넣는다. 숫자를 감추면 안 믿는다. */
export function freqTitle(f: ConceptFreq): string {
  const base = `가중 출제 ${f.score.toFixed(1)}회 · 과목 점유율 ${(f.share * 100).toFixed(1)}%`;
  const how =
    f.percentile === null
      ? '과목 내 개념 표본이 적어 점유율 절대기준 적용'
      : `과목 내 백분위 ${f.percentile.toFixed(0)}`;
  return `${base} · 연결 문항 ${f.pinned}개(+자동 ${f.auto}개) · ${how}`;
}

export default function TierBadge({ freq, showLabel = true }: { freq: ConceptFreq; showLabel?: boolean }) {
  return (
    <span
      title={freqTitle(freq)}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${STYLE[freq.tier]}`}
    >
      {freq.tier}
      {showLabel && <span className="font-normal opacity-80">{LABEL[freq.tier]}</span>}
    </span>
  );
}

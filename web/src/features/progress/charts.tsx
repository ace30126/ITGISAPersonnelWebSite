// 인라인 SVG 차트. 라이브러리를 안 쓴다 (package.json 은 내 소유가 아니고,
// 이 정도 그림에 60KB 를 더 받는 건 폰에서 손해다).
//
// 공통 규칙: SVG 안에는 글자를 넣지 않는다. preserveAspectRatio="none" 으로
// 가로만 늘리기 때문에 글자를 넣으면 찌그러진다. 축 라벨은 전부 HTML 로 그린다.

export interface Bar {
  key: string;
  value: number;
  /** 그 중 정답 수 — 있으면 막대를 정답/오답 2색으로 쌓는다 */
  good?: number;
  title?: string;
}

export function BarChart({ bars, height = 80 }: { bars: Bar[]; height?: number }) {
  const max = Math.max(1, ...bars.map((b) => b.value));
  const W = 300;
  const n = Math.max(1, bars.length);
  const slot = W / n;
  const gap = Math.min(2, slot * 0.25);
  const bw = Math.max(1, slot - gap);

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="일자별 학습량"
    >
      {bars.map((b, i) => {
        const h = (b.value / max) * (height - 2);
        const x = i * slot + gap / 2;
        const good = b.good ?? 0;
        const gh = b.value ? (good / b.value) * h : 0;
        return (
          <g key={b.key}>
            {b.title ? <title>{b.title}</title> : null}
            {/* 바닥 눈금 — 안 푼 날도 자리를 보여준다 */}
            <rect x={x} y={height - 1} width={bw} height={1} className="fill-ink-600" />
            {h > 0 && (
              <>
                <rect x={x} y={height - h} width={bw} height={h - gh} className="fill-bad" />
                <rect x={x} y={height - gh} width={bw} height={gh} className="fill-ok" />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export interface LinePoint {
  key: string;
  value: number;
  title?: string;
}

/** 모의고사 점수 추이. 합격선(기본 60)을 점선으로 깐다. */
export function LineChart({
  points, min = 0, max = 100, threshold, height = 100,
}: {
  points: LinePoint[];
  min?: number;
  max?: number;
  threshold?: number;
  height?: number;
}) {
  const W = 300;
  const pad = 6;
  const span = Math.max(1, max - min);
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);
  const x = (i: number) =>
    points.length <= 1 ? W / 2 : pad + (i / (points.length - 1)) * (W - pad * 2);

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ');

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      role="img"
      aria-label="모의고사 점수 추이"
    >
      {threshold !== undefined && (
        <line
          x1={0} x2={W} y1={y(threshold)} y2={y(threshold)}
          className="stroke-ok" strokeWidth={1} strokeDasharray="4 4"
          vectorEffect="non-scaling-stroke" opacity={0.6}
        />
      )}
      <path
        d={d} fill="none" className="stroke-accent" strokeWidth={2}
        vectorEffect="non-scaling-stroke" strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <rect
          key={p.key}
          x={x(i) - 2} y={y(p.value) - 2} width={4} height={4}
          className={threshold !== undefined && p.value < threshold ? 'fill-bad' : 'fill-ok'}
        >
          {p.title ? <title>{p.title}</title> : null}
        </rect>
      ))}
    </svg>
  );
}

/** 가로 막대 하나 — 과목별 정답률처럼 "비율 하나"를 보일 때. */
export function RateBar({ value, total }: { value: number; total: number }) {
  const r = total === 0 ? 0 : value / total;
  const good = r >= 0.6;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-ink-700">
      <div
        className={`h-full rounded-full ${good ? 'bg-ok' : 'bg-bad'}`}
        style={{ width: `${Math.round(r * 100)}%` }}
      />
    </div>
  );
}

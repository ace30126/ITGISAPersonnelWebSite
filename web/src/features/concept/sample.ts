// 샘플 개념 3개 — Phase 5 집필분이 오기 전까지 화면을 실제로 동작시키는 데이터.
//
// ⚠ 이 파일은 통째로 교체될 자리다. data.ts 의 로더만 JSON fetch 로 바꾸면 되고
//   화면 코드는 손대지 않는다.
//
// tags 는 **개념 단위 태그**로 적는다(예: 'db:정규화'). 지금 경량 인덱스가 가진
// 태그는 topic:keyword / wrong / kinds / code / calc 다섯 개(문제 유형)뿐이라
// 개념과 겹치지 않는다. 그래서 오늘은 태그 자동 매칭이 0건이고, 관련 기출은
// pin + 지문 키워드 매칭으로 잡는다. (freq.ts 주석 참고)

import type { Concept } from './types';

const SVG_NORMAL_FORMS = `
<svg viewBox="0 0 560 120" width="100%" role="img" aria-label="정규화 단계 흐름도"
     fill="none" stroke="currentColor" stroke-width="1.5" font-size="13">
  <g>
    <rect x="4" y="34" width="86" height="34" rx="8" opacity="0.9"/>
    <text x="47" y="56" text-anchor="middle" stroke="none" fill="currentColor">비정규</text>
    <rect x="120" y="34" width="70" height="34" rx="8"/>
    <text x="155" y="56" text-anchor="middle" stroke="none" fill="currentColor">1NF</text>
    <rect x="220" y="34" width="70" height="34" rx="8"/>
    <text x="255" y="56" text-anchor="middle" stroke="none" fill="currentColor">2NF</text>
    <rect x="320" y="34" width="70" height="34" rx="8"/>
    <text x="355" y="56" text-anchor="middle" stroke="none" fill="currentColor">3NF</text>
    <rect x="420" y="34" width="86" height="34" rx="8"/>
    <text x="463" y="56" text-anchor="middle" stroke="none" fill="currentColor">BCNF</text>
  </g>
  <g stroke-linecap="round">
    <path d="M92 51 H116 m-6 -4 l6 4 l-6 4"/>
    <path d="M192 51 H216 m-6 -4 l6 4 l-6 4"/>
    <path d="M292 51 H316 m-6 -4 l6 4 l-6 4"/>
    <path d="M392 51 H416 m-6 -4 l6 4 l-6 4"/>
  </g>
  <g stroke="none" fill="currentColor" font-size="11" opacity="0.75" text-anchor="middle">
    <text x="104" y="26">도메인 원자값</text>
    <text x="204" y="26">부분 함수 종속 제거</text>
    <text x="304" y="26">이행 함수 종속 제거</text>
    <text x="404" y="26">결정자=후보키</text>
  </g>
  <text x="255" y="100" text-anchor="middle" stroke="none" fill="currentColor" font-size="11"
        opacity="0.75">두 부 이 결(도메인원자값 · 부분종속 · 이행종속 · 결정자)</text>
</svg>`;

const SVG_COUPLING = `
<svg viewBox="0 0 560 130" width="100%" role="img" aria-label="결합도 강약 스펙트럼"
     fill="none" stroke="currentColor" stroke-width="1.5" font-size="12">
  <path d="M20 40 H540" stroke-linecap="round"/>
  <path d="M540 40 l-8 -4 l0 8 z" fill="currentColor" stroke="none"/>
  <g stroke="none" fill="currentColor">
    <text x="20" y="26" font-size="12">약함 (좋음)</text>
    <text x="540" y="26" font-size="12" text-anchor="end">강함 (나쁨)</text>
  </g>
  <g>
    <path d="M40 34 V46"/><path d="M140 34 V46"/><path d="M240 34 V46"/>
    <path d="M340 34 V46"/><path d="M440 34 V46"/><path d="M520 34 V46"/>
  </g>
  <g stroke="none" fill="currentColor" text-anchor="middle" font-size="11">
    <text x="40" y="62">자료</text>
    <text x="140" y="62">스탬프</text>
    <text x="240" y="62">제어</text>
    <text x="340" y="62">외부</text>
    <text x="440" y="62">공통</text>
    <text x="518" y="62">내용</text>
  </g>
  <text x="280" y="100" text-anchor="middle" stroke="none" fill="currentColor" font-size="12"
        opacity="0.85">암기: 자 스 제 외 공 내</text>
  <text x="280" y="118" text-anchor="middle" stroke="none" fill="currentColor" font-size="11"
        opacity="0.7">응집도는 반대로 우 논 시 절 통 순 기 (기능적 응집도가 가장 강함)</text>
</svg>`;

const SVG_STACK_QUEUE = `
<svg viewBox="0 0 560 150" width="100%" role="img" aria-label="스택과 큐의 입출력 방향"
     fill="none" stroke="currentColor" stroke-width="1.5" font-size="12">
  <g>
    <text x="20" y="20" stroke="none" fill="currentColor" font-size="13">스택 · LIFO</text>
    <path d="M60 34 V110 H140 V34"/>
    <rect x="62" y="86" width="76" height="22"/>
    <rect x="62" y="62" width="76" height="22"/>
    <rect x="62" y="38" width="76" height="22"/>
    <g stroke="none" fill="currentColor" text-anchor="middle">
      <text x="100" y="101">A</text><text x="100" y="77">B</text><text x="100" y="53">C</text>
    </g>
    <path d="M100 26 V16" stroke-linecap="round"/>
    <path d="M170 30 l-14 0" stroke-linecap="round"/>
    <text x="176" y="34" stroke="none" fill="currentColor" font-size="11">top: push/pop 이 같은 쪽</text>
  </g>
  <g transform="translate(0,0)">
    <text x="320" y="20" stroke="none" fill="currentColor" font-size="13">큐 · FIFO</text>
    <path d="M330 40 H520 M330 84 H520"/>
    <rect x="342" y="46" width="46" height="32"/>
    <rect x="398" y="46" width="46" height="32"/>
    <rect x="454" y="46" width="46" height="32"/>
    <g stroke="none" fill="currentColor" text-anchor="middle">
      <text x="365" y="67">A</text><text x="421" y="67">B</text><text x="477" y="67">C</text>
    </g>
    <path d="M528 62 H544 m-6 -4 l6 4 l-6 4" stroke-linecap="round"/>
    <path d="M306 62 H326 m-6 -4 l6 4 l-6 4" stroke-linecap="round"/>
    <g stroke="none" fill="currentColor" font-size="11" opacity="0.8">
      <text x="300" y="100" text-anchor="middle">rear 삽입</text>
      <text x="536" y="100" text-anchor="middle">front 삭제</text>
    </g>
  </g>
  <text x="280" y="136" text-anchor="middle" stroke="none" fill="currentColor" font-size="11"
        opacity="0.7">스택=한쪽 끝만 사용 · 큐=양쪽 끝을 나눠 사용</text>
</svg>`;

export const SAMPLE_CONCEPTS: Concept[] = [
  {
    id: 'db-normalization',
    subject: 3,
    title: '정규화와 이상 현상',
    level: 'core',
    tags: ['db:정규화', 'db:함수종속', 'db:이상현상'],
    body: `
## 한 줄 정의

**정규화(Normalization)** 는 중복을 줄이도록 릴레이션을 쪼개서, 삽입·삭제·갱신
이상(anomaly)이 생기지 않게 만드는 작업이다.

## 왜 쪼개나 — 이상 현상 3가지

| 이상 | 언제 터지나 | 예 |
| --- | --- | --- |
| 삽입 이상 | 필요 없는 값까지 억지로 채워야 저장됨 | 아직 수강생 없는 과목을 못 넣음 |
| 삭제 이상 | 한 줄을 지웠더니 다른 정보까지 날아감 | 마지막 수강생 삭제 → 과목 정보 소멸 |
| 갱신 이상 | 중복된 값 일부만 고쳐서 불일치 | 학과 사무실 번호를 한 줄만 수정 |

## 단계별 조건

1. **1NF** — 모든 속성이 원자값(하나의 칸에 값 하나)
2. **2NF** — 1NF + **부분 함수 종속** 제거 (복합키 일부에만 매달린 속성을 분리)
3. **3NF** — 2NF + **이행 함수 종속** 제거 (A → B, B → C 인 A → C 를 분리)
4. **BCNF** — 모든 결정자가 후보키
5. 4NF(다치 종속) · 5NF(조인 종속) 는 이름만 알아 두면 된다

> 순서 암기: **도부이결다조** — 도메인 원자값, 부분종속, 이행종속, 결정자, 다치, 조인.

## 반정규화는 반대편

조회 성능을 위해 일부러 중복을 되돌리는 게 **반정규화(Denormalization)** 다.
중복 테이블 추가, 테이블 병합·분할, 중복 컬럼 추가가 대표 기법이고
"정규화의 실패"가 아니라 **의도된 트레이드오프**다.

## 시험 포인트

- "A → B, B → C 일 때 A → C 를 제거하는 단계" → **3NF**
- "결정자가 후보키가 아닌 것을 제거" → **BCNF**
- 정규화의 목적: 중복 최소화·이상 제거·일관성. **검색 속도 향상은 목적이 아니다**
  (오히려 조인이 늘어 느려질 수 있다). 이 함정이 반복 출제된다.
`.trim(),
    items: [
      'q:2022-1:050',
      'q:2022-3:049',
      'q:2023-2:055',
      'q:2023-3:049',
      'q:2024-1:046',
      'q:2024-2:048',
      'q:2024-3:044',
      'q:2024-3:055',
      'q:2025-2:050',
      'q:2025-2:052',
      's:20200606:060',
      's:20200822:050',
      's:20200822:056',
    ],
    quiz: [
      {
        q: '함수 종속이 A → B, B → C 일 때 A → C 관계를 제거하는 정규화 단계는?',
        choices: ['1NF', '2NF', '3NF', 'BCNF'],
        a: 2,
        why: '이행 함수 종속(transitive dependency)을 없애는 단계가 3NF 다. 부분 함수 종속 제거는 2NF, 결정자가 후보키가 아닌 경우 제거는 BCNF.',
      },
      {
        q: '정규화의 목적으로 보기 어려운 것은?',
        choices: ['데이터 중복 최소화', '이상 현상 제거', '검색 속도 향상', '데이터 일관성 유지'],
        a: 2,
        why: '정규화는 릴레이션을 쪼개므로 조인이 늘어 조회가 느려질 수 있다. 속도가 필요하면 반정규화를 한다.',
      },
    ],
    diagrams: [{ id: 'nf-flow', svg: SVG_NORMAL_FORMS }],
  },
  {
    id: 'sw-coupling-cohesion',
    subject: 4,
    title: '결합도와 응집도',
    level: 'core',
    tags: ['sw:모듈화', 'sw:결합도', 'sw:응집도'],
    body: `
## 한 줄 정의

**결합도(Coupling)** 는 모듈 *사이*가 얼마나 얽혀 있나, **응집도(Cohesion)** 는
모듈 *안*의 요소들이 얼마나 한 가지 일에 몰려 있나를 재는 척도다.
좋은 설계는 **결합도는 낮게, 응집도는 높게**다.

## 결합도 — 약한 것부터

| 단계 | 무엇을 주고받나 | 한 줄 |
| --- | --- | --- |
| 자료(Data) | 필요한 값만 파라미터로 | 가장 이상적 |
| 스탬프(Stamp) | 자료구조 통째로 | 안 쓰는 필드까지 노출 |
| 제어(Control) | 제어 플래그 | 남의 흐름을 내가 결정 |
| 외부(External) | 외부 형식·프로토콜 공유 | 외부 규격에 묶임 |
| 공통(Common) | 전역 변수 공유 | 누가 고쳤는지 추적 불가 |
| 내용(Content) | 남의 내부를 직접 참조·수정 | 최악 |

암기: **자 스 제 외 공 내**

## 응집도 — 약한 것부터

우연적 → 논리적 → 시간적 → 절차적 → 통신적 → 순차적 → **기능적**

암기: **우 논 시 절 통 순 기** (뒤로 갈수록 좋다)

- **논리적**: 비슷한 성격의 기능을 묶고 플래그로 골라 실행
- **시간적**: 초기화처럼 "같은 시점에 실행"이라는 이유만으로 묶임
- **절차적**: 순서대로 실행되지만 데이터는 안 주고받음
- **통신적**: 같은 데이터를 사용하는 기능끼리
- **순차적**: 앞 기능의 출력이 뒤 기능의 입력
- **기능적**: 단 하나의 목적만 수행 — 가장 강함

## 시험 포인트

- "다른 모듈의 내부 기능·자료를 직접 참조" → **내용 결합도**
- "제어 신호로 하위 모듈의 논리를 지시" → **제어 결합도**
- 순서 나열형이 매년 나온다. 두 암기 문장만 정확하면 그대로 득점이다.
`.trim(),
    items: [
      'q:2022-1:068',
      'q:2022-2:073',
      'q:2022-2:078',
      'q:2023-2:076',
      'q:2023-3:064',
      'q:2023-3:074',
      'q:2024-1:077',
      'q:2024-2:064',
      'q:2025-3:069',
      's:20200606:064',
      's:20200606:079',
      's:20200822:070',
      's:20200926:073',
      's:20210307:061',
      's:20210307:073',
      's:20210515:075',
      's:20210814:061',
      's:20210814:075',
    ],
    quiz: [
      {
        q: '한 모듈이 다른 모듈의 내부 기능과 내부 자료를 직접 참조할 때의 결합도는?',
        choices: ['자료 결합도', '제어 결합도', '공통 결합도', '내용 결합도'],
        a: 3,
        why: '남의 내부를 직접 들여다보는 순간 내용 결합도다. 결합도 중 가장 강하고(=나쁘고) 수정 파급이 제일 크다.',
      },
      {
        q: '가장 강한(바람직한) 응집도는?',
        choices: ['우연적 응집도', '시간적 응집도', '순차적 응집도', '기능적 응집도'],
        a: 3,
        why: '응집도는 우 논 시 절 통 순 기 순으로 강해진다. 하나의 목적만 수행하는 기능적 응집도가 가장 강하다.',
      },
    ],
    diagrams: [{ id: 'coupling-scale', svg: SVG_COUPLING }],
  },
  {
    id: 'ds-stack-queue',
    subject: 2,
    title: '스택과 큐',
    level: 'core',
    tags: ['ds:스택', 'ds:큐', 'ds:선형자료구조'],
    body: `
## 한 줄 정의

**스택(Stack)** 은 한쪽 끝(top)에서만 넣고 빼는 **LIFO**, **큐(Queue)** 는 뒤(rear)로
넣고 앞(front)에서 빼는 **FIFO** 구조다.

## 대표 응용

| 구조 | 응용 |
| --- | --- |
| 스택 | 재귀 호출, 수식의 후위 표기 변환·계산, 인터럽트 처리, 되돌리기(undo), 깊이 우선 탐색 |
| 큐 | 프로세스 스케줄링(FIFO/SJF 대기열), 프린터 스풀, 버퍼, 너비 우선 탐색 |

## 삽입·삭제 알고리즘

\`\`\`c
push(S, x) { if (Top >= n-1) overflow; else S[++Top] = x; }
pop(S)     { if (Top < 0)    underflow; else return S[Top--]; }
\`\`\`

- 스택이 가득 찬 상태에서 push → **오버플로**
- 빈 상태에서 pop → **언더플로**

## 출력 순서 문제 푸는 법

입력이 A, B, C, D 로 고정일 때 push/pop 을 섞으면 나올 수 있는 순서가 정해진다.
직접 시뮬레이션이 제일 빠르고 확실하다. 예를 들어
push A, push B, pop, push C, pop, pop → 출력 **B, C, A**.
불가능 순서를 고르는 문제는 "먼저 들어간 것이 나중 것보다 먼저 나오려면
그 사이에 pop 이 있어야 한다"만 확인하면 된다.

## 시험 포인트

- 스택은 FIFO 가 아니다. 보기에서 "FIFO 방식으로 처리된다"가 나오면 틀린 설명이다
- 큐는 삽입과 삭제가 **서로 다른 쪽**에서 일어난다
- 원형 큐(Circular Queue)는 배열 큐의 공간 낭비를 없애려는 변형
`.trim(),
    items: [
      'q:2022-1:023',
      'q:2022-1:035',
      'q:2022-3:029',
      'q:2022-3:033',
      'q:2023-2:025',
      'q:2023-3:029',
      'q:2024-2:024',
      'q:2024-3:034',
      's:20210814:027',
      's:20220305:023',
      't:code:055',
    ],
    quiz: [
      {
        q: '스택에 대한 설명으로 옳지 않은 것은?',
        choices: [
          'LIFO 방식으로 동작한다',
          '삽입과 삭제가 같은 쪽 끝에서 일어난다',
          '순서 리스트의 뒤에서 삽입하고 앞에서 삭제한다',
          '재귀 호출과 후위 표기법 계산에 쓰인다',
        ],
        a: 2,
        why: '뒤에서 넣고 앞에서 빼는 것은 큐(FIFO)다. 스택은 top 한쪽에서만 넣고 뺀다.',
      },
      {
        q: '입력 A, B, C, D 를 push, push, pop, push, pop, pop 순으로 처리했을 때 출력은?',
        choices: ['A, B, C', 'B, C, A', 'B, A, C', 'C, B, A'],
        a: 1,
        why: 'push A / push B / pop → B / push C / pop → C / pop → A. 따라서 B, C, A 다.',
      },
    ],
    diagrams: [{ id: 'stack-queue', svg: SVG_STACK_QUEUE }],
  },
];

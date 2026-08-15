---
id: cohesion
subject: 4
title: 응집도
tier: A
tags: [응집도, cohesion, 우연적응집도, 논리적응집도, 시간적응집도, 절차적응집도, 통신적응집도, 순차적응집도, 기능적응집도]
keywords: [응집도]
items: [q:2022-2:073, q:2023-3:074, q:2022-2:080, q:2022-1:068]
updated: 2026-08-15
---

## 한 줄 정의
응집도(Cohesion)는 한 모듈 안의 구성 요소들이 같은 목적으로 얼마나 묶여 있는지를 나타내며, 높을수록 좋은 설계다.

## 왜 시험에 나오나
일곱 단계 중 가장 낮은 것과 가장 높은 것을 묻는 문항이 반복된다. 특정 단계를 서술로 풀어 놓고 이름을 고르게도 한다.

## 그림
<svg viewBox="0 0 400 190" role="img" aria-label="응집도 일곱 단계를 낮은 쪽에서 높은 쪽으로 쌓은 사다리">
  <text x="200" y="16" text-anchor="middle" font-size="12" fill="currentColor">위로 갈수록 응집도가 높다 — 좋다</text>
  <rect x="70" y="22" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="38" text-anchor="middle" font-size="12" fill="currentColor">기능적 응집도</text>
  <rect x="70" y="46" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="62" text-anchor="middle" font-size="12" fill="currentColor">순차적 응집도</text>
  <rect x="70" y="70" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="86" text-anchor="middle" font-size="12" fill="currentColor">통신적 응집도</text>
  <rect x="70" y="94" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="110" text-anchor="middle" font-size="12" fill="currentColor">절차적 응집도</text>
  <rect x="70" y="118" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="134" text-anchor="middle" font-size="12" fill="currentColor">시간적 응집도</text>
  <rect x="70" y="142" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="158" text-anchor="middle" font-size="12" fill="currentColor">논리적 응집도</text>
  <rect x="70" y="166" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="182" text-anchor="middle" font-size="12" fill="currentColor">우연적 응집도</text>
</svg>

## 핵심
| 단계 | 묶인 이유 |
|---|---|
| 우연적(Coincidental) | 아무 연관이 없다. 가장 낮다 |
| 논리적(Logical) | 성격이 비슷한 기능을 한데 모으고 매개변수로 골라 쓴다 |
| 시간적(Temporal) | 같은 시간대에 실행되는 것끼리 모았다 |
| 절차적(Procedural) | 정해진 순서대로 실행되는 요소들이다 |
| 통신적(Communicational) | 같은 자료를 사용하는 요소들이다 |
| 순차적(Sequential) | 앞 요소의 출력이 뒤 요소의 입력이 된다 |
| 기능적(Functional) | 하나의 기능만 수행한다. 가장 높다 |

## 헷갈리는 지점
- 가장 낮은 응집도는 우연적, 가장 높은 응집도는 기능적이다. 보기에 시간적과 순차적을 함께 놓아 중간값을 고르게 유도한다.
- 응집도는 모듈 안의 관계다. 모듈과 모듈 사이의 의존도라고 설명한 보기는 [[coupling]] 의 정의라 틀렸다.
- 응집도는 높게, 결합도는 낮게 설계한다. 좋고 나쁨의 방향이 서로 반대라 헷갈린다.
- 통신적과 순차적을 구분한다. 같은 자료를 함께 쓰기만 하면 통신적, 앞의 결과를 뒤가 받아 쓰면 순차적이다.
- 논리적 응집도는 비슷한 성격끼리 묶은 것이지 연관이 없는 것이 아니다. 연관이 전혀 없으면 우연적이다.

## 기출 패턴
가장 낮은 응집도를 고르는 문항이 대표적이다. 서로 의미 있는 연관이 없는 요소로 이루어진 경우를 서술로 풀어 놓고 영문 이름을 고르게 하기도 한다. 모듈화 설명 네 개 중 응집도와 결합도의 정의를 뒤바꾼 문장을 찾는 문항도 반복된다.

## 퀴즈
- q: 응집도 중 가장 낮은 단계는?
  choices: [순차적 응집도, 기능적 응집도, 시간적 응집도, 우연적 응집도]
  a: 4
  why: 요소들 사이에 아무 연관이 없는 우연적 응집도가 가장 낮다. 기능적 응집도는 정반대로 가장 높은 단계다.
- q: 앞 요소의 출력이 다음 요소의 입력이 되는 응집도는?
  choices: [통신적 응집도, 순차적 응집도, 절차적 응집도, 논리적 응집도]
  a: 2
  why: 출력이 다음 입력으로 이어지면 순차적이다. 통신적은 같은 자료를 함께 쓸 뿐 결과를 넘기지 않는다.
- q: 모듈 안 구성 요소들이 공통의 목적으로 얼마나 관련되어 있는지를 나타내는 것은?
  choices: [Cohesion, Coupling, Structure, Modularity]
  a: 1
  why: 모듈 내부의 연관 정도가 Cohesion 이다. Coupling 은 모듈 사이의 의존 정도라 대상이 다르다.

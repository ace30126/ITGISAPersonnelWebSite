---
id: coupling
subject: 4
title: 결합도
tier: A
tags: [결합도, coupling, 자료결합도, 스탬프결합도, 제어결합도, 외부결합도, 공통결합도, 내용결합도, 모듈화]
keywords: [결합도]
items: [q:2022-2:078, q:2024-1:077, q:2024-2:019, q:2022-1:068]
updated: 2026-08-15
---

## 한 줄 정의
결합도(Coupling)는 모듈과 모듈 사이의 의존 정도이며, 낮을수록 좋은 설계다.

## 왜 시험에 나오나
여섯 단계 중 하나를 설명으로 풀어 놓고 이름을 고르게 하는 형태가 회차마다 나온다. [[cohesion]] 과 묶어 높고 낮음의 방향을 묻기도 한다.

## 그림
<svg viewBox="0 0 400 170" role="img" aria-label="결합도 여섯 단계를 낮은 쪽에서 높은 쪽으로 쌓은 사다리">
  <text x="200" y="16" text-anchor="middle" font-size="12" fill="currentColor">위로 갈수록 결합도가 높다 — 나쁘다</text>
  <rect x="70" y="22" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="38" text-anchor="middle" font-size="12" fill="currentColor">내용 결합도</text>
  <rect x="70" y="46" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="62" text-anchor="middle" font-size="12" fill="currentColor">공통 결합도</text>
  <rect x="70" y="70" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="86" text-anchor="middle" font-size="12" fill="currentColor">외부 결합도</text>
  <rect x="70" y="94" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="110" text-anchor="middle" font-size="12" fill="currentColor">제어 결합도</text>
  <rect x="70" y="118" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="134" text-anchor="middle" font-size="12" fill="currentColor">스탬프 결합도</text>
  <rect x="70" y="142" width="260" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="158" text-anchor="middle" font-size="12" fill="currentColor">자료 결합도</text>
</svg>

## 핵심
| 단계 | 무엇을 주고받는가 |
|---|---|
| 자료(Data) | 매개변수로 필요한 값만 넘긴다. 가장 낮다 |
| 스탬프(Stamp) | 자료 구조 전체를 넘기고 그중 일부만 쓴다 |
| 제어(Control) | 무엇을 할지 지시하는 제어 신호를 넘긴다 |
| 외부(External) | 외부에서 정한 형식이나 장치를 함께 참조한다 |
| 공통(Common) | 같은 전역 데이터에 여러 모듈이 접근한다 |
| 내용(Content) | 다른 모듈의 내부 기능과 자료를 직접 참조한다. 가장 높다 |

제어 결합도에서는 하위 모듈이 상위 모듈에게 처리 방법을 지시하는 권리 전도 현상이 생긴다.

## 헷갈리는 지점
- 자료 결합도를 "자료 구조 형태로 전달한다"라고 쓴 보기는 틀렸다. 그것은 스탬프 결합도의 설명이다. 이 맞바꿈이 반복 출제된다.
- 결합도는 낮게, 응집도는 높게 설계한다. 방향을 뒤집은 보기가 항상 함께 나온다.
- 결합도는 모듈 사이의 관계, 응집도는 모듈 안 요소들의 관계다. 응집도를 모듈 간 의존도라 설명한 보기가 정답 자리에 놓인다.
- 내용 결합도와 공통 결합도를 헷갈린다. 내부를 직접 들여다보면 내용, 전역 데이터를 함께 쓰면 공통이다.
- 제어 결합도의 표시는 제어 신호와 권리 전도다. 값만 넘기면 자료 결합도다.

## 기출 패턴
결합도 하나를 서술로 길게 설명하고 이름을 고르게 하는 형태가 대표적이다. 결합도와 응집도의 바람직한 방향을 묻는 문항, 모듈화 설명 네 개 중 틀린 것을 고르는 문항도 반복된다.

## 퀴즈
- q: 한 모듈이 다른 모듈의 내부 기능과 내부 자료를 직접 참조할 때의 결합도는?
  choices: [내용 결합도, 제어 결합도, 공통 결합도, 스탬프 결합도]
  a: 1
  why: 내부를 직접 들여다보는 것이 가장 강한 내용 결합도다. 공통 결합도는 전역 데이터를 함께 쓰는 경우라 다르다.
- q: 좋은 설계의 방향으로 옳은 것은?
  choices: [응집도는 낮게 결합도는 높게, 응집도는 높게 결합도는 낮게, 양쪽 모두 낮게, 양쪽 모두 높게]
  a: 2
  why: 모듈 안은 단단히 묶이고 모듈 사이는 느슨해야 독립적으로 고칠 수 있다. 반대로 하면 한 모듈을 고칠 때 다른 모듈까지 흔들린다.
- q: 제어 신호를 넘겨 다른 모듈의 처리 흐름을 지시할 때의 결합도는?
  choices: [자료 결합도, 스탬프 결합도, 제어 결합도, 공통 결합도]
  a: 3
  why: 제어 결합도에서는 권리 전도 현상이 나타난다. 스탬프 결합도는 자료 구조를 넘길 뿐 흐름을 지시하지 않는다.

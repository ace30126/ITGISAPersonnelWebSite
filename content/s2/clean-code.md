---
id: clean-code
subject: 2
title: 클린 코드와 리팩토링
tier: A
tags: [클린코드, 가독성, 단순성, 의존성배제, 중복성최소화, 추상화, 리팩토링, 코드스멜, 스파게티코드]
keywords: [클린코드]
items: [q:2022-1:021, q:2023-2:037, q:2022-3:034, q:2022-2:034]
updated: 2026-08-15
---

## 한 줄 정의

클린 코드(Clean Code)는 누구나 쉽게 읽고 고칠 수 있도록 단순하고 명료하게 작성한 코드다.

## 왜 시험에 나오나

2과목에서 작성 원칙 다섯 개만 반복해 묻는다. 원칙 하나의 방향을 반대로 뒤집어 틀린 보기를 만드는 방식이 고정돼 있다.

## 그림

<svg viewBox="0 0 380 130" role="img" aria-label="클린 코드 작성 원칙 다섯 가지와 각 원칙의 방향">
  <rect x="8" y="14" width="110" height="34" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="63" y="36" text-anchor="middle" font-size="13" fill="currentColor">가독성</text>
  <text x="128" y="36" font-size="12" fill="currentColor">누구나 읽기 쉽게</text>
  <rect x="8" y="54" width="110" height="34" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="63" y="76" text-anchor="middle" font-size="13" fill="currentColor">단순성</text>
  <text x="128" y="76" font-size="12" fill="currentColor">한 번에 한 가지만</text>
  <rect x="8" y="94" width="110" height="34" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="63" y="116" text-anchor="middle" font-size="13" fill="currentColor">추상화</text>
  <text x="128" y="116" font-size="12" fill="currentColor">상위는 간략, 하위는 상세</text>
  <text x="252" y="36" font-size="12" fill="currentColor">의존성 배제</text>
  <text x="252" y="54" font-size="12" fill="currentColor">영향 최소화</text>
  <text x="252" y="80" font-size="12" fill="currentColor">중복성 최소화</text>
  <text x="252" y="98" font-size="12" fill="currentColor">중복 코드 제거</text>
  <line x1="244" y1="14" x2="244" y2="118" stroke="currentColor" stroke-width="1.2" opacity="0.5"/>
</svg>

## 핵심

| 원칙 | 내용 |
|---|---|
| 가독성 | 누구든지 쉽게 읽도록 이해하기 쉬운 용어와 들여쓰기를 쓴다 |
| 단순성 | 한 번에 한 가지를 처리하도록 최소 단위로 나눈다 |
| 의존성 배제 | 코드가 다른 모듈에 미치는 영향을 최소화한다 |
| 중복성 최소화 | 중복된 코드를 없애고 공통 코드를 쓴다 |
| 추상화 | 상위에서는 특성만 간략히 나타내고 상세 내용은 하위에서 구현한다 |

- 리팩토링(Refactoring)은 겉으로 보이는 동작을 바꾸지 않고 내부 구조만 바꿔 이해와 수정을 쉽게 하는 작업이다.
- 리팩토링은 코드 스멜(Code Smell)을 다듬는 과정이다.
- 로직이 복잡하게 얽힌 코드를 스파게티 코드라 부르며 나쁜 코드로 분류한다.

## 헷갈리는 지점

- 추상화의 위아래를 뒤집는다. 간략하게 나타내는 쪽이 상위이고 상세하게 구현하는 쪽이 하위다.
- 의존성은 배제하는 것이다. 다른 모듈에 미치는 영향을 최대화하도록 작성한다는 서술은 오답이다.
- 중복성은 최소화하는 것이다. 중복이 최대화된 코드라는 보기가 그대로 정답이 되는 문항이 있다.
- 리팩토링은 기능을 더하거나 동작을 바꾸는 작업이 아니다. 유지보수와도 구분한다.

## 기출 패턴

원칙 문항은 가독성·단순성·중복성 셋을 맞게 두고 의존성이나 추상화 한 줄만 방향을 뒤집어 틀린 것을 고르게 한다. 리팩토링 문항은 동작 변화 없이 내부 구조를 바꾼다는 정의를 그대로 주고 이름을 묻는다. 오답 보기로는 설계나 명세를 뜻하는 단어를 깐다.

## 퀴즈
- q: 클린 코드 작성 원칙으로 틀린 것은?
  choices: [코드 중복을 최소화한다, 다른 모듈에 미치는 영향을 최대화한다, 누구든지 쉽게 읽도록 작성한다, 간단하게 작성한다]
  a: 2
  why: 의존성 배제 원칙에 따라 다른 모듈에 주는 영향은 최소화해야 한다. 중복 최소화는 방향이 맞는 서술이므로 정답이 아니다.
- q: 클린 코드의 추상화 원칙에 대한 설명으로 맞는 것은?
  choices: [상위에서 특성을 간략히 나타내고 상세는 하위에서 구현한다, 하위에서 특성을 간략히 나타내고 상세는 상위에서 구현한다, 모든 계층에 같은 수준으로 상세히 쓴다, 계층을 두지 않고 한 곳에 모은다]
  a: 1
  why: 위로 갈수록 간략해지고 아래로 갈수록 구체화되는 것이 추상화다. 상하를 맞바꾼 두 번째 보기가 기출에서 쓰이는 대표 오답이다.
- q: 겉으로 보이는 동작의 변화 없이 내부 구조를 바꾸는 작업은?
  choices: [리팩토링, 아키텍팅, 명세화, 리뉴얼]
  a: 1
  why: 동작을 유지한 채 구조만 개선하는 것이 리팩토링이다. 아키텍팅은 설계 구조를 세우는 활동이라 동작 유지를 전제하지 않는다.

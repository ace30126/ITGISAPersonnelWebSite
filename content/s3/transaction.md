---
id: db-transaction
subject: 3
title: 트랜잭션과 ACID
tier: S
tags: [트랜잭션, acid, 원자성, 일관성, 격리성, 지속성, 커밋, 롤백, 트랜잭션상태]
keywords: [트랜잭션]
items: [q:2024-3:056, q:2022-2:042, q:2024-1:054, q:2022-2:051, q:2022-1:055]
updated: 2026-08-15
---

## 한 줄 정의

트랜잭션(Transaction)은 하나의 논리적 기능을 수행하는 작업 단위이자, 전부 수행되거나 전혀 수행되지 않아야 하는 연산들의 묶음이다.

## 왜 시험에 나오나

3과목에서 30문항 넘게 나온 축이다. ACID 네 성질 중 하나를 설명으로 골라내는 문항과 트랜잭션 상태 이름을 묻는 문항이 거의 매 회차에 등장한다.

## 그림

<svg viewBox="0 0 380 160" role="img" aria-label="트랜잭션의 상태 전이">
  <rect x="8" y="20" width="76" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="46" y="39" text-anchor="middle" font-size="13" fill="currentColor">활동</text>
  <rect x="122" y="20" width="106" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="175" y="39" text-anchor="middle" font-size="13" fill="currentColor">부분 완료</text>
  <rect x="266" y="20" width="76" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="304" y="39" text-anchor="middle" font-size="13" fill="currentColor">완료</text>
  <line x1="84" y1="35" x2="122" y2="35" stroke="currentColor" stroke-width="1.2"/>
  <line x1="228" y1="35" x2="266" y2="35" stroke="currentColor" stroke-width="1.2"/>
  <text x="232" y="30" font-size="12" fill="currentColor">커밋</text>
  <rect x="122" y="96" width="106" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="175" y="115" text-anchor="middle" font-size="13" fill="currentColor">실패</text>
  <rect x="266" y="96" width="76" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="304" y="115" text-anchor="middle" font-size="13" fill="currentColor">철회</text>
  <line x1="46" y1="50" x2="46" y2="111" stroke="currentColor" stroke-width="1.2"/>
  <line x1="46" y1="111" x2="122" y2="111" stroke="currentColor" stroke-width="1.2"/>
  <line x1="228" y1="111" x2="266" y2="111" stroke="currentColor" stroke-width="1.2"/>
  <text x="228" y="106" font-size="12" fill="currentColor">롤백</text>
</svg>

## 핵심

| 성질 | 뜻 |
|---|---|
| 원자성(Atomicity) | 전부 수행되거나 전혀 수행되지 않는다 |
| 일관성(Consistency) | 수행 전후로 데이터베이스가 모순 없는 상태를 유지한다 |
| 격리성(Isolation) | 수행 중인 트랜잭션에 다른 트랜잭션의 연산이 끼어들 수 없다 |
| 지속성(Durability) | 완료된 결과는 장애가 나도 남는다 |

- 상태는 활동, 부분 완료, 완료, 실패, 철회 다섯이다.
- 부분 완료는 마지막 연산까지 끝났지만 결과가 아직 데이터베이스에 반영되지 않은 상태다.
- 철회는 실패한 트랜잭션이 롤백 연산까지 마친 상태다.

## 헷갈리는 지점

- 커밋과 롤백이 보장하는 성질은 원자성이다. 일관성이라고 쓴 서술이 오답 자리로 나온다.
- 부분 완료와 완료는 다른 상태다. 마지막 연산이 끝난 직후는 부분 완료이고, 반영까지 끝나야 완료다.
- 실패와 철회도 다른 상태다. 롤백을 실행한 상태를 물으면 답은 철회다.
- 격리성은 동시 실행 중 끼어들기를 막는 성질이다. 지속성과 헷갈리면 안 된다. 지속성은 장애 이후 결과가 남는가의 문제다.
- 트랜잭션 인터페이스 설계는 논리적 설계 단계의 일이다. 개념적 설계나 물리적 설계 항목으로 제시되면 오답이다.

## 기출 패턴

성질 문항은 설명 한 문단을 주고 영문 이름 넷 중 하나를 고르게 한다. 상태 문항은 "마지막 연산이 실행된 직후", "롤백을 실행한 상태" 같은 표현으로 부분 완료와 철회를 구분시킨다. 옳지 않은 것을 찾는 문항에서는 커밋과 롤백을 일관성에 묶은 보기가 정답이 된다.

## 퀴즈
- q: 모든 연산이 수행되거나 하나도 수행되지 않아야 한다는 성질은?
  choices: [Atomicity, Consistency, Isolation, Durability]
  a: 1
  why: 전부 아니면 전무가 원자성이다. 일관성은 수행 전후 상태가 모순 없이 유지되는가의 문제라 초점이 다르다.
- q: 마지막 연산까지 끝났으나 결과가 아직 데이터베이스에 반영되지 않은 상태는?
  choices: [Active, Partially Committed, Committed, Aborted]
  a: 2
  why: 반영 직전이 부분 완료다. 반영까지 끝나면 완료로 넘어가므로 두 상태를 같은 것으로 보면 안 된다.
- q: 커밋과 롤백 명령어가 보장하는 트랜잭션의 성질은?
  choices: [원자성, 일관성, 격리성, 지속성]
  a: 1
  why: 전부 반영하거나 전부 되돌리는 장치이므로 원자성이다. 기출에서는 이를 일관성으로 바꿔 쓴 보기가 틀린 서술로 출제됐다.

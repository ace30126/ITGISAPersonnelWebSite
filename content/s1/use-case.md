---
id: use-case
subject: 1
title: 유스케이스 다이어그램
tier: A
tags: [유스케이스, 액터, 시스템경계, 연관, 포함, 확장, 일반화, 주액터, 시스템액터]
keywords: [유스케이스]
items: [q:2022-2:004, q:2022-2:019, q:2024-2:016, s:20210307:013, s:20210515:002]
updated: 2026-08-15
---

## 한 줄 정의

유스케이스 다이어그램은 사용자 시각에서 시스템이 제공해야 할 기능과 범위를 나타내는 UML 행위 다이어그램이며, 액터와 유스케이스와 시스템 경계로 구성된다.

## 왜 시험에 나오나

관계 네 가지의 이름과 정의, 액터의 범위, 구성 요소가 반복 출제된다. 요구사항 모델링 도구로 묶여 나오기도 한다.

## 그림

<svg viewBox="0 0 360 150" role="img" aria-label="유스케이스 다이어그램의 표기법">
  <circle cx="34" cy="46" r="9" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <line x1="34" y1="55" x2="34" y2="80" stroke="currentColor" stroke-width="1.4"/>
  <line x1="20" y1="64" x2="48" y2="64" stroke="currentColor" stroke-width="1.4"/>
  <line x1="34" y1="80" x2="22" y2="100" stroke="currentColor" stroke-width="1.4"/>
  <line x1="34" y1="80" x2="46" y2="100" stroke="currentColor" stroke-width="1.4"/>
  <text x="34" y="118" text-anchor="middle" font-size="12" fill="currentColor">액터</text>
  <rect x="92" y="10" width="260" height="130" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="222" y="28" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.8">시스템 경계</text>
  <ellipse cx="160" cy="60" rx="52" ry="20" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="160" y="65" text-anchor="middle" font-size="12" fill="currentColor">주문하기</text>
  <line x1="48" y1="60" x2="108" y2="60" stroke="currentColor" stroke-width="1.3"/>
  <ellipse cx="290" cy="60" rx="52" ry="20" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="290" y="65" text-anchor="middle" font-size="12" fill="currentColor">결제하기</text>
  <line x1="212" y1="60" x2="232" y2="60" stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 4"/>
  <text x="222" y="98" text-anchor="middle" font-size="12" fill="currentColor">포함은 점선 화살표</text>
  <ellipse cx="160" cy="120" rx="52" ry="16" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="160" y="125" text-anchor="middle" font-size="12" fill="currentColor">쿠폰 적용</text>
</svg>

## 핵심

| 관계 | 정의로 주어지는 문구 |
|---|---|
| 연관(Association) | 액터와 유스케이스 사이의 상호작용 |
| 포함(Include) | 하나의 유스케이스가 다른 유스케이스의 실행을 전제로 함 |
| 확장(Extend) | 기본 유스케이스 수행 중 특별한 조건을 만족할 때 수행 |
| 일반화(Generalization) | 유사한 유스케이스나 액터를 추상화해 묶음 |

- 구성 요소는 액터, 유스케이스, 시스템(시스템 경계)이다.
- 액터는 시스템과 상호작용하는 모든 외부 요소이며 사람과 외부 시스템을 모두 포함한다.
- 주액터는 기능을 요구하는 사용자이고, 시스템 액터는 기능 수행을 위해 연동되는 외부 시스템이다.
- 유스케이스는 사용자 측면의 요구사항이며 기능 모델링에 쓰인다.

## 헷갈리는 지점

- 구체화(실체화)는 유스케이스의 관계에 없다. 연관과 확장과 일반화 사이에 끼워 넣는 대표적 오답이다.
- 오퍼레이션은 유스케이스 다이어그램의 구성 요소가 아니다. 클래스 다이어그램 쪽 용어다.
- 외부 시스템도 액터로 파악한다. 액터로 파악해서는 안 된다는 서술은 오답이다.
- 유스케이스 다이어그램은 사용자의 요구를 분석하기 위한 것이다. 개발자의 요구를 추출한다는 서술은 오답이다.
- 확장과 포함을 맞바꾼 보기가 나온다. 조건을 만족할 때만 수행하면 확장이다.
- 단계 다이어그램은 요구사항 모델링 도구가 아니다. 애자일과 유스케이스와 순차 다이어그램이 모델링에 쓰인다.

## 기출 패턴

관계 문항은 네 이름을 주고 포함되지 않는 하나를 고르게 한다. 정의 제시형은 확장을 가장 자주 묻는다. 액터 문항은 액터의 범위를 좁힌 서술 하나를 정답 자리에 놓는다. UI 설계 도구와 함께 나올 때는 유스케이스가 보기 넷째 자리를 채우는 오답으로 쓰인다.

## 퀴즈
- q: 유스케이스의 관계에 포함되지 않는 것은?
  choices: [연관, 확장, 구체화, 일반화]
  a: 3
  why: 관계는 연관, 포함, 확장, 일반화다. 구체화는 UML 클래스 사이의 실체화 관계에서 쓰는 용어라 유스케이스에는 없다.
- q: 기본 유스케이스 수행 중 특별한 조건을 만족할 때 수행되는 관계는?
  choices: [연관, 확장, 포함, 일반화]
  a: 2
  why: 조건부로 덧붙는 관계가 확장이다. 포함은 조건 없이 반드시 실행되는 것을 전제로 하므로 다르다.
- q: 유스케이스 다이어그램의 구성 요소가 아닌 것은?
  choices: [액터, 시스템, 유스케이스, 오퍼레이션]
  a: 4
  why: 구성 요소는 액터와 유스케이스와 시스템 경계다. 오퍼레이션은 클래스의 동작을 정의한 요소이므로 클래스 다이어그램에 속한다.

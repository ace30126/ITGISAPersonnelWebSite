---
id: db-relational-model
subject: 3
title: 관계형 모델과 릴레이션
tier: S
tags: [관계형모델, 릴레이션, 튜플, 속성, 도메인, 차수, 카디널리티, 데이터모델구성요소]
keywords: [관계형모델]
items: [q:2022-2:059, q:2023-3:044, q:2023-2:041, q:2022-2:056, q:2024-3:054]
updated: 2026-08-15
---

## 한 줄 정의

관계형 모델은 데이터를 행과 열로 이루어진 릴레이션(Relation)의 집합으로 표현하는 데이터 모델이다.

## 왜 시험에 나오나

3과목 문항의 6분의 1이 이 용어 위에 서 있다. 차수와 카디널리티의 구분, 릴레이션의 성질 중 틀린 서술 찾기, 용어 정의 맞히기가 반복된다.

## 그림

<svg viewBox="0 0 380 170" role="img" aria-label="릴레이션의 차수와 카디널리티">
  <rect x="70" y="24" width="240" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="70" y="50" width="240" height="26" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <rect x="70" y="76" width="240" height="26" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <rect x="70" y="102" width="240" height="26" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <line x1="150" y1="24" x2="150" y2="128" stroke="currentColor" stroke-width="1.2"/>
  <line x1="230" y1="24" x2="230" y2="128" stroke="currentColor" stroke-width="1.2"/>
  <text x="110" y="42" text-anchor="middle" font-size="12" fill="currentColor">속성</text>
  <text x="190" y="42" text-anchor="middle" font-size="12" fill="currentColor">속성</text>
  <text x="270" y="42" text-anchor="middle" font-size="12" fill="currentColor">속성</text>
  <text x="190" y="68" text-anchor="middle" font-size="12" fill="currentColor">튜플</text>
  <text x="190" y="94" text-anchor="middle" font-size="12" fill="currentColor">튜플</text>
  <text x="190" y="120" text-anchor="middle" font-size="12" fill="currentColor">튜플</text>
  <text x="70" y="16" font-size="12" fill="currentColor">차수(Degree) = 속성 수 = 3</text>
  <text x="6" y="94" font-size="12" fill="currentColor">카디널리티</text>
  <text x="6" y="110" font-size="12" fill="currentColor">= 튜플 수 = 3</text>
  <text x="70" y="152" font-size="12" fill="currentColor">도메인 = 한 속성이 가질 수 있는 원자값의 집합</text>
</svg>

## 핵심

| 용어 | 뜻 |
|---|---|
| 릴레이션 | 행과 열로 된 하나의 표 |
| 튜플 | 릴레이션의 행 |
| 속성 | 릴레이션의 열 |
| 도메인 | 한 속성이 가질 수 있는 원자값의 집합 |
| 차수 | 속성의 개수 |
| 카디널리티 | 튜플의 개수 |

- 데이터 모델의 구성 요소는 구조(Structure), 연산(Operation), 제약 조건(Constraint) 셋이다.
- 릴레이션의 성질은 튜플의 유일성, 튜플 간 순서 없음, 속성 간 순서 없음, 속성값의 원자성이다.
- 데이터베이스를 관계형·계층형·네트워크형으로 나누는 기준은 관계(Relationship)다.
- 릴레이션 스키마는 구조의 정의이고, 릴레이션 인스턴스는 그 시점에 담긴 튜플들이다.

## 헷갈리는 지점

- 차수는 열, 카디널리티는 행이다. 이름이 어려운 카디널리티가 행이라고 외우면 뒤집히지 않는다.
- 릴레이션의 튜플에는 순서가 없다. "튜플은 특정한 순서를 가진다"는 서술은 항상 오답이다.
- 도메인은 속성이 가질 수 있는 값의 집합이다. 저장된 값 자체나 튜플이 아니다.
- 연산(Operation)은 값을 처리하는 작업이고 구조(Structure)는 표현 틀이다. 구성 요소 문항에서 이 둘이 서로의 오답으로 붙는다.
- 카티션 프로덕트 결과의 차수는 두 릴레이션 차수의 합, 카디널리티는 곱이다. 둘 다 곱으로 계산하면 틀린다.
- 차수를 묻는 문항에 후보키 개수와 튜플 수가 함께 주어진다. 답에 쓰이는 값은 속성 수 하나뿐이다.

## 기출 패턴

용어 정의 문항은 설명 한 줄을 주고 릴레이션·튜플·도메인·카디널리티 중 하나를 고르게 한다. 성질 문항은 옳은 서술 셋에 순서 관련 서술 하나를 섞어 "거리가 먼 것"을 묻는다. 계산 문항은 차수와 카디널리티 값을 주고 카티션 프로덕트 결과를 숫자쌍으로 고르게 한다.

## 퀴즈
- q: 릴레이션에 포함된 튜플의 수를 가리키는 말은?
  choices: [Degree, Cardinality, Attribute, Domain]
  a: 2
  why: 튜플 수는 카디널리티다. Degree 는 속성 수이므로 이 둘을 맞바꾼 보기가 대표적인 오답이다.
- q: 릴레이션에 대한 설명으로 옳지 않은 것은?
  choices: [모든 튜플은 서로 다르다, 튜플 사이에는 순서가 있다, 속성 이름은 릴레이션 내에서 유일하다, 모든 속성값은 원자값이다]
  a: 2
  why: 릴레이션은 튜플의 집합이라 순서가 없다. 튜플이 모두 상이하다는 서술은 집합의 성질이므로 옳다.
- q: 데이터 모델의 구성 요소가 아닌 것은?
  choices: [구조(Structure), 연산(Operation), 제약 조건(Constraint), 색인(Index)]
  a: 4
  why: 구성 요소는 구조·연산·제약 조건 셋이다. 색인은 성능을 위한 물리적 장치라 모델의 구성 요소가 아니다.

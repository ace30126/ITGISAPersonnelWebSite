---
id: rumbaugh
subject: 1
title: 럼바우 객체지향 분석 3모형
tier: A
tags: [럼바우, omt, 객체모델링, 동적모델링, 기능모델링, 객동기, 상태다이어그램, 자료흐름도]
keywords: [럼바우]
items: [q:2023-2:003, q:2023-2:015, q:2025-3:019, q:2022-3:019, s:20200926:002]
updated: 2026-08-15
---

## 한 줄 정의

럼바우(Rumbaugh) 분석 기법은 소프트웨어 구성 요소를 그래픽 표기법으로 모델링하는 객체지향 분석 방법이며, 객체 모델링과 동적 모델링과 기능 모델링 세 가지를 이 순서로 수행한다.

## 왜 시험에 나오나

1과목에서 매 회차 수준으로 반복된다. 묻는 각도는 셋뿐이다. 세 모형의 수행 순서, 각 모형이 쓰는 다이어그램, 3모형에 들어가지 않는 이름 고르기다.

## 그림

<svg viewBox="0 0 370 200" role="img" aria-label="럼바우 3모형의 순서와 각 모형이 사용하는 다이어그램">
  <rect x="10" y="14" width="104" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="62" y="36" text-anchor="middle" font-size="13" fill="currentColor">객체 모델링</text>
  <text x="130" y="36" font-size="12" fill="currentColor">객체 다이어그램</text>
  <line x1="62" y1="48" x2="62" y2="76" stroke="currentColor" stroke-width="1.2"/>
  <rect x="10" y="76" width="104" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="62" y="98" text-anchor="middle" font-size="13" fill="currentColor">동적 모델링</text>
  <text x="130" y="98" font-size="12" fill="currentColor">상태 다이어그램</text>
  <line x1="62" y1="110" x2="62" y2="138" stroke="currentColor" stroke-width="1.2"/>
  <rect x="10" y="138" width="104" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="62" y="160" text-anchor="middle" font-size="13" fill="currentColor">기능 모델링</text>
  <text x="130" y="160" font-size="12" fill="currentColor">자료 흐름도</text>
  <text x="130" y="182" font-size="12" fill="currentColor" opacity="0.75">머리글자 암기: 객·동·기</text>
</svg>

## 핵심

| 모형 | 별칭 | 표기 도구 | 표현 대상 |
|---|---|---|---|
| 객체(Object) | 정보 모델링 | 객체 다이어그램 | 객체의 속성과 연산, 객체 간 관계 |
| 동적(Dynamic) | 상태 모델링 | 상태 다이어그램 | 제어 흐름, 상호작용, 동작 순서 |
| 기능(Functional) | 자료 흐름 모델링 | 자료 흐름도(DFD) | 프로세스 사이의 자료 흐름 |

- 객체 모델링이 가장 먼저 수행된다.
- 럼바우 기법은 객체 모델링 기술(OMT, Object Modeling Technique)이라고도 부른다.
- 다른 객체지향 분석 방법과 묶여 나온다. 부치(Booch)는 미시적·거시적 프로세스를 함께 쓰고, 야콥슨(Jacobson)은 유스케이스를 강조하며, 코드와 요든(Coad-Yourdon)은 개체 관계 다이어그램을 쓴다.

## 헷갈리는 지점

- 정적 모델링은 럼바우 3모형에 없다. 3모형이 아닌 것을 고르는 문항의 정답으로 정적 모델링, 블랙박스 분석 모델링, 분석 모델링 같은 가짜 이름이 번갈아 들어간다.
- 순서를 뒤집은 보기가 정답 바로 옆에 깔린다. 기능 모델링이 앞에 오거나 동적과 기능이 자리를 바꾼 배열은 오답이다.
- 자료 흐름도는 기능 모델링, 상태 다이어그램은 동적 모델링이다. 이 둘을 맞바꾼 보기가 반복된다.
- 럼바우와 부치를 바꿔 놓은 보기도 나온다. 3모형을 만든 사람은 럼바우다.

## 기출 패턴

절차 나열형은 세 모형의 순서만 다르게 한 네 보기를 준다. 설명 제시형은 "정보 모델링이라고도 하며 속성과 연산을 식별한다" 식의 서술을 주고 모형 이름을 고르게 하며, 이때 보기 넷째 자리에 Static이 들어간다. 부정형은 3모형에 포함되지 않는 것을 묻는다. 다이어그램 짝짓기는 자료 흐름도나 상태 다이어그램을 주고 어느 모델링인지 묻는다.

## 퀴즈
- q: 럼바우 분석 기법의 수행 순서로 옳은 것은?
  choices: [기능 → 객체 → 동적, 객체 → 동적 → 기능, 동적 → 객체 → 기능, 객체 → 기능 → 동적]
  a: 2
  why: 객체 모델링이 선행되고 동적, 기능 순으로 이어진다. 객체 다음에 기능이 오는 배열은 동적과 기능의 자리를 바꾼 대표적 오답이다.
- q: 상태 다이어그램을 사용하는 모델링은?
  choices: [객체 모델링, 기능 모델링, 동적 모델링, 정적 모델링]
  a: 3
  why: 상태 다이어그램은 시간에 따른 제어 흐름을 다루므로 동적 모델링이다. 정적 모델링은 럼바우 3모형에 존재하지 않는 이름이다.
- q: 럼바우의 3모형에 포함되지 않는 것은?
  choices: [객체 모델링, 동적 모델링, 기능 모델링, 구조 모델링]
  a: 4
  why: 3모형은 객체, 동적, 기능이다. 구조 모델링은 보기 채우기용 이름이며 기능 모델링은 자료 흐름도를 쓰는 실제 구성 요소다.

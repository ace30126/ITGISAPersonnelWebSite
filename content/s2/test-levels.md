---
id: test-levels
subject: 2
title: 테스트 단계와 스텁·드라이버
tier: S
tags: [테스트단계, 단위테스트, 통합테스트, 시스템테스트, 인수테스트, 스텁, 드라이버, 하향식, 상향식, 알파테스트, 베타테스트]
items: [q:2022-1:022, q:2022-3:037, q:2023-2:034, q:2022-3:036, q:2023-3:030]
keywords: [테스트단계]
updated: 2026-08-15
---

## 한 줄 정의

테스트 단계는 모듈 하나를 보는 단위 테스트에서 시작해 통합, 시스템, 인수 테스트로 범위를 넓혀 가는 순서다.

## 왜 시험에 나오나

2과목 최다 출제군이다. 절반은 스텁과 드라이버를 맞바꿔 놓은 문항이다. 나머지는 단계별로 무엇을 발견하는지를 묻는다.

## 그림

<svg viewBox="0 0 380 185" role="img" aria-label="단위 통합 시스템 인수 순서의 테스트 단계와 통합 방식별 보조 모듈">
  <rect x="8" y="10" width="150" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="83" y="30" text-anchor="middle" font-size="13" fill="currentColor">단위 테스트</text>
  <text x="170" y="30" font-size="12" fill="currentColor">모듈 하나</text>
  <line x1="83" y1="40" x2="83" y2="52" stroke="currentColor" stroke-width="1.2"/>
  <rect x="8" y="52" width="150" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="83" y="72" text-anchor="middle" font-size="13" fill="currentColor">통합 테스트</text>
  <text x="170" y="72" font-size="12" fill="currentColor">모듈 사이 인터페이스</text>
  <line x1="83" y1="82" x2="83" y2="94" stroke="currentColor" stroke-width="1.2"/>
  <rect x="8" y="94" width="150" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="83" y="114" text-anchor="middle" font-size="13" fill="currentColor">시스템 테스트</text>
  <text x="170" y="114" font-size="12" fill="currentColor">전체 시스템</text>
  <line x1="83" y1="124" x2="83" y2="136" stroke="currentColor" stroke-width="1.2"/>
  <rect x="8" y="136" width="150" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="83" y="156" text-anchor="middle" font-size="13" fill="currentColor">인수 테스트</text>
  <text x="170" y="156" font-size="12" fill="currentColor">알파·베타 테스트</text>
</svg>

## 핵심

| 구분 | 하향식 통합 | 상향식 통합 |
|---|---|---|
| 방향 | 상위 모듈에서 하위로 | 하위 모듈에서 상위로 |
| 보조 모듈 | 스텁(Stub) | 드라이버(Driver) |
| 보조 모듈의 역할 | 아직 없는 하위 모듈을 대신한다 | 아직 없는 상위 모듈처럼 하위를 호출한다 |
| 특징 | 깊이 우선·넓이 우선으로 순서를 정한다 | 클러스터를 묶어 올린다 |

- 단위 테스트는 모듈 내부 구조를 보는 구조적 테스트를 주로 쓴다. 도구로 JUnit, CppUnit, HttpUnit이 나온다.
- 인수 테스트에는 알파 테스트와 베타 테스트가 속한다.
- 드라이버는 매개 변수를 전달하고 결과를 받아 보여 준다. 스텁은 필요한 조건만 가진 임시 모듈이다.

## 헷갈리는 지점

- 스텁은 하향식, 드라이버는 상향식이다. 이 짝을 뒤집은 보기가 가장 자주 나온다.
- 드라이버가 하위 모듈의 역할을 한다는 서술은 스텁의 설명이다. 드라이버는 상위 모듈 자리를 대신한다.
- 모듈 간 비정상적 상호 작용으로 생긴 오류는 단위 테스트로 찾지 못한다. 통합 테스트의 몫이다.
- 상향식 통합이 최상위 모듈을 먼저 구현한다는 서술은 하향식의 설명이라 오답이다.
- 알파·베타 테스트는 인수 테스트다. 시스템 테스트로 묶으면 틀린다.

## 기출 패턴

스텁과 드라이버 문항은 설명 넷 중 셋만 맞게 두고 방향이나 역할 하나를 뒤집는다. 단계 문항은 "개별 모듈이 예정한 기능을 수행하는지 점검"처럼 범위를 한 줄로 주고 단계 이름을 고르게 한다. 단위 테스트 도구 문항은 실재하지 않는 이름을 하나 만들어 섞는다.

## 퀴즈
- q: 하향식 통합 테스트에서 아직 만들어지지 않은 하위 모듈을 대신하는 임시 모듈은?
  choices: [스텁, 드라이버, 테스트 슈트, 테스트 케이스]
  a: 1
  why: 하향식은 위에서 아래로 통합하므로 비어 있는 하위 자리를 스텁이 채운다. 드라이버는 상향식에서 상위 모듈을 대신해 하위를 호출한다.
- q: 단위 테스트로 발견할 수 없는 오류는?
  choices: [알고리즘 오류로 인한 잘못된 결과, 탈출구 없는 반복문, 모듈 간 비정상적 상호 작용, 틀린 계산 수식]
  a: 3
  why: 단위 테스트는 모듈 하나를 독립적으로 실행하므로 모듈 사이의 상호 작용은 대상이 아니다. 이는 통합 테스트에서 드러난다.
- q: 알파 테스트와 베타 테스트가 속하는 테스트 단계는?
  choices: [단위 테스트, 통합 테스트, 시스템 테스트, 인수 테스트]
  a: 4
  why: 알파·베타 테스트는 사용자가 요구를 충족하는지 확인하는 인수 테스트의 종류다. 시스템 테스트는 개발 조직이 전체 시스템 동작을 확인하는 단계라 다르다.

---
id: cost-estimation
subject: 5
title: 소프트웨어 비용 산정
tier: S
tags: [비용산정, cocomo, loc, 기능점수, putnam, slim, 델파이, 전문가감정, 조직형, 반분리형, 내장형]
keywords: [비용산정]
items: [q:2024-1:088, q:2022-1:098, q:2022-3:087, q:2023-2:082, q:2023-3:084]
updated: 2026-08-15
---

## 한 줄 정의

비용 산정은 개발에 드는 노력과 기간을 규모나 기능 수로 미리 추정하는 작업이다.

## 왜 시험에 나오나

5과목 최다 출제군이다. COCOMO 개발 유형 셋을 묻는 문항, 산정 기법을 하향식과 상향식으로 가르는 문항, LOC로 기간을 계산하는 문항이 돌아가며 나온다.

## 그림

<svg viewBox="0 0 380 190" role="img" aria-label="비용 산정 기법의 분류">
  <rect x="130" y="6" width="120" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="190" y="25" text-anchor="middle" font-size="13" fill="currentColor">비용 산정 기법</text>
  <line x1="190" y1="34" x2="190" y2="48" stroke="currentColor" stroke-width="1.2"/>
  <line x1="62" y1="48" x2="318" y2="48" stroke="currentColor" stroke-width="1.2"/>
  <line x1="62" y1="48" x2="62" y2="62" stroke="currentColor" stroke-width="1.2"/>
  <line x1="190" y1="48" x2="190" y2="62" stroke="currentColor" stroke-width="1.2"/>
  <line x1="318" y1="48" x2="318" y2="62" stroke="currentColor" stroke-width="1.2"/>
  <rect x="12" y="62" width="100" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="62" y="80" text-anchor="middle" font-size="12" fill="currentColor">하향식</text>
  <rect x="140" y="62" width="100" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="190" y="80" text-anchor="middle" font-size="12" fill="currentColor">상향식</text>
  <rect x="268" y="62" width="100" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="318" y="80" text-anchor="middle" font-size="12" fill="currentColor">수학적 모형</text>
  <text x="62" y="112" text-anchor="middle" font-size="12" fill="currentColor">전문가 감정</text>
  <text x="62" y="130" text-anchor="middle" font-size="12" fill="currentColor">델파이</text>
  <text x="190" y="112" text-anchor="middle" font-size="12" fill="currentColor">LOC</text>
  <text x="190" y="130" text-anchor="middle" font-size="12" fill="currentColor">Effort Per Task</text>
  <text x="318" y="112" text-anchor="middle" font-size="12" fill="currentColor">COCOMO</text>
  <text x="318" y="130" text-anchor="middle" font-size="12" fill="currentColor">Putnam</text>
  <text x="318" y="148" text-anchor="middle" font-size="12" fill="currentColor">기능 점수</text>
</svg>

## 핵심

| COCOMO 유형 | 규모 기준 | 성격 |
|---|---|---|
| 조직형 Organic | 5만 라인 이하 | 사무 처리, 과학 기술 계산 |
| 반분리형 Semi-Detached | 30만 라인 이하 | 컴파일러, 트랜잭션 처리 |
| 내장형 Embedded | 30만 라인 초과 | 실시간 처리, 미사일 유도 |

- COCOMO는 보헴이 제안했다. 원시 코드 라인 수로 인월(man-month)을 산정한다.
- LOC 예측치는 낙관치, 기대치, 비관치 셋으로 구한다.
- 기능 점수의 산정 요소는 자료 입력, 정보 출력, 명령어, 데이터 파일, 외부 인터페이스다.
- Putnam은 개발 주기 단계별 인력 분포를 가정한 모형이다. 자동화 도구가 SLIM이다.

## 헷갈리는 지점

- COCOMO 유형에 Sequential은 없다. object·dynamic·function으로 나눈다는 서술도 오답이다.
- UFP 계산은 기능 점수 모형의 절차다. COCOMO의 특징으로 제시되면 틀린 보기다.
- LOC 예측치 항목에 모형치는 없다.
- PERT는 일정 관리 기법이다. 비용 추정 모형을 고르는 문항에서 PERT가 정답이 되는 이유가 이것이다.
- 전문가 감정과 델파이는 하향식이다. LOC와 Effort Per Task가 상향식이다.

## 기출 패턴

COCOMO 문항은 유형 셋을 참으로 깔고 없는 이름 하나를 섞는다. 설명 하나를 주고 조직형·반분리형·내장형 중 고르게 하는 방향도 잦다. 계산형은 총 라인 수를 인원 수와 월 생산성으로 나눠 개월을 구한다. 기능 점수 문항은 산정 요소 넷을 참으로 두고 클래스 인터페이스처럼 무관한 항목 하나를 넣는다.

## 퀴즈
- q: COCOMO 모형의 개발 유형이 아닌 것은?
  choices: [Organic, Semi-Detached, Embedded, Sequential]
  a: 4
  why: COCOMO는 조직형·반분리형·내장형 셋으로만 나눈다. Semi-Detached는 실재하는 유형이므로 정답이 아니다.
- q: 총 라인 수 36,000, 프로그래머 6명, 1인 월 생산성 300라인일 때 개발 기간은?
  choices: [5개월, 10개월, 15개월, 20개월]
  a: 4
  why: 36,000을 300으로 나누면 120인월이고 이를 6명으로 나누면 20개월이다. 10개월은 인원을 두 배로 잘못 잡았을 때 나오는 값이다.
- q: 하향식 비용 산정 기법에 해당하는 것은?
  choices: [LOC 기법, 델파이 기법, Effort Per Task, 기능 점수]
  a: 2
  why: 델파이는 조정자가 전문가 의견을 종합하는 하향식이다. LOC는 각 기능의 코드 라인을 세어 올리는 상향식이다.

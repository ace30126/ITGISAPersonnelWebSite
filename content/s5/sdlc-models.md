---
id: sdlc-models
subject: 5
title: 소프트웨어 생명 주기 모형
tier: A
tags: [소프트웨어생명주기, 폭포수, 프로토타입, 나선형, v모델, iso12207, clasp, sdl, seven-touchpoints]
keywords: [소프트웨어생명주기]
items: [q:2023-1:089, q:2025-1:094, q:2022-1:086, q:2025-3:090, q:2024-1:099]
updated: 2026-08-15
---

## 한 줄 정의

소프트웨어 생명 주기 모형은 개발 과정을 어떤 순서와 반복 구조로 진행할지 정한 틀이다.

## 왜 시험에 나오나

나선형 모형의 태스크 순서를 묻는 문항이 압도적으로 많다. 모형별로 어떤 상황에 맞는지를 짝짓는 문항이 뒤를 잇는다.

## 그림

<svg viewBox="0 0 360 130" role="img" aria-label="나선형 모형의 네 단계 순환">
  <rect x="6" y="40" width="76" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="44" y="58" text-anchor="middle" font-size="12" fill="currentColor">계획 및</text>
  <text x="44" y="74" text-anchor="middle" font-size="12" fill="currentColor">정의</text>
  <line x1="82" y1="60" x2="102" y2="60" stroke="currentColor" stroke-width="1.4"/>
  <polygon points="102,60 94,56 94,64" fill="currentColor"/>
  <rect x="102" y="40" width="76" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="140" y="66" text-anchor="middle" font-size="12" fill="currentColor">위험 분석</text>
  <line x1="178" y1="60" x2="198" y2="60" stroke="currentColor" stroke-width="1.4"/>
  <polygon points="198,60 190,56 190,64" fill="currentColor"/>
  <rect x="198" y="40" width="76" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="236" y="66" text-anchor="middle" font-size="12" fill="currentColor">공학적 개발</text>
  <line x1="274" y1="60" x2="294" y2="60" stroke="currentColor" stroke-width="1.4"/>
  <polygon points="294,60 286,56 286,64" fill="currentColor"/>
  <rect x="278" y="40" width="76" height="40" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="316" y="66" text-anchor="middle" font-size="12" fill="currentColor">고객 평가</text>
  <line x1="316" y1="80" x2="316" y2="102" stroke="currentColor" stroke-width="1.2"/>
  <line x1="316" y1="102" x2="44" y2="102" stroke="currentColor" stroke-width="1.2"/>
  <line x1="44" y1="102" x2="44" y2="80" stroke="currentColor" stroke-width="1.2"/>
  <polygon points="44,80 40,88 48,88" fill="currentColor"/>
  <text x="180" y="122" text-anchor="middle" font-size="12" fill="currentColor">주기를 여러 번 반복한다</text>
</svg>

## 핵심

| 모형 | 성격 |
|---|---|
| 폭포수 | 단계를 순차로 진행, 산출물 중심 |
| 프로토타입 | 견본품을 먼저 만들어 요구를 확인 |
| 나선형 | 주기를 반복하며 위험을 관리, 대규모에 적합 |
| V 모델 | 폭포수의 변형, 개발과 검증을 짝지음 |

- 나선형의 순서는 계획 및 정의, 위험 분석, 공학적 개발, 고객 평가다.
- 프로토타입은 요구사항이 불분명할 때 고른다. 의뢰자와 개발자의 공동 참조 모델이 된다.
- ISO 12207의 기본 생명 주기 프로세스는 획득, 공급, 개발, 운영, 유지보수다.
- 개발 보안 생명 주기 방법론은 CLASP, SDL, Seven Touchpoints다.

## 헷갈리는 지점

- 나선형의 태스크에 버전 관리는 없다. 형상 관리 용어를 끼워 넣은 오답이다.
- 나선형은 주기를 여러 번 돈다. 개발 주기가 한 번만 수행된다거나 위험 분석을 마지막에 한 번만 한다는 서술은 오답이다.
- V 모델은 요구 분석과 설계를 거친다. 통합 테스트만 중심에 둔다는 서술은 틀렸다.
- PIMS는 개인정보 보호 관리 체계다. 개발 보안 방법론이 아닌 것을 고르는 문항의 정답이다.
- ISO 12207 기본 프로세스에 성능 평가는 없다.

## 기출 패턴

나선형 문항은 특징 셋을 참으로 두고 반복 여부를 뒤집는다. 태스크를 나열하고 아닌 것을 고르게 하는 방향도 같은 비중이다. 프로토타입 문항은 장점 셋 사이에 단점 한 줄을 섞거나, 적합한 상황을 고르게 한다. 방법론 이름 문항은 CLASP·SDL·Seven Touchpoints 사이에 관리 체계 약어를 넣는다.

## 퀴즈
- q: 나선형 모형의 주요 태스크가 아닌 것은?
  choices: [버전 관리, 위험 분석, 개발, 고객 평가]
  a: 1
  why: 나선형의 태스크는 계획, 위험 분석, 개발, 고객 평가다. 위험 분석은 나선형을 다른 모형과 구분하는 핵심이라 정답이 될 수 없다.
- q: 요구사항이 불분명할 때 가장 적합한 생명 주기 모형은?
  choices: [폭포수 모형, 프로토타입 모형, V 모형, 나선형 모형]
  a: 2
  why: 견본품으로 요구를 확인하는 것이 프로토타입이다. 나선형은 요구가 아니라 위험이 클 때 고르는 모형이다.
- q: 소프트웨어 개발 보안 생명 주기 방법론이 아닌 것은?
  choices: [CLASP, SDL, PIMS, Seven Touchpoints]
  a: 3
  why: PIMS는 개인정보 보호 관리 체계다. Seven Touchpoints는 개발 단계별 보안 활동을 정의한 실재하는 방법론이다.

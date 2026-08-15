---
id: structured-analysis
subject: 1
title: 구조적 분석 도구와 소프트웨어 모델링
tier: S
tags: [프로세스, 자료흐름도, DFD, HIPO, 자료사전, 모델링, 시스템구성요소, 마스터슬레이브]
keywords: [프로세스]
items: [q:2022-1:006, q:2022-3:009, q:2022-3:004, q:2023-1:010, q:2023-3:010]
updated: 2026-08-15
---

## 한 줄 정의

구조적 분석은 자료 흐름도와 자료 사전 같은 도표로 요구사항을 표현하는 프로세스 중심 분석 방법이며, 1과목에서는 각 도구의 구성 요소와 표기 기호를 묻는다.

## 왜 시험에 나오나

자료 흐름도 표기법 문항이 매 회차 수준으로 반복된다. HIPO의 성격과 시스템 구성 요소가 함께 출제군을 이룬다.

## 그림

<svg viewBox="0 0 360 150" role="img" aria-label="자료 흐름도의 네 가지 표기 기호">
  <rect x="10" y="16" width="70" height="34" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="45" y="38" text-anchor="middle" font-size="12" fill="currentColor">단말</text>
  <line x1="80" y1="33" x2="140" y2="33" stroke="currentColor" stroke-width="1.3"/>
  <polygon points="146,33 136,28 136,38" fill="currentColor"/>
  <text x="88" y="27" font-size="12" fill="currentColor">자료 흐름</text>
  <circle cx="182" cy="33" r="30" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="182" y="38" text-anchor="middle" font-size="12" fill="currentColor">처리</text>
  <line x1="182" y1="63" x2="182" y2="96" stroke="currentColor" stroke-width="1.3"/>
  <polygon points="182,102 177,92 187,92" fill="currentColor"/>
  <line x1="120" y1="112" x2="250" y2="112" stroke="currentColor" stroke-width="1.4"/>
  <line x1="120" y1="126" x2="250" y2="126" stroke="currentColor" stroke-width="1.4"/>
  <text x="185" y="142" text-anchor="middle" font-size="12" fill="currentColor">자료 저장소는 평행선</text>
</svg>

## 핵심

| 자료 흐름도 요소 | 기호 |
|---|---|
| 처리(Process) | 원 |
| 자료 흐름(Data Flow) | 화살표 |
| 자료 저장소(Data Store) | 평행선 |
| 단말(Terminator) | 사각형 |

- HIPO(Hierarchy Input Process Output)는 하향식 개발을 위한 문서화 도구다. 가시적 도표와 총체적 도표와 세부적 도표로 구성된다.
- 시스템 구성 요소는 입력, 처리, 출력, 제어, 피드백 다섯이다.
- 모델링은 분석과 설계 단계에서 만들어지되 개발 전 과정에서 쓰인다. 결과물은 다른 모델링 작업의 입력이 된다.
- 마스터 슬레이브 구조에서 마스터는 작업을 분배하고 슬레이브는 처리 결과를 되돌려 준다.

## 헷갈리는 지점

- 자료 저장소는 평행선이다. 삼각형이라는 보기가 반복 출제되며 이것이 정답 오류 유도 지점이다.
- 자료 사전은 자료 흐름도의 구성 요소가 아니다. 구성 요소 넷을 묻는 문항에서 자료 사전이나 소단위 명세서를 끼워 넣는다.
- HIPO는 하향식이다. 상향식이라는 서술이 거의 매번 정답 보기로 나온다.
- 유지보수는 시스템 구성 요소에 없다. 입력과 처리와 출력과 제어와 피드백 밖의 이름은 오답이다.
- 모델링은 유지보수 단계에서만 쓰는 기법이 아니다. 결과물이 다른 모델링에 영향을 줄 수 없다는 서술도 오답이다.

## 기출 패턴

표기법 문항은 요소와 기호를 짝지어 놓고 틀린 짝을 고르게 한다. 구성 요소 문항은 영문 네 개를 묶어 옳은 조합을 고르게 한다. HIPO는 부정형으로만 나오며 하향식과 상향식을 뒤집는다. 시스템 구성 요소 문항은 Maintenance를 넣어 고르게 한다. 자료 흐름도 작성 지침 문항도 나온다.

## 퀴즈
- q: 자료 흐름도에서 자료 저장소를 나타내는 기호는?
  choices: [원, 평행선, 삼각형, 마름모]
  a: 2
  why: 자료 저장소는 평행선이며 삼각형은 기출에서 오답으로 쓰이는 기호다. 원은 처리를 나타낸다.
- q: HIPO에 대한 설명으로 옳은 것은?
  choices: [상향식 개발을 위한 도구다, 하향식 개발을 위한 문서화 도구다, 자료 흐름만 표현한다, 객체지향 전용 표기법이다]
  a: 2
  why: HIPO는 하향식 개발의 문서화 도구이며 기능과 자료의 의존 관계를 함께 표현한다. 상향식이라는 서술이 대표적인 오답이다.
- q: 시스템의 구성 요소에 해당하지 않는 것은?
  choices: [입력, 제어, 피드백, 유지보수]
  a: 4
  why: 구성 요소는 입력, 처리, 출력, 제어, 피드백이다. 유지보수는 개발 이후의 단계이므로 구성 요소에 들어가지 않는다.

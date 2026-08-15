---
id: sequence-diagram
subject: 1
title: 순차 다이어그램
tier: A
tags: [순차다이어그램, 시퀀스다이어그램, 생명선, 실행상자, 메시지, 액터, 회귀메시지, 상호작용]
keywords: [순차다이어그램]
items: [q:2022-3:016, q:2022-2:001, q:2023-3:012, q:2022-1:011, s:20210515:014]
updated: 2026-08-15
---

## 한 줄 정의

순차 다이어그램(Sequence Diagram)은 객체들이 시간의 흐름에 따라 주고받는 메시지를 나타내는 UML 행위 다이어그램이다.

## 왜 시험에 나오나

구성 항목 다섯 가지와 정적인지 동적인지를 묻는 문항이 반복된다. 상태 다이어그램과 설명을 맞바꾼 보기가 단골이다.

## 그림

<svg viewBox="0 0 360 190" role="img" aria-label="순차 다이어그램의 생명선과 메시지 표기">
  <rect x="30" y="8" width="86" height="28" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="73" y="27" text-anchor="middle" font-size="12" fill="currentColor">:주문화면</text>
  <rect x="220" y="8" width="86" height="28" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="263" y="27" text-anchor="middle" font-size="12" fill="currentColor">:결제서비스</text>
  <line x1="73" y1="36" x2="73" y2="180" stroke="currentColor" stroke-width="1.1" stroke-dasharray="5 5"/>
  <line x1="263" y1="36" x2="263" y2="180" stroke="currentColor" stroke-width="1.1" stroke-dasharray="5 5"/>
  <rect x="67" y="60" width="12" height="90" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="257" y="76" width="12" height="52" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <line x1="79" y1="76" x2="250" y2="76" stroke="currentColor" stroke-width="1.3"/>
  <polygon points="257,76 247,71 247,81" fill="currentColor"/>
  <text x="88" y="70" font-size="12" fill="currentColor">결제요청()</text>
  <line x1="257" y1="128" x2="86" y2="128" stroke="currentColor" stroke-width="1.3" stroke-dasharray="5 4"/>
  <polyline points="86,122 76,128 86,134" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="96" y="146" font-size="12" fill="currentColor">응답은 점선</text>
  <text x="10" y="176" font-size="12" fill="currentColor" opacity="0.8">세로 점선 = 생명선, 세로 사각형 = 실행 상자</text>
</svg>

## 핵심

- 구성 항목은 액터, 객체, 생명선, 메시지, 실행 상자다.
- 생명선은 객체가 메모리에 존재하는 기간이며 객체 아래로 점선을 긋는다.
- 실행 상자는 객체가 메시지를 처리하며 구동 중임을 나타낸다.
- 수직 방향이 시간의 흐름이다.
- 회귀 메시지와 제어 블록으로도 구성된다.
- 상호작용 다이어그램(Interaction Diagram)의 한 종류다.

## 헷갈리는 지점

- 순차 다이어그램은 동적 다이어그램이다. 정적 측면을 모델링한다거나 정적 다이어그램에 가깝다는 서술은 오답이다.
- 정적 다이어그램이 아닌 것을 고르는 문항에서 컴포넌트와 배치와 패키지 사이에 순차 다이어그램이 놓이면 그것이 정답이다.
- 확장은 구성 항목이 아니다. 유스케이스의 관계 이름을 가져와 섞어 놓은 오답이다.
- 순차 다이어그램은 메시지 교환을, 상태 다이어그램은 상태 변화를 나타낸다. 두 설명을 맞바꾼 보기가 반복 출제된다.
- 커뮤니케이션 다이어그램은 메시지에 더해 객체 사이의 연관까지 표현한다. 순차 다이어그램과 구분해서 봐야 한다.
- 절차 다이어그램이라는 UML 다이어그램은 없다.

## 기출 패턴

구성 항목 문항은 다섯 항목 중 셋을 주고 없는 이름 하나를 끼워 고르게 한다. 성격 문항은 부정형으로 나오며 정적이라는 서술이 정답이다. UML 전반 문항에서는 상태 다이어그램의 정의와 자리를 바꿔 놓는다. 요구사항 모델링 도구를 묻는 문항에서도 보기로 등장한다.

## 퀴즈
- q: 순차 다이어그램의 구성 항목이 아닌 것은?
  choices: [생명선, 실행 상자, 확장, 메시지]
  a: 3
  why: 구성 항목은 액터, 객체, 생명선, 메시지, 실행 상자다. 확장은 유스케이스 사이의 관계 이름이라 여기에 속하지 않는다.
- q: 순차 다이어그램에 대한 설명으로 옳지 않은 것은?
  choices: [시간 흐름에 따른 메시지 전달을 강조한다, 정적 다이어그램에 가깝다, 객체 간 상호작용을 표현한다, 상호작용 다이어그램의 한 종류다]
  a: 2
  why: 시간에 따른 상호작용을 다루므로 동적 다이어그램이다. 상호작용 다이어그램의 한 종류라는 서술은 기출에서 참으로 제시된다.
- q: 객체가 메모리에 존재하는 기간을 점선으로 나타낸 요소는?
  choices: [실행 상자, 생명선, 메시지, 시스템 경계]
  a: 2
  why: 객체 아래로 내려긋는 점선이 생명선이다. 실행 상자는 그 위에 겹쳐 그리는 사각형으로 구동 중인 구간을 나타낸다.

---
id: uml
subject: 1
title: UML 구성 요소와 관계
tier: S
tags: [UML, 사물, 관계, 다이어그램, 연관, 의존, 일반화, 실체화, 집합, 포함, 스테레오타입]
keywords: [UML]
items: [q:2022-3:006, q:2022-3:011, q:2023-1:007, q:2023-1:011, q:2022-1:011]
updated: 2026-08-15
---

## 한 줄 정의

UML(Unified Modeling Language)은 객체지향 시스템의 산출물을 명세화하고 시각화하고 문서화하는 표준 모델링 언어이며, 사물과 관계와 다이어그램으로 구성된다.

## 왜 시험에 나오나

1과목에서 두 번째로 문항이 많다. 구성 요소 세 가지, 관계의 이름과 정의 짝짓기, 다이어그램의 구조와 행위 분류가 반복 출제된다.

## 그림

<svg viewBox="0 0 360 190" role="img" aria-label="UML 주요 관계의 표기법">
  <text x="8" y="18" font-size="12" fill="currentColor">연관</text>
  <line x1="70" y1="14" x2="180" y2="14" stroke="currentColor" stroke-width="1.3"/>
  <text x="190" y="18" font-size="12" fill="currentColor">실선</text>
  <text x="8" y="52" font-size="12" fill="currentColor">의존</text>
  <line x1="70" y1="48" x2="180" y2="48" stroke="currentColor" stroke-width="1.3" stroke-dasharray="6 4"/>
  <polyline points="170,42 180,48 170,54" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="190" y="52" font-size="12" fill="currentColor">점선 + 열린 화살</text>
  <text x="8" y="88" font-size="12" fill="currentColor">일반화</text>
  <line x1="70" y1="84" x2="168" y2="84" stroke="currentColor" stroke-width="1.3"/>
  <polygon points="182,84 168,78 168,90" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="190" y="88" font-size="12" fill="currentColor">속 빈 삼각형</text>
  <text x="8" y="124" font-size="12" fill="currentColor">실체화</text>
  <line x1="70" y1="120" x2="168" y2="120" stroke="currentColor" stroke-width="1.3" stroke-dasharray="6 4"/>
  <polygon points="182,120 168,114 168,126" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="190" y="124" font-size="12" fill="currentColor">점선 + 삼각형</text>
  <text x="8" y="160" font-size="12" fill="currentColor">집합</text>
  <polygon points="70,160 84,154 98,160 84,166" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <line x1="98" y1="160" x2="180" y2="160" stroke="currentColor" stroke-width="1.3"/>
  <text x="190" y="164" font-size="12" fill="currentColor">속 빈 마름모</text>
</svg>

## 핵심

- 구성 요소는 사물(Things), 관계(Relationship), 다이어그램(Diagram) 셋이다.
- 스테레오 타입은 겹화살괄호 기호로 표기한다.

| 관계 | 정의로 주어지는 문구 |
|---|---|
| 연관(Association) | 두 사물이 구조적으로 연결돼 있음 |
| 의존(Dependency) | 한 사물의 명세가 바뀌면 다른 사물이 영향을 받음. 매개변수로 쓰는 경우 |
| 일반화(Generalization) | 일반적인 사물과 특수한 사물 사이의 관계 |
| 실체화(Realization) | 한 객체가 다른 객체에게 오퍼레이션 수행을 지정 |
| 집합(Aggregation) | 하나가 다른 것을 포함하는 관계 |

- 구조 다이어그램은 클래스, 객체, 컴포넌트, 배치, 복합구조, 패키지 여섯이다.
- 행위 다이어그램은 유스케이스, 순차, 커뮤니케이션, 상태, 활동, 상호작용 개요, 타이밍 일곱이다.

## 헷갈리는 지점

- 배치 다이어그램은 구조 다이어그램이다. 행위 다이어그램이 아닌 것을 고르는 문항의 단골 정답이다.
- 순차 다이어그램은 행위 쪽이다. 정적 다이어그램이 아닌 것을 묻는 문항에서 이것이 정답이 된다.
- 의존과 실체화를 맞바꾼 보기가 반복된다. 명세 변경이 전파되면 의존, 오퍼레이션 수행 지정이면 실체화다.
- 구성 요소를 묻는 문항에 Terminal 같은 없는 이름이 들어간다. 사물, 관계, 다이어그램만이 답이다.
- UML은 모델링 언어다. 개발 방법론이나 개발 프로세스라는 서술은 오답이다.

## 기출 패턴

관계 문항은 정의 한 줄을 주고 영문 네 개 중 하나를 고르게 한다. 분류 문항은 구조와 행위 중 한쪽 목록을 주고 섞인 하나를 찾게 한다. UML 전반을 묻는 부정형은 상태 다이어그램과 순차 다이어그램의 설명을 서로 바꿔 놓는 방식으로 틀린 보기를 만든다. 존재하지 않는 다이어그램 이름을 끼워 넣는 문항도 있다.

## 퀴즈
- q: 한 클래스를 다른 클래스의 오퍼레이션 매개변수로 사용할 때 나타나는 관계는?
  choices: [Association, Dependency, Realization, Generalization]
  a: 2
  why: 명세 변경이 다른 사물로 전파되는 일시적 사용 관계가 의존이다. 실체화는 오퍼레이션 수행을 지정하는 관계로 정의가 다르다.
- q: UML 행위 다이어그램에 해당하지 않는 것은?
  choices: [유스케이스 다이어그램, 활동 다이어그램, 배치 다이어그램, 상태 다이어그램]
  a: 3
  why: 배치 다이어그램은 하드웨어에 소프트웨어를 배치한 구조를 나타내므로 구조 다이어그램이다. 활동 다이어그램은 처리 흐름을 다루는 행위 쪽이다.
- q: UML의 기본 구성 요소로 옳게 묶인 것은?
  choices: [사물·관계·다이어그램, 사물·관계·단말, 객체·속성·연산, 모델·뷰·제어]
  a: 1
  why: 구성 요소는 사물, 관계, 다이어그램이다. 모델과 뷰와 제어는 MVC 아키텍처의 구성이지 UML의 구성 요소가 아니다.

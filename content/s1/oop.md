---
id: oop
subject: 1
title: 객체지향 기본 개념
tier: S
tags: [객체지향, 클래스, 캡슐화, 상속, 다형성, 메시지, 정보은닉, 오버로딩, 오버라이딩, 추상화, 인스턴스]
keywords: [객체지향]
items: [q:2022-1:020, q:2022-3:018, q:2022-1:004, q:2022-2:009, q:2025-2:003]
updated: 2026-08-15
---

## 한 줄 정의

객체지향(Object-Oriented)은 데이터와 그 데이터를 처리하는 함수를 객체 하나로 묶어 시스템을 구성하는 방법이며, 클래스와 캡슐화와 상속과 다형성을 기본 개념으로 삼는다.

## 왜 시험에 나오나

1과목 문항의 약 8분의 1이 이 갈래에서 나온다. 각 용어의 정의를 서술로 주고 이름을 고르게 하는 형태가 압도적이다. 용어끼리 서로 오답 보기가 된다.

## 그림

<svg viewBox="0 0 360 172" role="img" aria-label="캡슐화된 클래스와 상속 관계">
  <rect x="118" y="8" width="164" height="62" rx="4" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <line x1="118" y1="30" x2="282" y2="30" stroke="currentColor" stroke-width="1.2"/>
  <text x="200" y="25" text-anchor="middle" font-size="13" fill="currentColor">상위 클래스</text>
  <text x="126" y="47" font-size="12" fill="currentColor">속성 + 연산을 함께 묶음</text>
  <text x="126" y="63" font-size="12" fill="currentColor" opacity="0.8">= 캡슐화, 내부는 정보 은닉</text>
  <line x1="12" y1="40" x2="112" y2="40" stroke="currentColor" stroke-width="1.2"/>
  <polygon points="118,40 108,35 108,45" fill="currentColor"/>
  <text x="16" y="34" font-size="12" fill="currentColor">메시지</text>
  <line x1="200" y1="70" x2="200" y2="104" stroke="currentColor" stroke-width="1.2"/>
  <polygon points="200,70 193,84 207,84" fill="none" stroke="currentColor" stroke-width="1.2"/>
  <text x="212" y="92" font-size="12" fill="currentColor">상속</text>
  <rect x="118" y="104" width="164" height="46" rx="4" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="200" y="122" text-anchor="middle" font-size="13" fill="currentColor">하위 클래스</text>
  <text x="126" y="140" font-size="12" fill="currentColor" opacity="0.8">물려받은 것 + 새로 추가한 것</text>
</svg>

## 핵심

| 용어 | 정의로 주어지는 문구 |
|---|---|
| 클래스(Class) | 유사한 객체들을 묶어 공통 특성을 표현한 데이터 추상화의 단위 |
| 캡슐화(Encapsulation) | 속성과 연산을 하나로 묶고 필요한 인터페이스만 밖으로 드러냄 |
| 정보 은닉 | 캡슐화의 핵심 효과. 내부 구현을 다른 객체에게 숨김 |
| 상속(Inheritance) | 상위 클래스의 속성과 연산을 하위 클래스가 물려받음 |
| 다형성(Polymorphism) | 하나의 이름이 여러 형태로 동작함 |
| 메시지(Message) | 객체에게 행위를 지시하는 객체 간 상호작용 수단 |
| 인스턴스(Instance) | 클래스로부터 실제로 만들어진 객체 |

- 설계에 쓰는 추상화 기법은 과정 추상화, 자료 추상화, 제어 추상화 셋이다.
- 분석 방법론은 럼바우, 부치, 야콥슨, 코드와 요든, 워프스 브록으로 나뉜다. [[rumbaugh]] 참고.

## 헷갈리는 지점

- 정보 은닉과 가장 가까운 개념은 캡슐화다. 클래스나 인스턴스를 고르면 틀린다.
- "유사한 객체들을 묶은 것"은 클래스, "속성과 연산을 함께 묶은 것"은 캡슐화다. 두 서술이 거의 같은 문장으로 제시되니 묶는 대상이 객체인지 연산인지를 본다.
- 오버로딩은 같은 이름의 메서드를 매개변수의 개수나 자료형을 달리해 여러 개 두는 것이다. 메서드 이름을 다르게 한다는 서술은 오답이다.
- 오버라이딩은 상속 관계에서 상위 클래스의 메서드를 하위 클래스가 재정의하는 것이다. 오버로딩과 자리를 바꾼 보기가 반복된다.
- 추상화 기법에 강도 추상화는 없다. 보기 넷째 자리에 없는 이름을 끼워 넣는다.
- 코드와 요든 방법은 개체 관계 다이어그램을 쓴다. 유스케이스를 강조하는 것은 야콥슨이다.

## 기출 패턴

정의 제시형이 기본이다. 영문 보기 Class, Encapsulation, Inheritance, Polymorphism, Message, Association을 섞어 놓고 하나를 고르게 한다. 다형성 문항은 오버로딩 설명 한 줄만 뒤집어 틀린 보기를 만든다. 분석 방법론 문항은 사람 이름과 특징 한 줄을 짝짓게 한다. 설계 원칙은 [[solid-principles]]에서 따로 묻는다.

## 퀴즈
- q: 객체 내부 구현을 감추고 필요한 인터페이스만 노출하는 개념은?
  choices: [Inheritance, Encapsulation, Polymorphism, Instance]
  a: 2
  why: 속성과 연산을 묶어 외부와 경계를 만드는 것이 캡슐화이며 정보 은닉으로 이어진다. 상속은 상위 클래스의 것을 물려받는 별개의 개념이다.
- q: 메서드 오버로딩의 설명으로 옳은 것은?
  choices: [이름이 같고 매개변수가 다르다, 이름이 다르고 매개변수가 같다, 상속받은 메서드를 재정의한다, 상위 클래스에서만 정의한다]
  a: 1
  why: 오버로딩은 같은 이름에 매개변수의 개수나 자료형을 달리해 중복 정의한다. 상속받은 메서드의 재정의는 오버라이딩이다.
- q: 소프트웨어 설계의 추상화 기법이 아닌 것은?
  choices: [자료 추상화, 제어 추상화, 과정 추상화, 결합 추상화]
  a: 4
  why: 추상화 기법은 자료, 제어, 과정 셋이다. 결합이라는 이름은 존재하지 않으며 제어 추상화는 구현 방식을 정하지 않고 효과만 규정하는 실제 기법이다.

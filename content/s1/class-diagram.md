---
id: class-diagram
subject: 1
title: 클래스 다이어그램
tier: A
tags: [클래스다이어그램, 구조다이어그램, 정적구조, 오퍼레이션, 속성, 접근제어자, 연관관계]
keywords: [클래스다이어그램]
items: [q:2025-1:019, s:20210307:019, s:20200606:012, t:keyword:015, q:2024-2:003]
updated: 2026-08-15
---

## 한 줄 정의

클래스 다이어그램(Class Diagram)은 시스템 안 클래스의 정적 구조와 클래스가 가지는 속성, 그리고 클래스 사이의 관계를 표현하는 UML 구조 다이어그램이다.

## 왜 시험에 나오나

구조 다이어그램에 속하는지를 묻는 분류 문항과 구성 요소 용어를 묻는 문항이 반복된다. 다른 다이어그램의 설명을 붙여 놓은 부정형도 나온다.

## 그림

<svg viewBox="0 0 360 168" role="img" aria-label="클래스 다이어그램의 세 칸 표기와 연관 관계">
  <rect x="16" y="12" width="140" height="112" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <line x1="16" y1="38" x2="156" y2="38" stroke="currentColor" stroke-width="1.3"/>
  <line x1="16" y1="86" x2="156" y2="86" stroke="currentColor" stroke-width="1.3"/>
  <text x="86" y="31" text-anchor="middle" font-size="13" fill="currentColor">회원</text>
  <text x="24" y="56" font-size="12" fill="currentColor">- 회원번호</text>
  <text x="24" y="74" font-size="12" fill="currentColor">- 이름</text>
  <text x="24" y="106" font-size="12" fill="currentColor">+ 등급조회()</text>
  <text x="86" y="142" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.8">이름 / 속성 / 오퍼레이션</text>
  <line x1="156" y1="62" x2="216" y2="62" stroke="currentColor" stroke-width="1.3"/>
  <text x="162" y="56" font-size="12" fill="currentColor">1  *</text>
  <rect x="216" y="12" width="128" height="112" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <line x1="216" y1="38" x2="344" y2="38" stroke="currentColor" stroke-width="1.3"/>
  <line x1="216" y1="86" x2="344" y2="86" stroke="currentColor" stroke-width="1.3"/>
  <text x="280" y="31" text-anchor="middle" font-size="13" fill="currentColor">주문</text>
  <text x="224" y="56" font-size="12" fill="currentColor">- 주문번호</text>
  <text x="224" y="106" font-size="12" fill="currentColor">+ 합계()</text>
</svg>

## 핵심

- 클래스는 이름 칸과 속성 칸과 오퍼레이션 칸의 세 칸으로 그린다.
- 오퍼레이션(Operation)은 클래스의 동작이며 객체에 적용될 메서드를 정의한 것이다. 동작에 대한 인터페이스로도 설명된다.
- 접근 제어자는 이름 앞에 기호로 붙인다. 공개는 더하기, 비공개는 빼기다.
- 구조 다이어그램은 클래스, 객체, 컴포넌트, 배치, 복합구조, 패키지다. [[uml]] 참고.
- 클래스 다이어그램으로 시스템의 구조를 파악하고 구조상의 문제점을 도출한다.

## 헷갈리는 지점

- 상태 다이어그램은 구조 다이어그램이 아니다. 구조 다이어그램이 아닌 것을 고르는 문항에서 객체·컴포넌트·클래스 사이에 놓이면 그것이 정답이다.
- 활동 다이어그램도 행위 쪽이다. 같은 형태의 문항에서 정답 자리에 번갈아 들어간다.
- 메시지와 객체 사이의 연관을 함께 표현하는 것은 커뮤니케이션 다이어그램이다. 이 설명을 클래스 다이어그램에 붙인 보기가 오답으로 나온다.
- 오퍼레이션과 인스턴스를 맞바꾼 보기가 있다. 동작을 정의한 것이 오퍼레이션이고, 클래스로부터 만들어진 객체가 인스턴스다.
- 정보 은닉을 뜻하는 하이딩(Hiding)은 클래스 다이어그램의 구성 요소 이름이 아니다.

## 기출 패턴

분류 문항은 영문 다이어그램 이름 넷을 주고 구조 쪽에 속하지 않는 하나를 고르게 한다. 설명 제시형은 "클래스의 정적 구조와 속성 사이의 관계"라는 문구를 주고 클래스 다이어그램을 고르게 한다. 구성 요소 문항은 오퍼레이션의 정의를 주고 Instance, Item, Hiding을 오답으로 깐다.

## 퀴즈
- q: UML 구조 다이어그램에 속하지 않는 것은?
  choices: [Object Diagram, State Diagram, Component Diagram, Class Diagram]
  a: 2
  why: 상태 다이어그램은 상태 변화를 다루는 행위 다이어그램이다. 객체와 컴포넌트와 클래스는 모두 정적 구조를 나타내는 구조 다이어그램이다.
- q: 클래스의 동작을 의미하며 객체에 적용될 메서드를 정의한 요소는?
  choices: [Instance, Operation, Item, Hiding]
  a: 2
  why: 동작을 정의한 것이 오퍼레이션이다. 인스턴스는 클래스로부터 생성된 객체를 가리키므로 정의하는 대상이 아니라 만들어진 결과다.
- q: 클래스 다이어그램이 나타내는 것은?
  choices: [시간에 따른 메시지 교환, 클래스의 정적 구조와 관계, 하드웨어에 대한 배치, 상태의 변화 과정]
  a: 2
  why: 클래스와 속성과 관계라는 정적 구조를 표현한다. 시간에 따른 메시지 교환은 순차 다이어그램이 담당하는 영역이다.

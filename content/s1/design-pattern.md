---
id: design-pattern
subject: 1
title: GoF 디자인 패턴 분류
tier: S
tags: [디자인패턴, GoF, 생성패턴, 구조패턴, 행위패턴, 싱글톤, 어댑터, 옵서버, 팩토리메서드]
keywords: [디자인패턴]
items: [q:2022-2:015, q:2023-2:014, q:2022-1:014, q:2023-3:005, q:2024-2:005]
updated: 2026-08-15
---

## 한 줄 정의

디자인 패턴은 소프트웨어 설계에서 자주 발생하는 문제에 대한 전형적인 해결 방식이며, GoF(Gang of Four)는 이를 생성과 구조와 행위 세 갈래로 분류했다.

## 왜 시험에 나오나

1과목 상위 출제군이다. 패턴 이름 하나를 주고 어느 갈래인지 묻는 문항이 절반을 넘는다. 나머지는 장단점과 구성 요소를 묻는다.

## 그림

<svg viewBox="0 0 360 156" role="img" aria-label="GoF 디자인 패턴 세 갈래와 대표 패턴">
  <rect x="6" y="10" width="108" height="132" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="60" y="30" text-anchor="middle" font-size="13" fill="currentColor">생성 5</text>
  <text x="14" y="52" font-size="12" fill="currentColor">추상 팩토리</text>
  <text x="14" y="70" font-size="12" fill="currentColor">빌더</text>
  <text x="14" y="88" font-size="12" fill="currentColor">팩토리 메서드</text>
  <text x="14" y="106" font-size="12" fill="currentColor">프로토타입</text>
  <text x="14" y="124" font-size="12" fill="currentColor">싱글톤</text>
  <rect x="124" y="10" width="108" height="132" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="178" y="30" text-anchor="middle" font-size="13" fill="currentColor">구조 7</text>
  <text x="132" y="52" font-size="12" fill="currentColor">어댑터·브리지</text>
  <text x="132" y="70" font-size="12" fill="currentColor">컴포지트</text>
  <text x="132" y="88" font-size="12" fill="currentColor">데코레이터</text>
  <text x="132" y="106" font-size="12" fill="currentColor">퍼사드·프록시</text>
  <text x="132" y="124" font-size="12" fill="currentColor">플라이웨이트</text>
  <rect x="242" y="10" width="112" height="132" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="298" y="30" text-anchor="middle" font-size="13" fill="currentColor">행위 11</text>
  <text x="250" y="52" font-size="12" fill="currentColor">책임 연쇄·커맨드</text>
  <text x="250" y="70" font-size="12" fill="currentColor">인터프리터</text>
  <text x="250" y="88" font-size="12" fill="currentColor">반복자·중재자</text>
  <text x="250" y="106" font-size="12" fill="currentColor">메멘토·옵서버</text>
  <text x="250" y="124" font-size="12" fill="currentColor">상태·전략·방문자</text>
</svg>

## 핵심

- 분류는 생성과 구조와 행위 셋뿐이다. 행위 목록에는 템플릿 메서드도 들어간다.
- 싱글톤은 클래스 안에 인스턴스가 하나뿐임을 보장해 메모리 낭비를 줄인다.
- 팩토리 메서드는 상위 클래스가 생성 인터페이스를 정의하고 하위 클래스가 인스턴스를 만든다.
- 프로토타입은 원형을 먼저 만들고 인스턴스를 복제해 쓴다.
- 어댑터는 호환되지 않는 인터페이스를 중간에서 맞춰 준다. 브리지는 추상층과 구현부를 분리해 각각 확장한다.
- 구성 요소는 패턴 이름, 문제, 솔루션, 사례, 결과, 샘플 코드다.

## 헷갈리는 지점

- 추상 패턴이나 객체 패턴이라는 분류는 없다. 생성 패턴에 추상 팩토리가 있어 헷갈리게 만든 보기다.
- 빌더는 생성 패턴이다. 구조 패턴이 아닌 것을 고르는 문항에서 어댑터와 브리지와 프록시 사이에 끼워 놓는다.
- 프로토타입은 생성 패턴이다. 행위 패턴이 아닌 것을 묻는 문항의 정답으로 나온다.
- 어댑터 설명을 브리지에 붙인 보기가 있다. 중간에서 맞춰 주는 쪽이 어댑터다.
- 디자인 패턴은 객체지향 설계용이다. 절차형 언어와 함께 쓸 때 효율이 극대화된다는 서술은 오답이다.
- 초기 투자 비용과 개발 시간이 절약된다는 서술도 오답이다. 재사용 단계의 시간이 줄어드는 것이지 초기 비용이 줄지 않는다.

## 기출 패턴

분류 문항이 기본형이다. 네 패턴 이름을 주고 특정 갈래에 속하거나 속하지 않는 하나를 고르게 한다. 설명 제시형은 싱글톤을 가장 자주 묻고 "인스턴스가 하나뿐임을 보장"과 "메모리 낭비 최소화"를 서술로 준다. 장단점 문항과 구성 요소 문항은 개발자 이름이나 성명을 넣어 고르게 한다.

## 퀴즈
- q: GoF 디자인 패턴의 분류에 해당하지 않는 것은?
  choices: [생성 패턴, 구조 패턴, 행위 패턴, 추상 패턴]
  a: 4
  why: 분류는 생성과 구조와 행위 셋이다. 추상이라는 이름은 생성 패턴에 속한 추상 팩토리와 혼동하도록 만든 보기다.
- q: 구조 패턴이 아닌 것은?
  choices: [어댑터, 브리지, 빌더, 프록시]
  a: 3
  why: 빌더는 객체 생성 과정을 다루는 생성 패턴이다. 프록시는 대리 객체로 접근을 제어하는 구조 패턴이다.
- q: 인스턴스가 하나뿐임을 보장하는 패턴은?
  choices: [싱글톤, 옵서버, 데코레이터, 방문자]
  a: 1
  why: 싱글톤은 유일한 인스턴스를 보장해 메모리 낭비를 줄인다. 옵서버는 상태 변화를 통지하는 행위 패턴으로 생성과 관계가 없다.

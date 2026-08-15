---
id: solid-principles
subject: 1
title: SOLID 객체지향 설계 원칙
tier: A
tags: [인증기술, SOLID, SRP, OCP, LSP, ISP, DIP, 설계원칙, SSO]
keywords: [SOLID원칙]
items: [q:2022-3:010, q:2022-3:011, q:2022-2:012, q:2022-3:004, q:2023-1:007]
updated: 2026-08-15
---

## 한 줄 정의

SOLID는 객체지향 설계에서 지켜야 할 다섯 가지 원칙의 머리글자이며, 단일 책임과 개방 폐쇄와 리스코프 치환과 인터페이스 분리와 의존 역전으로 이뤄진다.

## 왜 시험에 나오나

다섯 원칙의 영문 약어를 나열하고 여기에 속하지 않는 하나를 고르게 하는 형태로 나온다. 오답 자리에 보안 쪽 약어를 섞어 두는 것이 이 문항의 특징이다.

## 그림

<svg viewBox="0 0 360 168" role="img" aria-label="SOLID 다섯 원칙의 약어와 뜻">
  <text x="10" y="24" font-size="13" fill="currentColor">S</text>
  <text x="34" y="24" font-size="12" fill="currentColor">SRP</text>
  <text x="86" y="24" font-size="12" fill="currentColor">단일 책임 원칙</text>
  <line x1="8" y1="34" x2="350" y2="34" stroke="currentColor" stroke-width="1" opacity="0.5"/>
  <text x="10" y="58" font-size="13" fill="currentColor">O</text>
  <text x="34" y="58" font-size="12" fill="currentColor">OCP</text>
  <text x="86" y="58" font-size="12" fill="currentColor">개방 폐쇄 원칙</text>
  <line x1="8" y1="68" x2="350" y2="68" stroke="currentColor" stroke-width="1" opacity="0.5"/>
  <text x="10" y="92" font-size="13" fill="currentColor">L</text>
  <text x="34" y="92" font-size="12" fill="currentColor">LSP</text>
  <text x="86" y="92" font-size="12" fill="currentColor">리스코프 치환 원칙</text>
  <line x1="8" y1="102" x2="350" y2="102" stroke="currentColor" stroke-width="1" opacity="0.5"/>
  <text x="10" y="126" font-size="13" fill="currentColor">I</text>
  <text x="34" y="126" font-size="12" fill="currentColor">ISP</text>
  <text x="86" y="126" font-size="12" fill="currentColor">인터페이스 분리 원칙</text>
  <line x1="8" y1="136" x2="350" y2="136" stroke="currentColor" stroke-width="1" opacity="0.5"/>
  <text x="10" y="160" font-size="13" fill="currentColor">D</text>
  <text x="34" y="160" font-size="12" fill="currentColor">DIP</text>
  <text x="86" y="160" font-size="12" fill="currentColor">의존 역전 원칙</text>
</svg>

## 핵심

| 약어 | 원어 |
|---|---|
| SRP | Single Responsibility Principle |
| OCP | Open Closed Principle |
| LSP | Liskov Substitution Principle |
| ISP | Interface Segregation Principle |
| DIP | Dependency Inversion Principle |

- 다섯 원칙은 객체지향 설계에만 적용된다. 기본 개념은 [[oop]]에서 다룬다.
- 의존 역전 원칙의 이름에 들어가는 의존은 UML의 의존 관계와 같은 낱말을 쓴다. 설계 원칙과 다이어그램 표기는 서로 다른 층위다.
- 인터페이스 분리 원칙은 쓰지 않는 기능까지 묶은 큰 인터페이스를 쪼갠다는 뜻이다.

## 헷갈리는 지점

- SSO(Single Sign On)는 SOLID에 속하지 않는다. 한 번의 인증으로 여러 시스템을 쓰는 인증 기술이며, 첫 글자가 S로 시작하고 형태가 비슷해 보기 자리에 놓인다. 이 문항의 정답은 늘 이런 인증 약어다.
- SRP와 SSO는 다르다. 머리글자가 겹치는 순간 보안 용어인지 설계 원칙인지를 먼저 갈라야 한다.
- 리스코프 치환 원칙은 사람 이름에서 왔다. 사람 이름이 붙었다는 이유로 설계 원칙이 아니라고 판단하면 틀린다.
- 개방 폐쇄 원칙은 확장에는 열려 있고 변경에는 닫혀 있다는 뜻이다. 두 방향을 뒤집은 서술이 오답으로 쓰인다.
- 다섯 원칙에 캡슐화나 상속은 들어가지 않는다. 그것은 객체지향의 기본 개념이지 설계 원칙의 이름이 아니다.

## 기출 패턴

부정형 한 가지 형태로 굳어 있다. ISP와 DIP와 LSP 세 개를 참으로 깔고 넷째 자리에 SSO 같은 보안 약어를 넣어 속하지 않는 것을 고르게 한다. 보기의 영문 원어까지 함께 제시되므로 원어를 읽으면 인증 쪽 용어인지가 바로 드러난다.

## 퀴즈
- q: SOLID 원칙에 속하지 않는 것은?
  choices: [ISP, DIP, LSP, SSO]
  a: 4
  why: SSO는 한 번의 인증으로 여러 시스템에 접근하는 인증 기술이다. ISP는 인터페이스 분리 원칙으로 다섯 원칙에 실제로 포함된다.
- q: 의존 역전 원칙을 뜻하는 약어는?
  choices: [SRP, OCP, DIP, ISP]
  a: 3
  why: 의존 역전은 Dependency Inversion Principle의 머리글자인 DIP다. SRP는 하나의 클래스가 하나의 책임만 갖는다는 단일 책임 원칙이다.
- q: 개방 폐쇄 원칙의 뜻으로 옳은 것은?
  choices: [확장에 열려 있고 변경에 닫혀 있다, 변경에 열려 있고 확장에 닫혀 있다, 인터페이스를 하나로 합친다, 상위 모듈이 하위 모듈에 의존한다]
  a: 1
  why: 확장은 허용하고 기존 코드의 변경은 막는 것이 개방 폐쇄 원칙이다. 방향을 뒤집은 둘째 보기가 대표적인 오답 형태다.

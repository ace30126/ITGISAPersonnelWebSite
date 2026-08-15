---
id: java
subject: 4
title: 자바 코드 추적과 문법
tier: S
tags: [자바, java, 증감연산자, 삼항연산자, 접근제어자, 예외, 가비지컬렉터, 배열, 자료형]
keywords: [자바]
items: [q:2024-1:069, q:2022-2:072, q:2023-3:063, q:2022-1:066]
updated: 2026-08-15
---

## 한 줄 정의
자바 문항은 증감·삼항 연산이 섞인 짧은 코드의 출력값을 묻거나, 문법 용어의 옳고 그름을 가른다.

## 왜 시험에 나오나
4과목에서 C언어 다음으로 많이 나온다. 코드 추적이 절반, 접근 제어자·자료형·예외 같은 용어 판별이 나머지 절반이다.

## 그림
<svg viewBox="0 0 400 130" role="img" aria-label="후위 증가 연산자와 전위 감소 연산자의 실행 순서 비교">
  <text x="34" y="45" text-anchor="middle" font-size="14" fill="currentColor">x++</text>
  <rect x="70" y="24" width="130" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="135" y="46" text-anchor="middle" font-size="12" fill="currentColor">지금 값을 쓴다</text>
  <line x1="200" y1="41" x2="232" y2="41" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="240,41 230,36 230,46" fill="currentColor"/>
  <rect x="245" y="24" width="130" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="310" y="46" text-anchor="middle" font-size="12" fill="currentColor">그 뒤에 1 증가</text>
  <text x="34" y="105" text-anchor="middle" font-size="14" fill="currentColor">--x</text>
  <rect x="70" y="84" width="130" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="135" y="106" text-anchor="middle" font-size="12" fill="currentColor">먼저 1 감소</text>
  <line x1="200" y1="101" x2="232" y2="101" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="240,101 230,96 230,106" fill="currentColor"/>
  <rect x="245" y="84" width="130" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="310" y="106" text-anchor="middle" font-size="12" fill="currentColor">바뀐 값을 쓴다</text>
</svg>

## 핵심
x 가 3 일 때 y = x++ 와 z = --x 를 차례로 실행한 추적 표다.

| 실행한 문장 | x | y | z |
|---|---|---|---|
| 시작 | 3 | 0 | 0 |
| y = x++ | 4 | 3 | 0 |
| z = --x | 3 | 3 | 3 |

| 항목 | 내용 |
|---|---|
| 출력 메서드 | print, println, printf |
| 접근 제어자 | public, protected, default, private |
| 정수형 | byte, short, int, long |
| 실수형 | float, double |
| 배열 길이 | length 필드로 얻는다 |

## 헷갈리는 지점
- 오버로딩(Overloading)은 같은 이름의 메서드를 매개변수의 타입이나 개수를 다르게 여러 개 두는 것이다. 이름과 매개변수가 같고 상속받은 동작만 새로 짜는 것은 오버라이딩(Overriding)이다. 둘의 설명을 맞바꾼 보기가 반복된다.
- 접근 제어자에 internal 은 없다. 네 개 중 하나를 낯선 이름으로 갈아 끼운 보기가 정답이다.
- short 와 byte 는 정수형이다. 이 둘을 실수형에 넣은 보기가 오답 유도로 나온다.
- 예외(Exception)는 실행 중에 생기는 오류다. 문법 오류는 예외가 아니라 번역 단계에서 걸린다.
- char 는 문자 한 개만 담는다. 여러 문자를 이어 담는 것은 String 이다.
- 가비지 컬렉터(Garbage Collector)는 참조를 잃은 객체를 힙에서 치운다. 이름을 Memory Collector 등으로 바꾼 보기가 나온다.

## 기출 패턴
정수 몇 개를 두고 삼항 연산자와 if-else 를 겹쳐 마지막에 남는 값을 묻는 형태가 잦다. 증감 연산자의 전위·후위를 한 줄씩 섞어 세 변수의 값을 한꺼번에 출력시키기도 한다. 출력 메서드나 접근 제어자 목록에 없는 이름을 고르는 문항도 반복된다.

## 퀴즈
- q: 같은 이름의 메서드를 매개변수의 타입이나 개수를 달리해 여러 개 정의하는 것은?
  choices: [오버라이딩, 오버로딩, 캡슐화, 상속]
  a: 2
  why: 이름은 같고 매개변수가 다른 것이 오버로딩이다. 오버라이딩은 상속받은 메서드를 같은 형태로 다시 구현하는 것이다.
- q: 자바의 접근 제어자가 아닌 것은?
  choices: [public, private, default, internal]
  a: 4
  why: 자바의 접근 제어자는 public protected default private 네 가지다. internal 은 다른 언어의 이름이다.
- q: 참조를 잃은 객체를 힙에서 제거하는 자바의 모듈은?
  choices: [Heap Collector, Garbage Collector, Memory Collector, Variable Collector]
  a: 2
  why: 가비지 컬렉터가 사용되지 않는 객체를 회수한다. 나머지 셋은 이름만 그럴듯하게 만든 보기다.

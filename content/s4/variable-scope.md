---
id: variable-scope
subject: 4
title: 변수의 유효 범위와 자료형
tier: A
tags: [변수범위, 지역변수, 전역변수, static, 변수명규칙, 자료형, 가비지컬렉터, 스택, 힙]
keywords: [변수범위]
items: [q:2023-2:064, q:2023-1:065, q:2022-3:072]
updated: 2026-08-15
---

## 한 줄 정의
변수의 유효 범위는 그 변수를 쓸 수 있는 코드 구간이며, 선언 위치가 범위와 수명을 함께 정한다.

## 왜 시험에 나오나
변수 작성 규칙과 자료형 분류를 판별형으로 묻는다. 자바에서 쓰지 않는 객체를 회수하는 가비지 컬렉터도 이 묶음에서 나온다.

## 그림
<svg viewBox="0 0 400 140" role="img" aria-label="전역 영역 안에 함수 영역이 있고 그 안에 블록 영역이 겹쳐 있는 변수 유효 범위">
  <rect x="10" y="10" width="380" height="120" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="30" text-anchor="middle" font-size="12" fill="currentColor">전역 — 프로그램 전체에서 쓴다</text>
  <rect x="40" y="40" width="320" height="82" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="60" text-anchor="middle" font-size="12" fill="currentColor">함수 — 호출될 때 만들어진다</text>
  <rect x="80" y="70" width="240" height="44" rx="8" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="88" text-anchor="middle" font-size="12" fill="currentColor">블록 — 중괄호를 벗어나면</text>
  <text x="200" y="106" text-anchor="middle" font-size="12" fill="currentColor">사라진다</text>
</svg>

## 핵심
| 구분 | 선언 위치 | 수명 |
|---|---|---|
| 지역 변수 | 함수나 블록 안 | 그 구간을 벗어나면 사라진다 |
| 전역 변수 | 함수 바깥 | 프로그램이 끝날 때까지 남는다 |
| 정적 변수 | static 을 붙여 선언 | 함수를 벗어나도 값을 유지한다 |

변수 이름 규칙이다.

- 첫 자리에 숫자를 쓸 수 없다.
- 영문 대소문자, 숫자, 밑줄만 쓴다. 중간에 공백을 넣을 수 없다.
- 예약어는 쓸 수 없다.

자바 자료형 분류다.

| 분류 | 자료형 |
|---|---|
| 정수형 | byte, short, int, long |
| 실수형 | float, double |
| 문자형 | char 한 개 문자 |
| 논리형 | boolean 참과 거짓 |

## 헷갈리는 지점
- short 와 byte 를 실수형에 넣은 보기가 정답 자리에 자주 놓인다. 둘은 정수형이다.
- char 는 문자 한 개만 담는다. 여러 문자를 담는다고 쓴 보기는 틀렸다.
- 변수 이름 중간에 공백을 쓸 수 있다는 보기가 오답 유도로 나온다. 밑줄은 되지만 공백은 안 된다.
- 지역 변수와 전역 변수의 이름이 같으면 안쪽 지역 변수가 우선한다.
- 가비지 컬렉터(Garbage Collector)는 참조를 잃어 더 쓰이지 않는 객체를 힙에서 치운다. 이름을 Heap Collector 나 Memory Collector 로 바꾼 보기가 붙는다.

## 기출 패턴
파이썬 변수 작성 규칙 네 개 중 옳지 않은 것을 고르는 형태, 자바 변수와 자료형 설명 네 개 중 틀린 것을 고르는 형태가 짝으로 반복된다. 참조를 잃은 객체를 제거하는 모듈의 이름을 고르는 문항도 자주 나온다.

## 퀴즈
- q: 자바의 실수형 자료형만 묶은 것은?
  choices: [float double, short byte, int long, char boolean]
  a: 1
  why: 실수형은 float 와 double 뿐이다. short 와 byte 는 정수형이라 실수를 담지 못한다.
- q: 변수 이름 규칙으로 옳지 않은 것은?
  choices: [첫 자리에 숫자를 쓸 수 없다, 예약어를 쓸 수 없다, 이름 중간에 공백을 쓸 수 있다, 밑줄을 쓸 수 있다]
  a: 3
  why: 공백이 들어가면 이름이 둘로 갈리므로 쓸 수 없다. 밑줄은 쓸 수 있어 옳은 설명이다.
- q: 함수를 벗어나도 값을 유지하는 변수는?
  choices: [지역 변수, 매개 변수, 정적 변수, 블록 변수]
  a: 3
  why: static 으로 선언한 정적 변수는 값이 남는다. 지역 변수는 함수가 끝나면 함께 사라진다.

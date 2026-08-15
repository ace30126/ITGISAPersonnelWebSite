---
id: operator
subject: 4
title: 연산자와 우선순위
tier: A
tags: [연산자, 산술연산자, 관계연산자, 논리연산자, 비트연산자, 시프트, 우선순위, 대입연산자]
keywords: [연산자]
items: [q:2024-1:068, q:2023-1:062, q:2022-1:064]
updated: 2026-08-15
---

## 한 줄 정의
연산자는 값을 계산하거나 비교하는 기호이며, 여러 개가 섞인 식은 우선순위 순서대로 계산해야 답이 맞는다.

## 왜 시험에 나오나
어느 분류에 속하지 않는 연산자를 고르는 단답형이 반복된다. 관계와 논리와 시프트가 한 식에 섞인 계산 문항도 나온다.

## 그림
<svg viewBox="0 0 400 160" role="img" aria-label="연산자 우선순위를 위에서 아래로 나열한 순서표">
  <rect x="60" y="8" width="280" height="24" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="25" text-anchor="middle" font-size="12" fill="currentColor">단항 — 부호 증감 논리 부정</text>
  <rect x="60" y="34" width="280" height="24" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="51" text-anchor="middle" font-size="12" fill="currentColor">산술 — 곱나눗셈이 덧뺄셈보다 먼저</text>
  <rect x="60" y="60" width="280" height="24" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="77" text-anchor="middle" font-size="12" fill="currentColor">시프트 — 왼쪽 밀기 오른쪽 밀기</text>
  <rect x="60" y="86" width="280" height="24" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="103" text-anchor="middle" font-size="12" fill="currentColor">관계 — 크기 비교와 같음 비교</text>
  <rect x="60" y="112" width="280" height="24" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="129" text-anchor="middle" font-size="12" fill="currentColor">논리 — 그리고 또는</text>
  <text x="200" y="152" text-anchor="middle" font-size="12" fill="currentColor">맨 마지막이 대입</text>
</svg>

## 핵심
| 분류 | 기호 |
|---|---|
| 산술 | + - * / % |
| 관계 | > < >= <= == != |
| 논리 | && \|\| ! |
| 비트 | & \| ^ ~ << >> |
| 대입 | = += -= *= /= |
| 삼항 | 조건 ? 참 : 거짓 |

a 가 1, b 가 2 일 때 시프트와 관계와 논리가 섞인 식의 추적 표다.

| 순서 | 계산하는 부분 | 결과 |
|---|---|---|
| 1 | b + 2 | 4 |
| 2 | a 를 왼쪽으로 1 밀기 | 2 |
| 3 | a < 4 | 참 |
| 4 | 2 <= b | 참 |
| 5 | 참 그리고 참 | 1 |

## 헷갈리는 지점
- 산술 연산자가 아닌 것을 묻는 문항에 = 와 << 가 번갈아 등장한다. = 는 대입, << 는 비트 시프트다. % 는 나머지를 구하는 산술 연산자라 정답이 아니다.
- 논리합은 두 값 중 하나라도 참이면 1 이다. 논리곱은 둘 다 참이어야 1 이다. 설명을 바꿔 놓은 보기가 나온다.
- == 는 비교, = 는 대입이다. 조건식에 = 를 쓰면 비교가 아니라 값이 들어간다.
- 산술과 관계와 논리가 섞이면 산술을 먼저, 논리를 마지막에 계산한다. 왼쪽부터 순서대로 읽으면 답이 틀어진다.
- 비트 연산자 & 와 논리 연산자 && 는 기호 개수로 갈린다.

## 기출 패턴
산술 연산자가 아닌 것을 고르는 문항이 가장 잦고 오답 자리에 = 와 << 가 돌아가며 놓인다. 논리 연산의 동작을 말로 풀어 놓고 기호를 고르게 하는 문항, 짧은 식 하나를 주고 계산 결과가 0 인지 1 인지 묻는 문항도 반복된다.

## 퀴즈
- q: C언어에서 산술 연산자가 아닌 것은?
  choices: [%, *, /, =]
  a: 4
  why: = 는 오른쪽 값을 왼쪽에 넣는 대입 연산자다. % 는 나머지를 구하는 산술 연산자라 오답이다.
- q: 두 논리 값 중 하나라도 참이면 1 을 반환하는 연산자는?
  choices: [논리합, 논리곱, 논리 부정, 같지 않음]
  a: 1
  why: 논리합은 하나만 참이어도 1 이다. 논리곱은 둘 다 참이어야 1 이라 조건이 더 엄격하다.
- q: 산술과 관계와 논리 연산자가 한 식에 섞였을 때 가장 먼저 계산하는 것은?
  choices: [논리, 관계, 산술, 대입]
  a: 3
  why: 산술이 가장 먼저, 대입이 가장 나중이다. 논리를 먼저 계산하면 비교할 값이 아직 없다.

---
id: c-lang
subject: 4
title: C언어 코드 추적
tier: S
tags: [C언어, 포인터, 배열, 구조체, 헤더파일, 서식문자, printf, 코드추적]
keywords: [C언어]
items: [q:2022-1:076, q:2022-2:063, q:2022-3:080, q:2022-1:064]
updated: 2026-08-15
---

## 한 줄 정의
4과목 C언어 문항은 문법 암기가 아니라 코드를 한 줄씩 따라가 최종 출력을 계산하는 문제다.

## 왜 시험에 나오나
4과목에서 가장 많이 나오는 소재다. 코드 추적 문항이 회차마다 여러 개 배치된다. 나머지는 헤더 파일 소속과 연산자 분류를 묻는다.

## 그림
<svg viewBox="0 0 400 120" role="img" aria-label="문자 배열 KOREA 의 인덱스 위치와 포인터 p1 이 가리키는 칸">
  <text x="65" y="26" text-anchor="middle" font-size="12" fill="currentColor">0</text>
  <text x="115" y="26" text-anchor="middle" font-size="12" fill="currentColor">1</text>
  <text x="165" y="26" text-anchor="middle" font-size="12" fill="currentColor">2</text>
  <text x="215" y="26" text-anchor="middle" font-size="12" fill="currentColor">3</text>
  <text x="265" y="26" text-anchor="middle" font-size="12" fill="currentColor">4</text>
  <rect x="40" y="34" width="50" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="90" y="34" width="50" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="140" y="34" width="50" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="190" y="34" width="50" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="240" y="34" width="50" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="65" y="57" text-anchor="middle" font-size="14" fill="currentColor">K</text>
  <text x="115" y="57" text-anchor="middle" font-size="14" fill="currentColor">O</text>
  <text x="165" y="57" text-anchor="middle" font-size="14" fill="currentColor">R</text>
  <text x="215" y="57" text-anchor="middle" font-size="14" fill="currentColor">E</text>
  <text x="265" y="57" text-anchor="middle" font-size="14" fill="currentColor">A</text>
  <line x1="65" y1="94" x2="65" y2="76" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="65,68 60,78 70,78" fill="currentColor"/>
  <text x="65" y="110" text-anchor="middle" font-size="12" fill="currentColor">p1</text>
  <line x1="165" y1="94" x2="165" y2="76" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="165,68 160,78 170,78" fill="currentColor"/>
  <text x="170" y="110" text-anchor="middle" font-size="12" fill="currentColor">p1+2</text>
</svg>

## 핵심
반복문은 회차마다 한 줄씩 값을 적는 추적 표로 푼다.

| i | i < 10 | s = s + i |
|---|---|---|
| 0 | 참 | 0 |
| 2 | 참 | 2 |
| 4 | 참 | 6 |
| 6 | 참 | 12 |
| 8 | 참 | 20 |
| 10 | 거짓 | 반복 종료 |

서식 문자와 헤더 파일은 표로 굳혀 둔다.

| 서식 | 출력 | 헤더 | 대표 함수 |
|---|---|---|---|
| %d | 정수 | stdio.h | printf scanf |
| %c | 문자 한 개 | string.h | strlen strcat |
| %s | 문자열 | stdlib.h | atoi malloc |
| %f | 실수 | math.h | sqrt pow |

## 헷갈리는 지점
- 배열 이름은 첫 원소의 주소다. p1 이 배열을 가리킬 때 *(p1 + 2) 는 배열의 세 번째 칸이다. 인덱스가 0부터라 한 칸씩 밀려 세는 오답이 나온다.
- stdlib.h 는 문자와 수치를 바꾸는 변환 함수, 동적 메모리 함수가 있는 곳이다. 표준 입출력은 stdio.h, strlen 은 string.h 다. 이 셋을 서로 바꿔 놓은 보기가 반복된다.
- 산술 연산자는 + - * / % 다. = 는 대입 연산자, << 는 비트 시프트다. "산술 연산자가 아닌 것"에 이 둘이 번갈아 등장한다.
- 같은 값이라도 %c 로 받으면 문자, %d 로 받으면 숫자가 찍힌다.

## 기출 패턴
구조체 안의 배열을 반복문으로 채운 뒤 짝수 번째 칸만 더해 합을 묻는 형태가 대표적이다. 문자 배열 두 개의 특정 칸을 서로 바꿔 넣고 이어 붙인 다음 한 글자를 출력하는 포인터 문항도 반복된다. 논리 연산의 뜻을 말로 풀어 놓고 기호를 고르게 하는 문항도 있다.

## 퀴즈
- q: 포인터 p 가 문자 배열의 시작을 가리킬 때 *(p + 2) 는 몇 번째 문자인가?
  choices: [첫 번째, 두 번째, 세 번째, 네 번째]
  a: 3
  why: 인덱스는 0부터 시작하므로 p+2 는 인덱스 2, 곧 세 번째 문자다. 두 번째로 세면 인덱스를 1부터 센 것이다.
- q: strlen 함수가 선언된 헤더 파일은?
  choices: [stdio.h, string.h, stdlib.h, math.h]
  a: 2
  why: 문자열 처리 함수는 string.h 에 있다. stdlib.h 는 변환 함수와 동적 메모리 함수를 담는다.
- q: C언어에서 산술 연산자가 아닌 것은?
  choices: [%, *, /, <<]
  a: 4
  why: << 는 비트를 왼쪽으로 미는 시프트 연산자다. % 는 나머지를 구하는 산술 연산자라 정답이 아니다.

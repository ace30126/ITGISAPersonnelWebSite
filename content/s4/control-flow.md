---
id: control-flow
subject: 4
title: 제어문과 반복 추적
tier: S
tags: [제어문, for, while, dowhile, break, continue, switch, 삼항연산자, 중첩반복]
keywords: [제어문]
items: [q:2024-2:069, q:2022-3:064, q:2022-2:063]
updated: 2026-08-15
---

## 한 줄 정의
제어문은 실행 순서를 바꾸는 문장이며, 시험은 그 순서를 따라간 뒤 남는 값을 묻는다.

## 왜 시험에 나오나
4과목 코드 문항의 뼈대다. C언어·자바·파이썬 문항 대부분이 반복문과 조건문의 실행 횟수를 정확히 세는지 확인한다.

## 그림
<svg viewBox="0 0 400 140" role="img" aria-label="for 문의 실행 순서: 초기식 다음 조건 다음 몸통 다음 증감식이 다시 조건으로 돌아가는 흐름">
  <rect x="14" y="12" width="86" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="57" y="34" text-anchor="middle" font-size="13" fill="currentColor">초기식</text>
  <rect x="130" y="12" width="86" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="173" y="34" text-anchor="middle" font-size="13" fill="currentColor">조건</text>
  <rect x="250" y="12" width="110" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="305" y="34" text-anchor="middle" font-size="13" fill="currentColor">몸통 실행</text>
  <rect x="130" y="86" width="86" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="173" y="108" text-anchor="middle" font-size="13" fill="currentColor">증감식</text>
  <line x1="100" y1="29" x2="122" y2="29" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="130,29 120,24 120,34" fill="currentColor"/>
  <line x1="216" y1="29" x2="242" y2="29" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="250,29 240,24 240,34" fill="currentColor"/>
  <line x1="305" y1="46" x2="305" y2="103" stroke="currentColor" stroke-width="1.5"/>
  <line x1="305" y1="103" x2="224" y2="103" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="216,103 226,98 226,108" fill="currentColor"/>
  <line x1="173" y1="86" x2="173" y2="54" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="173,46 168,56 178,56" fill="currentColor"/>
  <text x="352" y="70" text-anchor="middle" font-size="12" fill="currentColor">반복</text>
</svg>

## 핵심
후위 감소를 조건에 쓴 반복문은 이 표로 푼다. x 가 4 에서 시작하고 x 가 짝수면 건너뛰며 y 를 세는 경우다.

| 비교에 쓰인 x | x > 0 | 비교 뒤 x | 짝수인가 | y |
|---|---|---|---|---|
| 4 | 참 | 3 | 아니다 | 1 |
| 3 | 참 | 2 | 그렇다 | 1 |
| 2 | 참 | 1 | 아니다 | 2 |
| 1 | 참 | 0 | 그렇다 | 2 |
| 0 | 거짓 | 종료 | — | 2 |

- 조건에 쓰인 값과 몸통에서 쓰는 값이 다르다. 감소가 조건 검사 직후에 일어난다.
- 중첩 반복은 안쪽이 다 돌고 나서 바깥이 한 칸 움직인다. 출력 횟수는 두 횟수의 곱이다.

## 헷갈리는 지점
- continue 는 반복을 끝내지 않는다. 남은 몸통만 건너뛰고 다음 회차로 간다. 반복 자체를 벗어나는 것은 break 다. 둘을 바꿔 놓은 보기가 나온다.
- do-while 은 조건이 처음부터 거짓이어도 몸통을 한 번 실행한다. while 은 한 번도 실행하지 않는다.
- switch 문은 case 에 break 가 없으면 아래 case 로 계속 흘러 내려간다.
- 삼항 연산자는 조건 ? 참일 때 값 : 거짓일 때 값 순서다. 두 값을 뒤집어 놓은 보기가 오답으로 붙는다.

## 기출 패턴
반복문 안에 continue 를 넣고 최종 누적값을 묻는 형태가 대표적이다. 이중 for 문에 논리식을 넣고 같은 결과를 내는 다른 식을 고르라는 문항도 나온다. 삼항 연산자와 if-else 를 섞어 두고 마지막에 남는 변수 값을 물어보기도 한다.

## 퀴즈
- q: 반복문 몸통에서 continue 를 만나면 어떻게 되는가?
  choices: [반복문을 벗어난다, 남은 몸통을 건너뛰고 다음 회차로 간다, 프로그램이 종료된다, 조건식을 무시하고 몸통을 다시 실행한다]
  a: 2
  why: continue 는 이번 회차의 남은 몸통만 건너뛴다. 반복문을 벗어나는 것은 break 다.
- q: 조건이 처음부터 거짓일 때도 몸통을 한 번 실행하는 반복문은?
  choices: [for, while, do-while, switch]
  a: 3
  why: do-while 은 몸통을 먼저 실행하고 조건을 뒤에 검사한다. while 은 조건을 먼저 보므로 한 번도 실행하지 않는다.
- q: 삼항 연산자 a > b ? x : y 에서 a 가 b 보다 클 때의 결과는?
  choices: [x, y, 참, 거짓]
  a: 1
  why: 물음표 뒤가 조건이 참일 때의 값이다. 콜론 뒤 y 는 조건이 거짓일 때 선택된다.

---
id: stack
subject: 2
title: 스택과 큐
tier: S
tags: [스택, 큐, 데크, lifo, fifo, push, pop, top, front, rear, 오버플로, 언더플로]
keywords: [스택]
items: [q:2023-3:029, q:2023-2:025, q:2022-1:035, q:2024-3:034, q:2023-3:028]
updated: 2026-08-15
---

## 한 줄 정의

스택(Stack)은 삽입과 삭제가 한쪽 끝에서만 일어나는 후입선출 구조이고, 큐(Queue)는 한쪽에서 넣고 반대쪽에서 빼는 선입선출 구조다.

## 왜 시험에 나오나

2과목에서 매 회차 나온다. 특성을 묻는 정의형과, 입력 순서를 주고 출력 결과를 손으로 따라가게 하는 추적형이 반반이다.

## 그림

<svg viewBox="0 0 380 150" role="img" aria-label="스택은 top 한쪽으로만 입출력하고 큐는 rear로 넣어 front로 빼는 구조">
  <text x="8" y="18" font-size="13" fill="currentColor">스택 · LIFO</text>
  <rect x="8" y="28" width="60" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="8" y="54" width="60" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="8" y="80" width="60" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="38" y="46" text-anchor="middle" font-size="12" fill="currentColor">C</text>
  <text x="38" y="72" text-anchor="middle" font-size="12" fill="currentColor">B</text>
  <text x="38" y="98" text-anchor="middle" font-size="12" fill="currentColor">A</text>
  <text x="76" y="46" font-size="12" fill="currentColor">← top (push·pop)</text>
  <text x="8" y="128" font-size="12" fill="currentColor">포인터 1개, 나중에 넣은 C가 먼저 나온다</text>
  <text x="200" y="18" font-size="13" fill="currentColor">큐 · FIFO</text>
  <rect x="200" y="28" width="44" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="244" y="28" width="44" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="288" y="28" width="44" height="26" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="222" y="46" text-anchor="middle" font-size="12" fill="currentColor">A</text>
  <text x="266" y="46" text-anchor="middle" font-size="12" fill="currentColor">B</text>
  <text x="310" y="46" text-anchor="middle" font-size="12" fill="currentColor">C</text>
  <text x="200" y="72" font-size="12" fill="currentColor">front ↑ 삭제</text>
  <text x="200" y="90" font-size="12" fill="currentColor">rear (오른쪽 끝) 삽입</text>
  <text x="200" y="112" font-size="12" fill="currentColor">포인터 2개, 먼저 넣은</text>
  <text x="200" y="128" font-size="12" fill="currentColor">A가 먼저 나온다</text>
</svg>

## 핵심

입력 A, B, C, D에 push·push·push·pop·pop·push·pop·pop을 적용한 추적이다.

| 연산 | 스택 상태 | 출력 |
|---|---|---|
| push A | A | |
| push B | A B | |
| push C | A B C | |
| pop | A B | C |
| pop | A | C B |
| push D | A D | C B |
| pop | A | C B D |
| pop | 비었음 | C B D A |

- 스택 포인터는 top 하나다. 큐는 front와 rear 두 개를 갖는다. 데크(Deque)는 양쪽 끝에서 삽입과 삭제가 모두 가능하다.
- 스택 응용은 서브루틴 호출, 인터럽트 처리, 재귀 호출, 후위 표기식 연산, 깊이 우선 탐색이다.
- 빈 스택에서 삭제하면 언더플로(Underflow), 꽉 찬 스택에 삽입하면 오버플로(Overflow)다.

## 헷갈리는 지점

- 큐는 선형 구조다. "큐는 비선형 구조에 해당한다"는 서술이 틀린 보기로 반복 출제된다. 비선형은 트리와 그래프뿐이다.
- 스택이 front와 rear 두 포인터를 갖는다는 서술은 큐의 설명이다. 양쪽 끝에서 모두 삽입·삭제한다는 서술은 데크의 설명이다.
- 선택 정렬은 스택 응용이 아니다. 스택은 중간 값에 접근하지 못한다.
- 입력이 A, B, C, D일 때 D가 먼저 나왔다면 스택에 A, B, C가 순서대로 쌓여 있으므로 이후 출력은 C, B, A로 고정된다.

## 기출 패턴

정의형은 LIFO·한쪽 끝·응용 분야 셋을 참으로 깔고 큐나 데크의 설명 하나를 섞어 틀린 것을 고르게 한다. 추적형은 연산 나열을 주고 출력 순서를 묻거나, 네 개의 출력 순서 중 스택으로 만들 수 없는 것을 고르게 한다. 자료 구조 분류 문항과 짝을 이뤄 같은 회차에 함께 나온다.

## 퀴즈
- q: 입력 순서가 A, B, C, D일 때 스택으로 만들 수 없는 출력은?
  choices: [D C B A, C B A D, B C D A, D B C A]
  a: 4
  why: D가 먼저 나오려면 A B C D를 모두 넣은 상태이므로 남은 출력은 C B A로 고정된다. B C D A는 B를 뺀 뒤 C, D를 차례로 넣고 빼면 만들어지므로 가능하다.
- q: 스택에 대한 설명으로 틀린 것은?
  choices: [입출력이 한쪽 끝으로만 제한된다, front와 rear 두 포인터를 갖는다, LIFO 구조다, 빈 상태에서 삭제하면 언더플로가 발생한다]
  a: 2
  why: front와 rear를 함께 갖는 것은 큐다. 스택의 포인터는 top 하나다. 빈 스택에서 삭제할 때 언더플로가 나는 것은 맞는 서술이다.
- q: 스택을 이용한 연산과 거리가 먼 것은?
  choices: [재귀 호출, 후위 표기식 연산, 깊이 우선 탐색, 선택 정렬]
  a: 4
  why: 선택 정렬은 남은 구간 전체에서 최솟값을 찾아야 하는데 스택은 중간 값에 접근하지 못한다. 깊이 우선 탐색은 되돌아갈 지점을 쌓아 두므로 스택을 쓴다.

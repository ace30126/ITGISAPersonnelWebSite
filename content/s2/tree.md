---
id: tree
subject: 2
title: 트리와 순회
tier: S
tags: [트리, 이진트리, 순회, 전위, 중위, 후위, 차수, 단말노드, 이진탐색트리, avl]
keywords: [트리]
items: [q:2023-1:036, q:2024-1:028, q:2023-1:025, q:2024-1:031, q:2025-1:032]
updated: 2026-08-15
---

## 한 줄 정의

트리(Tree)는 노드와 간선으로 이루어지고 사이클이 없는 계층형 비선형 자료 구조다.

## 왜 시험에 나오나

2과목 최다 출제군이다. 그림 하나를 주고 순회 결과, 차수, 단말 노드 수를 손으로 세게 하는 계산형 문항이 회차마다 나온다.

## 그림

<svg viewBox="0 0 380 195" role="img" aria-label="루트 A 아래 B와 C, 그 아래 D E F G가 달린 이진 트리">
  <circle cx="190" cy="28" r="17" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="190" y="33" text-anchor="middle" font-size="13" fill="currentColor">A</text>
  <line x1="177" y1="40" x2="123" y2="83" stroke="currentColor" stroke-width="1.2"/>
  <line x1="203" y1="40" x2="257" y2="83" stroke="currentColor" stroke-width="1.2"/>
  <circle cx="110" cy="95" r="17" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="110" y="100" text-anchor="middle" font-size="13" fill="currentColor">B</text>
  <circle cx="270" cy="95" r="17" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="270" y="100" text-anchor="middle" font-size="13" fill="currentColor">C</text>
  <line x1="98" y1="107" x2="80" y2="150" stroke="currentColor" stroke-width="1.2"/>
  <line x1="122" y1="107" x2="140" y2="150" stroke="currentColor" stroke-width="1.2"/>
  <line x1="258" y1="107" x2="240" y2="150" stroke="currentColor" stroke-width="1.2"/>
  <line x1="282" y1="107" x2="300" y2="150" stroke="currentColor" stroke-width="1.2"/>
  <circle cx="70" cy="162" r="17" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="70" y="167" text-anchor="middle" font-size="13" fill="currentColor">D</text>
  <circle cx="150" cy="162" r="17" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="150" y="167" text-anchor="middle" font-size="13" fill="currentColor">E</text>
  <circle cx="230" cy="162" r="17" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="230" y="167" text-anchor="middle" font-size="13" fill="currentColor">F</text>
  <circle cx="310" cy="162" r="17" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="310" y="167" text-anchor="middle" font-size="13" fill="currentColor">G</text>
</svg>

## 핵심

| 순회 | 방문 순서 | 위 그림의 결과 |
|---|---|---|
| 전위 | 루트 → 왼쪽 → 오른쪽 | A B D E C F G |
| 중위 | 왼쪽 → 루트 → 오른쪽 | D B E A F C G |
| 후위 | 왼쪽 → 오른쪽 → 루트 | D E B F G C A |

- 차수(Degree)는 한 노드에 달린 자식 노드의 수다. 트리의 차수는 노드들의 차수 중 가장 큰 값이다. 위 그림은 2다.
- 단말 노드(Terminal Node)는 자식이 없는 노드다. 위 그림에서는 D, E, F, G 네 개다.
- 최악의 경우 검색 시간은 이진 탐색 트리가 O(n)이고 AVL 트리와 레드-블랙 트리가 O(log n)이다.

## 헷갈리는 지점

- 트리는 비선형 구조다. 선형 구조끼리 묶은 보기에 트리를 끼워 넣는 문항이 반복된다.
- 차수를 물을 때 루트의 자식 수만 세면 틀린다. 노드를 지정하지 않았으면 전체에서 가장 큰 차수를 답한다.
- 전위·중위·후위라는 이름은 루트를 언제 방문하는지를 가리킨다. 왼쪽을 오른쪽보다 먼저 보는 것은 세 순회가 같다.
- 최악의 검색 효율이 가장 나쁜 트리는 이진 탐색 트리다. 균형을 맞추지 않아 한쪽으로 치우칠 수 있다.

## 기출 패턴

그림을 주고 전위 순회에서 몇 번째로 탐색되는 노드를 묻거나 중위 순회 결과 전체를 보기로 깔아 고르게 한다. 차수와 단말 노드 수를 한 문항에서 같이 묻는 형태도 굳어져 있다. 정의형 문항은 사이클이 없다, 계층 형식이다, 그래프의 특수한 형태다라는 서술을 주고 이름을 고르게 한다.

## 퀴즈
- q: 그림의 트리에서 후위 순회의 마지막에 방문하는 노드는?
  choices: [가장 왼쪽 단말 노드, 루트 노드, 가장 오른쪽 단말 노드, 차수가 가장 큰 노드]
  a: 2
  why: 후위 순회는 왼쪽과 오른쪽 서브 트리를 모두 본 뒤 루트를 방문하므로 루트가 마지막이다. 루트를 가장 먼저 방문하는 것은 전위 순회다.
- q: 노드를 지정하지 않고 트리의 차수를 물었을 때 답으로 맞는 것은?
  choices: [루트의 자식 수, 단말 노드의 수, 전체 노드의 차수 중 최댓값, 간선의 총수]
  a: 3
  why: 트리의 차수는 모든 노드의 차수 중 가장 큰 값이다. 루트의 자식 수는 루트 한 노드의 차수일 뿐이라 더 큰 차수를 가진 노드가 아래에 있으면 틀린다.
- q: 최악의 경우 검색 효율이 가장 나쁜 트리 구조는?
  choices: [이진 탐색 트리, AVL 트리, 2-3 트리, 레드-블랙 트리]
  a: 1
  why: 이진 탐색 트리는 균형을 맞추지 않아 최악의 경우 O(n)이 된다. AVL 트리와 레드-블랙 트리는 균형을 유지해 O(log n)을 보장한다.

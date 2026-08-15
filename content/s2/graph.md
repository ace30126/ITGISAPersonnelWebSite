---
id: graph
subject: 2
title: 그래프와 탐색
tier: S
tags: [그래프, 정점, 간선, dfs, bfs, 깊이우선탐색, 너비우선탐색, 최대간선수, 제어흐름그래프]
keywords: [그래프]
items: [q:2023-2:039, q:2024-2:039, q:2023-2:036, q:2024-1:032]
updated: 2026-08-15
---

## 한 줄 정의

그래프(Graph)는 정점(Vertex)과 간선(Edge)의 집합으로 이루어진 비선형 자료 구조다.

## 왜 시험에 나오나

2과목 상위 출제군이다. 그림을 주고 깊이 우선 탐색 순서를 쓰게 하거나, 정점 수만 주고 최대 간선 수를 계산하게 하는 두 유형이 굳어져 있다.

## 그림

<svg viewBox="0 0 380 185" role="img" aria-label="정점 A B C D E와 간선으로 이루어진 무방향 그래프">
  <line x1="67" y1="40" x2="133" y2="40" stroke="currentColor" stroke-width="1.2"/>
  <line x1="167" y1="40" x2="233" y2="40" stroke="currentColor" stroke-width="1.2"/>
  <line x1="50" y1="57" x2="50" y2="113" stroke="currentColor" stroke-width="1.2"/>
  <line x1="67" y1="130" x2="133" y2="130" stroke="currentColor" stroke-width="1.2"/>
  <circle cx="50" cy="40" r="17" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="50" y="45" text-anchor="middle" font-size="13" fill="currentColor">A</text>
  <circle cx="150" cy="40" r="17" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="150" y="45" text-anchor="middle" font-size="13" fill="currentColor">B</text>
  <circle cx="250" cy="40" r="17" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="250" y="45" text-anchor="middle" font-size="13" fill="currentColor">D</text>
  <circle cx="50" cy="130" r="17" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="50" y="135" text-anchor="middle" font-size="13" fill="currentColor">C</text>
  <circle cx="150" cy="130" r="17" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="150" y="135" text-anchor="middle" font-size="13" fill="currentColor">E</text>
  <text x="196" y="112" font-size="12" fill="currentColor">DFS: A B D C E</text>
  <text x="196" y="134" font-size="12" fill="currentColor">BFS: A B C D E</text>
</svg>

## 핵심

| 항목 | 내용 |
|---|---|
| 무방향 그래프 최대 간선 수 | n(n-1)/2 |
| 방향 그래프 최대 간선 수 | n(n-1) |
| 깊이 우선 탐색 | 한 분기를 끝까지 간 뒤 되돌아온다. 스택과 재귀를 쓴다 |
| 너비 우선 탐색 | 가까운 정점을 먼저 모두 본다. 큐를 쓴다 |

- 트리는 사이클이 없는 그래프의 특수한 형태다. 그래프는 사이클을 가질 수 있다.
- 제어 흐름 그래프의 순환 복잡도는 간선 수에서 노드 수를 뺀 뒤 2를 더해 구한다.

## 헷갈리는 지점

- 최대 간선 수는 방향 여부로 갈린다. 2로 나누는 쪽이 무방향이다. 방향 그래프는 나누지 않는다.
- 깊이 우선 탐색 결과에 형제 정점이 먼저 등장하면 오답이다. 더 내려갈 곳이 없을 때만 되돌아온다.
- 그래프는 비선형 구조다. 선형 구조끼리 묶은 보기에 그래프를 넣는 문항이 반복된다.
- 순환 복잡도 계산에서 노드 수와 간선 수를 뒤집거나 마지막에 2를 더하지 않으면 답이 하나씩 어긋난다.

## 기출 패턴

탐색 문항은 정점 대여섯 개짜리 그림과 시작 정점을 주고 깊이 우선 탐색 결과를 보기 넷으로 깔아 고르게 한다. 오답 보기는 대개 너비 우선 탐색 결과다. 간선 수 문항은 n(n-1)/2 외에 n-1, n/2, n(n+1)을 함께 깔아 놓는다. 제어 흐름 그래프 문항은 노드와 화살표만 세면 풀린다.

## 퀴즈
- q: n개의 정점으로 구성된 무방향 그래프의 최대 간선 수는?
  choices: [n-1, n/2, n(n-1)/2, n(n+1)]
  a: 3
  why: 정점 쌍마다 간선이 하나씩이므로 n(n-1)/2다. n-1은 모든 정점을 잇는 최소 간선 수, 즉 트리의 간선 수다.
- q: 깊이 우선 탐색에서 사용하는 자료 구조는?
  choices: [큐, 스택, 해시 테이블, 힙]
  a: 2
  why: 되돌아갈 지점을 나중에 넣은 것부터 꺼내야 하므로 스택을 쓴다. 큐는 가까운 정점부터 처리하는 너비 우선 탐색이 쓴다.
- q: 노드가 4개, 간선이 6개인 제어 흐름 그래프의 순환 복잡도는?
  choices: [3, 4, 5, 6]
  a: 2
  why: 간선 6에서 노드 4를 빼고 2를 더해 4다. 2를 더하지 않으면 2가 나오는데 보기에 없으므로 계산 순서를 확인해야 한다.

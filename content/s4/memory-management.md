---
id: memory-management
subject: 4
title: 기억장치 관리와 페이지 교체
tier: S
tags: [메모리관리, 배치전략, 최초적합, 최적적합, 최악적합, 단편화, 페이징, 페이지교체, FIFO, LRU, 스레싱, 워킹셋, 지역성]
keywords: [메모리관리]
items: [q:2022-1:071, q:2022-1:075, q:2023-2:066, q:2024-1:074]
updated: 2026-08-15
---

## 한 줄 정의
기억장치 관리는 제한된 주기억장치에 프로그램을 어디에 놓고 무엇을 내보낼지 정하는 규칙이다.

## 왜 시험에 나오나
4과목 운영체제 파트에서 가장 많이 나온다. 배치 전략과 단편화 계산, 페이지 교체 알고리즘 추적, 페이지 크기와 스레싱 판별이 돌아가며 출제된다.

## 그림
<svg viewBox="0 0 400 130" role="img" aria-label="빈 공간 세 개 중 최초 적합 최적 적합 최악 적합이 각각 어느 칸을 고르는지 보여 주는 그림">
  <rect x="20" y="30" width="90" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="65" y="55" text-anchor="middle" font-size="13" fill="currentColor">20KB</text>
  <rect x="130" y="30" width="90" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="175" y="55" text-anchor="middle" font-size="13" fill="currentColor">16KB</text>
  <rect x="240" y="30" width="90" height="40" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="285" y="55" text-anchor="middle" font-size="13" fill="currentColor">40KB</text>
  <text x="200" y="20" text-anchor="middle" font-size="12" fill="currentColor">17KB 를 넣을 빈 공간</text>
  <line x1="65" y1="70" x2="65" y2="88" stroke="currentColor" stroke-width="1.5"/>
  <text x="65" y="104" text-anchor="middle" font-size="12" fill="currentColor">최초·최적</text>
  <text x="65" y="120" text-anchor="middle" font-size="12" fill="currentColor">남는 3KB</text>
  <line x1="285" y1="70" x2="285" y2="88" stroke="currentColor" stroke-width="1.5"/>
  <text x="285" y="104" text-anchor="middle" font-size="12" fill="currentColor">최악</text>
  <text x="285" y="120" text-anchor="middle" font-size="12" fill="currentColor">남는 23KB</text>
</svg>

## 핵심
| 배치 전략 | 고르는 칸 |
|---|---|
| 최초 적합(First Fit) | 앞에서부터 처음 들어가는 칸 |
| 최적 적합(Best Fit) | 들어가는 칸 중 가장 작은 칸 |
| 최악 적합(Worst Fit) | 들어가는 칸 중 가장 큰 칸 |

내부 단편화는 배정된 칸의 크기에서 프로그램 크기를 뺀 값이다. 20KB 칸에 17KB 를 넣으면 3KB 다.

페이지 교체 알고리즘을 프레임 3개, 참조 순서 2 3 2 1 5 2 4 로 추적한 표다.

| 참조 | 프레임 상태 | 내보낸 페이지 |
|---|---|---|
| 2 | 2 | — |
| 3 | 2 3 | — |
| 2 | 2 3 | 적중 |
| 1 | 2 3 1 | — |
| 5 | 5 3 1 | 2 |
| 2 | 5 2 1 | 3 |
| 4 | 5 2 4 | 1 |

## 헷갈리는 지점
- 페이지 교체 알고리즘은 FIFO, LRU, LFU, Optimal, NUR 이다. LUF 처럼 글자를 뒤집은 이름이 오답 보기로 나온다.
- 페이지 크기가 작아지면 내부 단편화는 줄지만 페이지 수가 늘어 페이지 맵 테이블은 커진다. 테이블이 작아진다고 쓴 보기가 정답 자리다.
- 스레싱(Thrashing)은 페이지 교환에 쓰는 시간이 실제 수행 시간보다 커진 상태다. 부등호를 뒤집어 놓은 보기가 반복된다.
- 워킹 셋(Working Set)은 일정 시간 자주 참조하는 페이지의 집합이고, 지역성(Locality)은 특정 부분에 참조가 몰리는 성질이다. 둘을 바꿔 낸다.
- 내부 단편화는 배정된 칸 안에 남는 공간, 외부 단편화는 너무 작아 쓰지 못하는 빈 칸이다.

## 기출 패턴
빈 공간 크기 네 개를 주고 최적 적합으로 넣었을 때의 내부 단편화를 계산시키는 문항이 대표적이다. 프레임 수와 참조 순서를 주고 FIFO 로 교체했을 때 마지막 프레임 상태를 고르게도 한다. 페이지 교체 알고리즘이 아닌 것 고르기도 반복된다.

## 퀴즈
- q: 20KB 16KB 8KB 40KB 의 빈 공간에 최적 적합으로 17KB 를 넣으면 내부 단편화는?
  choices: [3KB, 8KB, 23KB, 40KB]
  a: 1
  why: 17KB 가 들어가는 칸 중 가장 작은 20KB 를 골라 3KB 가 남는다. 23KB 는 최악 적합으로 40KB 를 골랐을 때의 값이다.
- q: 페이지 교체 알고리즘이 아닌 것은?
  choices: [FIFO, LRU, Optimal, LUF]
  a: 4
  why: 사용 빈도가 가장 낮은 것을 내보내는 알고리즘의 이름은 LFU 다. Optimal 은 앞으로 가장 늦게 쓰일 페이지를 내보내는 실제 알고리즘이다.
- q: 페이지 크기가 작아질 때 나타나지 않는 현상은?
  choices: [내부 단편화 감소, 입출력 시간 증가, 페이지 맵 테이블 크기 감소, 기억장소 이용 효율 증가]
  a: 3
  why: 페이지가 작아지면 페이지 수가 늘어 테이블은 오히려 커진다. 내부 단편화가 줄어드는 것은 맞는 설명이다.

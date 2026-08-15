---
id: data-structure
subject: 2
title: 자료 구조의 분류
tier: A
tags: [자료구조, 선형구조, 비선형구조, 파일구조, 배열, 리스트, 데크, 순차파일, 색인파일, 직접파일]
keywords: [자료구조]
items: [q:2024-1:032, q:2023-3:028, q:2022-1:030, q:2025-1:032]
updated: 2026-08-15
---

## 한 줄 정의

자료 구조(Data Structure)는 자료를 저장하고 꺼내는 방식에 따라 선형 구조, 비선형 구조, 파일 구조로 나뉜다.

## 왜 시험에 나오나

분류만 외우면 풀리는 문항이 회차마다 나온다. 선형 구조끼리 묶인 보기를 고르거나, 선형이 아닌 것 하나를 고르는 형태다.

## 그림

<svg viewBox="0 0 380 175" role="img" aria-label="자료 구조를 선형 구조 비선형 구조 파일 구조로 나눈 분류표">
  <rect x="130" y="8" width="120" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="190" y="28" text-anchor="middle" font-size="13" fill="currentColor">자료 구조</text>
  <line x1="190" y1="38" x2="190" y2="52" stroke="currentColor" stroke-width="1.2"/>
  <line x1="60" y1="52" x2="320" y2="52" stroke="currentColor" stroke-width="1.2"/>
  <line x1="60" y1="52" x2="60" y2="66" stroke="currentColor" stroke-width="1.2"/>
  <line x1="190" y1="52" x2="190" y2="66" stroke="currentColor" stroke-width="1.2"/>
  <line x1="320" y1="52" x2="320" y2="66" stroke="currentColor" stroke-width="1.2"/>
  <rect x="8" y="66" width="104" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="60" y="85" text-anchor="middle" font-size="13" fill="currentColor">선형 구조</text>
  <rect x="138" y="66" width="104" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="190" y="85" text-anchor="middle" font-size="13" fill="currentColor">비선형 구조</text>
  <rect x="268" y="66" width="104" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="320" y="85" text-anchor="middle" font-size="13" fill="currentColor">파일 구조</text>
  <text x="60" y="114" text-anchor="middle" font-size="12" fill="currentColor">배열, 리스트</text>
  <text x="60" y="132" text-anchor="middle" font-size="12" fill="currentColor">스택, 큐, 데크</text>
  <text x="190" y="114" text-anchor="middle" font-size="12" fill="currentColor">트리</text>
  <text x="190" y="132" text-anchor="middle" font-size="12" fill="currentColor">그래프</text>
  <text x="320" y="114" text-anchor="middle" font-size="12" fill="currentColor">순차, 색인</text>
  <text x="320" y="132" text-anchor="middle" font-size="12" fill="currentColor">직접 파일</text>
  <text x="8" y="162" font-size="12" fill="currentColor">비선형에 들어가는 것은 트리와 그래프 둘뿐이다</text>
</svg>

## 핵심

| 분류 | 속하는 것 |
|---|---|
| 선형 구조 | 배열, 선형 리스트, 스택, 큐, 데크 |
| 비선형 구조 | 트리, 그래프 |
| 파일 구조 | 순차 파일, 색인 파일, 직접 파일 |

- 선형 구조는 자료가 일렬로 이어져 앞뒤 관계가 하나씩 정해진다.
- 비선형 구조는 하나의 자료에 여러 자료가 계층이나 망 형태로 연결된다.
- 데크(Deque)는 양쪽 끝에서 삽입과 삭제가 모두 가능한 선형 구조다.
- 세부 동작은 [[stack]], [[tree]], [[graph]] 노트에서 따로 다룬다.

## 헷갈리는 지점

- 큐는 선형 구조다. "큐는 비선형 구조에 해당한다"는 서술이 틀린 보기로 굳어져 있다.
- 데크는 양쪽 끝을 쓰지만 여전히 선형 구조다. 양쪽을 쓴다는 이유로 비선형이라 서술한 보기는 오답이다.
- 비선형은 트리와 그래프 둘뿐이다. 짝 짓기 보기에서 이 둘 중 하나가 섞여 있으면 선형 묶음이 아니다.
- 파일 구조는 선형·비선형과 나란한 세 번째 분류다. 순차 파일을 선형 구조 보기로 내밀면 분류 자체가 다르다.

## 기출 패턴

"선형 구조로만 묶인 것"을 고르는 문항은 정답 외 세 보기에 트리나 그래프를 하나씩 심어 둔다. "선형 구조가 아닌 것"은 트리가 정답이고 나머지는 리스트·스택·데크로 채운다. 자료 구조 설명 문항은 큐의 선형 여부를 참거짓 판단 지점으로 쓴다.

## 퀴즈
- q: 선형 구조로만 묶인 것은?
  choices: [스택과 트리, 큐와 데크, 큐와 그래프, 리스트와 그래프]
  a: 2
  why: 큐와 데크는 모두 선형 구조다. 트리와 그래프는 비선형이므로 이 둘이 하나라도 들어간 묶음은 답이 될 수 없다.
- q: 자료 구조의 분류 중 비선형 구조에 해당하는 것은?
  choices: [데크, 선형 리스트, 그래프, 순차 파일]
  a: 3
  why: 비선형 구조는 트리와 그래프 둘뿐이다. 순차 파일은 파일 구조라는 별도 분류이므로 비선형 구조의 답이 되지 않는다.
- q: 데크(Deque)에 대한 설명으로 맞는 것은?
  choices: [한쪽 끝에서만 삽입과 삭제가 일어난다, 양쪽 끝에서 삽입과 삭제가 모두 가능하다, 계층 구조를 표현하는 비선형 구조다, 사이클을 가질 수 있다]
  a: 2
  why: 데크는 양쪽 끝을 모두 쓰는 선형 구조다. 한쪽 끝만 쓰는 것은 스택이고, 계층 구조를 표현하는 비선형 구조는 트리다.

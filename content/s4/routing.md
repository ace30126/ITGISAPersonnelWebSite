---
id: routing
subject: 4
title: 라우팅 프로토콜
tier: A
tags: [라우팅, RIP, OSPF, BGP, IGP, EGP, 거리벡터, 링크상태, 홉카운트]
keywords: [라우팅]
items: [q:2022-2:066, q:2025-1:087]
updated: 2026-08-15
---

## 한 줄 정의
라우팅 프로토콜은 라우터가 목적지까지의 경로를 정하고 서로 경로 정보를 주고받는 규칙이다.

## 왜 시험에 나오나
RIP 이 거의 전부다. 설명 네 개 중 틀린 것을 고르게 하거나, 최대 홉 수 같은 특징 하나로 프로토콜을 지목하게 한다.

## 그림
<svg viewBox="0 0 400 140" role="img" aria-label="라우팅 프로토콜이 내부용 IGP 와 외부용 EGP 로 나뉘는 분류">
  <rect x="130" y="10" width="140" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="30" text-anchor="middle" font-size="13" fill="currentColor">라우팅 프로토콜</text>
  <line x1="200" y1="40" x2="200" y2="54" stroke="currentColor" stroke-width="1.5"/>
  <line x1="90" y1="54" x2="310" y2="54" stroke="currentColor" stroke-width="1.5"/>
  <line x1="90" y1="54" x2="90" y2="68" stroke="currentColor" stroke-width="1.5"/>
  <line x1="310" y1="54" x2="310" y2="68" stroke="currentColor" stroke-width="1.5"/>
  <rect x="20" y="68" width="140" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="90" y="88" text-anchor="middle" font-size="13" fill="currentColor">IGP 내부용</text>
  <rect x="240" y="68" width="140" height="30" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="310" y="88" text-anchor="middle" font-size="13" fill="currentColor">EGP 외부용</text>
  <text x="90" y="120" text-anchor="middle" font-size="12" fill="currentColor">RIP · OSPF</text>
  <text x="310" y="120" text-anchor="middle" font-size="12" fill="currentColor">BGP</text>
</svg>

## 핵심
| 항목 | RIP | OSPF |
|---|---|---|
| 분류 | IGP | IGP |
| 방식 | 거리 벡터 | 링크 상태 |
| 경로 계산 | 벨만-포드(Bellman-Ford) | 다익스트라(Dijkstra) |
| 기준값 | 홉 카운트 | 대역폭 등 비용 |
| 규모 | 소규모 | 대규모 |

- RIP 의 최대 홉 수는 15 다. 16 이 되면 도달할 수 없는 경로로 본다.
- RIP 라우터는 이웃 라우터에게서 받은 정보로 자기 라우팅 표를 갱신한다.
- 자율 시스템 안에서 쓰면 IGP, 자율 시스템 사이에서 쓰면 EGP 다. BGP 가 EGP 쪽이다.

## 헷갈리는 지점
- RIP 은 IGP 다. EGP 로 분류한 보기가 정답 자리에 반복해서 놓인다.
- 최대 홉 수 15 는 RIP 의 표시다. 이 숫자만 보고 OSPF 를 고르면 안 된다.
- 거리 벡터와 링크 상태를 맞바꿔 놓는다. 벨만-포드는 RIP, 다익스트라는 OSPF 다.
- 홉 카운트는 거쳐 가는 라우터 수다. 회선 속도와 무관하므로 느린 경로가 선택되기도 한다.
- 라우팅은 경로를 정하는 일이고, 논리 주소를 물리 주소로 바꾸는 일은 [[tcpip]] 의 ARP 가 맡는다.

## 기출 패턴
RIP 설명 네 개 중 틀린 것을 고르는 문항이 대표적이고, 틀린 문장은 대개 IGP 와 EGP 를 뒤집은 것이다. 최대 홉 수를 15 로 제한한 프로토콜을 고르라는 단답형도 나온다.

## 퀴즈
- q: RIP 라우팅 프로토콜에 대한 설명으로 틀린 것은?
  choices: [경로 선택 기준은 홉 카운트다, IGP 와 EGP 로 나눌 때 EGP 에 해당한다, 최단 경로 탐색에 벨만-포드 방식을 쓴다, 이웃 라우터에게 받은 정보로 라우팅 표를 갱신한다]
  a: 2
  why: RIP 은 자율 시스템 내부에서 쓰는 IGP 다. 홉 카운트를 기준으로 삼는다는 설명은 옳아 정답이 아니다.
- q: 최대 홉 수를 15 로 제한한 라우팅 프로토콜은?
  choices: [RIP, OSPF, BGP, EIGRP]
  a: 1
  why: RIP 은 16 홉을 도달 불가로 보므로 규모가 큰 망에 쓰기 어렵다. OSPF 는 홉 수 제한 방식이 아니다.
- q: OSPF 가 최단 경로를 구할 때 쓰는 방식은?
  choices: [거리 벡터, 링크 상태, 홉 카운트 누적, 브로드캐스트 탐색]
  a: 2
  why: OSPF 는 링크 상태 정보를 모아 다익스트라 방식으로 경로를 구한다. 거리 벡터는 RIP 쪽 방식이다.

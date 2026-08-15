---
id: eai
subject: 2
title: EAI 구축 유형
tier: A
tags: [EAI, point-to-point, hub-and-spoke, message-bus, esb, hybrid, 미들웨어, 애플리케이션통합]
keywords: [EAI]
items: [q:2022-3:025, q:2025-1:030, q:2024-2:025]
updated: 2026-08-15
---

## 한 줄 정의

EAI(Enterprise Application Integration)는 기업 안의 여러 애플리케이션과 플랫폼을 연계해 정보를 주고받게 하는 통합 솔루션이다.

## 왜 시험에 나오나

2과목에서 구축 유형 네 가지만 반복해서 묻는다. 유형 이름과 설명을 짝짓거나, 유형이 아닌 것을 하나 고르게 한다.

## 그림

<svg viewBox="0 0 380 150" role="img" aria-label="Point-to-Point는 1대1 연결이고 Hub and Spoke는 중앙 허브를 거치며 Message Bus는 미들웨어를 둔다">
  <text x="8" y="18" font-size="12" fill="currentColor">Point-to-Point</text>
  <circle cx="24" cy="44" r="11" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="90" cy="44" r="11" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="24" cy="92" r="11" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="90" cy="92" r="11" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <line x1="35" y1="44" x2="79" y2="44" stroke="currentColor" stroke-width="1.1"/>
  <line x1="24" y1="55" x2="24" y2="81" stroke="currentColor" stroke-width="1.1"/>
  <line x1="35" y1="51" x2="79" y2="85" stroke="currentColor" stroke-width="1.1"/>
  <line x1="90" y1="55" x2="90" y2="81" stroke="currentColor" stroke-width="1.1"/>
  <text x="8" y="122" font-size="12" fill="currentColor">1대1 연결</text>
  <text x="140" y="18" font-size="12" fill="currentColor">Hub &amp; Spoke</text>
  <circle cx="180" cy="68" r="14" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="180" y="72" text-anchor="middle" font-size="12" fill="currentColor">허브</text>
  <circle cx="146" cy="34" r="10" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="216" cy="34" r="10" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="146" cy="102" r="10" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="216" cy="102" r="10" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <line x1="154" y1="42" x2="171" y2="59" stroke="currentColor" stroke-width="1.1"/>
  <line x1="206" y1="42" x2="189" y2="59" stroke="currentColor" stroke-width="1.1"/>
  <line x1="154" y1="94" x2="171" y2="77" stroke="currentColor" stroke-width="1.1"/>
  <line x1="206" y1="94" x2="189" y2="77" stroke="currentColor" stroke-width="1.1"/>
  <text x="140" y="122" font-size="12" fill="currentColor">중앙 집중형</text>
  <text x="264" y="18" font-size="12" fill="currentColor">Message Bus</text>
  <circle cx="284" cy="34" r="10" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="330" cy="34" r="10" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <rect x="266" y="58" width="100" height="22" rx="4" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="316" y="74" text-anchor="middle" font-size="12" fill="currentColor">미들웨어</text>
  <circle cx="284" cy="102" r="10" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="330" cy="102" r="10" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <line x1="284" y1="44" x2="284" y2="58" stroke="currentColor" stroke-width="1.1"/>
  <line x1="330" y1="44" x2="330" y2="58" stroke="currentColor" stroke-width="1.1"/>
  <line x1="284" y1="80" x2="284" y2="92" stroke="currentColor" stroke-width="1.1"/>
  <line x1="330" y1="80" x2="330" y2="92" stroke="currentColor" stroke-width="1.1"/>
  <text x="264" y="122" font-size="12" fill="currentColor">ESB 방식</text>
</svg>

## 핵심

| 유형 | 방식 |
|---|---|
| Point-to-Point | 가장 기본적인 통합 방식이다. 애플리케이션을 1대1로 연결한다 |
| Hub &amp; Spoke | 단일 접점인 허브를 통해 데이터를 전송하는 중앙 집중형이다 |
| Message Bus | 애플리케이션 사이에 미들웨어를 두어 처리한다. ESB 방식이라고도 한다 |
| Hybrid | 그룹 안에서는 Hub &amp; Spoke, 그룹 사이에서는 Message Bus를 쓴다 |

- Hub &amp; Spoke는 확장과 유지 보수가 쉽지만 허브에 장애가 나면 전체에 영향을 준다.
- Hybrid는 두 방식을 섞어 데이터 병목 현상을 줄인다. 필요하면 한 가지 방식만으로도 구현할 수 있다.

## 헷갈리는 지점

- 유형은 네 가지뿐이다. Tree는 EAI 구축 유형이 아니며 "옳지 않은 것"의 정답으로 반복해서 쓰인다.
- Hybrid는 Hub &amp; Spoke와 Message Bus의 혼합이다. Point-to-Point와 Hub &amp; Spoke의 혼합이라는 서술은 오답이다.
- Hybrid도 중간에 미들웨어를 둔다. 미들웨어 없이 1대1로 연결한다는 서술은 Point-to-Point의 설명이다.
- 미들웨어를 두는 방식은 Message Bus다. 이 설명을 Hub &amp; Spoke에 붙인 보기가 나온다.

## 기출 패턴

유형 나열형은 세 유형을 참으로 깔고 실재하지 않는 이름 하나를 정답으로 만든다. 설명 대응형은 네 유형의 설명을 늘어놓고 Hybrid의 혼합 대상이나 미들웨어 사용 여부 한 곳만 바꿔 틀린 것을 찾게 한다. 미들웨어 문항군과 같은 회차에 묶여 나온다.

## 퀴즈
- q: EAI의 구축 유형으로 옳지 않은 것은?
  choices: [Tree, Hub &amp; Spoke, Message Bus, Point-to-Point]
  a: 1
  why: EAI 구축 유형은 Point-to-Point, Hub &amp; Spoke, Message Bus, Hybrid 넷이다. Tree는 자료 구조 이름이지 통합 유형이 아니다.
- q: 애플리케이션 사이에 미들웨어를 두어 처리하는 EAI 구축 유형은?
  choices: [Point-to-Point, Hub &amp; Spoke, Message Bus, Tree]
  a: 3
  why: 미들웨어를 매개로 두는 방식이 Message Bus, 즉 ESB다. Hub &amp; Spoke는 미들웨어가 아니라 단일 허브 시스템을 접점으로 쓴다.
- q: Hybrid 방식에 대한 설명으로 틀린 것은?
  choices: [Hub &amp; Spoke와 Message Bus의 혼합이다, 데이터 병목 현상을 줄일 수 있다, 필요하면 한 가지 방식으로 구현할 수 있다, 미들웨어 없이 1대1로 연결한다]
  a: 4
  why: Hybrid는 중간에 미들웨어를 둔다. 미들웨어 없이 1대1로 잇는 것은 Point-to-Point의 설명이다.

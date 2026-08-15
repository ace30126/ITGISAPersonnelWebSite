---
id: schedule-management
subject: 5
title: 프로젝트 일정 관리
tier: A
tags: [일정관리, 간트차트, pert, cpm, 임계경로, wbs, 시간선차트]
keywords: [일정관리]
items: [q:2022-1:091, q:2022-2:100, q:2022-3:099, q:2024-3:100]
updated: 2026-08-15
---

## 한 줄 정의

일정 관리는 작업의 순서와 기간을 도표로 표현해 프로젝트 진행을 통제하는 활동이다.

## 왜 시험에 나오나

간트 차트와 PERT·CPM의 설명을 맞바꿔 놓는 문항이 반복된다. 막대 도표인지 네트워크 도표인지만 구분하면 갈린다.

## 그림

<svg viewBox="0 0 360 150" role="img" aria-label="간트 차트와 네트워크 도표의 표현 방식 비교">
  <text x="10" y="20" font-size="12" fill="currentColor">간트 차트 · 막대 도표</text>
  <rect x="10" y="28" width="120" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <rect x="60" y="48" width="150" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <rect x="150" y="68" width="100" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="270" y="60" font-size="12" fill="currentColor">길이 = 기간</text>
  <text x="10" y="106" font-size="12" fill="currentColor">PERT · CPM · 네트워크 도표</text>
  <circle cx="30" cy="128" r="10" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <line x1="40" y1="128" x2="80" y2="128" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="90" cy="128" r="10" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <line x1="100" y1="128" x2="140" y2="128" stroke="currentColor" stroke-width="1.3"/>
  <circle cx="150" cy="128" r="10" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="180" y="132" font-size="12" fill="currentColor">작업 간 선후 관계</text>
</svg>

## 핵심

| 기법 | 표현 | 알 수 있는 것 |
|---|---|---|
| 간트 차트 | 막대 도표 | 각 작업의 시작과 종료, 기간, 자원 배치 |
| PERT | 네트워크 도표 | 작업 간 상호 관련성, 결정 경로, 경계 시간 |
| CPM | 네트워크 도표 | 작업 시간과 작업 사이의 관계, 임계 경로 |

- 간트 차트는 시간선(Time-Line) 차트라고도 부른다.
- 간트 차트는 CPM 네트워크로부터 만들 수 있다.
- 임계 경로는 시작에서 종료까지의 경로 중 가장 오래 걸리는 경로다.
- WBS는 작업을 잘게 나눈 분해 구조다. 일정표 자체는 아니다.

## 헷갈리는 지점

- 간트 차트의 수평 막대 길이는 기간이다. 인원 수를 나타낸다고 쓴 보기가 정답 자리에 반복된다.
- CPM은 막대 그래프가 아니다. 막대 도표 서술이 붙으면 간트 차트의 설명이다.
- PERT는 비용 추정 모형이 아니다. COCOMO·Putnam·기능 점수 사이에 섞이면 PERT가 정답이다.
- 임계 경로는 최장 경로다. 가장 짧은 경로로 계산하면 틀린다.
- 시간선 차트라는 별칭은 간트 차트의 것이다.

## 기출 패턴

간트 차트 서술형은 특징 셋을 참으로 두고 막대 길이의 의미만 뒤집는다. PERT 문항은 간트 차트의 특징 셋을 오답으로 깔고 네트워크 도표에서만 알 수 있는 항목을 정답으로 둔다. 계산형은 그림으로 준 경로별 소요 기일을 각각 더해 가장 큰 값을 고르게 한다.

## 퀴즈
- q: 간트 차트에 대한 설명으로 틀린 것은?
  choices: [작업의 시작과 종료를 한눈에 본다, 자원 배치 계획에 쓴다, CPM 네트워크로부터 만들 수 있다, 수평 막대의 길이는 인원 수를 나타낸다]
  a: 4
  why: 막대 길이는 작업 기간이다. CPM 네트워크에서 간트 차트를 만드는 것은 실제로 가능하므로 참이다.
- q: 시작에서 종료까지 소요 기간이 가장 긴 경로를 뜻하는 것은?
  choices: [임계 경로, 최단 경로, 기준선, 마일스톤]
  a: 1
  why: 임계 경로가 전체 일정을 결정하므로 최장 경로다. 최단 경로를 고르면 일정이 실제보다 짧게 잡힌다.
- q: 작업 간 상호 관련성과 결정 경로, 경계 시간을 제시하는 일정 관리 기법은?
  choices: [간트 차트, PERT, WBS, 시간선 차트]
  a: 2
  why: 네트워크 도표를 쓰는 PERT가 작업 사이의 관계를 보여 준다. 시간선 차트는 간트 차트의 다른 이름이라 같은 것을 두 번 고르는 셈이 된다.

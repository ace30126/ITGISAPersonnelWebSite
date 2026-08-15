---
id: scheduling
subject: 4
title: 프로세스 스케줄링
tier: A
tags: [스케줄링, 선점, 비선점, FCFS, SJF, HRN, RR, SRT, 다단계큐, 기아]
keywords: [스케줄링]
items: [q:2023-2:067, q:2022-2:067, q:2022-3:066]
updated: 2026-08-15
---

## 한 줄 정의
스케줄링은 준비 상태의 프로세스 중 다음에 중앙처리장치를 쓸 하나를 고르는 규칙이다.

## 왜 시험에 나오나
HRN 이 거의 매번 나온다. 계산식을 주고 순서를 매기게 하거나, 설명 중 틀린 것을 고르게 한다. 선점과 비선점 분류도 함께 물어본다.

## 그림
<svg viewBox="0 0 400 120" role="img" aria-label="HRN 우선순위 계산식과 값이 클수록 먼저 처리된다는 규칙">
  <text x="200" y="24" text-anchor="middle" font-size="12" fill="currentColor">HRN 우선순위</text>
  <text x="200" y="52" text-anchor="middle" font-size="13" fill="currentColor">대기 시간 + 서비스 시간</text>
  <line x1="90" y1="60" x2="310" y2="60" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="80" text-anchor="middle" font-size="13" fill="currentColor">서비스 시간</text>
  <rect x="90" y="92" width="220" height="24" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="200" y="109" text-anchor="middle" font-size="12" fill="currentColor">값이 클수록 먼저 처리된다</text>
</svg>

## 핵심
| 구분 | 기법 |
|---|---|
| 비선점 | FCFS, SJF, HRN, 우선순위, 기한부 |
| 선점 | RR, SRT, 다단계 큐, 다단계 피드백 큐 |

HRN 계산 예다. 값이 큰 순서대로 처리한다.

| 작업 | 대기 시간 | 서비스 시간 | 계산 | 값 |
|---|---|---|---|---|
| A | 8 | 4 | 12 나누기 4 | 3.0 |
| B | 6 | 12 | 18 나누기 12 | 1.5 |
| C | 15 | 5 | 20 나누기 5 | 4.0 |

처리 순서는 C 다음 A 다음 B 다.

- HRN 은 SJF 에서 긴 작업이 계속 밀리는 문제를 대기 시간을 더해 보완한 기법이다.
- 대기 시간이 길수록, 서비스 시간이 짧을수록 값이 커진다.

## 헷갈리는 지점
- HRN 은 계산값이 클수록 우선순위가 높다. 낮을수록 높다고 쓴 보기가 정답 자리에 반복해서 놓인다.
- HRN 은 비선점 기법이다. 실행 중인 작업을 빼앗지 않는다.
- 계산식의 분모는 서비스 시간 하나다. 분모에 대기 시간을 넣으면 순서가 뒤집힌다.
- 시간 할당량을 정해 돌아가며 쓰는 RR 은 선점이다. 도착 순서대로 끝까지 실행하는 FCFS 는 비선점이다.
- 기아(Starvation)는 순서가 계속 밀리는 상태이고 [[deadlock]] 은 서로 기다리며 멈춘 상태다. 원인이 다르다.

## 기출 패턴
작업 서너 개의 대기 시간과 서비스 시간을 표로 주고 HRN 처리 순서를 고르게 하는 형태가 가장 잦다. 계산식만 보여 주고 어떤 스케줄링인지 이름을 고르라는 문항, HRN 설명 중 옳지 않은 것을 고르는 문항도 나온다.

## 퀴즈
- q: HRN 방식에서 우선순위가 높은 작업은?
  choices: [계산값이 작은 작업, 계산값이 큰 작업, 서비스 시간이 긴 작업, 대기 시간이 짧은 작업]
  a: 2
  why: 계산값이 클수록 먼저 처리한다. 서비스 시간이 길면 값이 작아져 오히려 뒤로 밀린다.
- q: 다음 중 선점 스케줄링 기법은?
  choices: [FCFS, SJF, HRN, RR]
  a: 4
  why: RR 은 시간 할당량이 끝나면 실행 중인 프로세스를 빼앗는다. HRN 은 SJF 를 보완한 비선점 기법이다.
- q: HRN 이 보완하려 한 기법은?
  choices: [SJF, RR, 다단계 큐, SRT]
  a: 1
  why: SJF 에서 긴 작업이 계속 밀리는 문제를 대기 시간을 더해 완화한 것이 HRN 이다. RR 은 애초에 선점 방식이라 관련이 없다.

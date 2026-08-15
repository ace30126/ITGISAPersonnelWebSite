---
id: deadlock
subject: 4
title: 교착상태
tier: A
tags: [교착상태, deadlock, 상호배제, 점유와대기, 비선점, 환형대기, 은행가알고리즘, 예방, 회피, 탐지, 회복]
keywords: [교착상태]
items: [q:2022-3:074, q:2024-3:075, q:2023-1:068]
updated: 2026-08-15
---

## 한 줄 정의
교착상태(Deadlock)는 둘 이상의 프로세스가 서로 상대방이 쥔 자원을 기다리며 영원히 진행하지 못하는 상태다.

## 왜 시험에 나오나
4과목 운영체제 파트의 고정 출제 소재다. 묻는 각도는 두 가지뿐이다. 발생 조건 4개 중 가짜 고르기, 그리고 해결 기법 4개 중 은행가 알고리즘의 소속 고르기.

## 그림
<svg viewBox="0 0 400 170" role="img" aria-label="두 프로세스와 두 자원이 원을 이루며 서로를 기다리는 환형 대기 구조">
  <rect x="30" y="18" width="90" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="75" y="41" text-anchor="middle" font-size="13" fill="currentColor">프로세스1</text>
  <rect x="280" y="18" width="90" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="325" y="41" text-anchor="middle" font-size="13" fill="currentColor">자원2</text>
  <rect x="280" y="110" width="90" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="325" y="133" text-anchor="middle" font-size="13" fill="currentColor">프로세스2</text>
  <rect x="30" y="110" width="90" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="75" y="133" text-anchor="middle" font-size="13" fill="currentColor">자원1</text>
  <line x1="120" y1="36" x2="272" y2="36" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="280,36 270,31 270,41" fill="currentColor"/>
  <text x="196" y="30" text-anchor="middle" font-size="12" fill="currentColor">요청</text>
  <line x1="325" y1="54" x2="325" y2="102" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="325,110 320,100 330,100" fill="currentColor"/>
  <text x="352" y="86" text-anchor="middle" font-size="12" fill="currentColor">점유</text>
  <line x1="280" y1="128" x2="128" y2="128" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="120,128 130,123 130,133" fill="currentColor"/>
  <text x="204" y="122" text-anchor="middle" font-size="12" fill="currentColor">요청</text>
  <line x1="75" y1="110" x2="75" y2="62" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="75,54 70,64 80,64" fill="currentColor"/>
  <text x="48" y="86" text-anchor="middle" font-size="12" fill="currentColor">점유</text>
</svg>

## 핵심
네 조건이 **동시에** 성립할 때만 발생한다. 하나라도 깨지면 발생하지 않는다.

| 발생 조건 | 뜻 |
|---|---|
| 상호 배제(Mutual Exclusion) | 자원을 한 번에 한 프로세스만 쓴다 |
| 점유와 대기(Hold and Wait) | 자원을 쥔 채로 다른 자원을 기다린다 |
| 비선점(Non-preemption) | 남이 쥔 자원을 빼앗지 못한다 |
| 환형 대기(Circular Wait) | 대기 관계가 원을 이룬다 |

해결 기법은 네 가지다.

| 기법 | 방식 |
|---|---|
| 예방(Prevention) | 발생 조건 중 하나를 미리 없앤다 |
| 회피(Avoidance) | 안전 상태를 유지하도록 할당한다. 은행가 알고리즘(Banker's Algorithm) |
| 탐지(Detection) | 자원 할당 그래프로 발생 여부를 검사한다 |
| 회복(Recovery) | 프로세스를 강제 종료하거나 자원을 선점해 푼다 |

## 헷갈리는 지점
- 조건 이름을 한 단어만 바꾼 보기가 정답이다. 환형 대기 자리에 선형 대기(Linear Wait)를 넣거나, 비선점을 선점(Preemption)으로 바꿔 낸다. 선점은 조건이 아니라 교착상태를 푸는 쪽이다.
- 은행가 알고리즘은 예방이 아니라 회피다. 조건을 없애는 것이 아니라 할당해도 안전한지 먼저 계산한다.
- 탐지는 자원 할당 그래프, 회복은 강제 종료와 선점이다. 둘을 맞바꿔 놓은 보기가 나온다.
- 교착상태와 기아 상태(Starvation)는 다르다. 기아는 우선순위에 밀려 순서가 오지 않는 것이고 환형 대기가 없다.

## 기출 패턴
"교착상태 발생의 필요 충분 조건이 아닌 것"이 가장 잦다. 보기 넷 중 셋은 진짜 조건이고 하나만 이름이 어긋난 가짜다. 은행가 알고리즘을 주고 예방·회피·탐지·회복 중 고르라는 문항도 반복된다. 5과목 보안 문항에서 Deadlock 이 엉뚱한 오답 보기로 섞이기도 한다.

## 퀴즈
- q: 교착상태 발생의 필요 충분 조건이 아닌 것은?
  choices: [상호 배제, 점유와 대기, 비선점, 선형 대기]
  a: 4
  why: 네 번째 조건은 선형 대기가 아니라 환형 대기다. 비선점은 실제 조건이므로 오답이다.
- q: 은행가 알고리즘은 교착상태 해결 기법 중 어디에 속하는가?
  choices: [예방, 회피, 탐지, 회복]
  a: 2
  why: 할당 전에 안전 상태인지 계산하는 회피 기법이다. 예방은 발생 조건 자체를 제거하는 방식이라 다르다.
- q: 자원 할당 그래프로 교착상태 발생 여부를 검사하는 기법은?
  choices: [예방, 회피, 탐지, 회복]
  a: 3
  why: 그래프의 순환을 찾아내는 것이 탐지다. 회복은 탐지된 뒤 프로세스를 종료하거나 자원을 선점하는 단계다.

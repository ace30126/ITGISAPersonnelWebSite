---
id: access-control
subject: 5
title: 접근 통제 정책
tier: S
tags: [접근통제, dac, mac, rbac, 보안등급, 신분, 역할, secure-os]
keywords: [접근통제]
items: [q:2024-2:093, q:2022-2:095, q:2024-1:089, q:2025-3:099]
updated: 2026-08-15
---

## 한 줄 정의

접근 통제는 주체가 객체에 접근할 권한을 무엇을 기준으로 줄지 정하는 정책이다.

## 왜 시험에 나오나

정책 세 가지 이름을 묻는 문항이 반복된다. 결정 기준이 신분인지 보안 등급인지 역할인지만 구분하면 풀린다.

## 그림

<svg viewBox="0 0 360 160" role="img" aria-label="접근 통제 세 정책의 권한 부여 주체와 결정 기준">
  <rect x="8" y="12" width="106" height="76" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="61" y="36" text-anchor="middle" font-size="13" fill="currentColor">MAC</text>
  <text x="61" y="58" text-anchor="middle" font-size="12" fill="currentColor">시스템</text>
  <text x="61" y="78" text-anchor="middle" font-size="12" fill="currentColor">보안 등급</text>
  <rect x="126" y="12" width="106" height="76" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="179" y="36" text-anchor="middle" font-size="13" fill="currentColor">DAC</text>
  <text x="179" y="58" text-anchor="middle" font-size="12" fill="currentColor">데이터 소유자</text>
  <text x="179" y="78" text-anchor="middle" font-size="12" fill="currentColor">신분</text>
  <rect x="244" y="12" width="106" height="76" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="297" y="36" text-anchor="middle" font-size="13" fill="currentColor">RBAC</text>
  <text x="297" y="58" text-anchor="middle" font-size="12" fill="currentColor">중앙 관리자</text>
  <text x="297" y="78" text-anchor="middle" font-size="12" fill="currentColor">역할</text>
  <text x="179" y="116" text-anchor="middle" font-size="12" fill="currentColor">윗칸은 권한 부여 주체</text>
  <text x="179" y="138" text-anchor="middle" font-size="12" fill="currentColor">아랫칸은 접근 결정 기준</text>
</svg>

## 핵심

| 정책 | 결정 기준 | 권한 부여 | 정책 변경 |
|---|---|---|---|
| MAC 강제 접근 통제 | 보안 등급 Label | 시스템 | 어렵다 |
| DAC 임의 접근 통제 | 신분 Identity | 데이터 소유자 | 쉽다 |
| RBAC 역할 기반 접근 통제 | 역할 Role | 중앙 관리자 | 쉽다 |

- MAC은 주체와 객체 양쪽의 보안 레이블을 비교해 높은 등급 정보가 낮은 등급 주체에게 새지 않게 막는다.
- RBAC은 직무와 직책에 따라 권한을 준다. 사람이 바뀌어도 역할은 그대로다.
- 보안 운영체제(Secure OS)의 기능에 식별과 인증, 강제 접근 통제, 임의 접근 통제가 들어간다.

## 헷갈리는 지점

- 접근 통제 정책은 셋뿐이다. 데이터 전환 접근 통제 같은 없는 이름이 정답으로 나온다.
- MAC은 안정적이지만 변경이 어렵다. 변경이 용이하다고 쓴 보기는 DAC이나 RBAC의 설명이다.
- 보안 등급은 MAC, 신분은 DAC이다. 두 기준을 맞바꾼 보기가 표 형태 문항에서 반복된다.
- 고가용성 지원은 성능 항목이다. 보안 운영체제의 보안 기능을 묻는 문항의 정답이 이것이다.
- 축약어 오답으로 NAC, SDAC, AAC가 깔린다. 정책 이름은 MAC·DAC·RBAC 셋이다.

## 기출 패턴

설명 한 줄을 주고 정책 이름을 고르게 하는 방향이 가장 잦다. 역할이라는 단어가 나오면 RBAC, 보안 레이블이 나오면 MAC이다. 표를 통째로 주고 빈칸 한 칸을 채우게 하는 형식도 나온다. 정책이 아닌 것 고르기는 없는 이름을 정답으로 둔다.

## 퀴즈
- q: 접근 통제 정책의 종류가 아닌 것은?
  choices: [임의적 접근 통제, 데이터 전환 접근 통제, 강제적 접근 통제, 역할 기반 접근 통제]
  a: 2
  why: 정책은 DAC·MAC·RBAC 셋이다. 역할 기반 접근 통제는 실재하는 정책이라 정답이 될 수 없다.
- q: 주체와 객체의 보안 등급을 비교해 접근을 결정하는 정책은?
  choices: [DAC, MAC, RBAC, NAC]
  a: 2
  why: 보안 레이블을 비교하는 것이 MAC이다. DAC은 등급이 아니라 접근하는 사용자의 신분을 본다.
- q: 조직 내 직무와 직책에 따라 권한을 부여하는 정책은?
  choices: [RBAC, DAC, MAC, QAC]
  a: 1
  why: 역할을 기준으로 삼는 것이 RBAC이다. MAC은 역할이 아니라 미리 정한 보안 등급으로 결정한다.

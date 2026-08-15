---
id: db-normalization
subject: 3
title: 정규화와 이상 현상
tier: S
tags: [정규화, 이상현상, 1nf, 2nf, 3nf, bcnf, 4nf, 5nf, 부분함수종속, 이행함수종속, 도부이결다조]
keywords: [정규화]
items: [q:2024-1:053, q:2023-3:050, q:2024-3:055, q:2025-1:043, q:2022-1:043]
updated: 2026-08-15
---

## 한 줄 정의

정규화(Normalization)는 릴레이션을 함수 종속에 따라 단계적으로 분해해 중복과 이상 현상을 없애는 논리적 설계 작업이다.

## 왜 시험에 나오나

3과목 최다 출제군에 속한다. 물어보는 각도는 셋으로 고정돼 있다. 정규형 단계와 그 단계가 제거하는 종속을 짝짓기, 이상 현상의 종류, 정규화의 목적과 수행 시점이다.

## 그림

<svg viewBox="0 0 380 290" role="img" aria-label="정규형 단계와 각 단계에서 제거하는 종속">
  <rect x="8" y="8" width="66" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="41" y="26" text-anchor="middle" font-size="13" fill="currentColor">1NF</text>
  <line x1="41" y1="34" x2="41" y2="56" stroke="currentColor" stroke-width="1.2"/>
  <text x="84" y="50" font-size="12" fill="currentColor">부분 함수 종속 제거</text>
  <rect x="8" y="56" width="66" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="41" y="74" text-anchor="middle" font-size="13" fill="currentColor">2NF</text>
  <line x1="41" y1="82" x2="41" y2="104" stroke="currentColor" stroke-width="1.2"/>
  <text x="84" y="98" font-size="12" fill="currentColor">이행 함수 종속 제거</text>
  <rect x="8" y="104" width="66" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="41" y="122" text-anchor="middle" font-size="13" fill="currentColor">3NF</text>
  <line x1="41" y1="130" x2="41" y2="152" stroke="currentColor" stroke-width="1.2"/>
  <text x="84" y="146" font-size="12" fill="currentColor">결정자가 후보키 아닌 종속 제거</text>
  <rect x="8" y="152" width="66" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="41" y="170" text-anchor="middle" font-size="13" fill="currentColor">BCNF</text>
  <line x1="41" y1="178" x2="41" y2="200" stroke="currentColor" stroke-width="1.2"/>
  <text x="84" y="194" font-size="12" fill="currentColor">다치 종속 제거</text>
  <rect x="8" y="200" width="66" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="41" y="218" text-anchor="middle" font-size="13" fill="currentColor">4NF</text>
  <line x1="41" y1="226" x2="41" y2="248" stroke="currentColor" stroke-width="1.2"/>
  <text x="84" y="242" font-size="12" fill="currentColor">조인 종속 제거</text>
  <rect x="8" y="248" width="66" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="41" y="266" text-anchor="middle" font-size="13" fill="currentColor">5NF</text>
</svg>

## 핵심

| 정규형 | 조건 |
|---|---|
| 1NF | 모든 도메인이 원자값 |
| 2NF | 부분 함수 종속 제거 |
| 3NF | 이행 함수 종속 제거 |
| BCNF | 모든 결정자가 후보키 |
| 4NF | 다치 종속 제거 |
| 5NF | 후보키를 통하지 않는 조인 종속 제거 |

머리글자 암기는 도·부·이·결·다·조다.

- 이상(Anomaly)은 삽입 이상, 삭제 이상, 갱신 이상 세 가지다.
- 이행적 함수 종속은 A→B이고 B→C일 때 A→C가 성립하는 관계다.
- 정규화는 개념적 설계 다음의 논리적 설계 단계에서 수행한다.

## 헷갈리는 지점

- 검색 이상이라는 것은 없다. "이상 현상이 아닌 것"을 묻는 문항의 정답은 검색 이상이다.
- 3NF에서 BCNF로 가는 조건은 결정자이면서 후보키가 아닌 것의 제거다. 이행적 함수 종속 제거는 2NF에서 3NF로 가는 조건이다. 두 보기가 한 문항에 같이 깔린다.
- 정규화 수행 시점은 논리적 설계다. 개념적 설계 이전에 한다는 서술은 오답이다.
- 이행적 종속의 방향은 A→C다. C→A나 B→A로 뒤집은 보기가 오답으로 붙는다.
- 정규화는 중복을 배제한다. "중복 데이터의 활성화" 같은 방향이 반대인 보기를 고르면 안 된다.

## 기출 패턴

이상 현상 문항은 보기 넷 중 하나만 실재하지 않는 이름을 넣어 고르게 한다. 단계 짝짓기 문항은 조건 서술만 주고 정규형 이름을 묻거나, 종속 이름을 주고 몇 단계 사이인지를 묻는 두 방향으로 나온다. 정규화 목적을 묻는 문항은 안정성 최대화·이상 최소화·불일치 최소화를 참으로 두고 중복 관련 보기 하나만 뒤집는다.

## 퀴즈
- q: 이상 현상에 해당하지 않는 것은?
  choices: [삽입 이상, 삭제 이상, 검색 이상, 갱신 이상]
  a: 3
  why: 이상은 삽입·삭제·갱신 세 가지다. 검색은 데이터를 바꾸지 않으므로 이상이 생기지 않는다. 갱신 이상은 중복된 값 일부만 수정돼 불일치가 생기는 실재하는 이상이다.
- q: 모든 결정자가 후보키인 릴레이션이 만족하는 정규형은?
  choices: [2NF, 3NF, BCNF, 4NF]
  a: 3
  why: 결정자가 후보키가 아닌 함수 종속을 제거한 상태가 BCNF다. 3NF는 이행 함수 종속까지만 제거한 단계라 결정자 조건을 보장하지 않는다.
- q: 정규화를 수행하는 데이터베이스 설계 단계는?
  choices: [요구 분석, 개념적 설계, 논리적 설계, 물리적 설계]
  a: 3
  why: 정규화는 릴레이션 스키마를 다듬는 작업이므로 논리적 설계에서 한다. 개념적 설계 이전에 수행한다는 서술은 기출에서 오답으로 쓰인다.

---
id: hashing
subject: 2
title: 해싱과 해시 함수
tier: A
tags: [해싱, 해시함수, 제산법, 제곱법, 폴딩법, 숫자분석법, 기수변환법, 충돌, 시노님, 오버플로, 개방주소법, 체이닝]
keywords: [해싱]
items: [q:2022-3:031, q:2024-1:025]
updated: 2026-08-15
---

## 한 줄 정의

해싱(Hashing)은 키 값에 해시 함수를 적용해 저장 위치인 홈 주소를 직접 계산하는 검색 방식이다.

## 왜 시험에 나오나

2과목에서 해마다 한 문항 안팎으로 나온다. 각도는 둘로 고정돼 있다. 해시 함수의 종류를 나열하고 아닌 것을 고르게 하거나, 함수 하나의 동작을 서술하고 이름을 묻는다.

## 그림

<svg viewBox="0 0 380 190" role="img" aria-label="키가 해시 함수를 거쳐 버킷에 저장되고 충돌이 발생하는 과정">
  <rect x="8" y="20" width="70" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="43" y="39" text-anchor="middle" font-size="13" fill="currentColor">키 A</text>
  <rect x="8" y="66" width="70" height="28" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="43" y="85" text-anchor="middle" font-size="13" fill="currentColor">키 B</text>
  <line x1="78" y1="34" x2="130" y2="55" stroke="currentColor" stroke-width="1.2"/>
  <line x1="78" y1="80" x2="130" y2="59" stroke="currentColor" stroke-width="1.2"/>
  <rect x="130" y="40" width="94" height="34" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="177" y="62" text-anchor="middle" font-size="13" fill="currentColor">해시 함수</text>
  <line x1="224" y1="57" x2="266" y2="57" stroke="currentColor" stroke-width="1.2"/>
  <rect x="266" y="40" width="100" height="34" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="316" y="62" text-anchor="middle" font-size="13" fill="currentColor">홈 주소 3</text>
  <text x="8" y="122" font-size="12" fill="currentColor">두 키의 홈 주소가 같음 = 충돌, 두 키는 시노님</text>
  <rect x="266" y="134" width="100" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.6"/>
  <text x="316" y="154" text-anchor="middle" font-size="12" fill="currentColor">버킷 3 자리 참</text>
  <line x1="316" y1="74" x2="316" y2="134" stroke="currentColor" stroke-width="1.2" stroke-dasharray="4 3"/>
  <text x="8" y="152" font-size="12" fill="currentColor">→ 오버플로</text>
  <text x="8" y="172" font-size="12" fill="currentColor">→ 개방 주소법 또는 체이닝으로 처리</text>
</svg>

## 핵심

| 해시 함수 | 계산 방법 |
|---|---|
| 제산법 | 키를 해시표 크기로 나눈 나머지를 주소로 쓴다 |
| 제곱법 | 키를 제곱한 뒤 중앙 부분을 주소로 쓴다 |
| 폴딩법 | 키를 여러 부분으로 나눠 더하거나 배타적 논리합을 취한다 |
| 숫자 분석법 | 키 숫자의 분포를 분석해 고른 자리만 뽑아 쓴다 |
| 기수 변환법 | 키의 진수를 다른 진수로 바꾼 뒤 자릿수를 맞춘다 |
| 무작위법 | 난수를 발생시켜 주소로 쓴다 |

- 서로 다른 키가 같은 홈 주소를 받는 것이 충돌(Collision)이고, 그 키들을 시노님(Synonym)이라 한다.
- 버킷이 꽉 차서 더 넣지 못하는 상태가 오버플로(Overflow)다.
- 충돌 해결 방법은 개방 주소법(Open Addressing)과 체이닝(Chaining)이다. 개방 주소법에는 선형 탐사, 제곱 탐사, 이중 해싱이 있다.

## 헷갈리는 지점

- 개방 주소법은 해시 함수가 아니라 충돌 해결 방법이다. 함수 종류를 묻는 보기에 개방 주소법을 끼워 넣는 문항이 반복된다.
- 폴딩법과 숫자 분석법을 바꿔 놓는다. 나눠서 더하면 폴딩법이고, 자릿수 분포를 보고 뽑으면 숫자 분석법이다.
- 제산법의 나눗셈 결과는 몫이 아니라 나머지다.
- 폴딩법의 다른 이름은 중첩법이다. 이름이 달라 다른 함수로 보이지만 같은 것이다.

## 기출 패턴

종류 문항은 제산법·제곱법·숫자 분석법 셋을 참으로 깔고 충돌 해결 방법 하나를 섞어 아닌 것을 고르게 한다. 서술형 문항은 함수의 계산 절차만 한 줄로 주고 이름을 묻는다. 폴딩법은 배타적 논리합이라는 단어로 식별한다. 정렬·검색 문항과 한 세트로 묶여 나오는 회차가 잦다.

## 퀴즈
- q: 해시 함수의 종류에 해당하지 않는 것은?
  choices: [제산법, 제곱법, 개방 주소법, 숫자 분석법]
  a: 3
  why: 개방 주소법은 충돌이 일어난 뒤 빈자리를 찾는 충돌 해결 방법이다. 제산법은 키를 해시표 크기로 나눈 나머지를 주소로 쓰는 실재하는 해시 함수다.
- q: 키를 여러 부분으로 나눠 더하거나 배타적 논리합을 취해 주소로 쓰는 해시 함수는?
  choices: [제산법, 폴딩법, 기수 변환법, 숫자 분석법]
  a: 2
  why: 나눠서 합치는 동작이 폴딩법의 정의다. 숫자 분석법은 키를 나누지 않고 자릿수 분포가 고른 자리만 골라 쓴다.
- q: 서로 다른 키가 같은 홈 주소를 갖게 된 키들을 부르는 이름은?
  choices: [버킷, 슬롯, 시노님, 오버플로]
  a: 3
  why: 같은 홈 주소를 공유하는 키들이 시노님이다. 오버플로는 그 결과 버킷에 자리가 없어 저장하지 못하는 상태를 가리키므로 키를 부르는 이름이 아니다.

---
id: public-key
subject: 5
title: 공개 키 암호화
tier: S
tags: [공개키, 비대칭키, rsa, ecc, dsa, 디피헬만, 소인수분해, 이산대수, 전자서명, pki]
keywords: [공개키]
items: [q:2023-2:093, q:2025-3:083, q:2022-2:093, q:2023-2:094]
updated: 2026-08-15
---

## 한 줄 정의

공개 키 암호화는 암호화 키와 복호화 키가 다른 방식이다. 비대칭 키 암호화라고도 부른다.

## 왜 시험에 나오나

소인수 분해라는 단어를 주고 RSA를 고르게 하는 문항이 반복된다. 대칭 키와 비교해 옳고 그름을 가리는 서술형도 자주 나온다.

## 그림

<svg viewBox="0 0 370 150" role="img" aria-label="공개 키로 암호화하고 개인 키로 복호화하는 구조">
  <rect x="8" y="52" width="76" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="46" y="75" text-anchor="middle" font-size="13" fill="currentColor">평문</text>
  <line x1="84" y1="70" x2="118" y2="70" stroke="currentColor" stroke-width="1.4"/>
  <polygon points="118,70 110,66 110,74" fill="currentColor"/>
  <rect x="118" y="52" width="74" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="155" y="75" text-anchor="middle" font-size="12" fill="currentColor">암호화</text>
  <text x="155" y="34" text-anchor="middle" font-size="12" fill="currentColor">공개 키</text>
  <line x1="155" y1="40" x2="155" y2="52" stroke="currentColor" stroke-width="1.2"/>
  <line x1="192" y1="70" x2="226" y2="70" stroke="currentColor" stroke-width="1.4"/>
  <polygon points="226,70 218,66 218,74" fill="currentColor"/>
  <rect x="226" y="52" width="74" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="263" y="75" text-anchor="middle" font-size="12" fill="currentColor">복호화</text>
  <text x="263" y="34" text-anchor="middle" font-size="12" fill="currentColor">개인 키</text>
  <line x1="263" y1="40" x2="263" y2="52" stroke="currentColor" stroke-width="1.2"/>
  <text x="185" y="122" text-anchor="middle" font-size="12" fill="currentColor">키 두 개가 짝을 이룬다</text>
</svg>

## 핵심

| 알고리즘 | 근거 수학 |
|---|---|
| RSA | 소인수 분해 |
| ECC | 타원 곡선 |
| 디피-헬만 | 이산 대수 기반 키 교환 |
| DSA | 전자 서명 표준 |

- 공개 키는 공개하고 개인 키는 본인만 보관한다.
- 개인 키로 서명하면 인증과 전자 서명에 쓸 수 있다.
- 사용자가 n명이면 관리할 키는 2n개다. 대칭 키보다 관리할 키가 적다.
- 대칭 키보다 속도가 느리다. 키 교환 문제가 없다는 점이 장점이다.
- PKI는 공개 키 기반 구조를 뜻하는 체계 이름이다. 알고리즘이 아니다.

## 헷갈리는 지점

- 소인수 분해가 나오면 RSA다. ECC는 타원 곡선이므로 같이 깔려도 정답이 아니다.
- 공개 키 방식이 해시로 키를 만든다는 서술은 오답이다. 키는 소인수 분해나 이산 대수로 만든다.
- 키 개수는 공개 키가 2n, 대칭 키가 n(n-1)/2다. 어느 쪽이 더 많은지를 뒤집은 보기가 나온다.
- RSA와 PKI를 한 문항에 함께 깐다. PKI는 구조이지 암호 알고리즘이 아니다.
- 디피-헬만은 키 교환 알고리즘이다. 스패닝 트리처럼 무관한 문항의 오답으로도 등장한다.

## 기출 패턴

근거 수학을 단서로 던지고 알고리즘 이름을 고르게 한다. 비교형은 대칭 키의 속도와 공개 키의 전자 서명 활용을 참으로 두고 키 교환 관련 한 줄만 뒤집는다. 성격 다른 하나 찾기에서는 대칭 키 셋 사이에 RSA를 끼워 넣는다.

## 퀴즈
- q: 소인수 분해 문제를 이용한 공개 키 암호 알고리즘은?
  choices: [RSA, ECC, PKI, DES]
  a: 1
  why: RSA는 큰 수의 소인수 분해가 어렵다는 성질에 기댄다. PKI는 공개 키 기반 구조라는 체계 이름이므로 알고리즘이 아니다.
- q: 사용자가 n명일 때 공개 키 방식에서 관리할 키의 개수는?
  choices: [n, 2n, n(n-1)/2, n의 제곱]
  a: 2
  why: 각자 공개 키와 개인 키를 하나씩 가지므로 2n개다. n(n-1)/2는 대칭 키에서 쌍마다 키를 나눠 가질 때의 개수다.
- q: 공개 키 암호화에 대한 설명으로 틀린 것은?
  choices: [키가 두 개다, 전자 서명에 쓸 수 있다, 대칭 키보다 속도가 빠르다, 개인 키는 공개하지 않는다]
  a: 3
  why: 공개 키는 연산이 무거워 대칭 키보다 느리다. 개인 키를 감추는 것은 방식의 전제라 참이다.

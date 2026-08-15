---
id: symmetric-key
subject: 5
title: 대칭 키 암호화
tier: S
tags: [대칭키, 개인키, 비밀키, des, aes, seed, aria, idea, rc4, lfsr, 블록암호, 스트림암호]
keywords: [대칭키]
items: [q:2024-2:089, q:2023-2:094, q:2022-1:095, q:2023-3:097, q:2022-3:089]
updated: 2026-08-15
---

## 한 줄 정의

대칭 키 암호화는 암호화 키와 복호화 키가 같은 방식이다. 개인 키 또는 비밀 키 암호화라고도 부른다.

## 왜 시험에 나오나

알고리즘 이름 넷 중 성격이 다른 하나를 고르는 문항이 매 회차 수준으로 나온다. 블록 방식과 스트림 방식을 가르는 문항도 반복된다.

## 그림

<svg viewBox="0 0 370 130" role="img" aria-label="대칭 키 암호화에서 같은 키를 양쪽이 사용하는 구조">
  <rect x="8" y="44" width="80" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="48" y="67" text-anchor="middle" font-size="13" fill="currentColor">평문</text>
  <line x1="88" y1="62" x2="126" y2="62" stroke="currentColor" stroke-width="1.4"/>
  <polygon points="126,62 118,58 118,66" fill="currentColor"/>
  <rect x="126" y="44" width="118" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="185" y="67" text-anchor="middle" font-size="13" fill="currentColor">암호화 · 복호화</text>
  <line x1="244" y1="62" x2="282" y2="62" stroke="currentColor" stroke-width="1.4"/>
  <polygon points="282,62 274,58 274,66" fill="currentColor"/>
  <rect x="282" y="44" width="80" height="36" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="322" y="67" text-anchor="middle" font-size="13" fill="currentColor">암호문</text>
  <text x="185" y="24" text-anchor="middle" font-size="12" fill="currentColor">같은 키 하나</text>
  <line x1="185" y1="30" x2="185" y2="44" stroke="currentColor" stroke-width="1.2"/>
  <text x="185" y="108" text-anchor="middle" font-size="12" fill="currentColor">키를 미리 나눠 가져야 한다</text>
</svg>

## 핵심

| 방식 | 알고리즘 |
|---|---|
| 블록 암호 | DES, AES, SEED, ARIA, IDEA |
| 스트림 암호 | LFSR, RC4 |

- 블록 암호는 데이터를 블록 단위로, 스트림 암호는 비트나 바이트 단위로 순차 처리한다.
- DES는 블록 크기가 64비트다. AES는 DES의 보안 문제를 해결하려고 미국 표준화 기관이 만들었다.
- SEED와 ARIA는 국내에서 만든 표준 알고리즘이다.
- 공개 키 방식보다 속도가 빠르고 알고리즘이 단순하다.
- 사용자가 n명이면 관리할 키는 n(n-1)/2개다. 사람이 늘수록 키가 급격히 늘어난다.

## 헷갈리는 지점

- DES·AES·SEED·ARIA 사이에 RSA를 섞어 놓고 개인 키 기법이 아닌 것을 묻는다. RSA만 공개 키다.
- RC4는 대칭 키지만 스트림 방식이다. 블록 암호가 아닌 것을 고르는 문항의 정답이 RC4다.
- 대칭 키는 키 교환이 필요하다. 키 교환이 필요 없어 빠르다는 서술은 앞부분이 틀렸다.
- 키 개수는 대칭 키가 n(n-1)/2, 공개 키가 2n이다. 두 식을 바꿔 놓은 보기가 나온다.
- 스트림 암호가 해시 암호화 방식을 쓴다는 서술은 오답이다. 해시는 단방향이다.

## 기출 패턴

성격 다른 하나 찾기가 가장 많다. 대칭 키 셋에 공개 키 하나, 또는 해시 셋에 대칭 키 하나를 섞는다. 설명형은 암호화 키와 복호화 키가 같다는 조건을 주고 AES를 고르게 한다. DES 관련 문항은 비트 수를 직접 묻는다.

## 퀴즈
- q: 개인 키 암호화 기법에 해당하지 않는 것은?
  choices: [DES, ARIA, SEED, RSA]
  a: 4
  why: RSA는 소인수 분해를 이용한 공개 키 알고리즘이다. ARIA는 국내에서 만든 대칭 키 블록 암호라 정답이 아니다.
- q: 블록 암호화 방식이 아닌 것은?
  choices: [DES, RC4, AES, SEED]
  a: 2
  why: RC4는 스트림 암호다. 대칭 키라는 점은 나머지와 같으므로 방식을 묻는 문항임을 놓치면 틀린다.
- q: 암호화 키와 복호화 키가 동일한 알고리즘은?
  choices: [RSA, AES, DSA, ECC]
  a: 2
  why: AES는 대칭 키라 두 키가 같다. ECC는 타원 곡선을 쓰는 공개 키 방식이므로 두 키가 다르다.

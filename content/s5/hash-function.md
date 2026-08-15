---
id: hash-function
subject: 5
title: 해시 함수와 일방향 암호
tier: A
tags: [해시함수, 일방향암호, sha, md5, md4, snefru, haval, n-nash, 무결성]
keywords: [해시함수]
items: [q:2023-3:086, q:2025-1:099, q:2022-3:096]
updated: 2026-08-15
---

## 한 줄 정의

해시 함수(Hash Function)는 임의 길이의 입력을 고정 길이의 값으로 바꾸는 일방향(One-way) 함수다.

## 왜 시험에 나오나

암호 알고리즘 이름 넷을 늘어놓고 성격이 다른 하나를 고르게 하는 문항이 반복된다. 해시 이름 목록을 외우면 그 자리에서 풀린다.

## 그림

<svg viewBox="0 0 370 130" role="img" aria-label="해시 함수의 단방향 변환 구조">
  <rect x="8" y="30" width="96" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="56" y="49" text-anchor="middle" font-size="12" fill="currentColor">임의 길이</text>
  <text x="56" y="66" text-anchor="middle" font-size="12" fill="currentColor">입력</text>
  <line x1="104" y1="52" x2="140" y2="52" stroke="currentColor" stroke-width="1.4"/>
  <polygon points="140,52 132,48 132,56" fill="currentColor"/>
  <rect x="140" y="30" width="86" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="183" y="57" text-anchor="middle" font-size="13" fill="currentColor">해시 함수</text>
  <line x1="226" y1="52" x2="262" y2="52" stroke="currentColor" stroke-width="1.4"/>
  <polygon points="262,52 254,48 254,56" fill="currentColor"/>
  <rect x="262" y="30" width="96" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="310" y="49" text-anchor="middle" font-size="12" fill="currentColor">고정 길이</text>
  <text x="310" y="66" text-anchor="middle" font-size="12" fill="currentColor">해시값</text>
  <line x1="262" y1="96" x2="104" y2="96" stroke="currentColor" stroke-width="1.2" opacity="0.6"/>
  <text x="183" y="114" text-anchor="middle" font-size="12" fill="currentColor">역방향 복원 불가</text>
  <line x1="176" y1="88" x2="190" y2="104" stroke="currentColor" stroke-width="1.4"/>
  <line x1="190" y1="88" x2="176" y2="104" stroke="currentColor" stroke-width="1.4"/>
</svg>

## 핵심

| 구분 | 방향 | 대표 알고리즘 |
|---|---|---|
| 해시 | 단방향 | SHA 시리즈, MD4, MD5, N-NASH, SNEFRU, HAVAL |
| 대칭 키 | 양방향 | DES, AES, SEED, ARIA, RC4 |
| 공개 키 | 양방향 | RSA, ECC, 디피-헬만 |

- 출력 길이는 입력 길이와 무관하게 고정이다.
- 쓰임은 무결성 검증과 비밀번호 저장이다. 복호화가 목적이 아니다.
- 해시값만 보고 원문을 되돌릴 수 없다.

## 헷갈리는 지점

- MD4·MD5·SHA-1 사이에 AES를 섞어 두고 성격이 다른 하나를 묻는다. AES는 대칭 키다.
- 공개 키 방식의 키 생성에 해시를 쓴다는 서술은 오답이다. 공개 키의 키는 소인수 분해나 이산 대수로 만든다.
- 해시는 일방향이다. 양방향 암호화를 지원한다는 서술이 붙으면 틀린 보기다.
- SHA는 해시, WPA는 무선 랜 보안 규격이다. 무선 인증 표준을 묻는 문항에 SHA가 오답으로 깔린다.
- 이름에 Hash가 들어간 보기가 무조건 정답은 아니다. 스패닝 트리를 묻는 문항의 오답으로도 쓰인다.

## 기출 패턴

성격 다른 하나 찾기가 가장 잦다. 보기 셋이 해시이고 하나가 대칭 키다. 설명형은 고정 길이 변환과 일방향 함수를 참으로 두고 용도 한 줄만 뒤집는다. 해시 알고리즘 목록을 나열하는 보기에서는 HAVAL과 SHA-1이 실재하는 이름으로 함께 등장한다.

## 퀴즈
- q: 다음 중 해시 알고리즘이 아닌 것은?
  choices: [MD5, SHA-1, SEED, SNEFRU]
  a: 3
  why: SEED는 국내에서 개발한 대칭 키 블록 암호다. SNEFRU는 실재하는 해시 알고리즘이므로 정답이 될 수 없다.
- q: 해시 함수의 설명으로 틀린 것은?
  choices: [고정 길이 값을 출력한다, 일방향 함수다, 무결성 검증에 쓴다, 해시값에서 원문을 복호화한다]
  a: 4
  why: 해시는 되돌릴 수 없어 복호화라는 말이 성립하지 않는다. 고정 길이 출력은 해시의 정의 그대로라 참이다.
- q: 해시 함수의 주된 용도는?
  choices: [키 교환, 무결성 검증, 세션 유지, 대역폭 확보]
  a: 2
  why: 해시는 값이 바뀌었는지를 확인하는 무결성 검증에 쓴다. 키 교환은 디피-헬만 같은 공개 키 방식의 몫이다.

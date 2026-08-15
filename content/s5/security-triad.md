---
id: security-triad
subject: 5
title: 정보 보안 3요소와 인증
tier: S
tags: [보안3요소, 기밀성, 무결성, 가용성, 부인방지, 인증유형, sso, 취약점관리]
keywords: [보안3요소]
items: [q:2022-3:085, q:2022-2:081, q:2023-1:083, q:2022-2:097, q:2024-2:082]
updated: 2026-08-15
---

## 한 줄 정의

정보 보안 3요소는 기밀성, 무결성, 가용성이다.

## 왜 시험에 나오나

3요소를 그대로 묻는 문항이 회차마다 반복된다. 설명 한 줄을 주고 어느 요소인지 고르게 하는 방향과, 3요소가 아닌 것을 고르게 하는 방향 둘로 나온다.

## 그림

<svg viewBox="0 0 360 150" role="img" aria-label="정보 보안 3요소와 각 요소의 통제 대상">
  <rect x="8" y="20" width="106" height="60" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="61" y="44" text-anchor="middle" font-size="13" fill="currentColor">기밀성</text>
  <text x="61" y="66" text-anchor="middle" font-size="12" fill="currentColor">접근</text>
  <rect x="126" y="20" width="106" height="60" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="179" y="44" text-anchor="middle" font-size="13" fill="currentColor">무결성</text>
  <text x="179" y="66" text-anchor="middle" font-size="12" fill="currentColor">수정</text>
  <rect x="244" y="20" width="106" height="60" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="297" y="44" text-anchor="middle" font-size="13" fill="currentColor">가용성</text>
  <text x="297" y="66" text-anchor="middle" font-size="12" fill="currentColor">사용 시점</text>
  <text x="179" y="112" text-anchor="middle" font-size="12" fill="currentColor">머리글자 암기: 기·무·가</text>
  <text x="179" y="134" text-anchor="middle" font-size="12" fill="currentColor">휘발성은 3요소가 아니다</text>
</svg>

## 핵심

| 요소 | 뜻 |
|---|---|
| 기밀성 Confidentiality | 인가된 사용자만 자원에 접근한다 |
| 무결성 Integrity | 인가된 사용자만 자원을 수정한다 |
| 가용성 Availability | 인가된 사용자가 필요할 때 접근한다 |

| 인증 유형 | 예 |
|---|---|
| 지식 | 패스워드, PIN |
| 소유 | 토큰, 스마트카드 |
| 생체 | 지문, 홍채 |
| 행위 | 서명, 음성 |

- SSO(Single Sign On)는 한 번 인증하면 다른 시스템 접근 권한까지 얻는 방식이다.

## 헷갈리는 지점

- 휘발성은 보안 요소가 아니다. 3요소가 아닌 것을 고르는 문항의 정답이 매번 휘발성이다.
- 접근은 기밀성, 수정은 무결성이다. 두 서술이 한 문항에 나란히 깔린다.
- 생체 인증의 예는 지문과 홍채다. 패턴이나 QR을 생체의 예로 든 보기는 오답이다.
- 취약점 관리에서 확인하는 대상은 동작 중인 프로세스와 열린 포트다. 중단된 프로세스와 닫힌 포트라고 뒤집은 보기가 반복된다.
- 부인 방지는 3요소에 들어가지 않는다.

## 기출 패턴

3요소 나열형은 보기 셋을 참으로 두고 없는 요소 하나를 넣는다. 설명형은 수정 권한을 말하면서 기밀성을 오답으로 함께 깐다. 인증 유형 문항은 네 유형의 예시를 짝지어 놓고 하나만 예시를 바꿔 둔다. 축약어를 묻는 문항은 SSO 자리에 SOA, SBO 같은 비슷한 철자를 오답으로 배치한다.

## 퀴즈
- q: 정보 보안 3요소에 해당하지 않는 것은?
  choices: [기밀성, 무결성, 가용성, 휘발성]
  a: 4
  why: 3요소는 기밀성·무결성·가용성이다. 가용성은 필요할 때 접근할 수 있어야 한다는 실재하는 요소라 정답이 될 수 없다.
- q: 인가된 사용자만 정보를 수정할 수 있게 하는 보안 요소는?
  choices: [기밀성, 무결성, 가용성, 부인 방지]
  a: 2
  why: 수정 권한을 통제하는 것이 무결성이다. 기밀성은 수정이 아니라 열람과 접근을 통제한다.
- q: 소유 기반 인증의 예로 옳은 것은?
  choices: [패스워드, 스마트카드, 홍채, 서명]
  a: 2
  why: 소유는 가지고 있는 물건으로 인증한다. 패스워드는 알고 있는 것이므로 지식 기반이다.

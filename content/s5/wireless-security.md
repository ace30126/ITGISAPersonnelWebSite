---
id: wireless-security
subject: 5
title: 무선 통신과 무선 보안
tier: A
tags: [무선보안, wpa, 블루버그, 블루스나프, 블루프린팅, 블루재킹, zing, piconet, nfc, zigbee, wi-sun]
keywords: [무선보안]
items: [q:2022-1:087, q:2022-3:088, q:2022-2:083]
updated: 2026-08-15
---

## 한 줄 정의

무선 보안은 무선 랜과 블루투스처럼 선 없이 오가는 통신을 인증하고 암호화하는 문제를 다룬다.

## 왜 시험에 나오나

블루투스 공격 네 가지의 설명을 서로 바꿔 놓은 문항이 반복된다. 근거리 무선 기술 이름과 특징을 짝짓는 문항도 함께 나온다.

## 그림

<svg viewBox="0 0 360 120" role="img" aria-label="블루투스 공격 네 가지의 목적 구분">
  <rect x="8" y="12" width="164" height="42" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="90" y="30" text-anchor="middle" font-size="12" fill="currentColor">블루프린팅</text>
  <text x="90" y="47" text-anchor="middle" font-size="12" fill="currentColor">장치 검색</text>
  <rect x="188" y="12" width="164" height="42" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="270" y="30" text-anchor="middle" font-size="12" fill="currentColor">블루재킹</text>
  <text x="270" y="47" text-anchor="middle" font-size="12" fill="currentColor">명함 살포</text>
  <rect x="8" y="64" width="164" height="42" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="90" y="82" text-anchor="middle" font-size="12" fill="currentColor">블루스나프</text>
  <text x="90" y="99" text-anchor="middle" font-size="12" fill="currentColor">파일 열람</text>
  <rect x="188" y="64" width="164" height="42" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="270" y="82" text-anchor="middle" font-size="12" fill="currentColor">블루버그</text>
  <text x="270" y="99" text-anchor="middle" font-size="12" fill="currentColor">연결 관리 악용</text>
</svg>

## 핵심

| 블루투스 공격 | 수법 |
|---|---|
| 블루프린팅 BluePrinting | 공격 대상 장치를 찾는 검색 활동 |
| 블루스나프 BlueSnarf | 취약점으로 장비의 파일에 접근해 정보 열람 |
| 블루재킹 BlueJacking | 명함을 익명으로 스팸처럼 퍼뜨림 |
| 블루버그 BlueBug | 장비 사이의 취약한 연결 관리를 악용 |

| 무선 기술 | 특징 |
|---|---|
| WPA | Wi-Fi가 제정한 무선 랜 인증과 암호화 표준 |
| NFC | 10cm 이내 근거리 무선 통신 |
| Zing | 10cm 이내에서 기가급 속도를 내는 초고속 근접 통신 |
| PICONET | UWB나 블루투스로 독립 장치들이 만드는 무선망 |
| Zigbee | 저전력 근거리 통신, 홈 네트워크와 센서망 |

## 헷갈리는 지점

- 블루버그와 블루스나프의 설명이 자주 뒤바뀐다. 파일 접근은 블루스나프, 연결 관리 악용은 블루버그다.
- 블루프린팅은 검색 단계다. 공격 자체가 아니라 대상을 찾는 활동이다.
- 무선 랜 인증 표준은 WPA다. 오답으로 SHA와 SSL이 붙지만 앞은 해시, 뒤는 웹 구간 암호화다.
- NFC와 Zing은 둘 다 10cm 이내다. 기가급 속도라는 단서가 나오면 Zing이다.
- PICONET을 묻는 문항에 SCRUM이 오답으로 들어간다. SCRUM은 개발 방법론이다.

## 기출 패턴

블루투스 문항은 네 이름과 네 설명을 짝지어 놓고 바르게 연결된 하나를 고르게 한다. 나머지 셋은 설명을 서로 옮겨 둔다. 무선 기술 문항은 거리와 속도를 단서로 주고 이름을 고르게 하며 오답으로 이동 통신망 약어를 깐다.

## 퀴즈
- q: 블루투스 취약점으로 장비의 파일에 접근해 정보를 열람하는 공격은?
  choices: [블루버그, 블루스나프, 블루프린팅, 블루재킹]
  a: 2
  why: 파일 접근과 정보 열람이 블루스나프다. 블루버그는 취약한 연결 관리를 악용하는 공격이라 파일 열람과 초점이 다르다.
- q: Wi-Fi가 제정한 무선 랜 인증 및 암호화 표준은?
  choices: [WCDMA, WPA, SSL, SHA]
  a: 2
  why: 무선 랜 보안 표준이 WPA다. SHA는 해시 알고리즘이라 무선 랜 인증 규격과 관계가 없다.
- q: 10cm 이내 근접 거리에서 기가급 속도로 데이터를 전송하는 기술은?
  choices: [BcN, Zing, Marine Navi, C-V2X]
  a: 2
  why: 초고속 근접 무선 통신이 Zing이다. BcN은 광대역 통합망이라 근접 거리 전송 기술이 아니다.

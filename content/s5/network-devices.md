---
id: network-devices
subject: 5
title: 네트워크 장비와 스토리지
tier: A
tags: [네트워크장비, 리피터, 브리지, 스위치, 라우터, 게이트웨이, 브라우터, 스패닝트리, san, nas, das]
keywords: [네트워크장비]
items: [q:2022-3:091, q:2022-3:097, q:2024-2:085, q:2022-3:093]
updated: 2026-08-15
---

## 한 줄 정의

네트워크 장비는 신호를 재생하거나 망을 이어 주는 기기이며, 동작하는 계층으로 구분한다.

## 왜 시험에 나오나

장비 설명 넷을 늘어놓고 틀린 하나를 고르게 하는 문항이 반복된다. 저장 장치 연결 방식을 묻는 문항이 함께 붙는다.

## 그림

<svg viewBox="0 0 340 160" role="img" aria-label="네트워크 장비가 동작하는 계층">
  <rect x="8" y="8" width="140" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="78" y="28" text-anchor="middle" font-size="12" fill="currentColor">응용 계층</text>
  <text x="230" y="28" font-size="12" fill="currentColor">게이트웨이</text>
  <rect x="8" y="46" width="140" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="78" y="66" text-anchor="middle" font-size="12" fill="currentColor">네트워크 계층</text>
  <text x="230" y="66" font-size="12" fill="currentColor">라우터</text>
  <rect x="8" y="84" width="140" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="78" y="104" text-anchor="middle" font-size="12" fill="currentColor">데이터 링크 계층</text>
  <text x="230" y="104" font-size="12" fill="currentColor">브리지 · 스위치</text>
  <rect x="8" y="122" width="140" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="78" y="142" text-anchor="middle" font-size="12" fill="currentColor">물리 계층</text>
  <text x="230" y="142" font-size="12" fill="currentColor">리피터 · 허브</text>
</svg>

## 핵심

| 장비 | 역할 |
|---|---|
| 리피터 | 약해지거나 왜곡된 신호를 원래 형태로 재생 |
| 브리지 | LAN과 LAN을 연결, MAC 계층에서 동작 |
| 스위치 | LAN을 묶어 더 큰 LAN을 구성, 2계층 |
| 라우터 | 최적 경로를 선택해 서로 다른 망을 연결, 3계층 |
| 브라우터 | 브리지와 라우터의 기능을 함께 갖춘 장비 |

- 스패닝 트리 알고리즘은 브리지로 이어진 망에서 루프가 생기지 않게 연결을 정한다.
- 서로 다른 네트워크 대역의 호스트를 통신하게 해 주는 장비가 라우터다.

| 스토리지 | 연결 방식 |
|---|---|
| DAS | 저장 장치를 호스트 버스 어댑터에 직접 연결 |
| NAS | 저장 장치를 네트워크에 연결해 공유 |
| SAN | 파이버 채널 스위치로 저장 전용 네트워크를 구성 |

## 헷갈리는 지점

- 신호를 재생하는 장비는 리피터다. 이 설명을 브라우터에 붙여 놓은 보기가 정답 자리에 온다.
- SAN은 초기 설치 비용이 크다. 비용을 절약할 수 있다는 서술은 오답이다.
- DAS는 중간에 네트워크 장비가 없어야 한다. 네트워크로 연결하면 NAS다.
- 브리지와 스위치는 둘 다 2계층이다. 라우터를 2계층으로 쓴 보기를 주의해야 한다.
- 루프 방지를 묻는 문항의 오답으로 디피-헬만과 해시 알고리즘이 붙는다. 답은 스패닝 트리다.

## 기출 패턴

장비 설명형은 브리지·스위치·라우터 셋을 정확히 쓰고 나머지 하나의 역할만 바꿔 둔다. 스토리지 문항은 설명 두 줄을 주고 DAS·NAS·SAN 중 고르게 하며 오답으로 NFC나 N-Screen 같은 무관한 약어를 넣는다. SAN 서술형은 장점 셋에 비용 관련 한 줄을 뒤집어 끼운다.

## 퀴즈
- q: 전송 중 약해진 신호를 원래 형태로 재생해 다시 보내는 장비는?
  choices: [브라우터, 리피터, 라우터, 게이트웨이]
  a: 2
  why: 신호 재생은 물리 계층 장비인 리피터의 역할이다. 브라우터는 브리지와 라우터를 겸한 장비라 신호 재생이 본래 기능이 아니다.
- q: 서로 다른 네트워크 대역의 호스트가 통신하게 해 주는 장비는?
  choices: [L2 스위치, 허브, 라우터, 리피터]
  a: 3
  why: 경로를 선택해 다른 대역을 잇는 것이 3계층 장비인 라우터다. L2 스위치는 같은 LAN 안에서만 프레임을 전달한다.
- q: 저장 장치를 호스트 버스 어댑터에 직접 연결하는 스토리지 방식은?
  choices: [DAS, NAS, SAN, NFC]
  a: 1
  why: 중간에 네트워크 장비 없이 직접 붙이는 방식이 DAS다. NAS는 네트워크를 통해 연결하므로 직접 연결이 아니다.

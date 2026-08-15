---
id: security-solutions
subject: 5
title: 보안 솔루션과 침입 탐지
tier: A
tags: [보안솔루션, 방화벽, ids, 오용탐지, 이상탐지, hids, nids, snort, vpn, dmz, screened-subnet]
keywords: [보안솔루션]
items: [q:2022-3:090, q:2022-2:088, q:2024-1:089]
updated: 2026-08-15
---

## 한 줄 정의

보안 솔루션은 침입을 막거나 탐지하려고 네트워크와 시스템에 두는 장치와 소프트웨어다.

## 왜 시험에 나오나

침입 탐지 시스템의 두 탐지 기법을 맞바꿔 놓은 문항이 반복된다. 솔루션 이름과 역할을 짝짓는 문항도 함께 나온다.

## 그림

<svg viewBox="0 0 360 140" role="img" aria-label="침입 탐지 시스템의 두 탐지 기법 비교">
  <rect x="8" y="14" width="164" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="90" y="38" text-anchor="middle" font-size="13" fill="currentColor">오용 탐지</text>
  <text x="90" y="60" text-anchor="middle" font-size="12" fill="currentColor">Signature · Knowledge</text>
  <text x="90" y="82" text-anchor="middle" font-size="12" fill="currentColor">알려진 공격 패턴</text>
  <rect x="188" y="14" width="164" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="270" y="38" text-anchor="middle" font-size="13" fill="currentColor">이상 탐지</text>
  <text x="270" y="60" text-anchor="middle" font-size="12" fill="currentColor">Behavior · Statistical</text>
  <text x="270" y="82" text-anchor="middle" font-size="12" fill="currentColor">평소와 다른 행위</text>
  <text x="180" y="126" text-anchor="middle" font-size="12" fill="currentColor">둘을 맞바꾼 보기가 반복된다</text>
</svg>

## 핵심

| 솔루션 | 역할 |
|---|---|
| 방화벽 | 정해진 규칙으로 통과 여부를 결정 |
| IDS 침입 탐지 시스템 | 침입 징후를 탐지하고 기록 |
| VPN 가상 사설망 | 공중망 위에 사설망을 구축 |
| DMZ | 외부에 서비스하는 서버를 두는 완충 구간 |

- 오용 탐지는 미리 입력한 공격 패턴을 찾는다. 새로운 공격에 약하다.
- 이상 탐지는 평소 상태와 다른 행위를 찾는다. 알려지지 않은 공격에 강하다.
- HIDS는 호스트의 계정과 작업 기록을 추적한다. NIDS는 네트워크를 본다. 대표 도구가 Snort다.
- 스크린드 서브넷은 외부망과 내부망 사이에 완충 통신망을 두는 방화벽 구축 유형이다.

## 헷갈리는 지점

- Signature Base와 Knowledge Base는 오용 탐지의 다른 이름이다. 이상 탐지의 설명으로 붙여 놓은 보기가 정답 자리에 온다.
- 방화벽 설정을 잘못 조작해 생기는 위협은 기술적 위협이다. 물리적 위협이 아닌 것을 묻는 문항의 정답이다.
- 화재와 홍수, 하드웨어 파손, 방화와 테러는 물리적 위협이다.
- IDS는 탐지가 목적이다. 차단을 IDS의 기본 기능처럼 서술한 보기는 조심해야 한다.
- VPN은 전용 회선을 새로 까는 것이 아니라 공중망을 빌려 쓰는 방식이다.

## 기출 패턴

IDS 문항은 HIDS·NIDS·DMZ 설명 셋을 참으로 두고 탐지 기법 한 줄만 뒤집는다. 솔루션 이름 문항은 설명을 주고 VPN이나 SAN 같은 약어를 고르게 하며 오답으로 철자가 비슷한 NAC, NIC를 깐다. 위협 분류 문항은 물리적 셋에 기술적 하나를 섞는다.

## 퀴즈
- q: 이미 알려진 공격 패턴을 입력해 두고 탐지하는 침입 탐지 기법은?
  choices: [이상 탐지, 오용 탐지, 통계 탐지, 행위 탐지]
  a: 2
  why: 알려진 패턴을 대조하는 것이 오용 탐지다. 이상 탐지는 평균적인 상태와 달라진 행위를 근거로 삼으므로 반대다.
- q: 공중망에 사설망을 구축해 전용망처럼 쓰는 보안 솔루션은?
  choices: [IDS, VPN, ZIGBEE, KDD]
  a: 2
  why: 가상 사설망이 VPN이다. IDS는 침입을 탐지할 뿐 통신 구간을 사설화하지 않는다.
- q: 물리적 위협으로 인한 문제에 해당하지 않는 것은?
  choices: [화재로 인한 위협, 하드웨어 고장, 기록 장치의 물리적 파괴, 방화벽 설정 오조작]
  a: 4
  why: 설정 오조작은 기술적 위협이다. 하드웨어 고장은 장비 자체가 망가지는 것이므로 물리적 위협에 들어간다.

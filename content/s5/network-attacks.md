---
id: network-attacks
subject: 5
title: 네트워크 공격 기법
tier: A
tags: [네트워크공격, dos, ddos, ping-of-death, smurfing, syn-flooding, land, teardrop, 세션하이재킹, switch-jamming]
keywords: [네트워크공격]
items: [q:2022-1:088, q:2022-3:084, q:2023-2:087, q:2022-2:090, q:2024-3:094]
updated: 2026-08-15
---

## 한 줄 정의

네트워크 공격은 프로토콜의 특성이나 취약점을 악용해 통신을 마비시키거나 세션을 가로채는 행위다.

## 왜 시험에 나오나

공격 이름과 수법을 1:1로 짝짓는 문항이 반복된다. 특히 서비스 거부 공격 네 가지의 설명을 섞어 놓고 틀린 것을 고르게 한다.

## 그림

<svg viewBox="0 0 360 130" role="img" aria-label="서비스 거부 공격의 네 가지 수법 구분">
  <rect x="8" y="12" width="164" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="90" y="30" text-anchor="middle" font-size="12" fill="currentColor">Ping of Death</text>
  <text x="90" y="48" text-anchor="middle" font-size="12" fill="currentColor">큰 ICMP 패킷</text>
  <rect x="188" y="12" width="164" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="270" y="30" text-anchor="middle" font-size="12" fill="currentColor">Smurf</text>
  <text x="270" y="48" text-anchor="middle" font-size="12" fill="currentColor">브로드캐스트 악용</text>
  <rect x="8" y="66" width="164" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="90" y="84" text-anchor="middle" font-size="12" fill="currentColor">SYN Flooding</text>
  <text x="90" y="102" text-anchor="middle" font-size="12" fill="currentColor">접속 공간 고갈</text>
  <rect x="188" y="66" width="164" height="44" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="270" y="84" text-anchor="middle" font-size="12" fill="currentColor">Land</text>
  <text x="270" y="102" text-anchor="middle" font-size="12" fill="currentColor">출발지 = 목적지 IP</text>
</svg>

## 핵심

| 공격 | 수법 |
|---|---|
| Ping of Death | 허용 범위를 넘는 ICMP 패킷을 조각내 보냄 |
| Smurfing | IP와 ICMP 특성을 악용해 한 사이트에 데이터를 집중 |
| SYN Flooding | 없는 클라이언트가 접속한 것처럼 속여 자리를 채움 |
| Land | 출발지와 목적지 IP를 같게 만들어 보냄 |
| Ping Flood | 대량의 ICMP 에코 요청으로 자원을 소진 |
| Switch Jamming | 위조 MAC 주소를 흘려 스위치를 더미 허브처럼 만듦 |
| 세션 하이재킹 | 인증된 세션을 가로채 권한을 도용 |

- 분산 서비스 거부 공격 도구로 Trin00, Tribe Flood Network, TFN2K, Stacheldraht가 있다.
- 세션 하이재킹 탐지 방법은 비동기화 상태 탐지, ACK Storm 탐지, 패킷 유실과 재전송 증가 탐지다.

## 헷갈리는 지점

- Smurf는 브로드캐스트를 악용한다. 멀티캐스트라고 쓴 보기가 정답 자리에 반복해서 온다.
- 세션 하이재킹 탐지에 FTP SYN SEGMENT 탐지는 없다. 나머지 셋만 실제 탐지 방법이다.
- ICMP를 쓰는 공격이 Ping of Death와 Smurfing 둘이다. 패킷 크기를 말하면 앞, 집중 전송을 말하면 뒤다.
- Land 공격의 단서는 주소를 같게 만든다는 서술 하나다.
- DDoS를 묻는 문항에 Nimda가 오답으로 붙는다. Nimda는 악성 코드 이름이다.

## 기출 패턴

서비스 거부 공격 문항은 넷을 나란히 설명하고 한 줄만 틀리게 둔다. 설명 하나를 주고 이름을 고르게 하는 방향도 같은 비중이다. 탐지 방법 문항은 실재하는 셋에 없는 이름 하나를 섞는다. 도구 이름을 묻는 문항에는 셸 접속 프로그램이나 교착 상태 같은 무관한 용어가 오답으로 깔린다.

## 퀴즈
- q: 출발지 IP와 목적지 IP를 같게 만들어 보내는 서비스 거부 공격은?
  choices: [Ping of Death, Smurf, SYN Flooding, Land]
  a: 4
  why: 주소를 동일하게 위조하는 것이 Land 공격이다. Smurf는 주소 위조를 쓰되 브로드캐스트로 응답을 몰아주는 방식이라 다르다.
- q: 세션 하이재킹 탐지 방법으로 거리가 먼 것은?
  choices: [FTP SYN SEGMENT 탐지, 비동기화 상태 탐지, ACK STORM 탐지, 패킷 유실 및 재전송 증가 탐지]
  a: 1
  why: 실제 탐지 방법은 비동기화, ACK Storm, 패킷 유실 셋이다. ACK Storm은 응답 비율이 급증하는 현상을 잡는 실재 기법이다.
- q: 분산 서비스 거부 공격에 쓰이는 도구는?
  choices: [Secure Shell, Tribe Flood Network, Nimda, Deadlock]
  a: 2
  why: Tribe Flood Network는 좀비 호스트에 설치하는 분산 공격 도구다. Nimda는 악성 코드라 공격 도구 분류에 들어가지 않는다.

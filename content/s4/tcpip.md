---
id: tcpip
subject: 4
title: TCP/IP 프로토콜
tier: S
tags: [TCPIP, TCP, UDP, IP, ICMP, ARP, RARP, 전송계층, 인터넷계층]
keywords: [TCPIP]
items: [q:2023-1:070, q:2022-1:067, q:2022-3:077]
updated: 2026-08-15
---

## 한 줄 정의
TCP/IP 는 인터넷 통신을 네 계층으로 나눈 프로토콜 묶음이며, 시험은 어떤 프로토콜이 어느 계층에서 무슨 일을 하는지를 묻는다.

## 왜 시험에 나오나
4과목 네트워크 파트의 최다 출제 소재다. 프로토콜 이름을 주고 계층을 고르거나, 기능 설명을 주고 프로토콜 이름을 고르게 한다.

## 그림
<svg viewBox="0 0 400 170" role="img" aria-label="TCP/IP 4계층과 각 계층의 대표 프로토콜">
  <rect x="20" y="12" width="360" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="110" y="34" text-anchor="middle" font-size="13" fill="currentColor">응용 계층</text>
  <text x="280" y="34" text-anchor="middle" font-size="12" fill="currentColor">HTTP FTP DNS SMTP</text>
  <rect x="20" y="50" width="360" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="110" y="72" text-anchor="middle" font-size="13" fill="currentColor">전송 계층</text>
  <text x="280" y="72" text-anchor="middle" font-size="12" fill="currentColor">TCP UDP</text>
  <rect x="20" y="88" width="360" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="110" y="110" text-anchor="middle" font-size="13" fill="currentColor">인터넷 계층</text>
  <text x="280" y="110" text-anchor="middle" font-size="12" fill="currentColor">IP ICMP ARP RARP</text>
  <rect x="20" y="126" width="360" height="34" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="110" y="148" text-anchor="middle" font-size="13" fill="currentColor">네트워크 접속</text>
  <text x="280" y="148" text-anchor="middle" font-size="12" fill="currentColor">Ethernet PPP</text>
</svg>

## 핵심
| 프로토콜 | 계층 | 하는 일 |
|---|---|---|
| TCP | 전송 | 연결형, 순서와 오류를 보장한다 |
| UDP | 전송 | 비연결형, 빠르지만 보장이 없다 |
| IP | 인터넷 | 주소를 붙여 패킷을 보낸다 |
| ICMP | 인터넷 | IP 전송 중 생긴 오류 정보를 알린다 |
| ARP | 인터넷 | 논리 주소를 물리 주소로 바꾼다 |
| RARP | 인터넷 | 물리 주소를 논리 주소로 바꾼다 |

## 헷갈리는 지점
- TCP 는 전송 계층이다. 보기에 세션 계층과 네트워크 계층이 함께 놓여 헷갈리게 한다.
- ARP 와 RARP 는 방향이 반대다. 논리 주소에서 물리 주소로 가는 쪽이 ARP 다. 앞 글자 R 하나로 답이 갈린다.
- 오류를 알리는 프로토콜은 ICMP 다. ECP 처럼 있을 법한 이름을 만들어 보기에 넣는다.
- TCP 는 연결을 맺고 보내며 UDP 는 맺지 않는다. 신뢰성을 UDP 쪽에 적어 놓은 보기가 나온다.
- 전송 계층은 데이터를 세그먼트로, 인터넷 계층은 패킷으로 다룬다. 프레임은 아래쪽 계층 단위다.

## 기출 패턴
특정 프로토콜의 계층을 곧바로 묻는 형태가 가장 많다. 기능을 서술한 뒤 프로토콜 이름을 고르게 하는 형태도 잦으며, 이때 오답 보기는 실제 존재하지 않는 약어인 경우가 많다. [[osi-7-layer]] 와 묶어 계층 대응을 묻기도 한다.

## 퀴즈
- q: TCP/IP 프로토콜에서 TCP 가 속하는 계층은?
  choices: [데이터 링크 계층, 인터넷 계층, 전송 계층, 세션 계층]
  a: 3
  why: TCP 는 종단 사이의 신뢰성 있는 전달을 맡는 전송 계층 프로토콜이다. 인터넷 계층에는 IP 가 있다.
- q: 논리 주소를 물리 주소로 변환하는 프로토콜은?
  choices: [TCP, ARP, RARP, FTP]
  a: 2
  why: ARP 가 IP 주소로 물리 주소를 찾는다. RARP 는 반대 방향이라 오답이다.
- q: IP 동작 중 발생한 오류 정보를 알리는 프로토콜은?
  choices: [ECP, ARP, ICMP, PPP]
  a: 3
  why: ICMP 가 도달 불가 등 오류 메시지를 보낸다. ECP 는 보기용으로 만들어진 이름이다.

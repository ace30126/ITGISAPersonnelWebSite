---
id: osi-7-layer
subject: 4
title: OSI 7계층
tier: A
tags: [OSI7계층, 물리계층, 데이터링크, 네트워크계층, 전송계층, 세션, 표현, 응용, HDLC, PPP]
keywords: [OSI7계층]
items: [q:2022-3:078, q:2022-1:063, q:2023-2:071]
updated: 2026-08-15
---

## 한 줄 정의
OSI 7계층은 통신 기능을 일곱 단계로 나눈 표준 참조 모형이다.

## 왜 시험에 나오나
계층 이름과 역할을 맞바꾼 보기가 회차마다 나온다. 특정 계층에 속하지 않는 프로토콜을 고르는 형태도 반복된다.

## 그림
<svg viewBox="0 0 400 250" role="img" aria-label="OSI 7계층의 이름과 각 계층에서 다루는 데이터 단위">
  <rect x="20" y="8" width="360" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="28" text-anchor="middle" font-size="13" fill="currentColor">7 응용</text>
  <text x="290" y="28" text-anchor="middle" font-size="12" fill="currentColor">HTTP FTP</text>
  <rect x="20" y="42" width="360" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="62" text-anchor="middle" font-size="13" fill="currentColor">6 표현</text>
  <text x="290" y="62" text-anchor="middle" font-size="12" fill="currentColor">암호화 압축</text>
  <rect x="20" y="76" width="360" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="96" text-anchor="middle" font-size="13" fill="currentColor">5 세션</text>
  <text x="290" y="96" text-anchor="middle" font-size="12" fill="currentColor">대화 관리</text>
  <rect x="20" y="110" width="360" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="130" text-anchor="middle" font-size="13" fill="currentColor">4 전송</text>
  <text x="290" y="130" text-anchor="middle" font-size="12" fill="currentColor">TCP UDP 세그먼트</text>
  <rect x="20" y="144" width="360" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="164" text-anchor="middle" font-size="13" fill="currentColor">3 네트워크</text>
  <text x="290" y="164" text-anchor="middle" font-size="12" fill="currentColor">IP 패킷 라우터</text>
  <rect x="20" y="178" width="360" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="198" text-anchor="middle" font-size="13" fill="currentColor">2 데이터링크</text>
  <text x="290" y="198" text-anchor="middle" font-size="12" fill="currentColor">HDLC PPP 프레임</text>
  <rect x="20" y="212" width="360" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="120" y="232" text-anchor="middle" font-size="13" fill="currentColor">1 물리</text>
  <text x="290" y="232" text-anchor="middle" font-size="12" fill="currentColor">비트 전송</text>
</svg>

## 핵심
| 계층 | 하는 일 | 단위 |
|---|---|---|
| 물리 | 전기 신호로 비트를 보낸다 | 비트 |
| 데이터 링크 | 이웃한 노드 사이에서 프레임을 주고받고 오류를 잡는다 | 프레임 |
| 네트워크 | 발신지에서 최종 목적지까지 경로를 정한다. 논리 주소를 붙인다 | 패킷 |
| 전송 | 종단 사이의 신뢰성과 흐름을 맡는다 | 세그먼트 |
| 세션 | 연결을 열고 닫으며 대화를 관리한다 | — |
| 표현 | 형식 변환, 암호화, 압축을 한다 | — |
| 응용 | 사용자에게 서비스를 제공한다 | — |

## 헷갈리는 지점
- 한 노드에서 다른 노드로 프레임을 보내는 책임은 데이터 링크 계층이다. 이 문장을 네트워크 계층 설명에 섞어 놓은 보기가 반복해서 정답이 된다.
- 네트워크 계층은 최종 목적지까지의 경로를 다룬다. 이웃 사이 전달과 구분해야 한다.
- HDLC, PPP, LLC 는 데이터 링크 계층이다. HTTP 를 이 목록에 끼워 넣는다. HTTP 는 응용 계층이다.
- 암호화와 압축은 표현 계층이다. 세션 계층은 연결 관리만 한다.
- OSI 는 7계층, [[tcpip]] 는 4계층이다. 계층 수를 섞어 묻기도 한다.

## 기출 패턴
특정 계층 설명 네 개 중 틀린 것을 고르게 하는 형태가 가장 많고, 틀린 문장은 대개 옆 계층의 역할을 가져온 것이다. 어떤 계층에 속하지 않는 프로토콜을 고르는 형태도 자주 나온다.

## 퀴즈
- q: 한 노드에서 이웃 노드로 프레임을 전송하는 책임을 지는 계층은?
  choices: [물리 계층, 데이터 링크 계층, 네트워크 계층, 전송 계층]
  a: 2
  why: 프레임 단위의 인접 노드 전달은 데이터 링크 계층의 일이다. 네트워크 계층은 최종 목적지까지의 경로를 맡는다.
- q: OSI 7계층 중 데이터 링크 계층의 프로토콜이 아닌 것은?
  choices: [HTTP, HDLC, PPP, LLC]
  a: 1
  why: HTTP 는 응용 계층 프로토콜이다. PPP 는 점대점 링크를 다루는 데이터 링크 계층 프로토콜이라 오답이다.
- q: 암호화와 압축, 형식 변환을 담당하는 계층은?
  choices: [세션 계층, 표현 계층, 응용 계층, 전송 계층]
  a: 2
  why: 표현 계층이 데이터의 형식을 바꾼다. 세션 계층은 연결을 열고 닫는 관리만 맡는다.

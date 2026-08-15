---
id: middleware
subject: 1
title: 미들웨어 솔루션의 유형
tier: A
tags: [미들웨어, RPC, MOM, TP모니터, ORB, WAS, DB미들웨어, 위치투명성]
keywords: [미들웨어]
items: [q:2024-3:004, q:2022-2:002, q:2024-1:002, s:20200822:005, s:20210307:005]
updated: 2026-08-15
---

## 한 줄 정의

미들웨어(Middleware)는 이기종 환경에서 응용 프로그램과 운영 환경 사이의 통신을 중계하는 소프트웨어이며, 표준 인터페이스로 시스템 간 데이터 교환의 일관성을 제공한다.

## 왜 시험에 나오나

유형 다섯 가지의 영문 약어와 역할을 짝짓는 문항이 반복된다. 미들웨어 일반의 성질을 묻는 부정형도 자주 나온다.

## 그림

<svg viewBox="0 0 360 150" role="img" aria-label="미들웨어의 위치와 주요 유형">
  <rect x="20" y="10" width="320" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="180" y="30" text-anchor="middle" font-size="13" fill="currentColor">응용 프로그램</text>
  <rect x="20" y="52" width="320" height="44" rx="5" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <text x="180" y="70" text-anchor="middle" font-size="13" fill="currentColor">미들웨어</text>
  <text x="180" y="88" text-anchor="middle" font-size="12" fill="currentColor" opacity="0.85">DB · RPC · MOM · TP 모니터 · ORB · WAS</text>
  <rect x="20" y="108" width="320" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="180" y="128" text-anchor="middle" font-size="13" fill="currentColor">운영체제 · 하드웨어 · 네트워크</text>
</svg>

## 핵심

| 유형 | 역할 |
|---|---|
| DB 미들웨어 | 데이터베이스와 애플리케이션을 연결 |
| RPC(Remote Procedure Call) | 원격 프로시저를 로컬 프로시저처럼 호출 |
| MOM(Message Oriented Middleware) | 메시지 큐로 비동기 메시지를 전달 |
| TP 모니터 | 트랜잭션이 올바르게 처리되는지 감시하고 제어 |
| ORB(Object Request Broker) | 객체 간 메시지 전달을 중계하는 객체지향 미들웨어 |
| WAS(Web Application Server) | 동적 콘텐츠를 처리하는 웹 환경 미들웨어 |

- 위치 투명성을 제공한다.
- 여러 컴포넌트를 일대일과 일대다와 다대다로 연결할 수 있다.

## 헷갈리는 지점

- 웹 서버는 미들웨어 솔루션에 들어가지 않는다. WAS와 이름이 비슷해 함께 보기로 나온다.
- 메시지 지향 미들웨어는 비동기 방식이다. 즉각적인 응답이 필요한 온라인 업무에 적합하다는 서술은 오답이다. 느리더라도 안정적인 응답이 필요한 경우에 쓴다.
- 사용자가 내부 동작을 쉽게 확인할 수 있어야 한다는 서술은 오답이다. 내부 동작은 사용자가 알 필요가 없다.
- 애플리케이션과 사용자 사이에서만 서비스를 제공한다는 서술도 오답이다. 클라이언트와 서버 사이 등 두 시스템 사이 어디에나 놓인다.
- 원격 프로시저 호출은 RPC, 객체 요청 중계는 ORB다. 두 약어를 맞바꾼 보기가 나온다.
- 트랜잭션 감시는 TP 모니터다. HUB나 RPC를 고르게 유도한다.

## 기출 패턴

정의 제시형이 기본이다. 역할 한 줄을 주고 약어 넷 중 하나를 고르게 하며 RPC와 TP 모니터가 가장 자주 나온다. 유형 문항은 미들웨어가 아닌 것 하나를 넣어 고르게 하고 웹 서버가 정답이 된다. 일반 성질을 묻는 부정형은 범위를 좁히거나 내부 동작 노출을 요구하는 서술을 정답 자리에 놓는다.

## 퀴즈
- q: 원격 프로시저를 로컬 프로시저처럼 호출하는 미들웨어는?
  choices: [WAS, MOM, RPC, ORB]
  a: 3
  why: 원격 호출을 지역 호출처럼 다루는 것이 RPC다. ORB는 객체 사이의 요청을 중계하는 미들웨어라 목적이 다르다.
- q: 미들웨어 솔루션의 유형에 포함되지 않는 것은?
  choices: [WAS, 웹 서버, RPC, ORB]
  a: 2
  why: 웹 서버는 정적 파일을 제공하는 소프트웨어라 미들웨어로 분류하지 않는다. WAS는 동적 콘텐츠를 처리하는 웹 미들웨어다.
- q: 메시지 지향 미들웨어에 대한 설명으로 옳지 않은 것은?
  choices: [비동기 방식으로 통신한다, 메시지 큐를 활용한다, 즉각적인 응답이 필요한 업무에 적합하다, 독립 애플리케이션을 하나로 묶는다]
  a: 3
  why: 즉각적인 응답보다 느리더라도 안정적인 전달이 필요한 경우에 쓴다. 메시지 큐 활용과 비동기 통신은 정의 그대로 맞는 서술이다.

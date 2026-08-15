---
id: software-architecture
subject: 1
title: 소프트웨어 아키텍처 패턴
tier: A
tags: [소프트웨어아키텍처, 파이프필터, 레이어, 계층구조, 클라이언트서버, MVC, 데이터중심, 품질속성]
keywords: [소프트웨어아키텍처]
items: [q:2022-3:014, q:2023-1:020, q:2022-2:020, s:20210515:008, s:20210515:012]
updated: 2026-08-15
---

## 한 줄 정의

소프트웨어 아키텍처는 외부에서 인식할 수 있는 특성이 담긴 소프트웨어의 골격이 되는 기본 구조이며, 파이프 필터와 계층과 클라이언트 서버와 모델 뷰 제어 등의 패턴으로 나뉜다.

## 왜 시험에 나오나

패턴의 이름과 구조 설명을 짝짓는 문항이 반복된다. 파이프 필터와 모델 뷰 제어가 출제의 대부분이다.

## 그림

<svg viewBox="0 0 360 160" role="img" aria-label="파이프 필터 구조와 모델 뷰 제어 구조">
  <text x="8" y="18" font-size="12" fill="currentColor" opacity="0.8">파이프 필터</text>
  <rect x="8" y="28" width="76" height="32" rx="4" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="46" y="49" text-anchor="middle" font-size="12" fill="currentColor">필터 1</text>
  <line x1="84" y1="44" x2="118" y2="44" stroke="currentColor" stroke-width="1.3"/>
  <polygon points="124,44 114,39 114,49" fill="currentColor"/>
  <rect x="126" y="28" width="76" height="32" rx="4" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="164" y="49" text-anchor="middle" font-size="12" fill="currentColor">필터 2</text>
  <line x1="202" y1="44" x2="236" y2="44" stroke="currentColor" stroke-width="1.3"/>
  <polygon points="242,44 232,39 232,49" fill="currentColor"/>
  <rect x="244" y="28" width="76" height="32" rx="4" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="282" y="49" text-anchor="middle" font-size="12" fill="currentColor">필터 3</text>
  <text x="8" y="94" font-size="12" fill="currentColor" opacity="0.8">모델 뷰 제어</text>
  <rect x="8" y="104" width="94" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="55" y="126" text-anchor="middle" font-size="12" fill="currentColor">모델 1개</text>
  <line x1="102" y1="114" x2="146" y2="114" stroke="currentColor" stroke-width="1.3"/>
  <line x1="102" y1="130" x2="146" y2="130" stroke="currentColor" stroke-width="1.3"/>
  <rect x="148" y="98" width="88" height="26" rx="4" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="192" y="116" text-anchor="middle" font-size="12" fill="currentColor">뷰 A</text>
  <rect x="148" y="128" width="88" height="26" rx="4" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="192" y="146" text-anchor="middle" font-size="12" fill="currentColor">뷰 B</text>
  <text x="248" y="126" font-size="12" fill="currentColor" opacity="0.8">뷰는 여럿</text>
</svg>

## 핵심

| 패턴 | 구조 |
|---|---|
| 파이프 필터 | 서브시스템이 입력을 처리해 결과를 다음 서브시스템으로 넘기는 과정을 반복 |
| 계층(Layers) | 시스템을 계층 단위로 나누고 계층 사이를 사용 가능 관계로 연결 |
| 클라이언트 서버 | 하나의 서버와 다수의 클라이언트 컴포넌트로 구성 |
| 모델 뷰 제어 | 서브시스템을 모델과 뷰와 제어 셋으로 구조화 |
| 데이터 중심 | 공유 데이터 저장소를 통해 접근자끼리 통신 |
| 마스터 슬레이브 | 마스터가 작업을 분배하고 슬레이브가 처리해 결과를 반환 |

- 뷰는 모델의 데이터를 화면에 보여 주고, 제어는 모델에 명령을 보내 상태를 바꾼다.
- 시스템 품질 속성에는 가용성, 변경 용이성, 성능, 보안성, 사용성, 시험 용이성이 있다.

## 헷갈리는 지점

- 파이프 필터는 계층 모델이 아니다. 계층 모델이라는 서술은 계층 패턴의 설명을 가져다 붙인 오답이다.
- 파이프 필터에서 필터 사이를 이동할 때 오버헤드가 발생한다. 오버헤드가 없다는 서술은 오답이다.
- 모델 하나에 뷰를 여러 개 둘 수 있다. 뷰마다 모델이 하나씩 연결된다는 서술이 반복 출제되는 오답이다.
- 모델은 전달자가 아니라 핵심 기능과 데이터를 보관하는 쪽이다.
- 독립성(Isolation)은 시스템 품질 속성이 아니다. 트랜잭션의 성질 이름을 가져와 섞은 보기다.
- 마스터 슬레이브에서 슬레이브도 데이터 수집 기능을 수행할 수 있다. 수행할 수 없다는 서술은 오답이다.

## 기출 패턴

패턴 문항은 구조 설명 한 줄을 주고 이름을 고르게 하며 파이프 필터가 가장 자주 나온다. 모델 뷰 제어는 네 보기 중 모델의 역할을 뒤집은 하나가 정답인 형태로 굳어 있다. 아키텍처 전반 문항은 파이프 필터의 흐름 방향과 오버헤드를 건드린다. 품질 속성 문항은 없는 이름 하나를 넣는다.

## 퀴즈
- q: 서브시스템이 입력 데이터를 처리해 결과를 다음 서브시스템으로 넘기는 구조는?
  choices: [클라이언트 서버 구조, 계층 구조, 모델 뷰 제어 구조, 파이프 필터 구조]
  a: 4
  why: 데이터가 필터를 거쳐 변환되며 흐르는 것이 파이프 필터다. 계층 구조는 상하 계층 사이의 사용 관계로 구성되므로 데이터 변환의 연쇄와 다르다.
- q: 모델 뷰 제어 구조에 대한 설명으로 옳지 않은 것은?
  choices: [뷰는 모델의 데이터를 화면에 보인다, 제어는 모델의 상태를 변경할 수 있다, 뷰마다 모델이 하나씩 연결된다, 사용자 인터페이스 계층의 응집도를 높인다]
  a: 3
  why: 한 모델에 여러 뷰를 붙일 수 있다. 제어가 모델에 명령을 보내 상태를 바꾼다는 서술은 정의 그대로 맞다.
- q: 소프트웨어 아키텍처의 시스템 품질 속성이 아닌 것은?
  choices: [가용성, 독립성, 변경 용이성, 사용성]
  a: 2
  why: 품질 속성은 가용성과 변경 용이성과 성능과 보안성과 사용성과 시험 용이성이다. 독립성은 트랜잭션의 성질에서 가져온 이름이라 여기에 속하지 않는다.

---
id: configuration-management
subject: 2
title: 형상 관리와 버전 관리
tier: S
tags: [형상관리, 형상식별, 형상통제, 형상감사, 기준선, 버전관리, rcs, 체크인, 체크아웃, 커밋]
keywords: [형상관리]
items: [q:2023-3:033, q:2023-1:029, q:2022-2:029, q:2022-2:024, q:2025-2:033]
updated: 2026-08-15
---

## 한 줄 정의

형상 관리(Configuration Management)는 소프트웨어 개발 과정에서 생기는 변경 사항을 식별하고 통제하기 위한 일련의 활동이다.

## 왜 시험에 나오나

2과목 최다 출제군이다. 절차 네 단계, 관리 항목에 들어가지 않는 것, 버전 관리 용어 세 각도가 고정돼 있다.

## 그림

<svg viewBox="0 0 380 130" role="img" aria-label="형상 식별 통제 감사 기록으로 이어지는 형상 관리 절차">
  <rect x="8" y="30" width="80" height="34" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="48" y="52" text-anchor="middle" font-size="13" fill="currentColor">형상 식별</text>
  <line x1="88" y1="47" x2="106" y2="47" stroke="currentColor" stroke-width="1.2"/>
  <rect x="106" y="30" width="80" height="34" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="146" y="52" text-anchor="middle" font-size="13" fill="currentColor">형상 통제</text>
  <line x1="186" y1="47" x2="204" y2="47" stroke="currentColor" stroke-width="1.2"/>
  <rect x="204" y="30" width="80" height="34" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="244" y="52" text-anchor="middle" font-size="13" fill="currentColor">형상 감사</text>
  <line x1="284" y1="47" x2="302" y2="47" stroke="currentColor" stroke-width="1.2"/>
  <rect x="292" y="30" width="80" height="34" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="332" y="52" text-anchor="middle" font-size="13" fill="currentColor">형상 기록</text>
  <text x="8" y="88" font-size="12" fill="currentColor">식별=대상을 정한다 · 통제=변경 요구를 검토해 기준선에 반영</text>
  <text x="8" y="110" font-size="12" fill="currentColor">감사=제대로 됐는지 살핀다 · 기록=결과를 남긴다</text>
</svg>

## 핵심

| 버전 관리 용어 | 뜻 |
|---|---|
| 저장소 | 최신 버전 파일과 변경 내역이 모여 있는 곳 |
| 체크아웃 | 수정하려고 저장소에서 파일을 받아 온다 |
| 체크인 | 수정을 마친 파일로 저장소를 새 버전으로 갱신한다 |
| 커밋 | 체크인할 때 충돌을 확인하고 갱신을 완료한다 |

- 관리 항목은 요구 분석서, 설계서, 소스 코드, 운영 및 설치 지침서, 테스트 케이스, 프로젝트 계획이다.
- 형상 관리는 가시성과 추적성을 보장해 이전 버전 정보에 접근하게 하고 여러 개발자의 동시 개발을 가능하게 한다.
- RCS(Revision Control System)는 파일 잠금 방식으로 한 번에 한 사람만 수정하게 한다.

## 헷갈리는 지점

- 프로젝트 개발 비용은 형상 관리의 항목도 역할도 아니다. 항목 문항과 역할 문항 양쪽에서 같은 보기가 정답으로 쓰인다.
- 형상 통제는 변경 요구를 즉시 수용하는 단계가 아니다. 검토하고 승인해 기준선에 반영한다.
- 형상 관리를 위해 구성된 팀을 chief programmer team이라 부른다는 서술은 오답이다. 그것은 책임 프로그래머 중심의 개발 팀이다.
- 체크아웃은 받아 오는 것, 체크인은 올리는 것이다. 두 방향을 맞바꾼 보기가 나온다.
- 소프트웨어 패키징은 개발자가 아니라 사용자 중심으로 진행한다.

## 기출 패턴

절차 문항은 식별·감사·기록의 설명을 맞게 두고 통제 설명 하나만 뒤집는다. 항목 문항은 산출물 셋에 개발 비용을 섞어 포함되지 않는 것을 고르게 한다. 용어 문항은 저장소 갱신이라는 한 줄 설명을 주고 체크인을 고르게 하며, 오답으로 롤백과 형상 감사를 깐다.

## 퀴즈
- q: 형상 관리의 관리 항목에 포함되지 않는 것은?
  choices: [프로젝트 요구 분석서, 소스 코드, 운영 및 설치 지침서, 프로젝트 개발 비용]
  a: 4
  why: 형상 관리는 산출물의 변경을 추적하는 활동이라 비용은 대상이 아니다. 운영 및 설치 지침서는 배포와 함께 버전이 바뀌므로 관리 항목에 들어간다.
- q: 저장소의 파일을 새로운 버전으로 갱신하는 것을 뜻하는 용어는?
  choices: [형상 감사, 롤백, 체크아웃, 체크인]
  a: 4
  why: 수정을 마치고 저장소를 갱신하는 것이 체크인이다. 체크아웃은 반대로 수정하려고 저장소에서 파일을 받아 오는 동작이다.
- q: 형상 관리 절차에 대한 설명으로 틀린 것은?
  choices: [형상 식별은 관리 대상을 구분하는 과정이다, 형상 통제는 변경 요구를 즉시 수용해 반영한다, 형상 감사는 변경이 요구에 맞게 됐는지 살핀다, 형상 관리는 가시성과 추적성을 보장한다]
  a: 2
  why: 형상 통제는 변경 요구를 검토하고 승인한 뒤 기준선에 반영한다. 즉시 수용하면 통제라는 단계 자체가 성립하지 않는다.

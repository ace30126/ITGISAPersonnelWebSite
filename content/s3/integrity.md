---
id: db-integrity
subject: 3
title: 무결성 제약 조건
tier: A
tags: [무결성, 개체무결성, 참조무결성, 도메인무결성, cascade, 트리거, 시스템카탈로그]
keywords: [무결성]
items: [q:2023-1:048, q:2022-2:058, q:2025-2:051, q:2024-1:041, q:2025-2:043]
updated: 2026-08-15
---

## 한 줄 정의

무결성(Integrity) 제약 조건은 데이터베이스에 저장된 값이 언제나 정확하고 일관되도록 강제하는 규칙이다.

## 왜 시험에 나오나

개체 무결성과 참조 무결성 둘을 구분시키는 문항이 3과목에 반복된다. 설명 한 줄을 주고 이름을 고르게 하는 형태라 정의만 정확하면 바로 풀린다.

## 그림

<svg viewBox="0 0 380 150" role="img" aria-label="개체 무결성과 참조 무결성">
  <rect x="8" y="24" width="150" height="60" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="83" y="46" text-anchor="middle" font-size="13" fill="currentColor">부모 릴레이션</text>
  <text x="83" y="68" text-anchor="middle" font-size="13" fill="currentColor">기본키</text>
  <rect x="222" y="24" width="150" height="60" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="297" y="46" text-anchor="middle" font-size="13" fill="currentColor">자식 릴레이션</text>
  <text x="297" y="68" text-anchor="middle" font-size="13" fill="currentColor">외래키</text>
  <line x1="222" y1="60" x2="158" y2="60" stroke="currentColor" stroke-width="1.4"/>
  <text x="190" y="52" text-anchor="middle" font-size="12" fill="currentColor">참조</text>
  <text x="8" y="110" font-size="12" fill="currentColor">개체 무결성: 기본키는 널이 아니고 중복되지 않는다</text>
  <text x="8" y="132" font-size="12" fill="currentColor">참조 무결성: 외래키는 널이거나 부모의 기본키 값이다</text>
</svg>

## 핵심

| 종류 | 규칙 |
|---|---|
| 개체 무결성 | 기본키는 널이 될 수 없고 중복될 수 없다 |
| 참조 무결성 | 외래키는 널이거나 참조하는 기본키에 실제로 존재하는 값이어야 한다 |
| 도메인 무결성 | 속성값은 정의된 도메인에 속한 값이어야 한다 |

- 참조 무결성을 지키기 위해 부모 행을 지울 때 자식 행까지 함께 지우는 옵션이 CASCADE 다.
- 트리거(Trigger)는 삽입·갱신·삭제 이벤트가 일어날 때 자동으로 실행되는 절차형 SQL 이다. 무결성 유지에 쓰인다.
- 시스템 카탈로그는 데이터베이스 객체의 정의를 담은 시스템 테이블 집합이다. 데이터 사전이라고도 하고 그 내용을 메타 데이터라 한다.

## 헷갈리는 지점

- 기본키 얘기가 나오면 개체 무결성, 외래키 얘기가 나오면 참조 무결성이다. 도메인 무결성은 값의 범위 얘기다.
- 시스템 카탈로그는 사용자가 조회는 할 수 있지만 갱신 명령으로 직접 고칠 수 없다. 갱신은 시스템이 자동으로 한다. 조회조차 못 한다는 서술도, 사용자가 직접 갱신해야 한다는 서술도 모두 오답이다.
- 트리거는 이벤트에 반응해 자동으로 도는 것이지 사용자가 매번 호출하는 것이 아니다. 잠금(Lock)이나 롤백과 섞인 보기가 함께 나온다.
- CASCADE 의 짝은 RESTRICTED 와 SET NULL 이다. CLUSTER 는 무결성 옵션이 아니라 저장 방식이라 오답으로 깔린다.

## 기출 패턴

"기본키 값이 널이 아닌 원자값을 갖는 성질"이라는 문장이 나오면 답은 개체 무결성이다. 외래키를 바꿀 때 참조되는 쪽도 함께 맞춰야 한다는 서술이면 참조 무결성이다. 옵션 문항은 부모 행 삭제 시 자식 행을 자동 삭제하는 키워드를 넷 중에서 고르게 한다.

## 퀴즈
- q: 기본키가 널 값을 가질 수 없고 중복될 수 없다는 제약 조건은?
  choices: [개체 무결성, 참조 무결성, 도메인 무결성, 사용자 정의 무결성]
  a: 1
  why: 기본키에 걸리는 규칙이 개체 무결성이다. 참조 무결성은 외래키가 부모의 기본키 값과 맞아야 한다는 규칙이라 대상이 다르다.
- q: 부모 릴레이션의 행을 삭제할 때 자식 릴레이션의 관련 행도 자동 삭제하는 옵션은?
  choices: [CLUSTER, CASCADE, SET NULL, RESTRICTED]
  a: 2
  why: 연쇄 삭제가 CASCADE 다. RESTRICTED 는 참조가 남아 있으면 삭제를 막는 반대 방향의 옵션이다.
- q: 시스템 카탈로그에 대한 설명으로 옳지 않은 것은?
  choices: [데이터 사전이라고도 한다, 저장된 정보를 메타 데이터라 한다, 무결성 유지를 위해 사용자가 직접 갱신한다, 뷰와 인덱스 정보를 저장한다]
  a: 3
  why: 카탈로그의 갱신은 시스템이 자동으로 수행한다. 사용자는 조회만 할 수 있으므로 직접 갱신한다는 서술이 틀렸다.

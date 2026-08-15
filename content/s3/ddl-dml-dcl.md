---
id: db-ddl-dml-dcl
subject: 3
title: DDL DML DCL 분류
tier: A
tags: [ddl, dml, dcl, create, alter, drop, select, insert, update, delete, grant, revoke, commit, rollback]
keywords: [DDL DML DCL]
items: [q:2022-2:052, q:2023-1:056, q:2024-1:043, q:2022-2:047, q:2025-1:041]
updated: 2026-08-15
---

## 한 줄 정의

SQL 명령어는 쓰임에 따라 구조를 정의하는 DDL, 데이터를 다루는 DML, 권한과 트랜잭션을 통제하는 DCL 로 나뉜다.

## 왜 시험에 나오나

명령어 넷을 늘어놓고 성격이 다른 하나를 고르라는 문항이 3과목에 거의 매 회차 나온다. 암기만으로 맞힐 수 있는 구간이라 실점하면 손해가 크다.

## 그림

<svg viewBox="0 0 380 130" role="img" aria-label="SQL 명령어의 세 가지 분류">
  <rect x="6" y="16" width="116" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="64" y="36" text-anchor="middle" font-size="13" fill="currentColor">DDL 정의</text>
  <text x="64" y="58" text-anchor="middle" font-size="12" fill="currentColor">CREATE</text>
  <text x="64" y="76" text-anchor="middle" font-size="12" fill="currentColor">ALTER</text>
  <text x="64" y="94" text-anchor="middle" font-size="12" fill="currentColor">DROP</text>
  <rect x="132" y="16" width="116" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="190" y="36" text-anchor="middle" font-size="13" fill="currentColor">DML 조작</text>
  <text x="190" y="58" text-anchor="middle" font-size="12" fill="currentColor">SELECT INSERT</text>
  <text x="190" y="76" text-anchor="middle" font-size="12" fill="currentColor">UPDATE</text>
  <text x="190" y="94" text-anchor="middle" font-size="12" fill="currentColor">DELETE</text>
  <rect x="258" y="16" width="116" height="86" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="316" y="36" text-anchor="middle" font-size="13" fill="currentColor">DCL 제어</text>
  <text x="316" y="58" text-anchor="middle" font-size="12" fill="currentColor">GRANT REVOKE</text>
  <text x="316" y="76" text-anchor="middle" font-size="12" fill="currentColor">COMMIT</text>
  <text x="316" y="94" text-anchor="middle" font-size="12" fill="currentColor">ROLLBACK</text>
</svg>

## 핵심

| 분류 | 명령어 | 대상 |
|---|---|---|
| DDL | CREATE, ALTER, DROP | 스키마, 도메인, 테이블, 뷰, 인덱스 |
| DML | SELECT, INSERT, UPDATE, DELETE | 저장된 데이터 |
| DCL | GRANT, REVOKE, COMMIT, ROLLBACK | 권한, 무결성, 병행 수행 |

- GRANT 는 권한 부여, REVOKE 는 권한 회수다.
- COMMIT 은 결과 확정, ROLLBACK 은 원래 상태로 복구다.
- DCL 의 기능은 보안, 무결성 유지, 병행 수행 제어, 회복이다.

## 헷갈리는 지점

- DELETE 는 DML 이고 DROP 은 DDL 이다. 이름이 비슷해 같은 분류로 묶으면 틀린다. 데이터를 지우면 DML, 구조를 지우면 DDL 이다.
- UPDATE 는 DML 이다. DDL 목록에 끼워 넣은 보기가 오답으로 자주 쓰인다.
- SELECT 는 DML 이다. CREATE·ALTER·DROP 사이에 섞어 놓고 성격이 다른 하나를 고르게 한다.
- 데이터 구조를 정의하는 것은 DDL 의 몫이다. DCL 의 기능을 묻는 문항에서 "논리적·물리적 데이터 구조 정의"가 정답 자리로 나온다.
- REVOKE 는 권한을 거둬들이는 명령이다. 열 이름을 바꾸는 기능은 없다.

## 기출 패턴

셋 중 성격이 다른 하나를 고르는 문항이 가장 잦고, GRANT 나 SELECT 가 답이 된다. DML 만으로 나열된 보기를 고르라는 문항은 GRANT 나 DROP 이 한 개 섞여 있는지로 갈린다. 기능 설명 문항은 GRANT·REVOKE·COMMIT·ROLLBACK 의 설명을 서로 뒤바꿔 놓는다.

## 퀴즈
- q: 다음 중 성격이 나머지와 다른 명령어는?
  choices: [SELECT, UPDATE, INSERT, GRANT]
  a: 4
  why: 앞의 셋은 데이터를 다루는 DML 이고 GRANT 만 권한을 다루는 DCL 이다. DELETE 가 아니라 GRANT 가 답이라는 점이 갈림길이다.
- q: DDL 에 해당하지 않는 것은?
  choices: [UPDATE, ALTER, DROP, CREATE]
  a: 1
  why: UPDATE 는 저장된 데이터를 바꾸는 DML 이다. DROP 은 이름이 비슷하지만 구조를 제거하므로 DDL 이다.
- q: DCL 의 기능으로 볼 수 없는 것은?
  choices: [데이터 보안, 데이터 구조 정의, 무결성 유지, 병행 수행 제어]
  a: 2
  why: 구조 정의는 DDL 의 몫이다. 보안·무결성·병행 수행 제어는 모두 DCL 이 담당하는 기능이다.

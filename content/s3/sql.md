---
id: db-sql
subject: 3
title: SQL 기본과 SELECT 문
tier: S
tags: [sql, select, where, having, group by, order by, distinct, delete, truncate, null, 하위질의]
keywords: [SQL]
items: [q:2022-1:042, q:2023-3:043, q:2025-1:057, q:2022-3:054, q:2023-1:058]
updated: 2026-08-15
---

## 한 줄 정의

SQL(Structured Query Language)은 관계형 데이터베이스에 정의·조작·제어 명령을 내리는 표준 질의어다.

## 왜 시험에 나오나

3과목 문항의 5분의 1 가까이가 SQL이다. 각 절을 어디에 쓰는지, 결과 튜플이 몇 개인지, 비슷한 명령어의 차이가 무엇인지 세 각도로 반복된다.

## 그림

<svg viewBox="0 0 380 150" role="img" aria-label="SELECT 문의 절 처리 순서">
  <rect x="6" y="14" width="78" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="45" y="33" text-anchor="middle" font-size="13" fill="currentColor">FROM</text>
  <rect x="102" y="14" width="78" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="141" y="33" text-anchor="middle" font-size="13" fill="currentColor">WHERE</text>
  <rect x="198" y="14" width="96" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="246" y="33" text-anchor="middle" font-size="13" fill="currentColor">GROUP BY</text>
  <line x1="84" y1="29" x2="102" y2="29" stroke="currentColor" stroke-width="1.2"/>
  <line x1="180" y1="29" x2="198" y2="29" stroke="currentColor" stroke-width="1.2"/>
  <line x1="294" y1="29" x2="330" y2="29" stroke="currentColor" stroke-width="1.2"/>
  <line x1="330" y1="29" x2="330" y2="76" stroke="currentColor" stroke-width="1.2"/>
  <line x1="330" y1="76" x2="294" y2="76" stroke="currentColor" stroke-width="1.2"/>
  <rect x="198" y="61" width="96" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="246" y="80" text-anchor="middle" font-size="13" fill="currentColor">HAVING</text>
  <rect x="102" y="61" width="78" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="141" y="80" text-anchor="middle" font-size="13" fill="currentColor">SELECT</text>
  <rect x="6" y="61" width="78" height="30" rx="5" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="45" y="80" text-anchor="middle" font-size="12" fill="currentColor">ORDER BY</text>
  <line x1="198" y1="76" x2="180" y2="76" stroke="currentColor" stroke-width="1.2"/>
  <line x1="102" y1="76" x2="84" y2="76" stroke="currentColor" stroke-width="1.2"/>
  <text x="6" y="118" font-size="12" fill="currentColor">HAVING 은 GROUP BY 뒤에만 온다</text>
  <text x="6" y="136" font-size="12" fill="currentColor">WHERE 는 행 조건, HAVING 은 그룹 조건</text>
</svg>

## 핵심

| 절 | 역할 |
|---|---|
| SELECT | 출력할 속성. DISTINCT 로 중복 제거 |
| FROM | 대상 릴레이션 |
| WHERE | 행 단위 조건 |
| GROUP BY | 그룹 묶기 |
| HAVING | 그룹 단위 조건 |
| ORDER BY | 정렬. ASC 오름차순, DESC 내림차순 |

- BETWEEN a AND b 는 양 끝값을 포함한다.
- 널 비교는 IS NULL, IS NOT NULL 로만 한다.
- 하위 질의는 괄호 안에 SELECT 속성 FROM 릴레이션 WHERE 조건 형태를 통째로 넣는다.
- 집계 함수는 COUNT, SUM, AVG, MAX, MIN 이다.
- UNION 은 두 결과를 합치며 중복을 제거하고, UNION ALL 은 중복을 남긴다.
- JOIN 은 여러 릴레이션의 레코드를 공통 값으로 조합한다.

## 헷갈리는 지점

- 조건절 없는 DELETE 는 행만 비운다. 릴레이션 자체는 남으므로 DROP TABLE 과 같은 효과라는 서술은 오답이다.
- TRUNCATE 는 구조를 남기고 데이터를 지운다는 점은 DELETE 와 같지만 ROLLBACK 으로 되살릴 수 없다.
- HAVING 은 GROUP BY 절에서만 쓴다. WHERE 나 ORDER BY 에 붙일 수 없다.
- DISTINCT 가 없으면 결과 튜플 수는 원본 행 수 그대로다. 값이 중복돼도 줄지 않는다.
- 널은 등호나 부등호로 비교되지 않는다.
- UNION 과 UNION ALL 은 결과 행 수가 다르다. 중복을 지우는 쪽이 UNION 이다.

## 기출 패턴

결과 튜플 수 문항은 같은 질의를 DISTINCT 유무로 나란히 주고 두 숫자를 함께 고르게 한다. 명령어 문항은 DELETE·DROP·TRUNCATE 나 GRANT·REVOKE 를 섞어 하나만 틀린 서술로 만든다. 빈칸 채우기 문항은 조건에 맞는 하위 질의나 정렬 방향을 고르는 형태로 나온다.

## 퀴즈
- q: 그룹으로 묶은 결과에 조건을 걸 때 쓰는 절은?
  choices: [WHERE, HAVING, ORDER BY, DISTINCT]
  a: 2
  why: 그룹 단위 조건은 HAVING 이고 GROUP BY 와 함께 쓴다. WHERE 는 그룹을 만들기 전 행 단위 조건이라 그룹 함수 결과에 조건을 걸 수 없다.
- q: 전화번호가 널이 아닌 행을 고르는 조건으로 옳은 것은?
  choices: [전화번호 <> NULL, 전화번호 != NOT NULL, 전화번호 IS NOT NULL, 전화번호 NOT NULL]
  a: 3
  why: 널은 값이 아니라 상태라서 IS NULL, IS NOT NULL 로만 판정한다. 부등호 비교는 참도 거짓도 아닌 결과가 되어 행이 걸리지 않는다.
- q: TRUNCATE 에 대한 설명으로 옳지 않은 것은?
  choices: [테이블의 모든 데이터를 삭제한다, 테이블 스키마는 유지된다, DELETE 보다 빠르게 제거한다, ROLLBACK 으로 되살릴 수 있다]
  a: 4
  why: TRUNCATE 는 되돌릴 수 없다는 점이 DELETE 와 갈리는 지점이다. 스키마가 남는다는 점은 DROP 과 갈리는 지점이라 옳은 서술이다.

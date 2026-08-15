---
id: db-relational-algebra
subject: 3
title: 관계 대수와 관계 해석
tier: A
tags: [관계대수, 관계해석, select, project, join, division, 카티션프로덕트, 순수관계연산자, 절차적]
keywords: [관계대수]
items: [q:2024-1:044, q:2023-3:054, q:2022-1:046, q:2024-3:050, q:2024-3:054]
updated: 2026-08-15
---

## 한 줄 정의

관계 대수는 릴레이션을 조작하는 연산의 집합으로, 원하는 결과를 얻기 위한 연산 순서를 명시하는 절차적 언어다.

## 왜 시험에 나오나

순수 관계 연산자에 무엇이 속하는지 묻는 문항이 3과목에 반복된다. 관계 대수와 관계 해석의 절차적·비절차적 구분도 매번 오답 자리로 쓰인다.

## 그림

<svg viewBox="0 0 380 140" role="img" aria-label="순수 관계 연산자와 일반 집합 연산자">
  <rect x="6" y="16" width="176" height="110" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="94" y="38" text-anchor="middle" font-size="13" fill="currentColor">순수 관계 연산자</text>
  <text x="94" y="60" text-anchor="middle" font-size="12" fill="currentColor">Select 행 선택</text>
  <text x="94" y="80" text-anchor="middle" font-size="12" fill="currentColor">Project 열 선택</text>
  <text x="94" y="100" text-anchor="middle" font-size="12" fill="currentColor">Join 결합</text>
  <text x="94" y="120" text-anchor="middle" font-size="12" fill="currentColor">Division 나누기</text>
  <rect x="198" y="16" width="176" height="110" rx="6" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <text x="286" y="38" text-anchor="middle" font-size="13" fill="currentColor">일반 집합 연산자</text>
  <text x="286" y="60" text-anchor="middle" font-size="12" fill="currentColor">합집합 Union</text>
  <text x="286" y="80" text-anchor="middle" font-size="12" fill="currentColor">교집합 Intersection</text>
  <text x="286" y="100" text-anchor="middle" font-size="12" fill="currentColor">차집합 Difference</text>
  <text x="286" y="120" text-anchor="middle" font-size="12" fill="currentColor">카티션 프로덕트</text>
</svg>

## 핵심

| 연산 | 하는 일 |
|---|---|
| Select | 조건에 맞는 행을 고른다. 수평적 부분집합 |
| Project | 지정한 열을 고른다. 수직적 부분집합 |
| Join | 공통 속성으로 두 릴레이션을 합친다 |
| Division | 두 번째 릴레이션의 모든 값과 짝지어진 행을 남긴다 |

- 관계 대수는 절차적, 관계 해석은 비절차적이다. 관계 해석은 수학의 프레디킷 해석에 기반을 둔다.
- 관계 해석의 정량자는 전칭 정량자와 존재 정량자 둘이다. "모든 것에 대하여"는 전칭 정량자다.
- 카티션 프로덕트 결과의 차수는 두 차수의 합, 카디널리티는 두 카디널리티의 곱이다.

## 헷갈리는 지점

- 카티션 프로덕트는 일반 집합 연산자다. 순수 관계 연산자가 아닌 것을 고르는 문항에서 답이 된다.
- 차집합도 일반 집합 연산자다. Project·Join·Division 사이에 끼워 넣은 보기가 정답 자리로 쓰인다.
- 절차적인 쪽은 관계 대수다. 관계 대수를 비절차적 언어라고 서술하면 오답이다.
- 프레디킷 해석에 기반을 둔 쪽은 관계 해석이다. 이를 관계 대수로 바꿔 놓은 서술이 오답으로 나온다.
- Select 는 행, Project 는 열이다. SQL 의 SELECT 절이 열을 고르는 것과 방향이 반대라 뒤집기 쉽다.

## 기출 패턴

"순수 관계 연산자가 아닌 것"을 묻는 형태가 가장 잦고 카티션 프로덕트나 차집합이 답이다. 기호와 연산을 짝짓는 문항은 그리스 문자 시그마를 주고 Select 를 고르게 한다. 계산 문항은 두 릴레이션의 차수와 카디널리티를 주고 카티션 프로덕트 결과를 숫자쌍으로 묻는다.

## 퀴즈
- q: 순수 관계 연산자에 해당하지 않는 것은?
  choices: [Select, Project, Division, Cartesian Product]
  a: 4
  why: 카티션 프로덕트는 일반 집합 연산자다. Division 은 이름이 낯설지만 순수 관계 연산자 넷 중 하나다.
- q: 관계 대수에 대한 설명으로 옳은 것은?
  choices: [원하는 정보가 무엇인지만 기술하는 비절차적 언어다, 연산의 순서를 명시하는 절차적 언어다, 프레디킷 해석에 기반을 둔다, 피연산자는 릴레이션이지만 결과는 값이다]
  a: 2
  why: 관계 대수는 절차적이고 피연산자와 결과가 모두 릴레이션이다. 비절차적이며 프레디킷 해석에 기반을 둔 쪽은 관계 해석이다.
- q: 차수 4, 카디널리티 5인 릴레이션과 차수 6, 카디널리티 7인 릴레이션을 카티션 프로덕트한 결과는?
  choices: [차수 24 카디널리티 35, 차수 10 카디널리티 35, 차수 10 카디널리티 12, 차수 24 카디널리티 12]
  a: 2
  why: 차수는 더하고 카디널리티는 곱한다. 둘 다 곱해 24와 35로 답하면 틀린다.

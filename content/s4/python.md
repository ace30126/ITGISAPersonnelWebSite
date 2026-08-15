---
id: python
subject: 4
title: 파이썬 자료형과 슬라이싱
tier: S
tags: [파이썬, python, 슬라이싱, 리스트, 튜플, 딕셔너리, elif, map, 스크립트언어]
keywords: [파이썬]
items: [q:2024-3:074, q:2022-2:070, q:2022-3:065, q:2022-2:065]
updated: 2026-08-15
---

## 한 줄 정의
파이썬 문항은 자료형의 성질과 슬라이싱 규칙을 알면 코드를 실행하지 않고도 출력을 적을 수 있다.

## 왜 시험에 나오나
4과목 코드 문항의 한 축이다. 슬라이싱 결과, 자료형 구분, 입력 처리, 스크립트 언어 판별이 돌아가며 나온다.

## 그림
<svg viewBox="0 0 400 120" role="img" aria-label="문자열의 양수 인덱스와 음수 인덱스를 위아래로 나란히 보여 주는 그림">
  <text x="30" y="26" text-anchor="middle" font-size="12" fill="currentColor">0</text>
  <text x="82" y="26" text-anchor="middle" font-size="12" fill="currentColor">1</text>
  <text x="134" y="26" text-anchor="middle" font-size="12" fill="currentColor">2</text>
  <text x="186" y="26" text-anchor="middle" font-size="12" fill="currentColor">3</text>
  <text x="238" y="26" text-anchor="middle" font-size="12" fill="currentColor">4</text>
  <rect x="6" y="34" width="48" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="58" y="34" width="48" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="110" y="34" width="48" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="162" y="34" width="48" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="214" y="34" width="48" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="30" y="57" text-anchor="middle" font-size="14" fill="currentColor">A</text>
  <text x="82" y="57" text-anchor="middle" font-size="14" fill="currentColor">B</text>
  <text x="134" y="57" text-anchor="middle" font-size="14" fill="currentColor">C</text>
  <text x="186" y="57" text-anchor="middle" font-size="14" fill="currentColor">D</text>
  <text x="238" y="57" text-anchor="middle" font-size="14" fill="currentColor">E</text>
  <text x="30" y="88" text-anchor="middle" font-size="12" fill="currentColor">-5</text>
  <text x="82" y="88" text-anchor="middle" font-size="12" fill="currentColor">-4</text>
  <text x="134" y="88" text-anchor="middle" font-size="12" fill="currentColor">-3</text>
  <text x="186" y="88" text-anchor="middle" font-size="12" fill="currentColor">-2</text>
  <text x="238" y="88" text-anchor="middle" font-size="12" fill="currentColor">-1</text>
  <text x="330" y="46" text-anchor="middle" font-size="12" fill="currentColor">위: 양수</text>
  <text x="330" y="84" text-anchor="middle" font-size="12" fill="currentColor">아래: 음수</text>
</svg>

## 핵심
슬라이싱은 대괄호 안에 시작, 끝, 간격을 콜론으로 적는다. 위 문자열에서 [-2:0:-2] 를 계산하는 절차다.

| 요소 | 해석 |
|---|---|
| 시작 -2 | 인덱스 3 인 D 부터 |
| 간격 -2 | 뒤쪽으로 두 칸씩 |
| 끝 0 | 인덱스 0 은 포함하지 않는다 |
| 결과 | D 와 B 를 이어 붙인 DB |

| 자료형 | 표기 | 성질 |
|---|---|---|
| 리스트 | 대괄호 | 순서 있음, 변경 가능 |
| 튜플 | 소괄호 | 순서 있음, 변경 불가 |
| 딕셔너리 | 중괄호 | 키와 값의 짝 |
| 세트 | 중괄호 | 중복 없음, 순서 없음 |

## 헷갈리는 지점
- 슬라이싱의 끝 인덱스는 결과에 들어가지 않는다. 한 칸 더 넣은 답이 오답 보기로 준비돼 있다.
- 튜플은 순서가 있는 시퀀스지만 값을 바꿀 수 없다. 리스트와 성질이 반반 섞인 보기가 나온다.
- 두 번째 이후의 조건 분기는 elif 다. else if 나 either 로 바꾼 보기가 붙는다.
- 변수 이름 중간에는 공백을 넣을 수 없다. 첫 글자에 숫자도 못 쓴다. 밑줄은 쓸 수 있다.
- input 을 구분자로 나누면 구분자는 결과에서 사라진다. print 로 값 두 개를 넘기면 공백으로 띄워 찍힌다.
- 파이썬은 스크립트 언어다. 같은 보기에 놓이는 Cobol 과 Fortran 은 스크립트 언어가 아니다.

## 기출 패턴
문자열에 간격이 음수인 슬라이싱을 걸고 결과 문자열을 고르게 하는 문항이 대표적이다. 리스트와 딕셔너리를 함께 만든 뒤 각각 한 칸씩 출력해 순서를 맞추게도 한다. 조건문 빈칸에 들어갈 키워드를 고르는 형태와 스크립트 언어가 아닌 것을 고르는 형태도 반복된다.

## 퀴즈
- q: 파이썬 자료형 중 순서가 있으나 저장된 값을 바꿀 수 없는 것은?
  choices: [리스트, 튜플, 딕셔너리, 세트]
  a: 2
  why: 튜플은 시퀀스지만 변경할 수 없다. 리스트는 같은 시퀀스이면서 값을 바꿀 수 있어 다르다.
- q: 슬라이싱에서 끝 인덱스는 결과에 어떻게 반영되는가?
  choices: [포함된다, 포함되지 않는다, 간격이 음수일 때만 포함된다, 시작보다 클 때만 포함된다]
  a: 2
  why: 끝 인덱스 바로 앞까지만 잘라 온다. 포함된다고 세면 결과가 한 글자 길어진 오답이 된다.
- q: 파이썬 변수 이름 규칙으로 옳지 않은 것은?
  choices: [첫 자리에 숫자를 쓸 수 없다, 밑줄을 쓸 수 있다, 중간에 공백을 쓸 수 있다, 예약어를 쓸 수 없다]
  a: 3
  why: 공백이 들어가면 서로 다른 두 이름으로 갈린다. 밑줄은 이름 어디에나 쓸 수 있어 옳은 설명이다.

---
id: case-tools
subject: 1
title: CASE 도구와 N-S 차트
tier: A
tags: [스토리지, CASE, 자동화도구, NS차트, 나씨슈나이더만, 설계도구, 문서화]
keywords: [CASE도구]
items: [q:2023-2:017, q:2024-2:020, q:2025-3:006, q:2025-2:020, q:2023-1:007]
updated: 2026-08-15
---

## 한 줄 정의

CASE(Computer Aided Software Engineering)는 요구 분석부터 검사까지의 개발 과정을 전용 소프트웨어 도구로 자동화하는 것이며, N-S 차트는 제어 논리를 도형으로만 나타내는 설계 표기법이다.

## 왜 시험에 나오나

CASE의 기능과 효과를 묻는 부정형이 반복된다. N-S 차트는 화살표 사용 여부를 뒤집은 서술로 나온다.

## 그림

<svg viewBox="0 0 360 150" role="img" aria-label="N-S 차트의 세 가지 제어 구조 표기">
  <rect x="8" y="14" width="100" height="120" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <line x1="8" y1="54" x2="108" y2="54" stroke="currentColor" stroke-width="1.3"/>
  <line x1="8" y1="94" x2="108" y2="94" stroke="currentColor" stroke-width="1.3"/>
  <text x="58" y="38" text-anchor="middle" font-size="12" fill="currentColor">처리 1</text>
  <text x="58" y="78" text-anchor="middle" font-size="12" fill="currentColor">처리 2</text>
  <text x="58" y="118" text-anchor="middle" font-size="12" fill="currentColor">연속</text>
  <rect x="124" y="14" width="110" height="120" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <line x1="124" y1="14" x2="179" y2="54" stroke="currentColor" stroke-width="1.3"/>
  <line x1="234" y1="14" x2="179" y2="54" stroke="currentColor" stroke-width="1.3"/>
  <line x1="124" y1="54" x2="234" y2="54" stroke="currentColor" stroke-width="1.3"/>
  <line x1="179" y1="54" x2="179" y2="134" stroke="currentColor" stroke-width="1.3"/>
  <text x="150" y="76" text-anchor="middle" font-size="12" fill="currentColor">참</text>
  <text x="208" y="76" text-anchor="middle" font-size="12" fill="currentColor">거짓</text>
  <text x="179" y="128" text-anchor="middle" font-size="12" fill="currentColor">선택</text>
  <rect x="250" y="14" width="102" height="120" fill="none" stroke="currentColor" stroke-width="1.4"/>
  <rect x="268" y="42" width="76" height="80" fill="none" stroke="currentColor" stroke-width="1.3"/>
  <text x="300" y="34" text-anchor="middle" font-size="12" fill="currentColor">조건</text>
  <text x="306" y="86" text-anchor="middle" font-size="12" fill="currentColor">반복</text>
</svg>

## 핵심

- CASE의 주요 기능은 소프트웨어 생명주기 전 단계의 연결, 그래픽 지원, 다양한 개발 모형 지원이다.
- CASE를 쓰면 모듈의 재사용성이 높아지고 품질이 향상되며 유지보수가 쉬워진다.
- 일관성 분석으로 요구사항의 변경을 추적하고 표준 준수 여부를 확인한다.
- N-S 차트는 논리 기술에 중점을 둔 도형식 표현 방법이다.
- N-S 차트는 연속과 선택과 다중 선택과 반복의 제어 구조를 상자로 나타낸다.
- 조건이 복합된 곳의 처리를 시각적으로 명확히 식별할 수 있다.

## 헷갈리는 지점

- N-S 차트는 화살표를 쓰지 않는다. 화살표로 흐름을 표현한다는 서술이 정답 자리에 놓인다. 화살표를 쓰는 것은 순서도와 자료 흐름도다.
- 언어 번역은 CASE의 주요 기능이 아니다. 컴파일러의 일이며 기능 목록 문항의 정답으로 나온다.
- 사용자에게 사용 방법을 숙지시키는 용도는 CASE와 무관하다. 개발자를 위한 도구다.
- 설계 명세서 작성은 요구사항 명세 단계의 산출물이다. 요구사항 분석과 거리가 먼 것을 고르는 문항에서 정답이 된다. [[requirements-analysis]] 참고.

## 기출 패턴

CASE 문항은 부정형 두 가지로 굳어 있다. 장점 셋을 참으로 깔고 사용자 교육 같은 무관한 목적 하나를 넣거나, 기능 셋을 참으로 깔고 언어 번역을 넣는다. N-S 차트는 도형식 표현과 제어 구조 서술을 참으로 두고 화살표 사용 여부만 뒤집는다.

## 퀴즈
- q: CASE의 주요 기능으로 옳지 않은 것은?
  choices: [생명주기 전 단계의 연결, 그래픽 지원, 다양한 개발 모형 지원, 언어 번역]
  a: 4
  why: 언어 번역은 컴파일러의 역할이라 CASE의 기능 목록에 들어가지 않는다. 그래픽 지원은 차트와 다이어그램 자동 생성을 뜻하는 실제 기능이다.
- q: N-S 차트에 대한 설명으로 옳지 않은 것은?
  choices: [논리 기술에 중점을 둔 도형식 표현이다, 화살표로 흐름을 표현한다, 연속·선택·반복 구조를 표현한다, 복합 조건 처리를 명확히 식별한다]
  a: 2
  why: N-S 차트는 상자를 겹쳐 그릴 뿐 화살표를 쓰지 않는다. 복합 조건을 시각적으로 구분하기 쉽다는 서술은 기출에서 참으로 제시된다.
- q: CASE 도구 사용의 효과로 보기 어려운 것은?
  choices: [모듈 재사용성 향상, 소프트웨어 품질 향상, 유지보수 간편화, 사용자 교육 시간 단축]
  a: 4
  why: CASE는 개발 과정을 자동화하는 도구라 사용자 교육과 관계가 없다. 재사용성과 품질과 유지보수는 모두 기출에 제시된 효과다.

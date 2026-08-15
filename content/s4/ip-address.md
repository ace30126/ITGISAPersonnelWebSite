---
id: ip-address
subject: 4
title: IP 주소와 서브네팅
tier: A
tags: [IP주소, IPv4, IPv6, 클래스, 서브네팅, 유니캐스트, 애니캐스트, 멀티캐스트, 브로드캐스트]
keywords: [IP주소]
items: [q:2022-3:071, q:2023-1:063, q:2024-1:076, q:2023-1:075]
updated: 2026-08-15
---

## 한 줄 정의
IP 주소는 네트워크에서 장치를 구분하는 논리 주소이며, IPv4 는 32비트, IPv6 는 128비트를 쓴다.

## 왜 시험에 나오나
IPv4 와 IPv6 의 성질을 비교하는 문항이 회차마다 나온다. 주소를 나눠 특정 서브넷의 사용 가능한 주소를 세는 계산 문항도 붙는다.

## 그림
<svg viewBox="0 0 400 130" role="img" aria-label="24비트 네트워크를 4개 서브넷으로 나눌 때의 주소 구간">
  <rect x="20" y="24" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="108" y="24" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="196" y="24" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <rect x="284" y="24" width="88" height="34" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="64" y="46" text-anchor="middle" font-size="12" fill="currentColor">0~63</text>
  <text x="152" y="46" text-anchor="middle" font-size="12" fill="currentColor">64~127</text>
  <text x="240" y="46" text-anchor="middle" font-size="12" fill="currentColor">128~191</text>
  <text x="328" y="46" text-anchor="middle" font-size="12" fill="currentColor">192~255</text>
  <text x="200" y="16" text-anchor="middle" font-size="12" fill="currentColor">마지막 옥텟을 4등분</text>
  <line x1="328" y1="58" x2="328" y2="76" stroke="currentColor" stroke-width="1.5"/>
  <text x="328" y="92" text-anchor="middle" font-size="12" fill="currentColor">4번째 서브넷</text>
  <text x="200" y="116" text-anchor="middle" font-size="12" fill="currentColor">각 구간의 첫 주소는 네트워크 주소</text>
</svg>

## 핵심
| 항목 | IPv4 | IPv6 |
|---|---|---|
| 길이 | 32비트 | 128비트 |
| 표기 | 옥텟 4개를 점으로 구분 | 16진수를 콜론으로 구분 |
| 구성 | A 부터 E 까지 5개 클래스 | 클래스 구분 없음 |
| 전송 방식 | 유니캐스트 브로드캐스트 멀티캐스트 | 유니캐스트 애니캐스트 멀티캐스트 |
| 보안 | 별도 적용 | 인증과 보안 기능을 포함 |
| 확장 | 헤더 길이 고정 | 확장 헤더로 기능을 늘린다 |

서브네팅 계산 절차다. 마지막 옥텟을 4등분하면 구간 크기는 64가 된다.

- 각 구간의 첫 주소는 네트워크 주소라 장치에 못 준다.
- 마지막 주소는 브로드캐스트 주소라 역시 못 준다.
- 4번째 구간은 192 부터 시작하므로 사용 가능한 첫 주소는 193 이고, 네 번째는 196 이다.

## 헷갈리는 지점
- IPv6 는 브로드캐스트가 없다. 대신 애니캐스트가 있다. 보기 넷 중 브로드캐스트가 정답 자리에 놓인다.
- 8비트씩 4부분을 10진수로 적는 것은 IPv4 다. 이 설명을 IPv6 쪽에 붙여 놓는다.
- IPv6 는 IPv4 보다 느리다는 서술은 틀렸다. 헤더가 단순해져 처리가 가볍다.
- IPv6 헤더 길이나 패킷 크기를 고정 수치로 못 박은 보기는 오답이다. 확장 헤더로 늘릴 수 있다.
- 서브넷에서 첫 주소와 마지막 주소는 쓸 수 없다. 이 둘을 빼지 않으면 계산이 한 칸씩 어긋난다.

## 기출 패턴
IPv6 설명 네 개 중 틀린 것을 고르는 형태가 가장 잦다. IPv4 와 IPv6 를 한 문항에 섞어 성질을 뒤바꾼 보기를 심어 두기도 한다. 서브넷 개수를 주고 특정 서브넷의 몇 번째 사용 가능한 주소를 계산시키는 문항도 반복된다.

## 퀴즈
- q: IPv6 의 주소 체계가 아닌 것은?
  choices: [유니캐스트, 애니캐스트, 브로드캐스트, 멀티캐스트]
  a: 3
  why: IPv6 는 브로드캐스트를 없애고 애니캐스트를 넣었다. 멀티캐스트는 IPv6 에도 그대로 있다.
- q: IPv4 에 대한 설명으로 옳은 것은?
  choices: [128비트 주소를 쓴다, 옥텟 4개를 점으로 구분해 표기한다, 콜론으로 각 부분을 구분한다, 클래스 구분이 없다]
  a: 2
  why: IPv4 는 32비트를 8비트씩 넷으로 나눠 점으로 잇는다. 콜론 표기와 128비트는 IPv6 의 특징이다.
- q: 마지막 옥텟을 4등분한 네트워크에서 4번째 서브넷의 첫 사용 가능한 주소의 끝자리는?
  choices: [192, 193, 196, 255]
  a: 2
  why: 4번째 구간은 192 에서 시작하고 192 는 네트워크 주소라 쓸 수 없어 193 이 첫 주소다. 196 은 네 번째 사용 가능한 주소다.

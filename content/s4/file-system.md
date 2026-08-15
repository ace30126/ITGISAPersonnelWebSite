---
id: file-system
subject: 4
title: 파일 시스템과 UNIX 명령어
tier: A
tags: [파일시스템, 파일디스크립터, FCB, inode, chmod, NTFS, FAT, 디렉터리]
keywords: [파일시스템]
items: [s:20210814:080, q:2025-1:079, q:2022-1:094]
updated: 2026-08-15
---

## 한 줄 정의
파일 시스템은 보조기억장치의 파일을 이름과 구조로 관리하는 체계이며, 파일마다 관리 정보를 담은 파일 디스크립터가 붙는다.

## 왜 시험에 나오나
파일 디스크립터의 성질, UNIX 명령어의 용도, NTFS 와 FAT 비교가 돌아가며 나온다. 셋 다 짧은 판별형이라 외운 만큼 그대로 맞힌다.

## 그림
<svg viewBox="0 0 400 130" role="img" aria-label="파일이 열릴 때 파일 디스크립터가 보조기억장치에서 주기억장치로 옮겨지는 흐름">
  <rect x="14" y="30" width="120" height="60" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="74" y="54" text-anchor="middle" font-size="12" fill="currentColor">보조기억장치</text>
  <text x="74" y="74" text-anchor="middle" font-size="12" fill="currentColor">파일 디스크립터</text>
  <rect x="266" y="30" width="120" height="60" rx="6" fill="none" stroke="currentColor" stroke-width="1.5"/>
  <text x="326" y="54" text-anchor="middle" font-size="12" fill="currentColor">주기억장치</text>
  <text x="326" y="74" text-anchor="middle" font-size="12" fill="currentColor">운영체제가 사용</text>
  <line x1="134" y1="60" x2="258" y2="60" stroke="currentColor" stroke-width="1.5"/>
  <polygon points="266,60 256,55 256,65" fill="currentColor"/>
  <text x="200" y="50" text-anchor="middle" font-size="12" fill="currentColor">파일 개방</text>
  <text x="200" y="106" text-anchor="middle" font-size="12" fill="currentColor">사용자는 직접 참조하지 못한다</text>
</svg>

## 핵심
파일 디스크립터(File Descriptor)의 성질이다. 파일 제어 블록(File Control Block)이라고도 부른다.

- 파일 관리를 위해 시스템이 필요로 하는 정보를 담는다.
- 보조기억장치에 있다가 파일이 개방되면 주기억장치로 옮겨진다.
- 운영체제가 관리하며 사용자가 직접 참조하지 못한다.

UNIX 명령어다.

| 명령 | 용도 |
|---|---|
| ls | 파일 목록 표시 |
| cat | 파일 내용 표시 |
| cp | 파일 복사 |
| chmod | 파일 권한 모드 설정 |
| fork | 새 프로세스 생성 |

Windows 파일 시스템 비교다.

| 항목 | FAT | NTFS |
|---|---|---|
| 보안 | 약하다 | 강하다 |
| 대용량 볼륨 | 비효율 | 효율적 |
| 압축과 안정성 | 없다 | 자동 압축과 복구 기능 |
| 저용량 볼륨 속도 | 빠르다 | 느려질 수 있다 |

## 헷갈리는 지점
- 파일 디스크립터를 사용자가 직접 참조할 수 있다고 쓴 보기는 틀렸다. 이 문장이 정답 자리에 반복해서 놓인다.
- 이동 방향을 뒤집어 주기억장치에 있다가 개방되면 보조기억장치로 간다고 쓴 보기도 정답으로 나온다. 방향은 그 반대다.
- NTFS 는 보안이 강하다. 보기에 "보안에 취약"이 섞이면 그것이 정답이다.
- fork 는 파일 명령이 아니라 프로세스를 만드는 명령이다. ls, cat, chmod 사이에 끼워 놓는다.
- 권한 설정은 chmod, 소유자 변경은 chown 이다. 이름이 비슷해 바꿔 낸다.
- UNIX 파일 시스템은 트리 구조다. 그물 구조로 바꿔 쓴 보기가 오답이다.

## 기출 패턴
파일 디스크립터 설명 네 개 중 틀린 것을 고르는 문항이 대표적이며, 틀린 문장은 대부분 사용자가 직접 참조한다는 서술이다. NTFS 의 특징이 아닌 것 고르기, 권한 설정 명령 고르기도 반복된다.

## 퀴즈
- q: 파일 디스크립터에 대한 설명으로 틀린 것은?
  choices: [파일 제어 블록이라고도 한다, 사용자가 직접 참조할 수 있다, 파일이 개방되면 주기억장치로 옮겨진다, 파일 관리에 필요한 정보를 담는다]
  a: 2
  why: 파일 디스크립터는 운영체제가 관리하므로 사용자가 직접 참조하지 못한다. 파일 제어 블록이라는 다른 이름은 옳은 설명이다.
- q: UNIX 에서 파일의 권한 모드를 설정하는 명령은?
  choices: [ls, chmod, cat, cp]
  a: 2
  why: chmod 가 읽기 쓰기 실행 권한을 바꾼다. cat 은 파일 내용을 화면에 보여 주는 명령이라 다르다.
- q: FAT 와 비교한 NTFS 의 특징이 아닌 것은?
  choices: [보안에 취약하다, 대용량 볼륨에 효율적이다, 자동 압축 기능이 있다, 저용량 볼륨에서 속도가 저하될 수 있다]
  a: 1
  why: NTFS 는 접근 권한을 다뤄 보안이 강한 쪽이다. 대용량 볼륨 효율은 NTFS 의 실제 장점이다.

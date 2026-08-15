# 정보처리기사 필기 학습 사이트

기출 문항과 개념 노트를 폰에서 읽고 풀기 위한 개인용 PWA.

**https://ace30126.github.io/ITGISAPersonnelWebSite/**

첫 접속 때 패스프레이즈를 한 번 입력한다. 이후 브라우저에 저장된다.

---

## 무엇이 들어 있나

| | |
|---|---|
| 고유 문항 | 1,243 (기출 2022~2025 12회 + 해설집 8회 + 주제별 5종에서 중복 제거) |
| 해설 | 897문항 |
| 개념 노트 | 70개 · 퀴즈 210문항 · 도식 68개 |
| 기능 | 과목별 학습 · 문제 풀이 · 모의고사 · 오답노트(SRS) · 통계 · AI 비유 설명 |

## 저작권

이 저장소는 공개지만 **문항 원문은 평문으로 들어 있지 않다.**
모든 문항·해설·이미지는 AES-256-GCM 으로 암호화된 `.enc` 로만 배포되며,
복호화 키는 저장소에 없다(`SECRETS.md` 는 `.gitignore` 대상).

원본 PDF 는 저장소에 복사하지 않고 로컬 절대경로로만 참조한다.
`pre-commit` 훅이 지문·보기를 가진 JSON 과 PDF 의 커밋을 거부하고,
CI 도 배포 산출물에 평문이 섞였는지 다시 검사한다.

원 자료의 권리는 각 발행처에 있다. 개인 학습 목적으로만 쓴다.

## 구조

```
pipeline/     PDF → 문항 JSON (Python 3.12 + PyMuPDF)
  common/     컬럼 분할·정규화·문항 검출 (파서 3종 공용)
  extract/    기출 원본 / 해설집 / 주제별 파서
  build/      병합·중복제거·태깅·개념 컴파일·샤딩·암호화·검증
content/      개념 노트 원고 (직접 집필, 저작권 클린)
web/          Vite + React + TS PWA
```

## 다시 만들기

```bash
# 1. 문항 파이프라인 (원본 PDF 경로는 pipeline/config.py)
python pipeline/build/smoke.py          # 소스 정찰 게이트
python pipeline/extract/past_exam.py    # 파서 3종
python pipeline/extract/solution_book.py
python pipeline/extract/topic_book.py
python pipeline/build/merge.py          # 병합·중복제거 + G12 교차검증
python pipeline/build/tag.py            # 개념 태그
python pipeline/build/verify_wave1.py   # 독립 검증

# 2. 개념 노트
python pipeline/build/plan_concepts.py  # 출제 빈도로 집필 대상 산출
python pipeline/build/concepts.py       # 컴파일 + 규약 게이트

# 3. 배포본
python pipeline/build/shard.py          # 경량 인덱스 + 과목별 샤드
python pipeline/build/pack.py           # AES-GCM 암호화
python pipeline/build/pack.py --verify  # 복호화 왕복 검증

# 4. 웹
cd web && npm ci && npm run build
```

`main` 에 푸시하면 GitHub Actions 가 빌드·검사·배포한다.

## 설계 메모

- **경량 인덱스만으로 필터·통계·SRS·모의고사 문항 선정이 전부 된다.** 초기 로드 127KB(gzip 약 35KB).
  지문·보기는 세션을 실제로 시작할 때 해당 과목 샤드만 받는다.
- **해설은 별도 샤드.** 시험 모드에서는 요청 자체를 하지 않아 네트워크 탭으로도 정답이 새지 않는다.
- **`attempts` 가 유일한 진실 원천.** SRS 상태와 통계는 전부 재계산 가능해서,
  알고리즘을 바꿔도 기록이 살아남는다. 백업은 `attempts + notes` 만 담는다.
- **Gemini 는 BYOK.** 키는 각자 브라우저에만 있고 중계 서버가 없다.
  개념 노트 본문 앞 800자만 보내며, 기출 원문 전송은 기본 꺼져 있다.

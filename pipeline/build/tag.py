"""Phase 2-B — 개념 태그 부여.

문제점: 경량 인덱스의 태그가 `topic:keyword` 같은 **문제 유형** 5종뿐이라
개념↔문항 자동 매칭의 신호가 사실상 0이다. 개념 페이지에서 본문 샤드를
받기 전에는 관련 기출을 못 고른다.

해결: 지문·보기에서 도메인 용어를 뽑아 `kw:<용어>` 태그를 단다.
이 태그는 경량 인덱스에 실리므로 95KB 만으로 개념 매칭이 가능해진다.

동의어를 한 대표어로 접는 것이 핵심이다. '결합도'와 'coupling' 이 다른
태그가 되면 매칭이 반으로 쪼개진다.
"""
from __future__ import annotations

import json
import sys
from collections import Counter
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
sys.stdout.reconfigure(encoding="utf-8")

import config as C  # noqa: E402
from common.normalize import norm  # noqa: E402

# 대표어 -> 표면형들. 표면형은 norm() 을 거쳐 비교되므로 공백·대소문자 무관.
CONCEPTS: dict[str, list[str]] = {
    # --- 1과목 소프트웨어 설계 ---
    "요구사항분석": ["요구사항 분석", "요구공학", "요구사항 명세", "기능 요구사항", "비기능 요구사항"],
    "UML": ["UML", "Unified Modeling Language"],
    "유스케이스": ["유스케이스", "use case", "usecase"],
    "클래스다이어그램": ["클래스 다이어그램", "class diagram"],
    "순차다이어그램": ["순차 다이어그램", "시퀀스 다이어그램", "sequence diagram"],
    "상태다이어그램": ["상태 다이어그램", "state diagram", "상태 전이"],
    "디자인패턴": ["디자인 패턴", "design pattern", "싱글톤", "팩토리", "옵서버", "옵저버",
                "빌더 패턴", "어댑터 패턴", "브리지", "프록시 패턴", "데코레이터"],
    "생성패턴": ["생성 패턴", "creational"],
    "구조패턴": ["구조 패턴", "structural"],
    "행위패턴": ["행위 패턴", "behavioral"],
    "객체지향": ["객체지향", "객체 지향", "캡슐화", "encapsulation", "다형성", "polymorphism",
              "상속", "inheritance", "추상화", "정보 은닉", "information hiding"],
    "럼바우": ["럼바우", "rumbaugh"],
    "애자일": ["애자일", "agile", "스크럼", "scrum", "익스트림 프로그래밍",
             "extreme programming", "XP", "칸반", "kanban"],
    "미들웨어": ["미들웨어", "middleware", "MOM", "RPC", "TP monitor", "ORB", "WAS"],
    "EAI": ["EAI", "Enterprise Application Integration", "hub & spoke", "message bus"],
    "UI설계": ["UI 설계", "사용자 인터페이스", "user interface", "직관성", "유효성",
             "학습성", "유연성", "CLI", "GUI", "NUI"],
    "소프트웨어아키텍처": ["소프트웨어 아키텍처", "아키텍처 패턴", "레이어 패턴",
                    "MVC", "파이프 필터", "클라이언트 서버"],
    "모듈화": ["모듈화", "modularity", "팬인", "팬아웃", "fan-in", "fan-out"],
    "결합도": ["결합도", "coupling", "자료 결합", "스탬프 결합", "제어 결합",
             "공통 결합", "내용 결합"],
    "응집도": ["응집도", "cohesion", "기능적 응집", "순차적 응집", "우연적 응집",
             "논리적 응집", "시간적 응집"],
    # --- 2과목 소프트웨어 개발 ---
    "자료구조": ["자료 구조", "자료구조", "선형 구조", "비선형 구조"],
    "스택": ["스택", "stack", "LIFO"],
    "큐": ["큐", "queue", "FIFO", "데크", "deque"],
    "트리": ["트리", "tree", "이진 트리", "binary tree", "전위 순회", "중위 순회",
           "후위 순회", "preorder", "inorder", "postorder", "차수", "단말 노드"],
    "그래프": ["그래프", "graph", "인접 행렬", "DFS", "BFS", "깊이 우선", "너비 우선"],
    "정렬": ["정렬", "sort", "버블 정렬", "선택 정렬", "삽입 정렬", "퀵 정렬",
           "힙 정렬", "합병 정렬", "셸 정렬"],
    "탐색": ["이진 검색", "이분 검색", "binary search", "순차 검색", "선형 검색"],
    "해싱": ["해싱", "hashing", "해시 함수", "제산법", "충돌", "collision", "버킷", "슬롯"],
    "테스트기법": ["블랙박스 테스트", "화이트박스 테스트", "black box", "white box",
               "동치 분할", "경계값 분석", "원인 결과 그래프", "오류 예측"],
    "테스트단계": ["단위 테스트", "통합 테스트", "시스템 테스트", "인수 테스트",
               "회귀 테스트", "regression", "상향식 통합", "하향식 통합",
               "스텁", "드라이버"],
    "검증확인": ["인스펙션", "inspection", "워크스루", "walkthrough", "동료 검토",
              "verification", "validation"],
    "복잡도": ["순환 복잡도", "cyclomatic", "맥케이브", "시간 복잡도", "빅오"],
    "형상관리": ["형상 관리", "버전 관리", "configuration management",
              "체크인", "체크아웃", "베이스라인", "git", "svn", "cvs"],
    "클린코드": ["리팩토링", "refactoring", "클린 코드", "코드 스멜"],
    "알고리즘": ["알고리즘", "algorithm", "분할 정복", "동적 계획법", "그리디"],
    # --- 3과목 데이터베이스 구축 ---
    "관계형모델": ["릴레이션", "relation", "튜플", "tuple", "애트리뷰트", "attribute",
               "카디널리티", "cardinality", "디그리", "degree", "도메인"],
    "키": ["기본키", "primary key", "외래키", "foreign key", "후보키", "candidate key",
         "슈퍼키", "super key", "대체키", "alternate key"],
    "정규화": ["정규화", "normalization", "1NF", "2NF", "3NF", "BCNF", "제1정규형",
             "제2정규형", "제3정규형", "부분 함수 종속", "이행 함수 종속",
             "함수 종속", "반정규화", "역정규화", "이상 현상", "anomaly"],
    "SQL": ["SELECT", "INSERT", "UPDATE", "DELETE", "CREATE TABLE", "ALTER",
            "DROP", "GRANT", "REVOKE", "COMMIT", "ROLLBACK", "GROUP BY",
            "HAVING", "ORDER BY", "JOIN", "SQL"],
    "DDL DML DCL": ["DDL", "DML", "DCL", "데이터 정의어", "데이터 조작어", "데이터 제어어"],
    "관계대수": ["관계 대수", "관계 해석", "셀렉트 연산", "프로젝트 연산",
              "디비전", "division", "카티션 프로덕트", "자연 조인"],
    "뷰": ["뷰", "view", "가상 테이블"],
    "인덱스": ["인덱스", "index", "B 트리", "클러스터드"],
    "트랜잭션": ["트랜잭션", "transaction", "원자성", "atomicity", "일관성",
              "고립성", "isolation", "지속성", "durability", "ACID"],
    "동시성제어": ["로킹", "locking", "타임스탬프", "교착 상태", "2단계 로킹"],
    "회복": ["회복 기법", "로그 기반", "즉각 갱신", "지연 갱신", "체크포인트", "그림자 페이징"],
    "무결성": ["무결성", "integrity", "개체 무결성", "참조 무결성", "도메인 무결성"],
    "ER모델": ["E-R", "ER 다이어그램", "개체 관계", "개체 타입", "관계 타입"],
    "스키마": ["스키마", "schema", "외부 스키마", "개념 스키마", "내부 스키마",
             "데이터 독립성"],
    "데이터웨어하우스": ["데이터 웨어하우스", "데이터 마트", "OLAP", "데이터 마이닝"],
    # --- 4과목 프로그래밍 언어 활용 ---
    "C언어": ["C언어", "printf", "scanf", "malloc", "struct", "typedef", "#include"],
    "포인터": ["포인터", "pointer", "주소 연산자", "역참조"],
    "배열": ["배열", "array", "2차원 배열", "첨자"],
    "파이썬": ["파이썬", "python", "리스트", "튜플 자료형", "딕셔너리", "람다"],
    "자바": ["자바", "java", "클래스", "메소드", "오버로딩", "overloading",
           "오버라이딩", "overriding", "생성자", "예외 처리", "try", "catch"],
    "연산자": ["연산자", "operator", "우선순위", "비트 연산", "삼항 연산", "시프트"],
    "제어문": ["제어문", "반복문", "조건문", "switch", "for", "while", "break", "continue"],
    "변수범위": ["변수", "지역 변수", "전역 변수", "정적 변수", "scope"],
    "운영체제": ["운영체제", "operating system", "커널", "shell", "unix", "linux", "windows"],
    "프로세스": ["프로세스", "process", "스레드", "thread", "PCB", "문맥 교환"],
    "스케줄링": ["스케줄링", "scheduling", "FCFS", "SJF", "라운드 로빈", "round robin",
              "우선순위 스케줄링", "HRN"],
    "교착상태": ["교착 상태", "deadlock", "상호 배제", "점유와 대기", "비선점", "환형 대기",
              "은행원 알고리즘"],
    "메모리관리": ["기억 장치", "페이징", "paging", "세그먼테이션", "가상 기억",
               "페이지 교체", "LRU", "FIFO 교체", "LFU", "스래싱", "thrashing",
               "최초 적합", "최적 적합", "최악 적합", "단편화"],
    "파일시스템": ["파일 시스템", "디렉터리", "inode", "chmod", "파일 디스크립터"],
    "OSI7계층": ["OSI", "물리 계층", "데이터 링크", "네트워크 계층", "전송 계층",
              "세션 계층", "표현 계층", "응용 계층"],
    "TCPIP": ["TCP", "UDP", "IP", "ICMP", "ARP", "RARP", "IGMP", "TCP/IP"],
    "IP주소": ["IPv4", "IPv6", "서브넷", "subnet", "서브네팅", "CIDR", "클래스 C"],
    "라우팅": ["라우팅", "routing", "RIP", "OSPF", "BGP", "거리 벡터", "링크 상태"],
    "네트워크장비": ["라우터", "스위치", "허브", "리피터", "브리지", "게이트웨이"],
    # --- 5과목 정보시스템 구축관리 ---
    "소프트웨어생명주기": ["폭포수 모형", "waterfall", "프로토타입 모형", "나선형 모형",
                   "spiral", "V 모델", "생명 주기"],
    "비용산정": ["COCOMO", "코코모", "기능 점수", "function point", "LOC", "Putnam",
              "델파이", "노력 추정"],
    "일정관리": ["PERT", "CPM", "간트 차트", "gantt", "임계 경로"],
    "CMM": ["CMM", "CMMI", "SPICE", "ISO 12207", "소프트웨어 성숙도"],
    "보안3요소": ["기밀성", "confidentiality", "무결성", "가용성", "availability",
              "부인 방지", "인증"],
    "대칭키": ["대칭키", "비밀키", "DES", "AES", "SEED", "ARIA", "IDEA", "RC4", "블록 암호"],
    "공개키": ["공개키", "비대칭", "RSA", "ECC", "디피 헬만", "Diffie", "전자 서명"],
    "해시함수": ["SHA", "MD5", "HMAC", "해시 알고리즘", "일방향"],
    "접근통제": ["접근 통제", "access control", "RBAC", "MAC", "DAC", "최소 권한"],
    "인증기술": ["커버로스", "kerberos", "SSO", "OTP", "생체 인식", "i-PIN"],
    "네트워크공격": ["DDoS", "DoS", "스머핑", "smurf", "ping of death", "티어드롭",
                "SYN flooding", "랜드 어택", "세션 하이재킹", "스니핑", "스푸핑",
                "스위치 재밍", "ARP 스푸핑"],
    "웹공격": ["SQL 인젝션", "XSS", "크로스 사이트", "CSRF", "디렉터리 트래버설",
             "버퍼 오버플로", "스택 가드", "포맷 스트링"],
    "악성코드": ["웜", "worm", "트로이 목마", "trojan", "바이러스", "랜섬웨어",
              "ransomware", "백도어", "키로거", "애드웨어", "스파이웨어"],
    "사회공학": ["피싱", "phishing", "스미싱", "smishing", "큐싱", "파밍", "스피어 피싱"],
    "보안솔루션": ["방화벽", "firewall", "IDS", "IPS", "침입 탐지", "침입 방지",
               "VPN", "DMZ", "NAC", "DLP", "ESM", "SIEM", "허니팟"],
    "무선보안": ["WPA", "WEP", "블루투스", "블루재킹", "블루스나핑", "NFC", "지그비"],
    "신기술": ["클라우드", "빅데이터", "하둡", "hadoop", "맵리듀스", "블록체인",
             "IoT", "사물 인터넷", "디지털 트윈", "메타버스", "SDN", "NFV",
             "도커", "docker", "쿠버네티스", "마이크로서비스", "서버리스",
             "머신러닝", "딥러닝", "인공지능", "5G", "엣지 컴퓨팅"],
    "스토리지": ["DAS", "NAS", "SAN", "RAID", "미러링", "스트라이핑"],
    "고가용성": ["이중화", "클러스터링", "핫 사이트", "웜 사이트", "콜드 사이트",
              "RTO", "RPO", "백업"],
}


def build_matcher() -> list[tuple[str, str]]:
    """(정규화된 표면형, 대표어). 긴 표면형부터 검사해 부분일치 오탐을 줄인다."""
    pairs = [(norm(surf), rep)
             for rep, surfs in CONCEPTS.items() for surf in surfs]
    pairs = [(s, r) for s, r in pairs if len(s) >= 2]
    pairs.sort(key=lambda p: -len(p[0]))
    return pairs


def main() -> int:
    src = C.INTERIM / "merged.json"
    data = json.loads(src.read_text(encoding="utf-8"))
    items = data["items"]
    matcher = build_matcher()

    print("=" * 70)
    print("Phase 2-B 개념 태그 부여")
    print("=" * 70)
    print(f"  대표어 {len(CONCEPTS)}개 / 표면형 {len(matcher)}개")

    tagged = Counter()
    per_item = []
    for it in items:
        hay = norm(it.get("stem", "") + " " + " ".join(it.get("choices", [])))
        found: list[str] = []
        for surf, rep in matcher:
            if rep in found:
                continue
            if surf in hay:
                found.append(rep)
        tags = [t for t in it.get("tags", []) if not t.startswith("kw:")]
        tags += [f"kw:{r}" for r in found]
        it["tags"] = tags
        per_item.append(len(found))
        for r in found:
            tagged[r] += 1

    n0 = sum(1 for n in per_item if n == 0)
    print(f"\n  태그 0개 문항 {n0} ({n0 * 100 / len(items):.1f}%)")
    print(f"  문항당 평균 {sum(per_item) / len(items):.2f}개, 최대 {max(per_item)}개")
    print(f"\n  상위 20 대표어:")
    for rep, n in tagged.most_common(20):
        print(f"    {rep:<20}{n:>5}")
    unused = [r for r in CONCEPTS if r not in tagged]
    if unused:
        print(f"\n  한 번도 안 걸린 대표어 {len(unused)}개: {unused}")

    src.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\n→ merged.json 갱신")

    # 커버리지가 낮으면 개념 매칭이 무의미하다
    if n0 > len(items) * 0.20:
        print("\nFAIL: 태그 0개 문항이 20%를 넘는다. 사전을 보강해야 한다.")
        return 1
    print("\nPhase 2-B PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

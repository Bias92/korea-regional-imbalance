# Korea Regional Imbalance Dashboard

한국 지역 불균형(수도권 집중·인구감소·폐교)을 시각화하는 데이터 대시보드.  
*소프트웨어공학 과제 "프로세스에 입각한 바이브코딩의 효과 논술"의 실증 프로젝트.*

---

## 1. 배경

수도권 집중과 지방 인구감소는 한국 사회의 핵심 문제이지만, 통계청 자료는 표 형태라
일반인이 체감하기 어렵다. 본 프로젝트는 이를 시각적으로 전달하는 대시보드를 만들고,
그 과정에서 **바이브코딩(AI 보조 개발)에 프로세스를 적용했을 때의 효과**를 실증한다.

## 2. MVP 정의

- [x] 수도권 집중 통계 카드 (인구·GRDP 비중)
- [x] 인구감소지역 수 표시
- [x] 폐교 수 표시
- [x] 시도별 인구 증감률 막대차트
- [x] (Phase 2) 시도 단위 choropleth 지도 초안
- [x] 지도 지표 전환 및 지역 선택 인터랙션
- [x] 종합 위험지수와 핵심 진단 카드
- [x] 위험지수 분석 시나리오 전환
- [x] 두 지역 직접 비교 모드
- [x] 위험지수 산식과 가중치 설명 UI

> Phase 1 MVP와 Phase 2 지도 초안은 임시 시연 데이터 기준으로 구현 완료. 공식 통계 데이터 교체는 후속 작업으로 관리한다.

## 3. 단계별 계획

| Phase | 목표 | 기간 |
|---|---|---|
| Phase 1 (MVP) | 통계 카드 + 막대차트 | 2026-05-18 ~ 2026-05-24 |
| Phase 2 | Leaflet 시도 단위 지도(choropleth) 추가 | 2026-05-25 ~ 2026-05-31 |
| Phase 3 | 폐교 통계 + 필터 + 설명 카드 | 2026-06-01 ~ 2026-06-05 |
| QA / 보고서 | 버그픽스, PDF 보고서 작성, 캡처 정리 | 2026-06-06 ~ 2026-06-08 |

## 4. 기술 스택

- **Frontend**: HTML5 / CSS3 / Vanilla JavaScript
- **시각화**: Chart.js (차트), Leaflet (지도)
- **지도 경계**: southkorea-maps KOSTAT 2018 시도 TopoJSON
- **데이터 처리**: 원본 CSV 확보 후 정적 JSON으로 변환
- **데이터 출처 (예정)**: KOSIS, 행정안전부 인구감소지역, 교육부 폐교현황
- **빌드/배포**: 정적 호스팅 (GitHub Pages 예정)

> 프레임워크(React/Next.js) 미사용 결정 근거는 [`docs/design.md`](./docs/design.md) 참조.

## 5. 소프트웨어공학 문서 읽는 순서

`docs/`의 Markdown 문서는 제출용 프로세스 증빙이다. 처음 보면 이름만으로 헷갈릴 수 있어
아래 순서대로 읽으면 된다.

| 문서 | 역할 |
|---|---|
| [`docs/process.md`](./docs/process.md) | 적용 방법론, 전체 개발 프로세스, 시퀀스 다이어그램, 프로세스 다이어그램 |
| [`docs/requirements.md`](./docs/requirements.md) | 사용자, 기능 요구사항, 비기능 요구사항, 추적성 |
| [`docs/design.md`](./docs/design.md) | Vanilla 스택, 정적 JSON, Phase 분리 같은 설계 결정 |
| [`docs/test-plan.md`](./docs/test-plan.md) | 수동·자동 검증 기준 |
| [`docs/lessons-learned.md`](./docs/lessons-learned.md) | Phase별 회고와 개선점 |
| [`docs/ai-log/`](./docs/ai-log/) | Claude와 Codex를 어떻게 사용했는지에 대한 날짜별 기록 |
| [`data/README.md`](./data/README.md) | 데이터 출처, 임시 데이터 상태, 공식 데이터 교체 원칙 |

## 6. 로컬 실행 방법

정적 JSON을 `fetch`로 불러오므로 로컬에서는 저장소 루트에서 정적 서버를 실행한다.

```bash
python -m http.server 8000
```

브라우저에서 다음 주소를 연다.

```text
http://127.0.0.1:8000/src/index.html
```

### 자동 검증

```bash
node --check src/app.js
node tests/verify-data.mjs
```

## 7. 바이브코딩 도구 운용 방침

- **Claude**: 요구사항 정리, 문서 작성, 의사결정 토론 파트너, 보고서 작성
- **Codex**: 코드 구현, 버그 수정, 비판적 리뷰, 커밋 메시지 정리
- 두 AI의 응답을 교차 검증하여 lessons learned를 [`docs/lessons-learned.md`](./docs/lessons-learned.md)에 누적 기록

## 8. 프로젝트 구조

```
korea-regional-imbalance/
├── README.md
├── docs/
│   ├── process.md           # 소프트웨어공학 프로세스 총괄
│   ├── requirements.md      # 요구사항 분석
│   ├── design.md            # 설계 결정 기록
│   ├── test-plan.md         # 검증 계획
│   ├── ai-log/              # AI와의 주요 토의 로그
│   └── lessons-learned.md   # 프로세스 적용 교훈
├── data/                    # 데이터 출처 및 전처리 산출물
│   ├── phase1-regions.json
│   ├── skorea-provinces-2018-topo-simple.json
│   └── skorea-provinces-license.md
├── src/                     # 실제 웹앱 코드
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── tests/
    └── verify-data.mjs      # Phase 1 데이터 구조 검증
```

## 9. 진행 로그

- **2026-05-18**: 프로젝트 킥오프 / 주제·스택 확정 / repo 개설
- **2026-05-21**: Day 1 리뷰 반영 / Phase 1 문서·데이터·MVP 구현 착수
- **2026-05-25**: 소프트웨어공학 프로세스 문서화 / 다이어그램 추가 / 데이터 검증 자동화
- **2026-05-25**: Phase 2 Leaflet 시도 단위 choropleth 지도 초안 구현
- **2026-05-25**: 지도 지표 전환·지역 선택 인터랙션 보강
- **2026-05-25**: 위험지수 기반 핵심 진단 패널 추가
- **2026-05-26**: 위험지수 분석 시나리오 전환 기능 추가
- **2026-05-26**: 두 지역 직접 비교 모드 추가
- **2026-05-27**: 위험지수 산식과 가중치 설명 UI 추가

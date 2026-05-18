# Korea Regional Imbalance Dashboard

한국 지역 불균형(수도권 집중·인구감소·폐교)을 시각화하는 데이터 대시보드.  
*소프트웨어공학 과제 "프로세스에 입각한 바이브코딩의 효과 논술"의 실증 프로젝트.*

---

## 1. 배경

수도권 집중과 지방 인구감소는 한국 사회의 핵심 문제이지만, 통계청 자료는 표 형태라
일반인이 체감하기 어렵다. 본 프로젝트는 이를 시각적으로 전달하는 대시보드를 만들고,
그 과정에서 **바이브코딩(AI 보조 개발)에 프로세스를 적용했을 때의 효과**를 실증한다.

## 2. MVP 정의

- [ ] 수도권 집중 통계 카드 (인구·GRDP 비중)
- [ ] 인구감소지역 수 표시
- [ ] 폐교 수 표시
- [ ] 시도별 인구 증감률 막대차트
- [ ] (Stretch) 시군구 단위 choropleth 지도

## 3. 단계별 계획

| Phase | 목표 | 기간 |
|---|---|---|
| Phase 1 (MVP) | 통계 카드 + 막대차트 | 2026-05-18 ~ 2026-05-24 |
| Phase 2 | Leaflet 지도(choropleth) 추가 | 2026-05-25 ~ 2026-05-31 |
| Phase 3 | 폐교 레이어 + 필터 + 설명 카드 | 2026-06-01 ~ 2026-06-05 |
| QA / 보고서 | 버그픽스, PDF 보고서 작성, 캡처 정리 | 2026-06-06 ~ 2026-06-08 |

## 4. 기술 스택

- **Frontend**: HTML5 / CSS3 / Vanilla JavaScript
- **시각화**: Chart.js (차트), Leaflet (지도)
- **데이터 출처 (예정)**: KOSIS, 행정안전부 인구감소지역, 교육부 폐교현황
- **빌드/배포**: 정적 호스팅 (GitHub Pages 예정)

> 프레임워크(React/Next.js) 미사용 결정 근거는 [`docs/design.md`](./docs/design.md) 참조.

## 5. 바이브코딩 도구 운용 방침

- **Claude**: 요구사항 정리, 문서 작성, 의사결정 토론 파트너, 보고서 작성
- **Codex**: 코드 구현, 버그 수정, 비판적 리뷰, 커밋 메시지 정리
- 두 AI의 응답을 교차 검증하여 lessons learned를 [`docs/lessons-learned.md`](./docs/lessons-learned.md)에 누적 기록

## 6. 프로젝트 구조

```
korea-regional-imbalance/
├── README.md
├── docs/
│   ├── requirements.md      # 요구사항 분석
│   ├── design.md            # 설계 결정 기록
│   ├── ai-log/              # AI와의 주요 토의 로그
│   └── lessons-learned.md   # 프로세스 적용 교훈
├── data/                    # 데이터 출처 및 전처리 산출물
├── src/                     # 실제 웹앱 코드
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── tests/                   # 테스트 케이스
```

## 7. 진행 로그

- **2026-05-18**: 프로젝트 킥오프 / 주제·스택 확정 / repo 개설

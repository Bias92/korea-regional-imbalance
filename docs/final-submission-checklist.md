# 최종 제출 체크리스트

본 문서는 제출 직전에 확인할 항목을 한곳에 모은 운영용 체크리스트다.
`docs/submission-evidence.md`가 과제 요구사항과 증빙의 매핑이라면, 이 문서는 실제 제출 파일과
검증 명령 중심으로 확인한다.

---

## 1. 제출 파일

| 항목 | 파일 또는 위치 | 상태 |
|---|---|---|
| PDF 보고서 | `docs/final-report.pdf` | 준비 완료 |
| PDF 원본 | `docs/final-report.html` | 준비 완료 |
| 데스크톱 화면 캡처 | `docs/assets/screenshots/2026-06-02-dashboard-capture.png` | 준비 완료 |
| 모바일 화면 캡처 | `docs/assets/screenshots/2026-06-02-dashboard-mobile.png` | 준비 완료 |
| GitHub 증빙 저장소 | `https://github.com/Bias92/korea-regional-imbalance` | main 브랜치에 누적 |
| GitHub Pages 데모 | `https://bias92.github.io/korea-regional-imbalance/` | 2026-06-03 배포 성공 및 200 OK 확인 |
| PWA 설치성 | `manifest.webmanifest`, `service-worker.js`, `assets/icons/` | 앱처럼 설치 가능한 웹앱 구성 완료 |
| 프로세스 증빙 인덱스 | `docs/submission-evidence.md` | 준비 완료 |

---

## 2. 제출 전 실행 명령

```bash
npm test
npm run report:pdf
pdfinfo docs/final-report.pdf
git status --short --branch
```

기대 결과는 다음과 같다.

| 명령 | 기대 결과 |
|---|---|
| `npm test` | 데이터 검증, UI 계약 검증, 제출물 검증 모두 통과 |
| `npm run report:pdf` | `docs/final-report.pdf` 재생성 |
| `pdfinfo docs/final-report.pdf` | A4 PDF, 7페이지, 암호화 없음 |
| `git status --short --branch` | `main...origin/main` 상태에서 변경 없음 |

---

## 3. 보고서에 반드시 언급할 포인트

- 적용 방법론: 위험 기반 반복·점진 개발
- 보조 방법: V-Model식 추적성, ADR 기반 설계 결정, 회고 기반 개선
- 요구사항 분석: 일반 사용자, 과제 평가자, 프로젝트 리뷰어 관점
- 품질 관리: `npm test`, UI 계약 검증, 제출물 검증, GitHub Actions
- 바이브코딩 효과: 구현 속도 향상, 스코프 통제, 설명 가능한 산출물, 회귀 방지
- 사용자 피드백 반영: 단순 표시 앱이라는 약점을 정책 대응 시뮬레이터 요구사항으로 전환
- 앱/웹 구분: 네이티브 앱은 아니지만 PWA로 설치 가능한 정적 웹앱
- 한계: 시도별 분석값 일부는 임시 데이터이므로 최종 정책 판단 지표가 아니라 데모용 분석 지표

---

## 4. 마지막 남은 선택 작업

| 작업 | 필수 여부 | 판단 |
|---|---|---|
| 공식 시도별 데이터 전체 교체 | 선택 | 데이터 신뢰도는 높아지지만 검증 시간이 필요하므로 별도 커밋으로 진행 |
| GitHub Pages 실제 URL 확인 | 권장 | 완료, `https://bias92.github.io/korea-regional-imbalance/` |
| PDF 문장 다듬기 | 권장 | 분량과 수업 제출 양식에 맞춰 최종 조정 |

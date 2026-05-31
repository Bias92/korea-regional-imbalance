# 2026-06-01 보고서 준비 기능과 초안 추가

## 작업 배경

Phase 3 기능 초안까지 들어간 뒤 남은 큰 과제는 최종 보고서와 QA였다. 앱 기능과 문서가 따로
움직이면 제출 직전에 화면 상태와 보고서 내용이 어긋날 수 있다. 따라서 앱에서 현재 분석 상태를
보고서용 Markdown으로 내보내고, 별도 최종 보고서 초안 문서를 작성하기로 했다.

## 구현 내용

- 보고서 요약 패널 추가
- 현재 시나리오 기준 보고서 요약 카드 추가
- Markdown 다운로드 기능 추가
- 최종 보고서 초안 문서 추가
- README 문서 읽는 순서에 보고서 초안 추가
- lessons learned에 보고서 전환 교훈 추가

## 검증

```bash
node --check src/app.js
node tests/verify-data.mjs
node tests/verify-ui-contract.mjs
python -m json.tool data/phase1-regions.json
python -m json.tool data/skorea-provinces-2018-topo-simple.json
```

브라우저 확인 항목:

- 보고서 요약 카드 3개 표시
- 위험지수 시나리오 전환 후 보고서 요약 카드 갱신
- 보고서 요약 MD 버튼 표시

## 남은 리스크

- 최종 보고서에는 실제 화면 캡처를 추가해야 한다.
- 시도별 공식 데이터 교체 전까지 위험지수 관련 결론은 잠정 결과로 서술해야 한다.
- GitHub Pages 배포 여부를 최종 제출 전 결정해야 한다.

# 2026-06-03 GitHub Pages 최종화 로그

## 배경

제출 직전 점검에서 예상 Pages URL `https://bias92.github.io/korea-regional-imbalance/`가 404를 반환했다.
로컬 테스트와 CI는 통과했지만, 실제 제출자가 클릭할 배포 링크가 동작하지 않으면 제출 리스크가 남는다.

## 확인 결과

- `npm test`는 로컬에서 통과했다.
- GitHub Actions `CI` 워크플로는 성공했다.
- `Deploy Pages` 워크플로는 `actions/configure-pages@v5` 단계에서 실패했다.
- 실패 원인은 repository Pages site가 아직 활성화되지 않아 GitHub Pages API가 404를 반환한 것이다.

## 반영 사항

`.github/workflows/pages.yml`의 `Configure GitHub Pages` 단계에 `enablement: true`를 추가했다.
이 변경은 Pages 사이트가 아직 만들어지지 않은 저장소에서도 GitHub Actions 기반 Pages 배포를 활성화하기 위한 조치다.

추가로 `gh api`를 사용해 저장소의 Pages site를 `build_type: workflow`로 직접 생성했다.
이후 `Deploy Pages` 워크플로를 수동 실행했고, 해당 실행은 성공했다.

## 최종 확인

- Pages URL: `https://bias92.github.io/korea-regional-imbalance/`
- 루트 URL 응답: `200 OK`
- 앱 URL 응답: `200 OK`
- 앱 HTML에서 `대응 시뮬레이터` 섹션 확인

## 교훈

제출용 배포는 워크플로 파일이 존재하는 것만으로 완료되지 않는다. 실제 URL 접근, Actions 로그,
Pages 활성화 상태를 모두 확인해야 제출 가능한 산출물이라고 볼 수 있다.

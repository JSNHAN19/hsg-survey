# 모의고사 대시보드 사용 후기 설문

선생님 대상 익명 사용 후기 설문. GitHub Pages로 배포하고, 응답은 Apps Script를 거쳐 Google Sheets에 쌓인다.

```
[설문 페이지 (GitHub Pages)] --POST text/plain--> [Apps Script 웹 앱 /exec] --appendRow--> [Google Sheet: Responses]
                                                                                            [Summary: 절약 시간·금액 자동 계산]
```

## 파일

| 파일 | 내용 |
|---|---|
| `index.html`, `styles.css`, `app.js` | 설문 페이지 (빌드 없음, 바닐라 JS) |
| `config.js` | Apps Script URL·토큰 — 배포 후 채워 넣기 |
| `apps-script/Code.gs` | 시트에 붙여넣을 수집 코드 |

## 시트 연결

1. 빈 스프레드시트 → **확장 프로그램 → Apps Script**
2. `Code.gs` 내용을 통째로 붙여넣고, 맨 위 `SHARED_TOKEN`을 랜덤 문자열로 바꾸기 → 저장
3. 함수 선택 `setup` → **실행** (처음엔 권한 허용: 고급 → 프로젝트로 이동 → 허용)
   - `Responses`, `Summary` 탭이 생김
4. (선택) `testInsert` 실행 → Responses에 TEST 줄 확인 → 그 줄 삭제
5. **배포 → 새 배포 → 웹 앱**
   - 다음 사용자 인증 정보로 실행: **나**
   - 액세스 권한: **모든 사용자**
   - 나온 `/exec` URL 복사
6. `config.js`에 `SUBMIT_URL`(그 URL), `SUBMIT_TOKEN`(2번 값) 넣고 커밋

### 코드 수정 후
저장만 하면 반영 안 됨 → **배포 관리 → 연필 → 버전: 새 버전 → 배포** (URL 유지됨). "새 배포"를 누르면 URL이 바뀜.

## Summary 탭

- 응답 수 / 중복 제외 기기 수 (두 값이 다르면 같은 기기 중복 제출 → `clientId`로 확인)
- 1회당 평균 절약(분), 1인당 연간 절약(시간), 합계 연간 절약(시간)
- **B8 시간당 단가(원)** 를 직접 넣으면 B9에 연간 절감액 합계가 계산됨
- 사용 편의성·추천 지수·NPS·다음 학기 사용 의향·도입 건의 의향·기능별 만족도

## 기타

- 같은 브라우저에서 제출하면 다시 열어도 완료 화면이 뜸. 테스트할 때는 주소 뒤에 `?reset=1`
- `SUBMIT_URL`이 비어 있으면 제출 시 콘솔에만 출력됨 (로컬 테스트용)
- 로컬 실행: `python3 -m http.server 8000` → http://localhost:8000

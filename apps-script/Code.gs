/**
 * 모의고사 대시보드 사용 후기 설문 — 응답 수집용 Apps Script
 *
 * 1) 아래 SHARED_TOKEN에 아무 랜덤 문자열을 넣고, 사이트 config.js의 SUBMIT_TOKEN에도 같은 값을 넣는다.
 * 2) 함수 선택에서 setup 실행 → Responses / Summary 탭이 만들어진다.
 * 3) 배포 → 새 배포 → 웹 앱 (실행: 나, 액세스: 모든 사용자) → /exec URL을 config.js의 SUBMIT_URL에 넣는다.
 */

var SHARED_TOKEN = 'CHANGE-ME';   // 예: 'hsg-8k2m7q'
var NOTIFY_EMAIL = '';            // 새 응답 알림 받을 메일 (비워두면 알림 없음)

var RESP = 'Responses';
var SUMM = 'Summary';
var FEAT = ['정오표로 시험 자동 등록', '태블릿 OMR 제출', '자동 채점', '과목별 과락·약점 파악', '학생별 점수 추이', '전체 학생 추이'];

var HEADERS = [
  'submittedAt', 'clientId', 'durationSec',
  'saved_per_exam_min', 'exams_per_year', 'annual_saved_hours',
  'B1_before_min', 'B1_after_min', 'B1_saved_min',
  'B2_before_min', 'B2_after_min', 'B2_saved_min',
  'B3_before_min', 'B3_after_min', 'B3_saved_min',
  'B4', 'B5', 'C1'
].concat(FEAT.map(function (f) { return 'C2_' + f; }))
 .concat(['C3', 'C4', 'C5', 'D1', 'D2', 'D3', 'E1', 'E2', 'raw_json']);

function doGet() {
  return json_({ ok: true, status: 'ready' });
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.token !== SHARED_TOKEN) return json_({ ok: false, error: 'unauthorized' });
    var data = body.data || {};

    var sh = sheet_(RESP);
    var headers = ensureHeaders_(sh);
    Object.keys(data).forEach(function (k) {
      if (headers.indexOf(k) < 0) {
        headers.splice(headers.length - 1, 0, k); // raw_json 앞에 새 컬럼 추가
      }
    });
    if (headers.length !== sh.getLastColumn()) writeHeaders_(sh, headers);

    var row = headers.map(function (h) {
      if (h === 'submittedAt') return new Date();
      if (h === 'raw_json') return JSON.stringify(data);
      var v = data[h];
      return v === undefined || v === null ? '' : v;
    });
    sh.appendRow(row);

    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, '[모의고사 대시보드 설문] 새 응답',
        '1회당 절약 ' + (data.saved_per_exam_min || 0) + '분 · 연간 ' + (data.annual_saved_hours || 0) + '시간\n' +
        '시트: ' + SpreadsheetApp.getActiveSpreadsheet().getUrl());
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/** 처음 한 번 실행: 탭과 헤더, 요약 시트를 만든다. 다시 실행해도 응답은 지워지지 않는다. */
function setup() {
  var sh = sheet_(RESP);
  ensureHeaders_(sh);
  sh.setFrozenRows(1);
  sh.getRange(1, 1, 1, sh.getLastColumn()).setFontWeight('bold').setBackground('#E1ECE6');
  buildSummary_();
}

/** 테스트 응답 한 줄 넣기 (확인 후 그 줄은 지워도 됨) */
function testInsert() {
  var data = {
    clientId: 'TEST', durationSec: 180, saved_per_exam_min: 150, exams_per_year: 4, annual_saved_hours: 10,
    B1_before_min: 120, B1_after_min: 15, B1_saved_min: 105, B4: '4회', C1: '자동 채점', C3: 5, D1: '꼭 사용하고 싶습니다', D2: 9
  };
  var res = doPost({ postData: { contents: JSON.stringify({ token: SHARED_TOKEN, data: data }) } });
  Logger.log(res.getContent());
}

function buildSummary_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SUMM) || ss.insertSheet(SUMM);
  sh.clear();

  function col(name) {
    return 'INDEX(' + RESP + '!$A$2:$AZ,0,MATCH("' + name + '",' + RESP + '!$A$1:$AZ$1,0))';
  }
  function nonEmpty(name) { return 'FILTER(' + col(name) + ',' + col(name) + '<>"")'; }

  var rows = [
    ['항목', '값', '메모'],
    ['응답 수 (전체 줄)', '=COUNTA(' + col('submittedAt') + ')', ''],
    ['응답 기기 수 (중복 제외)', '=IFERROR(COUNTUNIQUE(' + nonEmpty('clientId') + '),0)', '위 숫자보다 적으면 같은 기기에서 중복 제출된 줄이 있음 (clientId 확인)'],
    ['', '', ''],
    ['1회당 평균 절약 (분)', '=IFERROR(ROUND(AVERAGE(' + col('saved_per_exam_min') + '),1),0)', 'B1~B3 (도입 전 − 도입 후) 합'],
    ['1인당 평균 연간 절약 (시간)', '=IFERROR(ROUND(AVERAGE(' + col('annual_saved_hours') + '),1),0)', '1회당 절약 × 연간 실시 횟수'],
    ['응답자 합계 연간 절약 (시간)', '=IFERROR(ROUND(SUM(' + col('annual_saved_hours') + '),1),0)', ''],
    ['시간당 단가 (원)', '', '← 직접 입력 (기준을 정해서 넣기)'],
    ['연간 절감액 합계 (원)', '=IF(B8="","",ROUND(B7*B8,0))', '합계 연간 절약 × 시간당 단가'],
    ['', '', ''],
    ['사용 편의성 평균 (1~5)', '=IFERROR(ROUND(AVERAGE(' + col('C3') + '),2),"")', 'C3'],
    ['추천 지수 평균 (0~10)', '=IFERROR(ROUND(AVERAGE(' + col('D2') + '),1),"")', 'D2'],
    ['NPS', '=IFERROR(ROUND((COUNTIF(' + col('D2') + ',">=9")-COUNTIF(' + col('D2') + ',"<=6"))/COUNT(' + col('D2') + ')*100,0),"")', '9~10점 비율 − 0~6점 비율'],
    ['다음 학기 사용 의향 (긍정 비율)', '=IFERROR(TEXT((COUNTIF(' + col('D1') + ',"꼭 사용하고 싶습니다")+COUNTIF(' + col('D1') + ',"사용할 것 같습니다"))/COUNTA(' + col('submittedAt') + '),"0%"),"")', '꼭 + 사용할 것 같다'],
    ['정식 도입 건의 의향 (긍정 비율)', '=IFERROR(TEXT((COUNTIF(' + col('D3') + ',"적극 건의하겠습니다")+COUNTIF(' + col('D3') + ',"요청이 있으면 지지하겠습니다"))/COUNTA(' + col('submittedAt') + '),"0%"),"")', '적극 + 지지'],
    ['', '', ''],
    ['기능별 만족도 평균 (1~5)', '', '"안 써봄"은 제외하고 계산']
  ];
  FEAT.forEach(function (f) {
    rows.push(['  ' + f, '=IFERROR(ROUND(AVERAGE(' + col('C2_' + f) + '),2),"")', '']);
  });
  rows.push(['', '', '']);
  rows.push(['가장 도움 된 기능 (C1 응답 수)', '', '']);
  FEAT.forEach(function (f) {
    rows.push(['  ' + f, '=COUNTIF(' + col('C1') + ',"' + f + '")', '']);
  });

  sh.getRange(1, 1, rows.length, 3).setValues(rows.map(function (r) { return r.map(function (v) { return v; }); }));
  // setValues는 '='로 시작하는 문자열을 수식으로 처리함
  sh.getRange(1, 1, 1, 3).setFontWeight('bold').setBackground('#E1ECE6');
  sh.getRange('B8').setBackground('#FFF7D6').setNumberFormat('#,##0');
  sh.getRange('B9').setNumberFormat('#,##0');
  sh.setColumnWidth(1, 260); sh.setColumnWidth(2, 140); sh.setColumnWidth(3, 380);
  sh.setFrozenRows(1);
}

/* ---------- helpers ---------- */
function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  return ss.getSheetByName(name) || ss.insertSheet(name);
}
function ensureHeaders_(sh) {
  if (sh.getLastRow() === 0 || sh.getLastColumn() === 0) {
    writeHeaders_(sh, HEADERS.slice());
    return HEADERS.slice();
  }
  return sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String);
}
function writeHeaders_(sh, headers) {
  sh.getRange(1, 1, 1, headers.length).setValues([headers]);
}
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

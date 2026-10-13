(function () {
  'use strict';

  /* ---------------- data ---------------- */
  var FEAT = ['정오표로 시험 자동 등록', '태블릿 OMR 제출', '자동 채점', '과목별 과락·약점 파악', '학생별 점수 추이', '전체 학생 추이'];
  var TIME = [[0, '0'], [15, '15분'], [30, '30분'], [60, '1시간'], [90, '1.5시간'], [120, '2시간'], [180, '3시간'], [270, '4시간+']];
  var SECS = [
    { num: '01', title: '시간 절감', sub: '모의고사 1회 기준으로,\n대시보드 도입 전과 후를 비교해 주세요.' },
    { num: '02', title: '기능 평가', sub: '어떤 기능이 쓸모 있었는지\n솔직하게 알려주세요.' },
    { num: '03', title: '지속 사용', sub: '다음 학기 이야기를\n잠시 여쭙겠습니다.' },
    { num: '04', title: '마무리', sub: '거의 다 왔습니다.\n마지막 두 문항입니다.' }
  ];
  var Q = [
    { id: 'B1', sec: 0, type: 'time', req: true, title: '답안 수합·채점에\n얼마나 걸리셨나요?', hint: '종이 OMR 수합, 수기 채점, 엑셀 입력 등을 모두 포함해서 고려해주세요!' },
    { id: 'B2', sec: 0, type: 'time', req: true, title: '과목별 점수·과락 집계는\n얼마나 걸리셨나요?', hint: '5과목 105문항 분류와 과락자 파악까지 모두 포함해서 고려해주세요!' },
    { id: 'B3', sec: 0, type: 'time', req: true, title: '학생별 약점 분석과\n상담 자료 준비에는\n얼마나 걸리셨나요?', hint: '학생 1명당이 아닌, 전체 학생 기준 합계로 골라주시면 됩니다.' },
    { id: 'B4', sec: 0, type: 'single', req: true, title: '1년에 모의고사를\n보통 몇 회 실시하시나요?', hint: '연간 절약 시간을 계산하는 데 활용됩니다.', opts: ['2회', '4회', '6회', '8회', '10회 이상'], vals: [2, 4, 6, 8, 10] },
    { id: 'B5', sec: 0, type: 'multi', req: false, title: '아낀 시간은\n주로 어디에\n활용하실 수 있을까요?', hint: '여러 개 선택하셔도 괜찮습니다.', opts: ['학생 상담', '수업 준비', '다른 행정 업무', '기타'] },
    { id: 'C1', sec: 1, type: 'single', req: true, title: '가장 도움이 된\n기능 하나만 골라주세요', hint: '', opts: FEAT },
    { id: 'C2', sec: 1, type: 'grid', req: true, title: '기능별 만족도를\n매겨주세요', hint: '1 매우 불만족 · 5 매우 만족', rows: FEAT },
    { id: 'C3', sec: 1, type: 'scale', req: true, title: '전반적으로\n사용하기 편하셨나요?', hint: '', lo: '매우 어려움', hi: '매우 쉬움', n0: 1, n1: 5 },
    { id: 'C4', sec: 1, type: 'text', req: false, title: '불편했거나 오류가 났던 점이\n있다면 알려주세요', hint: '없으시면 비워두셔도 괜찮습니다.', ph: '예: 태블릿에서 제출 버튼이 잘 눌리지 않았습니다' },
    { id: 'C5', sec: 1, type: 'multi', req: false, title: '추가되면 좋을 기능을\n골라주세요', hint: '여러 개 선택하셔도 괜찮습니다.', opts: ['엑셀·PDF 내보내기', '학생 개인 성적표 출력', '문항별 오답률', '반별·학년별 비교', '과락 위험 알림', '학부모 공유 리포트', '기타'] },
    { id: 'D1', sec: 2, type: 'single', req: true, title: '다음 학기에도\n이어서 사용하실\n의향이 있으신가요?', hint: '', opts: ['꼭 사용하고 싶습니다', '사용할 것 같습니다', '잘 모르겠습니다', '사용하지 않을 것 같습니다'] },
    { id: 'D2', sec: 2, type: 'scale', req: true, title: '다른 선생님께 추천하실\n가능성은 얼마나 되나요?', hint: '', lo: '0 전혀 없음', hi: '10 매우 높음', n0: 0, n1: 10 },
    { id: 'D3', sec: 2, type: 'single', req: true, title: '학교 측에 정식 도입을\n건의해주실 의향이 있으신가요?', hint: '', opts: ['적극 건의하겠습니다', '요청이 있으면 지지하겠습니다', '잘 모르겠습니다', '건의할 생각은 없습니다'] },
    { id: 'E1', sec: 3, type: 'text', req: false, title: '개발자에게\n한마디 남겨주세요', hint: '사용 후기, 아쉬운 점 등 무엇이든 편하게 남겨주세요.', ph: '자유롭게 적어주세요' },
    { id: 'E2', sec: 3, type: 'single', req: true, title: '남겨주신 후기를\n사례 소개(개인 인스타그램\n게시물)에 인용해도 될까요?', hint: '학교명, 선생님 성함 등 개인정보는 일절 공개되지 않습니다', opts: ['익명으로 인용해도 좋습니다', '숫자 통계로만 활용해주세요', '인용하지 않았으면 합니다'] }
  ];
  var LAST = Q.length + 1;
  var DONE_KEY = 'hsg-survey-done-v1';
  var ID_KEY = 'hsg-survey-client-v1';

  /* ---------------- helpers ---------------- */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmt(min) {
    min = Math.max(0, Math.round(min));
    if (min === 0) return '0분';
    var h = Math.floor(min / 60), m = min % 60;
    return (h ? h + '시간' : '') + (h && m ? ' ' : '') + (m ? m + '분' : '');
  }
  function secOf(step) { return step >= 1 && step <= Q.length ? Q[step - 1].sec : null; }
  function reduced() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function store(key, val) {
    try { if (val === undefined) return localStorage.getItem(key); localStorage.setItem(key, val); } catch (e) { return null; }
  }
  function uid() {
    try { if (window.crypto && crypto.randomUUID) return crypto.randomUUID(); } catch (e) {}
    return 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
  }
  function lines(text) {
    return text.split('\n').map(function (l) { return '<span class="line"><span data-m>' + esc(l) + '</span></span>'; }).join('');
  }
  var CHECK = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1E5B4A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"></path></svg>';
  var ARROW = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"></path><path d="M13 6l6 6-6 6"></path></svg>';

  /* ---------------- state ---------------- */
  var cfg = window.SURVEY_CONFIG || {};
  var clientId = store(ID_KEY) || (function () { var id = uid(); store(ID_KEY, id); return id; })();
  var state = { step: 0, answers: {}, startedAt: null, submitting: false, error: '' };
  var busy = false;
  var shownSaved = 0, savedRaf = 0, countRaf = 0;
  var timers = [];

  var stage = $('stage'), nav = $('nav'), btnPrev = $('prev'), btnNext = $('next');
  var counter = $('counter'), barFill = $('barFill'), overlay = $('overlay');

  /* ---------------- calc ---------------- */
  function perExam(ans) {
    var sum = 0;
    ['B1', 'B2', 'B3'].forEach(function (id) {
      var a = ans[id];
      if (a && a.b != null && a.a != null) sum += Math.max(0, a.b - a.a);
    });
    return sum;
  }
  function examsPerYear(ans) { return ans.B4 != null ? Q[3].vals[ans.B4] : 0; }

  function answered(step) {
    if (step < 1 || step > Q.length) return true;
    var q = Q[step - 1], a = state.answers[q.id];
    if (!q.req) return true;
    if (q.type === 'time') return !!a && a.b != null && a.a != null;
    if (q.type === 'grid') return !!a && FEAT.every(function (_, i) { return a[i] != null; });
    return a != null;
  }

  /* ---------------- render ---------------- */
  function introHTML() {
    return '<div class="screen">' +
      '<h1 class="hero">' + lines('사용하신 후기가\n궁금합니다.') + '</h1>' +
      '<div data-r class="rule"></div>' +
      '<div class="prose">' +
        '<p data-a>안녕하세요, 선생님. 모의고사 대시보드를 만든 <strong>한진규</strong>입니다.😁</p>' +
        '<p data-a>그동안 제대로 인사드릴 기회가 없어 이렇게나마 인사드립니다. 바쁜 학기 중에 낯선 도구를 믿고 학생들과 직접 써주셔서 감사합니다.</p>' +
        '<p data-a>이번 설문으로 대시보드의 만족도를 조사하고, 다음 학기에 더 쓸모 있게 다듬으려 합니다.</p>' +
        '<p data-a>설문은 익명으로 진행됩니다!</p>' +
      '</div>' +
      '<div class="facts">' +
        '<div data-a><small>소요 시간</small><b>약 3분</b></div>' +
        '<div data-a><small>질문 수</small><b>15문항</b></div>' +
        '<div data-a><small>응답 방식</small><b>익명</b></div>' +
      '</div>' +
      '<div class="grow"></div>' +
      '<button data-a class="btn btn-primary btn-start" type="button" data-act="start"><span>시작하기</span>' + ARROW + '</button>' +
    '</div>';
  }

  function doneHTML() {
    return '<div class="screen">' +
      '<h1 class="hero">' + lines('감사합니다,\n선생님.') + '</h1>' +
      '<div data-r class="rule"></div>' +
      '<div class="prose"><p data-a>남겨주신 답변이 잘 전달되었습니다. 다음 학기에는 더 쓸모 있는 도구로 찾아뵙겠습니다.</p></div>' +
      '<div class="stats">' +
        '<div data-a><small>모의고사 1회당</small><span id="doneOnce" class="big num">0분</span></div>' +
        '<div data-a><small>1년이면</small><span id="doneAnnual" class="big num">0.0시간</span></div>' +
      '</div>' +
      '<p data-a class="note">선생님께서 선택하신 값으로 계산한 추정치입니다.</p>' +
      '<div class="grow"></div>' +
      '<p data-a class="sign">한진규 드림</p>' +
    '</div>';
  }

  function questionHTML(q) {
    var h = '<div class="q">' +
      '<div data-a class="meta"><span class="code num">' + q.id + '</span><span>' + esc(SECS[q.sec].title) + '</span><span class="req">' + (q.req ? '필수' : '선택') + '</span></div>';
    if (q.type === 'time') h += '<span data-a class="tag">모의고사 1회 기준</span>';
    h += '<h1 class="qtitle">' + lines(q.title) + '</h1>';
    if (q.hint) h += '<p data-a class="hint">' + esc(q.hint) + '</p>';

    if (q.type === 'time') {
      var grp = function (key, label) {
        return '<div data-a class="group"><span class="group-label">' + label + '</span><div class="chips">' +
          TIME.map(function (t) {
            return '<button class="chip" type="button" data-kind="time" data-key="' + key + '" data-v="' + t[0] + '" aria-pressed="false">' + t[1] + '</button>';
          }).join('') + '</div></div>';
      };
      h += '<div class="time">' + grp('b', '도입 전') + grp('a', '도입 후') +
        '<div data-a class="tally"><small>지금까지 1회당 아낀 시간</small><span id="savedVal" class="big num">' + fmt(shownSaved) + '</span></div></div>';
    }
    if (q.type === 'single' || q.type === 'multi') {
      var multi = q.type === 'multi';
      h += '<div class="opts" role="group">' + q.opts.map(function (label, i) {
        return '<button data-a class="opt' + (multi ? ' multi' : '') + '" type="button" data-kind="opt" data-v="' + i + '" aria-pressed="false">' +
          '<span class="idx num">' + pad(i + 1) + '</span><span class="lbl">' + esc(label) + '</span><span class="mark">' + CHECK + '</span></button>';
      }).join('') + '</div>';
    }
    if (q.type === 'grid') {
      h += '<div class="grid">' + q.rows.map(function (label, r) {
        return '<div data-a class="row"><span class="row-label">' + esc(label) + '</span><div class="cells">' +
          [1, 2, 3, 4, 5, 0].map(function (n) {
            return '<button class="chip" type="button" data-kind="grid" data-r="' + r + '" data-v="' + n + '" aria-pressed="false" aria-label="' + esc(label) + ' ' + (n ? n + '점' : '안 써봄') + '">' + (n ? n : '안 씀') + '</button>';
          }).join('') + '</div></div>';
      }).join('') + '</div>';
    }
    if (q.type === 'scale') {
      var cells = '';
      for (var n = q.n0; n <= q.n1; n++) cells += '<button class="chip num" type="button" data-kind="scale" data-v="' + n + '" aria-pressed="false">' + n + '</button>';
      h += '<div class="scale ' + (q.n1 - q.n0 + 1 <= 5 ? 's5' : 's11') + '"><div data-a class="cells">' + cells + '</div>' +
        '<div data-a class="scale-ends"><span>' + esc(q.lo) + '</span><span>' + esc(q.hi) + '</span></div></div>';
    }
    if (q.type === 'text') {
      var v = state.answers[q.id] || '';
      h += '<div class="textwrap"><textarea data-a class="ta" rows="6" maxlength="500" placeholder="' + esc(q.ph) + '" aria-label="' + esc(q.title.replace(/\n/g, ' ')) + '">' + esc(v) + '</textarea>' +
        '<span data-a class="count num"><span id="len">' + v.length + '</span> / 500</span></div>';
    }
    h += '<p id="err" class="err" role="alert"' + (state.error ? '' : ' hidden') + '>' + esc(state.error) + '</p>';
    return h + '</div>';
  }

  function render() {
    var s = state.step, isQ = s >= 1 && s <= Q.length;
    stage.innerHTML = s === 0 ? introHTML() : s === LAST ? doneHTML() : questionHTML(Q[s - 1]);
    stage.scrollTop = 0;
    nav.hidden = !isQ;
    counter.textContent = isQ ? pad(s) + ' / ' + Q.length : (s === LAST ? '완료' : '2026 · 2학기');
    barFill.style.width = (isQ ? (s / Q.length) * 100 : (s === LAST ? 100 : 0)) + '%';
    if (isQ) refresh();
  }

  function refresh() {
    var q = Q[state.step - 1], a = state.answers[q.id];
    Array.prototype.forEach.call(stage.querySelectorAll('[data-kind]'), function (el) {
      var k = el.getAttribute('data-kind'), v = +el.getAttribute('data-v'), on = false;
      if (k === 'time') on = !!a && a[el.getAttribute('data-key')] === v;
      else if (k === 'opt') on = q.type === 'multi' ? !!(a && a.indexOf(v) >= 0) : a === v;
      else if (k === 'grid') on = !!a && a[+el.getAttribute('data-r')] === v;
      else if (k === 'scale') on = a === v;
      el.classList.toggle('on', on);
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    var ok = answered(state.step);
    btnNext.disabled = !ok || state.submitting;
    btnNext.textContent = state.submitting ? '제출 중…' : (state.step === Q.length ? '제출하기' : '다음');
    btnPrev.disabled = state.submitting;
    var target = perExam(state.answers);
    if (Math.round(target) !== Math.round(shownSaved)) tweenSaved(target);
  }

  /* ---------------- motion ---------------- */
  function animItems() {
    return Array.prototype.slice.call(stage.querySelectorAll('[data-a],[data-m],[data-r]'));
  }
  function cancelAnims(els) {
    els.forEach(function (el) { if (el.getAnimations) el.getAnimations().forEach(function (a) { a.cancel(); }); });
  }
  function animIn(dir, base) {
    var els = animItems();
    if (reduced() || !els.length || !els[0].animate) return;
    els.forEach(function (el, i) {
      var kf, dur = 640;
      if (el.hasAttribute('data-m')) { kf = [{ transform: 'translateY(110%)' }, { transform: 'translateY(0)' }]; dur = 760; }
      else if (el.hasAttribute('data-r')) { kf = [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }]; dur = 900; }
      else { kf = [{ opacity: 0, transform: 'translateY(' + (26 * dir) + 'px)' }, { opacity: 1, transform: 'translateY(0)' }]; }
      el.animate(kf, { duration: dur, delay: base + 40 + Math.min(i, 14) * 48, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    });
  }
  function animOut(dir) {
    var els = animItems();
    if (reduced() || !els.length || !els[0].animate) return Promise.resolve();
    els.forEach(function (el, i) {
      var kf = el.hasAttribute('data-m')
        ? [{ transform: 'translateY(0)' }, { transform: 'translateY(-110%)' }]
        : [{ opacity: 1, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(' + (-14 * dir) + 'px)' }];
      el.animate(kf, { duration: 220, delay: Math.min(i, 9) * 16, easing: 'cubic-bezier(.55,0,.75,.2)', fill: 'forwards' });
    });
    return new Promise(function (r) { timers.push(setTimeout(r, 220 + Math.min(els.length - 1, 9) * 16)); });
  }
  function wipe(nxt, done) {
    var sec = SECS[secOf(nxt)];
    $('ovNum').textContent = sec.num;
    $('ovTitle').textContent = sec.title;
    $('ovSub').textContent = sec.sub;
    var inner = Array.prototype.slice.call(overlay.querySelectorAll('[data-o]'));
    cancelAnims([overlay].concat(inner));
    var ease = 'cubic-bezier(.76,0,.24,1)';
    overlay.animate([{ transform: 'translateY(100%)' }, { transform: 'translateY(0)' }], { duration: 620, easing: ease, fill: 'forwards' });
    inner.forEach(function (el, i) {
      var isRule = el.classList.contains('ov-rule');
      el.animate(isRule ? [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }] : [{ opacity: 0, transform: 'translateY(56px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: isRule ? 800 : 700, delay: 300 + i * 80, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    });
    var hold = 1000;
    timers.push(setTimeout(function () {
      state.step = nxt;
      render();
      animIn(1, hold + 260);
      timers.push(setTimeout(function () {
        overlay.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-100%)' }], { duration: 680, easing: ease, fill: 'forwards' });
      }, hold));
      timers.push(setTimeout(done, hold + 680));
    }, 620));
  }
  function tween(from, to, dur, apply, which) {
    if (which === 'saved') cancelAnimationFrame(savedRaf); else cancelAnimationFrame(countRaf);
    if (reduced()) { apply(to); return; }
    var t0 = null;
    var f = function (now) {
      if (t0 === null) t0 = now;
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      apply(from + (to - from) * e);
      if (p < 1) { if (which === 'saved') savedRaf = requestAnimationFrame(f); else countRaf = requestAnimationFrame(f); }
    };
    if (which === 'saved') savedRaf = requestAnimationFrame(f); else countRaf = requestAnimationFrame(f);
  }
  function tweenSaved(target) {
    tween(shownSaved, target, 700, function (v) {
      shownSaved = v;
      var el = $('savedVal'); if (el) el.textContent = fmt(v);
    }, 'saved');
  }
  function countUp(once, annualH) {
    var a = $('doneOnce'), b = $('doneAnnual');
    tween(0, 1, 1600, function (t) {
      if (a) a.textContent = fmt(once * t);
      if (b) b.textContent = (annualH * t).toFixed(1) + '시간';
    }, 'count');
  }

  /* ---------------- flow ---------------- */
  function go(d) {
    if (busy) return;
    var cur = state.step, nxt = cur + d;
    if (nxt < 0 || nxt > LAST) return;
    if (d > 0 && !answered(cur)) return;
    if (nxt === LAST) { submit(); return; }
    busy = true;
    state.error = '';
    if (cur === 0 && !state.startedAt) state.startedAt = Date.now();
    var cross = d > 0 && secOf(nxt) !== null && secOf(nxt) !== secOf(cur);
    animOut(d).then(function () {
      if (cross && !reduced() && overlay.animate) {
        wipe(nxt, function () { busy = false; });
      } else {
        state.step = nxt;
        render();
        animIn(d, 0);
        busy = false;
      }
    });
  }

  function payload() {
    var ans = state.answers, row = {};
    var pe = perExam(ans), ey = examsPerYear(ans);
    row.clientId = clientId;
    row.durationSec = state.startedAt ? Math.round((Date.now() - state.startedAt) / 1000) : '';
    row.saved_per_exam_min = pe;
    row.exams_per_year = ey;
    row.annual_saved_hours = Math.round(pe * ey / 60 * 10) / 10;
    Q.forEach(function (q) {
      var a = ans[q.id];
      if (q.type === 'time') {
        row[q.id + '_before_min'] = a ? a.b : '';
        row[q.id + '_after_min'] = a ? a.a : '';
        row[q.id + '_saved_min'] = a && a.b != null && a.a != null ? Math.max(0, a.b - a.a) : '';
      } else if (q.type === 'single') {
        row[q.id] = a != null ? q.opts[a] : '';
      } else if (q.type === 'multi') {
        row[q.id] = a && a.length ? a.slice().sort(function (x, y) { return x - y; }).map(function (i) { return q.opts[i]; }).join(', ') : '';
      } else if (q.type === 'grid') {
        q.rows.forEach(function (label, r) {
          var v = a ? a[r] : null;
          row['C2_' + label] = v == null ? '' : (v === 0 ? '안 써봄' : v);
        });
      } else {
        row[q.id] = a != null ? a : '';
      }
    });
    return row;
  }

  function finish(row) {
    store(DONE_KEY, JSON.stringify({ once: row.saved_per_exam_min, annual: row.annual_saved_hours }));
    state.submitting = false;
    animOut(1).then(function () {
      state.step = LAST;
      render();
      animIn(1, 0);
      timers.push(setTimeout(function () { countUp(row.saved_per_exam_min, row.annual_saved_hours); }, 450));
      busy = false;
    });
  }

  function submit() {
    if (state.submitting) return;
    busy = true;
    state.submitting = true;
    state.error = '';
    refresh();
    var row = payload();
    if (!cfg.SUBMIT_URL) {
      if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
        console.log('[survey] SUBMIT_URL 비어 있음 — 제출 데이터:', row);
        finish(row);
      } else {
        fail('제출 설정을 불러오지 못했습니다. 페이지를 새로고침한 뒤 다시 제출해주세요.');
      }
      return;
    }
    var body = JSON.stringify({ token: cfg.SUBMIT_TOKEN || '', data: row });
    fetch(cfg.SUBMIT_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, redirect: 'follow' })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res || !res.ok) throw new Error(res && res.error || 'failed');
        finish(row);
      })
      .catch(function (e) {
        console.error('[survey] 제출 실패', e);
        fail('제출에 실패했습니다. 인터넷 연결을 확인하신 뒤 다시 한 번 눌러주세요.');
      });
  }

  function fail(msg) {
    state.submitting = false;
    state.error = msg;
    busy = false;
    refresh();
    var err = $('err'); if (err) { err.textContent = msg; err.hidden = false; err.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  }

  /* ---------------- events ---------------- */
  stage.addEventListener('click', function (e) {
    var el = e.target.closest('button');
    if (!el || busy) return;
    if (el.getAttribute('data-act') === 'start') { go(1); return; }
    var k = el.getAttribute('data-kind');
    if (!k || state.submitting) return;
    var q = Q[state.step - 1], v = +el.getAttribute('data-v'), all = state.answers, cur = all[q.id];
    if (k === 'time') { var t = Object.assign({}, cur || {}); t[el.getAttribute('data-key')] = v; all[q.id] = t; }
    else if (k === 'opt') {
      if (q.type === 'multi') { var arr = (cur || []).slice(), i = arr.indexOf(v); if (i >= 0) arr.splice(i, 1); else arr.push(v); all[q.id] = arr; }
      else all[q.id] = v;
    }
    else if (k === 'grid') { var g = Object.assign({}, cur || {}); g[+el.getAttribute('data-r')] = v; all[q.id] = g; }
    else if (k === 'scale') all[q.id] = v;
    refresh();
  });
  stage.addEventListener('input', function (e) {
    if (!e.target.classList.contains('ta')) return;
    var q = Q[state.step - 1];
    state.answers[q.id] = e.target.value;
    var len = $('len'); if (len) len.textContent = e.target.value.length;
    refresh();
  });
  btnNext.addEventListener('click', function () { go(1); });
  btnPrev.addEventListener('click', function () { if (!state.submitting) go(-1); });

  /* ---------------- boot ---------------- */
  var prior = null;
  try { prior = JSON.parse(store(DONE_KEY) || 'null'); } catch (e) { prior = null; }
  if (prior && !/[?&]reset=1/.test(location.search)) {
    state.step = LAST;
    render();
    animIn(1, 0);
    timers.push(setTimeout(function () { countUp(prior.once || 0, prior.annual || 0); }, 450));
  } else {
    render();
    animIn(1, 0);
  }
})();

/* teacher-marks.js - upload and edit marks (one result per student, subject and exam) */
(function () {
  if (!T.ready) return;

  var mine = T.mySubjects();
  var classes = T.myClasses().filter(function (c) {
    return mine.some(function (s) { return s.class_id === c.class_id; });
  });
  if (!classes.length) { T.$('no-class').hidden = false; T.$('content').hidden = true; return; }

  var classSel = T.$('class'), subjectSel = T.$('subject'), examSel = T.$('exam'), rows = T.$('rows'), message = T.$('message');
  T.fillSelect(classSel, classes, function (c) { return c.class_id; }, T.classLabel);
  T.fillSelect(examSel, T.EXAMS, function (e) { return e; }, function (e) { return e; });

  function currentClass() {
    return classes.filter(function (c) { return String(c.class_id) === classSel.value; })[0];
  }
  function fillSubjects() {
    subjectSel.innerHTML = '';
    var cid = currentClass().class_id;
    T.fillSelect(subjectSel, mine.filter(function (s) { return s.class_id === cid; }),
                 function (s) { return s.subject_id; }, function (s) { return s.subject_name; });
  }

  function readMark(input) {            // returns null (blank), NaN (bad) or a number
    var v = input.value.trim();
    if (v === '') return null;
    if (!/^\d{1,3}(\.\d)?$/.test(v)) return NaN;
    var n = parseFloat(v);
    return n > T.FULL_MARKS ? NaN : n;
  }

  function updateSummary() {
    var vals = [];
    Array.prototype.forEach.call(rows.querySelectorAll('.mark-in'), function (inp) {
      var m = readMark(inp);
      var cell = inp.closest('tr').querySelector('.grade-cell');
      if (m === null || isNaN(m)) { cell.textContent = '-'; cell.classList.remove('fail'); return; }
      var g = T.grade(m);
      cell.textContent = g; cell.classList.toggle('fail', g === 'F');
      vals.push(m);
    });
    var total = rows.querySelectorAll('.mark-in').length;
    var html = '<span class="t-chip">Entered <strong>' + vals.length + ' of ' + total + '</strong></span>';
    if (vals.length) {
      var avg = vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
      html += '<span class="t-chip">Average <strong>' + avg.toFixed(1) + '</strong></span>' +
              '<span class="t-chip">Highest <strong>' + Math.max.apply(null, vals) + '</strong></span>' +
              '<span class="t-chip">Lowest <strong>' + Math.min.apply(null, vals) + '</strong></span>';
    }
    T.$('summary').innerHTML = html;
  }

  function render() {
    message.hidden = true;
    var cls = currentClass();
    var students = T.studentsOf(cls);
    var has = students.length > 0 && subjectSel.value !== '';
    T.$('empty').hidden = students.length > 0;
    T.$('table-wrap').hidden = !has;
    T.$('actions').hidden = !has;
    if (!has) { T.$('summary').innerHTML = ''; T.$('state').textContent = ''; return; }

    var sid = parseInt(subjectSel.value, 10);
    var existing = {};
    T.load('sms_results', []).forEach(function (r) {
      if (r.subject_id === sid && r.exam_name === examSel.value) existing[r.student_id] = r.marks;
    });
    var any = students.some(function (s) { return existing[s.student_id] !== undefined; });
    T.$('state').textContent = any
      ? 'Marks for this exam are already saved. You can change them and save again.'
      : 'No marks saved yet for this exam. Leave a box empty if a student did not sit the exam.';

    rows.innerHTML = students.map(function (s) {
      var v = existing[s.student_id] !== undefined ? existing[s.student_id] : '';
      return '<tr><td data-label="Roll">' + T.esc(s.roll_no) + '</td>' +
             '<td data-label="Name"><strong>' + T.esc(s.name) + '</strong></td>' +
             '<td data-label="Marks"><input class="mark-in" type="text" inputmode="decimal" maxlength="5" ' +
             'data-student="' + s.student_id + '" aria-label="Marks for ' + T.esc(s.name) + '" value="' + T.esc(v) + '">' +
             '<span class="cell-err"></span></td>' +
             '<td data-label="Grade" class="grade-cell">-</td></tr>';
    }).join('');
    updateSummary();
  }

  rows.addEventListener('input', updateSummary);
  classSel.addEventListener('change', function () { fillSubjects(); render(); });
  subjectSel.addEventListener('change', render);
  examSel.addEventListener('change', render);

  T.$('save-btn').addEventListener('click', function () {
    var inputs = Array.prototype.slice.call(rows.querySelectorAll('.mark-in'));
    var bad = null;
    inputs.forEach(function (inp) {
      var m = readMark(inp), err = inp.parentNode.querySelector('.cell-err');
      if (isNaN(m)) {
        inp.setAttribute('aria-invalid', 'true');
        err.textContent = 'Enter 0 to ' + T.FULL_MARKS + '.';
        if (!bad) bad = inp;
      } else { inp.removeAttribute('aria-invalid'); err.textContent = ''; }
    });
    if (bad) { bad.focus(); T.flash(message, 'Some marks are not valid. Fix the highlighted boxes and save again.', 'error'); return; }

    var sid = parseInt(subjectSel.value, 10), exam = examSel.value;
    var ids = inputs.map(function (i) { return parseInt(i.getAttribute('data-student'), 10); });
    var list = T.load('sms_results', []).filter(function (r) {
      return !(r.subject_id === sid && r.exam_name === exam && ids.indexOf(r.student_id) !== -1);
    });
    var next = T.nextId(T.load('sms_results', []), 'result_id'), saved = 0;
    inputs.forEach(function (inp) {
      var m = readMark(inp);
      if (m === null) return;
      list.push({ result_id: next++, student_id: parseInt(inp.getAttribute('data-student'), 10),
                  subject_id: sid, exam_name: exam, marks: m, grade: T.grade(m) });
      saved++;
    });
    T.save('sms_results', list);

    var subj = subjectSel.options[subjectSel.selectedIndex].textContent;
    T.log('marks', exam + ' marks saved for ' + T.classLabel(currentClass()) + ' - ' + subj);
    render();
    T.flash(message, 'Saved ' + saved + ' mark' + (saved === 1 ? '' : 's') + ' for ' + subj + ' (' + exam + ').', 'success');
    window.scrollTo(0, 0);
  });

  fillSubjects();
  render();
})();

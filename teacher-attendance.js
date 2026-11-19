/* teacher-attendance.js - take and edit attendance (one record per student per date) */
(function () {
  if (!T.ready) return;

  var classes = T.myClasses();
  if (!classes.length) { T.$('no-class').hidden = false; T.$('content').hidden = true; return; }

  var classSel = T.$('class'), dateInp = T.$('date'), rows = T.$('rows'), message = T.$('message');
  T.fillSelect(classSel, classes, function (c) { return c.class_id; }, T.classLabel);
  dateInp.max = T.today();
  dateInp.value = T.today();

  function currentClass() {
    return classes.filter(function (c) { return String(c.class_id) === classSel.value; })[0];
  }
  function validDate() {
    var d = dateInp.value;
    return /^\d{4}-\d{2}-\d{2}$/.test(d) && d <= T.today();
  }

  function updateSummary() {
    var n = { present: 0, absent: 0, late: 0 };
    Array.prototype.forEach.call(rows.querySelectorAll('input:checked'), function (i) { n[i.value]++; });
    T.$('summary').innerHTML =
      '<span class="t-chip">Present <strong>' + n.present + '</strong></span>' +
      '<span class="t-chip">Absent <strong>' + n.absent + '</strong></span>' +
      '<span class="t-chip">Late <strong>' + n.late + '</strong></span>';
  }

  function render() {
    message.hidden = true;
    var cls = currentClass();
    var students = T.studentsOf(cls);
    var hasStudents = students.length > 0;
    T.$('empty').hidden = hasStudents;
    T.$('table-wrap').hidden = !hasStudents;
    T.$('actions').hidden = !hasStudents;
    T.$('all-present').hidden = !hasStudents;
    if (!hasStudents) { T.$('state').textContent = ''; T.$('summary').innerHTML = ''; return; }

    if (!validDate()) {
      T.$('state').textContent = 'Choose a date that is today or earlier.';
      T.$('table-wrap').hidden = true; T.$('actions').hidden = true; T.$('summary').innerHTML = '';
      return;
    }

    var existing = {};
    T.load('sms_attendance', []).forEach(function (a) { if (a.date === dateInp.value) existing[a.student_id] = a.status; });
    var taken = students.some(function (s) { return existing[s.student_id]; });
    T.$('state').textContent = taken
      ? 'Attendance for ' + T.fmtDate(dateInp.value) + ' is already saved. You can change it and save again.'
      : 'Attendance for ' + T.fmtDate(dateInp.value) + ' is not taken yet. Everyone starts as Present.';

    rows.innerHTML = students.map(function (s) {
      var st = existing[s.student_id] || 'present';
      function radio(val, label, cls) {
        return '<label class="' + cls + '"><input type="radio" name="st-' + s.student_id + '" value="' + val + '"' +
               (st === val ? ' checked' : '') + '><span>' + label + '</span></label>';
      }
      return '<tr><td data-label="Roll">' + T.esc(s.roll_no) + '</td>' +
             '<td data-label="Name"><strong>' + T.esc(s.name) + '</strong></td>' +
             '<td data-label="Status"><div class="seg" role="radiogroup" aria-label="Status for ' + T.esc(s.name) + '">' +
             radio('present', 'Present', 'p') + radio('absent', 'Absent', 'a') + radio('late', 'Late', 'l') + '</div></td></tr>';
    }).join('');
    updateSummary();
  }

  rows.addEventListener('change', updateSummary);
  classSel.addEventListener('change', render);
  dateInp.addEventListener('change', render);

  T.$('all-present').addEventListener('click', function () {
    Array.prototype.forEach.call(rows.querySelectorAll('input[value="present"]'), function (i) { i.checked = true; });
    updateSummary();
  });

  T.$('save-btn').addEventListener('click', function () {
    var cls = currentClass();
    if (!cls || !validDate()) { T.flash(message, 'Choose a date that is today or earlier.', 'error'); return; }
    var students = T.studentsOf(cls);
    var list = T.load('sms_attendance', []);
    var nextId = T.nextId(list, 'attendance_id');
    var date = dateInp.value;

    students.forEach(function (s) {
      var checked = rows.querySelector('input[name="st-' + s.student_id + '"]:checked');
      if (!checked) return;
      var rec = list.filter(function (a) { return a.student_id === s.student_id && a.date === date; })[0];
      if (rec) { rec.status = checked.value; }
      else { list.push({ attendance_id: nextId++, student_id: s.student_id, date: date, status: checked.value }); }
    });
    T.save('sms_attendance', list);
    T.log('attendance', 'Attendance saved for ' + T.classLabel(cls) + ' (' + T.fmtDate(date) + ')');
    T.refreshBell();
    render();
    T.flash(message, 'Attendance saved for ' + T.classLabel(cls) + ' on ' + T.fmtDate(date) + '.', 'success');
    window.scrollTo(0, 0);
  });

  render();
})();

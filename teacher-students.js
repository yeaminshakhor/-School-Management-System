/* teacher-students.js - student list for my classes */
(function () {
  if (!T.ready) return;

  var classes = T.myClasses();
  if (!classes.length) { T.$('no-class').hidden = false; T.$('content').hidden = true; return; }

  var classSel = T.$('class'), q = T.$('q');
  T.fillSelect(classSel, classes, function (c) { return c.class_id; }, T.classLabel);

  var attendance = T.load('sms_attendance', []);
  function rate(studentId) {
    var rec = attendance.filter(function (a) { return a.student_id === studentId; });
    if (!rec.length) return '-';
    var ok = rec.filter(function (a) { return a.status !== 'absent'; }).length;
    return Math.round(ok / rec.length * 100) + '%';
  }

  function render() {
    var wanted = classSel.value ? classes.filter(function (c) { return String(c.class_id) === classSel.value; }) : classes;
    var term = q.value.trim().toLowerCase();
    var rows = [];
    wanted.forEach(function (c) {
      T.studentsOf(c).forEach(function (s) { rows.push({ s: s, c: c }); });
    });
    rows = rows.filter(function (r) {
      if (!term) return true;
      return String(r.s.name).toLowerCase().indexOf(term) !== -1 ||
             String(r.s.login_id || '').toLowerCase().indexOf(term) !== -1 ||
             String(r.s.roll_no) === term;
    });

    T.$('summary').innerHTML = '<span class="t-chip">Showing <strong>' + rows.length + '</strong> student' + (rows.length === 1 ? '' : 's') + '</span>';
    T.$('empty').hidden = rows.length > 0;
    T.$('table-wrap').hidden = rows.length === 0;
    T.$('rows').innerHTML = rows.map(function (r) {
      var s = r.s;
      return '<tr>' +
        '<td data-label="Roll">' + T.esc(s.roll_no) + '</td>' +
        '<td data-label="Student ID">' + T.esc(s.login_id || s.student_id) + '</td>' +
        '<td data-label="Name"><strong>' + T.esc(s.name) + '</strong></td>' +
        '<td data-label="Class">' + T.esc(T.classLabel(r.c)) + '</td>' +
        '<td data-label="Guardian">' + T.esc(s.guardian_name) + '</td>' +
        '<td data-label="Date of birth">' + (s.date_of_birth ? T.fmtDate(s.date_of_birth) : '-') + '</td>' +
        '<td data-label="Attendance">' + rate(s.student_id) + '</td></tr>';
    }).join('');
  }

  classSel.addEventListener('change', render);
  q.addEventListener('input', render);
  T.$('clear-btn').addEventListener('click', function () { classSel.value = ''; q.value = ''; render(); });
  render();
})();

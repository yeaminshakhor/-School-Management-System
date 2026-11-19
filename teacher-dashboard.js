/* teacher-dashboard.js - summary, chart, recent activity */
(function () {
  if (!T.ready) return;

  T.$('t-date').textContent = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

  var classes = T.myClasses();
  var seen = {}, total = 0;
  var counts = classes.map(function (c) {
    var list = T.studentsOf(c);
    list.forEach(function (s) { if (!seen[s.student_id]) { seen[s.student_id] = true; total++; } });
    return list.length;
  });
  T.$('s-students').textContent = total;
  T.$('s-classes').textContent = classes.length;
  T.$('s-subjects').textContent = T.mySubjects().length;
  T.$('s-notices').textContent = T.myNotices().length;

  // bar chart: students per class
  var chart = T.$('chart');
  if (!classes.length) {
    chart.innerHTML = '<p class="empty">No classes assigned yet.</p>';
  } else {
    var max = Math.ceil(Math.max.apply(null, counts.concat([4])) / 4) * 4;
    var colors = ['#1a6ef0', '#4caf50', '#8e63cf', '#fb9208', '#2b7a8a', '#b34a42'];
    var html = '<div class="t-chart" role="img" aria-label="Number of students in each of your classes"><div class="t-plot">';
    for (var i = 0; i <= 4; i++) {
      html += '<div class="t-grid" style="bottom:' + (i * 25) + '%"></div>' +
              '<span class="t-ytick" style="bottom:' + (i * 25) + '%">' + (max / 4 * i) + '</span>';
    }
    classes.forEach(function (c, idx) {
      html += '<div class="t-bar-col"><span class="t-bar-val">' + counts[idx] + '</span>' +
              '<div class="t-bar" style="height:' + (counts[idx] / max * 100) + '%;background:' + colors[idx % colors.length] + '"></div>' +
              '<span class="t-xlabel">' + T.esc(T.classLabel(c)) + '</span></div>';
    });
    chart.innerHTML = html + '</div></div>';
  }

  // recent activity
  var showAll = false;
  function renderActivity() {
    var items = T.recentLog(showAll ? 12 : 4);
    T.$('act-more').hidden = T.recentLog(12).length <= 4;
    T.$('act-more').textContent = showAll ? 'Show less' : 'View All';
    var icons = { attendance: 'attendance', marks: 'marks', notice: 'notices' };
    T.$('activity').innerHTML = items.length ? items.map(function (l) {
      return '<li><span class="t-act-ic ' + T.esc(l.type) + '">' + T.icon(icons[l.type] || 'history') + '</span>' +
             '<span class="t-act-text">' + T.esc(l.text) + '</span><span class="t-act-time">' + T.ago(l.at) + '</span></li>';
    }).join('') : '<li class="muted">No activity yet. Take attendance, upload marks or post a notice to get started.</li>';
  }
  T.$('act-more').addEventListener('click', function () { showAll = !showAll; renderActivity(); });
  renderActivity();
})();

/* 
   teacher-common.js - shared code for every Teacher page
   It does NOT load Member 4's common.js, so both can live in the same js/ folder.
   Data is kept in localStorage, like the rest of the project.
   ============================================================ */

var T = { ready: false };

// ---------- settings (change here if the group agrees on other names) ----------
T.SESSION_KEY = 'sms_user';      // Member 3's login must save {user_id: .., role: 'teacher'} here (sessionStorage)
T.LOGIN_PAGE  = 'teacher-dashboard.html';
T.SCHOOL_NAME = 'Greenfield School';
T.FULL_MARKS  = 100;
T.EXAMS = ['Class Test', 'First Term', 'Mid Term', 'Final Exam'];

// ---------- storage helpers ----------
T.load = function (key, fallback) {
  try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
};
T.save = function (key, value) { localStorage.setItem(key, JSON.stringify(value)); };
T.nextId = function (list, field) {
  return list.reduce(function (m, x) { return Math.max(m, x[field] || 0); }, 0) + 1;
};
T.$ = function (id) { return document.getElementById(id); };

// ---------- small helpers ----------
T.esc = function (text) {
  return String(text == null ? '' : text).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
};
T.today = function () {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
T.fmtDate = function (iso) {
  var d = new Date(iso + 'T00:00:00');
  return isNaN(d) ? iso : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};
T.grade = function (m) {
  if (m >= 80) return 'A+';
  if (m >= 70) return 'A';
  if (m >= 60) return 'A-';
  if (m >= 50) return 'B';
  if (m >= 40) return 'C';
  if (m >= 33) return 'D';
  return 'F';
};
T.ago = function (iso) {
  var mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return mins + (mins === 1 ? ' minute ago' : ' minutes ago');
  var h = Math.floor(mins / 60);
  if (h < 24) return h + (h === 1 ? ' hour ago' : ' hours ago');
  var d = Math.floor(h / 24);
  return d + (d === 1 ? ' day ago' : ' days ago');
};
T.flash = function (box, text, type) {
  box.className = 'alert alert-' + type;
  box.textContent = text;
  box.hidden = false;
};
T.fillSelect = function (select, items, valueFn, labelFn) {
  items.forEach(function (it) {
    var o = document.createElement('option');
    o.value = valueFn(it); o.textContent = labelFn(it);
    select.appendChild(o);
  });
};

// ---------- demo data (only created when the key is empty) ----------
// Other members' data (admin, students) is never overwritten.
T.seed = function () {
  if (!localStorage.getItem('sms_teachers')) {
    T.save('sms_teachers', [
      { teacher_id: 1, user_id: 2, name: 'Rudd Gullit',  phone: '01711000001', qualification: 'M.Sc., B.Ed.', joining_date: '2020-01-15' },
      { teacher_id: 2, user_id: 3, name: 'Frank Rijkaard', phone: '01711002302', qualification: 'B.Sc., B.Ed.', joining_date: '2021-03-01' },
      { teacher_id: 3, user_id: 4, name: 'Mar Van Basten', phone: '01711000002', qualification: 'B.Sc., B.Ed.', joining_date: '2021-03-01' }

    ]);
  }
  if (!localStorage.getItem('sms_classes')) {
    T.save('sms_classes', [
      { class_id: 1, class_name: 'Class 5', section: 'A', class_teacher_id: 1 },
      { class_id: 2, class_name: 'Class 6', section: 'A', class_teacher_id: 1 },
      { class_id: 3, class_name: 'Class 7', section: 'A', class_teacher_id: 2 }
    ]);
  }
  if (!localStorage.getItem('sms_subjects')) {
    T.save('sms_subjects', [
      { subject_id: 1, subject_name: 'Mathematics', class_id: 1, teacher_id: 1 },
      { subject_id: 2, subject_name: 'English',     class_id: 1, teacher_id: 1 },
      { subject_id: 3, subject_name: 'Science',     class_id: 1, teacher_id: 2 },
      { subject_id: 4, subject_name: 'Mathematics', class_id: 2, teacher_id: 1 },
      { subject_id: 5, subject_name: 'Bangla',      class_id: 2, teacher_id: 2 },
      { subject_id: 6, subject_name: 'Mathematics', class_id: 3, teacher_id: 2 }
    ]);
  }
  if (T.load('sms_students', []).length === 0) {
    var names = {
      'Class 5': ['Lamine Yamal', 'Andrea Shevchenko', 'Erling Haaland', 'Gabriel Batistuta', 'Carlo Anchelotti', 'Eden Hazard'],
      'Class 6': ['Robin Van Persie', 'Rahim Sterling', 'Sadio Mane', 'Mohammad Salah', 'Dominik Slobozai', 'Alenxender Arnold Trent'],
      'Class 7': ['Lionel Messi', 'Cristiano Ronaldo', 'Luis Figo', 'Rudd Van Nistelrooy', 'Zinedine Zidane', 'David Beckham']
    };
    var year = { 'Class 5': 2015, 'Class 6': 2014, 'Class 7': 2013 };
    var students = [], n = 0;
    Object.keys(names).forEach(function (cn) {
      names[cn].forEach(function (nm, i) {
        n++;
        students.push({
          student_id: n, login_id: 'STU-' + String(n).padStart(5, '0'), application_id: null,
          name: nm, class_name: cn, roll_no: i + 1,
          date_of_birth: year[cn] + '-0' + (i + 1) + '-1' + i,
          guardian_name: 'Guardian of ' + nm.split(' ')[0],
          email: 'guardian' + n + '@example.com'
        });
      });
    });
    T.save('sms_students', students);
  }
};

// ---------- who is logged in ----------
T.currentTeacher = function () {
  var s;
  try { s = JSON.parse(sessionStorage.getItem(T.SESSION_KEY) || 'null'); } catch (e) { s = null; }
  // Standalone module preview: use the demo teacher until Member 3's login is merged.
  // A real session from login will take precedence.
  if (!s) {
    s = { user_id: 2, role: 'teacher' };
    try { sessionStorage.setItem(T.SESSION_KEY, JSON.stringify(s)); } catch (e) {}
  }
  if (!s || String(s.role).toLowerCase() !== 'teacher') return null;
  var t = T.load('sms_teachers', []).filter(function (x) { return x.user_id === s.user_id; })[0];
  if (!t) return null;
  var u = T.load('sms_users', []).filter(function (x) { return x.user_id === s.user_id; })[0];
  t.display_name = (u && u.name) || t.name || 'Teacher';
  return t;
};

// ---------- data for this teacher ----------
T.classLabel = function (c) { return c.class_name + (c.section ? ' - ' + c.section : ''); };
T.mySubjects = function () {
  return T.load('sms_subjects', []).filter(function (s) { return s.teacher_id === T.teacher.teacher_id; });
};
// classes where I am the class teacher or teach a subject
T.myClasses = function () {
  var tid = T.teacher.teacher_id;
  var ids = T.mySubjects().map(function (s) { return s.class_id; });
  return T.load('sms_classes', []).filter(function (c) {
    return c.class_teacher_id === tid || ids.indexOf(c.class_id) !== -1;
  });
};
T.studentsOf = function (cls) {
  return T.load('sms_students', []).filter(function (s) {
    return s.class_id ? s.class_id === cls.class_id : s.class_name === cls.class_name;
  }).sort(function (a, b) { return (a.roll_no || 0) - (b.roll_no || 0); });
};
T.myNotices = function () {
  return T.load('sms_notices', []).filter(function (n) {
    return n.scope === 'class' && n.posted_by === T.teacher.user_id;
  });
};
// classes of mine with no attendance saved for today
T.pendingAttendance = function () {
  var today = T.today();
  var records = T.load('sms_attendance', []).filter(function (a) { return a.date === today; });
  var done = {};
  records.forEach(function (a) { done[a.student_id] = true; });
  return T.myClasses().filter(function (c) {
    var st = T.studentsOf(c);
    return st.length > 0 && !st.some(function (s) { return done[s.student_id]; });
  }).length;
};

// ---------- activity log ----------
T.log = function (type, text) {
  var list = T.load('sms_teacher_log', []);
  list.push({ teacher_id: T.teacher.teacher_id, type: type, text: text, at: new Date().toISOString() });
  T.save('sms_teacher_log', list.slice(-200));
};
T.recentLog = function (n) {
  return T.load('sms_teacher_log', []).filter(function (l) { return l.teacher_id === T.teacher.teacher_id; })
    .reverse().slice(0, n);
};

// ---------- icons ----------
T.ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  students: '<circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14c3 0 5 2 5 5"/>',
  attendance: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4M9 15l2 2 4-4"/>',
  marks: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  notices: '<path d="M3 11v3a1 1 0 001 1h2l7 4V6L6 10H4a1 1 0 00-1 1z"/><path d="M17 9a4 4 0 010 6"/>',
  logout: '<path d="M9 4H5a2 2 0 00-2 2v12a2 2 0 002 2h4M16 8l4 4-4 4M20 12H9"/>',
  bell: '<path d="M6 16v-5a6 6 0 1112 0v5l2 2H4z"/><path d="M10 20a2 2 0 004 0"/>',
  chevron: '<path d="M6 9l6 6 6-6"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  book: '<path d="M4 4h12a3 3 0 013 3v13H7a3 3 0 01-3-3z"/><path d="M4 17a3 3 0 013-3h12"/>',
  chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-5M12 16V8M16 16v-3"/>',
  history: '<path d="M3 12a9 9 0 109-9 9 9 0 00-7 3.4L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  calendar: '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>'
};
T.icon = function (name) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + T.ICONS[name] + '</svg>';
};
T.fillIcons = function () {
  Array.prototype.forEach.call(document.querySelectorAll('[data-icon]'), function (el) {
    el.innerHTML = T.icon(el.getAttribute('data-icon'));
  });
};

// ---------- top bar and sidebar (same on every teacher page) ----------
T.refreshBell = function () {
  var n = T.pendingAttendance();
  var bell = T.$('t-bell'), badge = T.$('t-badge');
  if (!bell) return;
  badge.textContent = n; badge.hidden = n === 0;
  bell.title = n === 0 ? 'Attendance is up to date for today'
                       : 'Attendance not taken today for ' + n + (n === 1 ? ' class' : ' classes');
  bell.setAttribute('aria-label', bell.title);
};

T.buildLayout = function () {
  var page = document.body.getAttribute('data-page');
  var name = T.teacher.display_name;
  var initials = name.split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join('');
  var items = [
    ['dashboard', 'teacher-dashboard.html', 'Dashboard', 'dashboard'],
    ['students', 'teacher-students.html', 'Students', 'students'],
    ['attendance', 'teacher-attendance.html', 'Attendance', 'attendance'],
    ['marks', 'teacher-marks.html', 'Marks', 'marks'],
    ['notices', 'teacher-notices.html', 'Notices', 'notices']
  ];
  var nav = items.map(function (i) {
    var active = i[0] === page ? ' class="active" aria-current="page"' : '';
    return '<a href="' + i[1] + '"' + active + '>' + T.icon(i[3]) + i[2] + '</a>';
  }).join('') + '<hr><a href="#" id="t-logout">' + T.icon('logout') + 'Logout</a>';

  T.$('t-header').innerHTML =
    '<header class="t-top"><div class="t-top-left">' +
    '<button class="t-burger" type="button" id="t-burger" aria-label="Open menu" aria-expanded="false">' + T.icon('menu') + '</button>' +
    '<a class="t-brand" href="teacher-dashboard.html">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3L1 9l11 6 9-4.9V17h2V9z"/><path d="M5 13v4c0 1.5 3.1 3 7 3s7-1.5 7-3v-4l-7 3.8z"/></svg>' +
    '<span>' + T.esc(T.SCHOOL_NAME) + '</span></a></div>' +
    '<div class="t-top-right">' +
    '<a class="t-bell" id="t-bell" href="teacher-attendance.html">' + T.icon('bell') + '<span class="t-badge" id="t-badge" hidden>0</span></a>' +
    '<div class="t-user"><button class="t-user-btn" type="button" id="t-user-btn" aria-expanded="false" aria-haspopup="true">' +
    '<span class="t-avatar">' + T.esc(initials) + '</span><span class="t-user-name">' + T.esc(name) + '</span>' + T.icon('chevron') + '</button>' +
    '<div class="t-menu" id="t-menu" hidden><a href="#" id="t-logout-top">Logout</a></div></div></div></header>';

  T.$('t-sidebar').innerHTML =
    '<div class="t-profile"><span class="t-avatar">' + T.esc(initials) + '</span><div><strong>' + T.esc(name) + '</strong><small>Teacher</small></div></div>' +
    '<nav class="t-nav" aria-label="Teacher menu">' + nav + '</nav>';

  T.fillIcons();
  T.refreshBell();

  function logout(e) {
    e.preventDefault();
    sessionStorage.removeItem(T.SESSION_KEY);
    window.location.href = T.LOGIN_PAGE;
  }
  T.$('t-logout').addEventListener('click', logout);
  T.$('t-logout-top').addEventListener('click', logout);

  var userBtn = T.$('t-user-btn'), menu = T.$('t-menu');
  userBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    menu.hidden = !menu.hidden;
    userBtn.setAttribute('aria-expanded', menu.hidden ? 'false' : 'true');
  });
  document.addEventListener('click', function () { menu.hidden = true; userBtn.setAttribute('aria-expanded', 'false'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') menu.hidden = true; });

  var burger = T.$('t-burger');
  burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('t-nav-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
};

// ---------- start ----------
T.seed();
T.teacher = T.currentTeacher();
if (!T.teacher) {
  // not logged in as a teacher: show a message with a link to the login page
  document.body.innerHTML =
    '<main style="max-width:520px;margin:60px auto;padding:0 16px;font-family:Segoe UI,Arial,sans-serif">' +
    '<h1>Teacher login required</h1><p>Please log in as a teacher to open this page.</p>' +
    '<p><a href="' + T.LOGIN_PAGE + '">Go to the login page</a></p></main>';
} else {
  T.ready = true;
  T.buildLayout();
}

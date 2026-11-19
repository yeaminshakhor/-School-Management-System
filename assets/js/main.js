/* ==========================================================================
   School Management System - static version (HTML + CSS + JavaScript only)

   There is no server and no database. All data lives in this browser's
   localStorage (applications, notices, gallery, classes, users, students).
   The logged-in admin and temporary page state live in sessionStorage.

   Sections:  1. Settings   2. Seed data   3. Storage   4. Helpers
              5. Page chrome (header/footer)   6. Pages   7. Start-up
   ========================================================================== */
(function () {
  'use strict';

  /* ======================= 1. SETTINGS (edit these) ======================= */
  var CFG = {
    school: {
      name: 'Greenfield School',
      tagline: 'Learning today, leading tomorrow',
      address: '123 School Road, Dhaka, Bangladesh',
      phone: '+880 1234-567890',
      email: 'info@greenfield.school',
      hours: 'Sunday - Thursday, 8:00 AM - 3:00 PM'
    },
    classes: ['Nursery', 'KG', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
              'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'],
    phoneRe: /^01[3-9][0-9]{8}$/,   // Bangladeshi mobile after normalising, e.g. 01712345678
    minAge: 2,
    maxAge: 25
  };

  /* ======================= 2. SEED DATA (first visit only) ======================= */
  // Test admin: admin@school.test / Admin@12345   (change or remove before real use)
  function svgThumb(label, c1, c2) {
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/>' +
      '<stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
      '<rect width="800" height="600" fill="url(#g)"/>' +
      '<text x="400" y="320" font-family="Segoe UI,Arial,sans-serif" font-size="44" fill="#ffffff" text-anchor="middle">' +
      label + '</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
  }

  function seed() {
    if (load('seeded', false)) { return; }
    var t = today(), salt = randHex(8);
    save('users', [{
      user_id: 1, name: 'Test Admin', email: 'admin@school.test',
      salt: salt, hash: sha256(salt + 'Admin@12345'),
      role: 'admin', photo: null, account_status: 'active'
    }]);
    save('notices', [
      { notice_id: 1, posted_by: 1, title: 'Admission Open for the New Session',
        details: 'Online admission is now open for Nursery to Class 10. Apply through the Admission page.', date: t, notice_scope: 'public' },
      { notice_id: 2, posted_by: 1, title: 'Annual Sports Day',
        details: 'The annual sports day will be held on the school ground. Parents are welcome to attend.', date: t, notice_scope: 'all' },
      { notice_id: 3, posted_by: 1, title: 'Teachers Meeting',
        details: 'Internal meeting for teachers only.', date: t, notice_scope: 'teacher' }
    ]);
    save('gallery', [
      { image_id: 1, title: 'Morning assembly',  image_path: svgThumb('Morning assembly', '#18324b', '#24496b'), upload_date: t },
      { image_id: 2, title: 'Science fair',      image_path: svgThumb('Science fair', '#2b7a4b', '#4aa36c'), upload_date: t },
      { image_id: 3, title: 'Sports day',        image_path: svgThumb('Sports day', '#b7791f', '#d9a441'), upload_date: t },
      { image_id: 4, title: 'Library corner',    image_path: svgThumb('Library corner', '#6b3f8c', '#9a6bb8'), upload_date: t },
      { image_id: 5, title: 'Art class',         image_path: svgThumb('Art class', '#b3402f', '#d9705e'), upload_date: t },
      { image_id: 6, title: 'Computer lab',      image_path: svgThumb('Computer lab', '#1d6f8c', '#4aa0bf'), upload_date: t }
    ]);
    save('classes', CFG.classes.map(function (n, i) { return { class_id: i + 1, class_name: n, section: 'A' }; }));
    save('students', []);
    save('admissions', [
      { application_id: 1, applicant_name: 'Rahim Uddin', date_of_birth: '2015-03-12', guardian_name: 'Karim Uddin',
        phone: '01712345678', email: 'karim@example.com', class_applied: 'Class 4', status: 'pending', applied_date: t, reviewed_by: null },
      { application_id: 2, applicant_name: 'Nusrat Jahan', date_of_birth: '2017-08-21', guardian_name: 'Salma Begum',
        phone: '01812345678', email: 'salma@example.com', class_applied: 'Class 2', status: 'pending', applied_date: t, reviewed_by: null }
    ]);
    save('seeded', true);
  }

  /* ======================= 3. STORAGE ======================= */
  var mem = {}, smem = {};   // fallbacks if the browser blocks storage

  function load(k, d) {
    if (k in mem) { return mem[k]; }
    try { var v = localStorage.getItem('sms_' + k); return v === null ? d : JSON.parse(v); }
    catch (err) { return d; }
  }
  function save(k, v) {
    try { localStorage.setItem('sms_' + k, JSON.stringify(v)); delete mem[k]; }
    catch (err) { mem[k] = v; }
  }
  function sget(k, d) {
    if (k in smem) { return smem[k]; }
    try { var v = sessionStorage.getItem('sms_s_' + k); return v === null ? d : JSON.parse(v); }
    catch (err) { return d; }
  }
  function sset(k, v) {
    try { sessionStorage.setItem('sms_s_' + k, JSON.stringify(v)); delete smem[k]; }
    catch (err) { smem[k] = v; }
  }
  function sclear() {
    smem = {};
    try {
      Object.keys(sessionStorage).filter(function (k) { return k.indexOf('sms_s_') === 0; })
        .forEach(function (k) { sessionStorage.removeItem(k); });
    } catch (err) { /* ignore */ }
  }
  function resetAllData() {
    mem = {};
    try {
      Object.keys(localStorage).filter(function (k) { return k.indexOf('sms_') === 0; })
        .forEach(function (k) { localStorage.removeItem(k); });
    } catch (err) { /* ignore */ }
    sclear();
    seed();
  }
  function nextId(rows, key) {
    return rows.reduce(function (m, r) { return Math.max(m, r[key]); }, 0) + 1;
  }

  /* ======================= 4. HELPERS ======================= */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function e(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function pad(n, w) { n = String(n); while (n.length < w) { n = '0' + n; } return n; }
  function isoDate(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1, 2) + '-' + pad(d.getDate(), 2); }
  function today() { return isoDate(new Date()); }

  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || '');
    return m ? m[3] + ' ' + MONTHS[parseInt(m[2], 10) - 1] + ' ' + m[1] : '';
  }
  function nl2br(s) { return e(s).replace(/\r?\n/g, '<br>'); }
  function trunc(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 3) + '...' : s; }

  function appIdFormat(id) { return 'ADM-' + pad(id, 5); }
  function appIdParse(s) {
    var m = /^(?:ADM-?)?0*([1-9][0-9]{0,9})$/.exec(String(s).trim().toUpperCase());
    return m ? parseInt(m[1], 10) : null;
  }
  function phoneNormalize(p) {
    p = String(p).replace(/[\s\-().]/g, '');
    if (p.indexOf('+88') === 0) { p = p.slice(3); }
    else if (p.indexOf('88') === 0 && p.length === 13) { p = p.slice(2); }
    return p;
  }
  function statusBadge(s) {
    return '<span class="badge badge-' + e(s) + '">' + e(s.charAt(0).toUpperCase() + s.slice(1)) + '</span>';
  }
  function qparam(name) { return new URLSearchParams(location.search).get(name); }

  function randHex(n) {
    var a = new Uint8Array(n), s = '', i;
    (window.crypto || window.msCrypto).getRandomValues(a);
    for (i = 0; i < n; i++) { s += pad(a[i].toString(16), 2); }
    return s;
  }
  function randPassword() {
    var alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789', out = '', i;
    var a = new Uint32Array(10);
    window.crypto.getRandomValues(a);
    for (i = 0; i < 10; i++) { out += alphabet.charAt(a[i] % alphabet.length); }
    return out;
  }

  /* Small synchronous SHA-256 (works on file:// and http:// alike). */
  function sha256(msg) {
    var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
    var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
    function ror(x, n) { return (x >>> n) | (x << (32 - n)); }
    var bytes = Array.prototype.slice.call(new TextEncoder().encode(msg));
    var bitLen = bytes.length * 8, hi = Math.floor(bitLen / 4294967296), lo = bitLen >>> 0, i, t;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) { bytes.push(0); }
    bytes.push((hi >>> 24) & 255, (hi >>> 16) & 255, (hi >>> 8) & 255, hi & 255,
               (lo >>> 24) & 255, (lo >>> 16) & 255, (lo >>> 8) & 255, lo & 255);
    for (i = 0; i < bytes.length; i += 64) {
      var w = new Array(64);
      for (t = 0; t < 16; t++) {
        w[t] = (bytes[i + 4 * t] << 24) | (bytes[i + 4 * t + 1] << 16) | (bytes[i + 4 * t + 2] << 8) | bytes[i + 4 * t + 3];
      }
      for (t = 16; t < 64; t++) {
        var s0 = ror(w[t - 15], 7) ^ ror(w[t - 15], 18) ^ (w[t - 15] >>> 3);
        var s1 = ror(w[t - 2], 17) ^ ror(w[t - 2], 19) ^ (w[t - 2] >>> 10);
        w[t] = (w[t - 16] + s0 + w[t - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], ee = H[4], f = H[5], g = H[6], h = H[7];
      for (t = 0; t < 64; t++) {
        var S1 = ror(ee, 6) ^ ror(ee, 11) ^ ror(ee, 25);
        var ch = (ee & f) ^ (~ee & g);
        var t1 = (h + S1 + ch + K[t] + w[t]) | 0;
        var S0 = ror(a, 2) ^ ror(a, 13) ^ ror(a, 22);
        var mj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + mj) | 0;
        h = g; g = f; f = ee; ee = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + ee) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    return H.map(function (x) { return pad((x >>> 0).toString(16), 8); }).join('');
  }

  /* ---------- session / login ---------- */
  function currentUser() { return sget('user', null); }
  function isAdmin() { var u = currentUser(); return !!(u && u.user_id && u.role === 'admin'); }

  /* ---------- flash messages (survive one page change) ---------- */
  function pushFlash(type, msg) { var f = sget('flash', []); f.push({ type: type, msg: msg }); sset('flash', f); }
  function takeFlash() { var f = sget('flash', []); sset('flash', []); return f; }
  function alertHtml(type, msg) {
    return '<div class="alert alert-' + e(type) + ' alert-wide" role="' + (type === 'error' ? 'alert' : 'status') + '">' + e(msg) + '</div>';
  }
  function showFlash(type, msg) { var box = $('#flash'); if (box) { box.innerHTML = alertHtml(type, msg); } }

  /* ---------- slip access (no account needed for applicants) ---------- */
  function slipGrant(id) { var o = sget('slip_ok', {}); o[id] = true; sset('slip_ok', o); }
  function slipAllowed(id) { return !!sget('slip_ok', {})[id]; }

  /* ---------- pager ---------- */
  function pager(el, pages, page, hrefFn) {
    if (!el) { return; }
    if (pages < 2) { el.innerHTML = ''; return; }
    var h = '<nav class="pager" aria-label="Pages">', i;
    for (i = 1; i <= pages; i++) {
      h += '<a href="' + e(hrefFn(i)) + '"' + (i === page ? ' class="active" aria-current="page"' : '') + '>' + i + '</a>';
    }
    el.innerHTML = h + '</nav>';
  }

  /* ---------- admission validation ---------- */
  function validateAdmission(inp) {
    var errors = {}, clean = {};
    var nameRe = /^\p{L}[\p{L} .'\-]{1,98}\p{L}\.?$/u;

    [['applicant_name', 'Applicant name'], ['guardian_name', 'Guardian name']].forEach(function (p) {
      var v = String(inp[p[0]] || '').replace(/\s+/g, ' ').trim();
      if (v === '') { errors[p[0]] = p[1] + ' is required.'; }
      else if (!nameRe.test(v)) { errors[p[0]] = p[1] + ' may contain only letters, spaces, dots, apostrophes and hyphens (3-100 characters).'; }
      clean[p[0]] = v;
    });

    var dob = String(inp.date_of_birth || '').trim(), m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dob);
    clean.date_of_birth = dob;
    if (dob === '') { errors.date_of_birth = 'Date of birth is required.'; }
    else {
      var y = m ? +m[1] : 0, mo = m ? +m[2] : 0, d = m ? +m[3] : 0, dt = m ? new Date(y, mo - 1, d) : null;
      if (!m || dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
        errors.date_of_birth = 'Enter a valid date of birth.';
      } else {
        var now = new Date(), age = now.getFullYear() - y;
        if (now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < d)) { age--; }
        if (dob > today()) { errors.date_of_birth = 'Date of birth cannot be in the future.'; }
        else if (age < CFG.minAge || age > CFG.maxAge) {
          errors.date_of_birth = 'Applicant age must be between ' + CFG.minAge + ' and ' + CFG.maxAge + ' years.';
        }
      }
    }

    var phone = phoneNormalize(inp.phone || '');
    clean.phone = phone;
    if (phone === '') { errors.phone = 'Phone number is required.'; }
    else if (!CFG.phoneRe.test(phone)) { errors.phone = 'Enter a valid mobile number, e.g. 01712345678.'; }

    var email = String(inp.email || '').trim();
    clean.email = email;
    if (email === '') { errors.email = 'Email is required.'; }
    else if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { errors.email = 'Enter a valid email address.'; }

    var cls = String(inp.class_applied || '');
    clean.class_applied = cls;
    if (cls === '') { errors.class_applied = 'Please choose the class you are applying for.'; }
    else if (CFG.classes.indexOf(cls) < 0) { errors.class_applied = 'Please choose a class from the list.'; }

    return { clean: clean, errors: errors };
  }

  /* ---------- convert an accepted applicant to a student ---------- */
  function convertApplicantToStudent(applicationId) {
    var admissions = load('admissions', []), users = load('users', []);
    var classes = load('classes', []), students = load('students', []);
    var a = admissions.filter(function (r) { return r.application_id === applicationId; })[0];
    if (!a) { return { ok: false, msg: 'Application not found.' }; }
    if (a.status !== 'accepted') { return { ok: false, msg: 'Only accepted applications can be converted to students.' }; }

    var existing = users.filter(function (u) { return u.email.toLowerCase() === a.email.toLowerCase(); })[0];
    if (existing) {
      return { ok: false, msg: existing.role === 'student'
        ? 'This applicant has already been converted to a student.'
        : 'That email address already belongs to another account (' + existing.role + '). It cannot be used for the student.' };
    }
    var cls = classes.filter(function (c) { return c.class_name === a.class_applied; })[0];
    if (!cls) { return { ok: false, msg: 'No class named "' + a.class_applied + '" exists yet. Create the class first, then convert again.' }; }

    var password = randPassword(), salt = randHex(8);
    var userId = nextId(users, 'user_id');
    var roll = students.filter(function (s) { return s.class_id === cls.class_id; })
      .reduce(function (m, s) { return Math.max(m, s.roll_no); }, 0) + 1;

    users.push({ user_id: userId, name: a.applicant_name, email: a.email, salt: salt, hash: sha256(salt + password),
                 role: 'student', photo: null, account_status: 'active' });
    students.push({ student_id: nextId(students, 'student_id'), user_id: userId, class_id: cls.class_id,
                    roll_no: roll, date_of_birth: a.date_of_birth, guardian_name: a.guardian_name });
    save('users', users);
    save('students', students);
    return { ok: true, msg: 'Application ' + appIdFormat(applicationId) + ' converted to student (' + a.class_applied +
      ', roll ' + roll + '). Login email: ' + a.email + ' - Temporary password: ' + password +
      ' (copy it now, it is shown only once).' };
  }

  /* ======================= 5. PAGE CHROME ======================= */
  function renderChrome() {
    var s = CFG.school, page = document.body.getAttribute('data-nav') || '';
    var title = document.body.getAttribute('data-title') || 'Welcome';
    document.title = title + ' | ' + s.name;

    var items = [['home', 'index.html', 'Home'], ['about', 'about.html', 'About'], ['notices', 'notices.html', 'Notices'],
                 ['gallery', 'gallery.html', 'Gallery'], ['admission', 'admission.html', 'Apply for Admission'],
                 ['track', 'track.html', 'Track Application']];
    var u = currentUser(), nav = '';
    items.forEach(function (it) {
      nav += '<a href="' + it[1] + '"' + (it[0] === page ? ' class="active" aria-current="page"' : '') + '>' + e(it[2]) + '</a>';
    });
    if (isAdmin()) {
      nav += '<a class="nav-cta" href="admin.html">Admin Panel</a><a href="#" data-logout>Logout</a>';
    } else if (u) {
      nav += '<a class="nav-cta" href="#" data-logout>Logout</a>';
    } else {
      nav += '<a class="nav-cta" href="login.html">Login</a>';
    }

    var header =
      '<header class="site-header"><div class="wrap header-row">' +
      '<a class="brand" href="index.html"><span class="brand-mark" aria-hidden="true">' + e(s.name.charAt(0)) + '</span>' +
      '<span><strong>' + e(s.name) + '</strong><small>' + e(s.tagline) + '</small></span></a>' +
      '<button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">&#9776;</button>' +
      '<nav id="main-nav" class="main-nav" aria-label="Main">' + nav + '</nav></div></header>';

    var footer =
      '<footer class="site-footer"><div class="wrap footer-grid">' +
      '<div><h3>' + e(s.name) + '</h3><p>' + e(s.tagline) + '</p></div>' +
      '<div><h3>Contact</h3><p>' + e(s.address) + '<br>Phone: ' + e(s.phone) + '<br>Email: ' + e(s.email) + '</p></div>' +
      '<div><h3>Quick links</h3><p><a href="admission.html">Apply for Admission</a><br>' +
      '<a href="track.html">Track Application</a><br><a href="gallery.html">Photo Gallery</a></p></div></div>' +
      '<div class="wrap copyright">&copy; ' + new Date().getFullYear() + ' ' + e(s.name) + '. School Management System.</div></footer>';

    var main = $('#main');
    document.body.insertAdjacentHTML('afterbegin', header);
    main.insertAdjacentHTML('afterend', footer);

    var flash = '';
    takeFlash().forEach(function (f) { flash += alertHtml(f.type, f.msg); });
    main.insertAdjacentHTML('afterbegin', '<div id="flash">' + flash + '</div>');

    $$('[data-school]').forEach(function (n) { n.textContent = CFG.school[n.getAttribute('data-school')] || ''; });

    var toggle = $('.nav-toggle'), navEl = $('#main-nav');
    toggle.addEventListener('click', function () {
      var open = navEl.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function bindGlobalClicks() {
    document.addEventListener('click', function (ev) {
      if (ev.target.closest('[data-print]')) { window.print(); return; }
      if (ev.target.closest('[data-logout]')) {
        ev.preventDefault();
        sclear();
        pushFlash('success', 'You have been logged out.');
        location.href = 'index.html';
      }
    });
  }

  /* ======================= 6. PAGES ======================= */
  function publicNotices() {
    return load('notices', []).filter(function (n) { return n.notice_scope === 'public' || n.notice_scope === 'all'; })
      .sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : b.notice_id - a.notice_id; });
  }
  function galleryRows() {
    return load('gallery', []).slice().sort(function (a, b) {
      return a.upload_date < b.upload_date ? 1 : a.upload_date > b.upload_date ? -1 : b.image_id - a.image_id;
    });
  }

  function pageHome() {
    var notices = publicNotices().slice(0, 3), photos = galleryRows().slice(0, 6), h = '';
    if (!notices.length) { h = '<p class="empty">No public notices at the moment.</p>'; }
    notices.forEach(function (n) {
      h += '<article class="notice"><h3>' + e(n.title) + '</h3><time datetime="' + e(n.date) + '">' + e(fmtDate(n.date)) +
           '</time><p>' + e(trunc(n.details, 180)) + '</p></article>';
    });
    $('#latest-notices').innerHTML = h;

    if (!photos.length) { $('#latest-gallery').innerHTML = '<p class="empty">Photos will appear here soon.</p>'; return; }
    h = '<div class="gallery-grid">';
    photos.forEach(function (p) {
      h += '<figure><img loading="lazy" src="' + e(p.image_path) + '" alt="' + e(p.title) + '"><figcaption>' + e(p.title) + '</figcaption></figure>';
    });
    $('#latest-gallery').innerHTML = h + '</div>';
  }

  function pageNotices() {
    var per = 10, all = publicNotices(), pages = Math.max(1, Math.ceil(all.length / per));
    var page = Math.min(Math.max(1, parseInt(qparam('page'), 10) || 1), pages);
    var rows = all.slice((page - 1) * per, page * per), h = '';
    if (!rows.length) { h = '<p class="empty">No public notices at the moment.</p>'; }
    rows.forEach(function (n) {
      h += '<article class="notice"><h3>' + e(n.title) + '</h3><time datetime="' + e(n.date) + '">' + e(fmtDate(n.date)) +
           '</time><p>' + nl2br(n.details) + '</p></article>';
    });
    $('#notice-list').innerHTML = h;
    pager($('#pager'), pages, page, function (i) { return '?page=' + i; });
  }

  function pageGallery() {
    var per = 12, all = galleryRows(), pages = Math.max(1, Math.ceil(all.length / per));
    var page = Math.min(Math.max(1, parseInt(qparam('page'), 10) || 1), pages);
    var rows = all.slice((page - 1) * per, page * per), root = $('#gallery-root');
    if (!rows.length) { root.innerHTML = '<p class="empty">No photos have been added yet.</p>'; }
    else {
      var h = '<div class="gallery-grid" data-lightbox>';
      rows.forEach(function (p) {
        h += '<figure><a href="' + e(p.image_path) + '" data-caption="' + e(p.title) + '"><img loading="lazy" src="' +
             e(p.image_path) + '" alt="' + e(p.title) + '"></a><figcaption>' + e(p.title) + '</figcaption></figure>';
      });
      root.innerHTML = h + '</div>';
      setupLightbox($('[data-lightbox]', root));
    }
    pager($('#pager'), pages, page, function (i) { return '?page=' + i; });
  }

  function setupLightbox(grid) {
    var box = document.createElement('div');
    box.className = 'lightbox'; box.hidden = true;
    box.innerHTML = '<button type="button" class="lb-close" aria-label="Close">&times;</button><img alt=""><p></p>';
    document.body.appendChild(box);
    var img = $('img', box), cap = $('p', box);
    function close() { box.hidden = true; img.removeAttribute('src'); }
    grid.addEventListener('click', function (ev) {
      var a = ev.target.closest('a[data-caption]');
      if (!a) { return; }
      ev.preventDefault();
      img.src = a.getAttribute('href'); img.alt = a.getAttribute('data-caption'); cap.textContent = a.getAttribute('data-caption');
      box.hidden = false; $('.lb-close', box).focus();
    });
    box.addEventListener('click', function (ev) { if (ev.target !== img) { close(); } });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !box.hidden) { close(); } });
  }

  function pageAdmission() {
    var form = $('#admission-form'), sel = $('#class_applied'), dob = $('#date_of_birth');
    CFG.classes.forEach(function (c) { sel.insertAdjacentHTML('beforeend', '<option value="' + e(c) + '">' + e(c) + '</option>'); });

    var maxD = new Date(); maxD.setFullYear(maxD.getFullYear() - CFG.minAge);
    var minD = new Date(); minD.setFullYear(minD.getFullYear() - CFG.maxAge);
    dob.max = isoDate(maxD); dob.min = isoDate(minD);

    var phone = $('#phone');
    phone.addEventListener('input', function () { phone.value = phone.value.replace(/[^0-9+\-\s()]/g, ''); });

    function clearErrors() {
      $$('.field-error', form).forEach(function (n) { n.remove(); });
      $$('[aria-invalid]', form).forEach(function (n) { n.removeAttribute('aria-invalid'); });
      $('#form-error').innerHTML = '';
    }

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      clearErrors();
      var input = {};
      ['applicant_name', 'date_of_birth', 'guardian_name', 'phone', 'email', 'class_applied'].forEach(function (k) {
        input[k] = form.elements[k].value;
      });
      var res = validateAdmission(input), first = null;

      Object.keys(res.errors).forEach(function (k) {
        var inp = form.elements[k];
        inp.parentNode.insertAdjacentHTML('beforeend', '<span class="field-error" id="err-' + k + '">' + e(res.errors[k]) + '</span>');
        inp.setAttribute('aria-invalid', 'true');
        first = first || inp;
      });
      if (first) { first.focus(); return; }

      var c = res.clean, rows = load('admissions', []);
      var dup = rows.some(function (r) {
        return r.applicant_name === c.applicant_name && r.date_of_birth === c.date_of_birth && r.phone === c.phone && r.status === 'pending';
      });
      if (dup) {
        $('#form-error').innerHTML = alertHtml('error', 'An application for this applicant is already pending. Use "Track Application" to check it.');
        return;
      }
      var id = nextId(rows, 'application_id');
      rows.push({ application_id: id, applicant_name: c.applicant_name, date_of_birth: c.date_of_birth,
                  guardian_name: c.guardian_name, phone: c.phone, email: c.email, class_applied: c.class_applied,
                  status: 'pending', applied_date: today(), reviewed_by: null });
      save('admissions', rows);
      slipGrant(id);
      location.href = 'admission-done.html?id=' + id;
    });
  }

  function pageAdmissionDone() {
    var id = parseInt(qparam('id'), 10) || 0;
    if (id < 1 || !slipAllowed(id)) {
      pushFlash('error', 'That confirmation page is no longer available. Use "Track Application" with your application ID and phone number.');
      location.replace('track.html');
      return;
    }
    $('#app-id').textContent = appIdFormat(id);
    $('#slip-link').href = 'slip.html?id=' + id;
    $('#done-box').hidden = false;
  }

  function pageTrack() {
    var form = $('#track-form'), errBox = $('#track-error'), out = $('#track-result');
    var MAX_FAILS = 5, WINDOW = 600000;
    var messages = {
      pending: 'Your application has been received and is waiting for review by the school.',
      accepted: 'Congratulations! Your application has been accepted. The school will contact you with the next steps.',
      rejected: 'We are sorry, your application could not be accepted this time. Please contact the school office for details.'
    };

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      errBox.innerHTML = ''; out.innerHTML = '';
      var now = Date.now();
      var fails = sget('track_fail', []).filter(function (t) { return t > now - WINDOW; });
      if (fails.length >= MAX_FAILS) {
        errBox.innerHTML = alertHtml('error', 'Too many unsuccessful attempts. Please wait a few minutes and try again.');
        return;
      }
      var id = appIdParse(form.elements.application_id.value);
      var phone = phoneNormalize(form.elements.phone.value.trim());
      var row = null;
      if (id !== null && phone !== '') {
        row = load('admissions', []).filter(function (r) { return r.application_id === id && r.phone === phone; })[0] || null;
      }
      if (!row) {
        fails.push(now); sset('track_fail', fails);
        errBox.innerHTML = alertHtml('error', 'No application found for that ID and phone number. Please check both and try again.');
        return;
      }
      sset('track_fail', []);
      slipGrant(row.application_id);
      out.innerHTML =
        '<section class="result-box" aria-live="polite"><h2>Application ' + e(appIdFormat(row.application_id)) + '</h2>' +
        '<table class="info-table">' +
        '<tr><th>Applicant</th><td>' + e(row.applicant_name) + '</td></tr>' +
        '<tr><th>Class applied</th><td>' + e(row.class_applied) + '</td></tr>' +
        '<tr><th>Applied on</th><td>' + e(fmtDate(row.applied_date)) + '</td></tr>' +
        '<tr><th>Status</th><td>' + statusBadge(row.status) + '</td></tr></table>' +
        '<p>' + e(messages[row.status] || '') + '</p>' +
        '<a class="btn btn-outline" href="slip.html?id=' + row.application_id + '">View admission slip</a></section>';
    });
  }

  function pageSlip() {
    var id = parseInt(qparam('id'), 10) || 0;
    if (id < 1 || !slipAllowed(id)) {
      pushFlash('error', 'To open your slip, first track your application with the ID and phone number.');
      location.replace('track.html');
      return;
    }
    var r = load('admissions', []).filter(function (x) { return x.application_id === id; })[0];
    if (!r) { pushFlash('error', 'Application not found.'); location.replace('track.html'); return; }
    var s = CFG.school;
    $('#slip-root').innerHTML =
      '<article class="slip" id="slip"><header class="slip-head"><h1>' + e(s.name) + '</h1><p>' + e(s.address) +
      ' &middot; ' + e(s.phone) + '</p><h2>Admission Application Slip</h2></header>' +
      '<p class="big-id">' + e(appIdFormat(r.application_id)) + '</p><table class="info-table">' +
      '<tr><th>Applicant name</th><td>' + e(r.applicant_name) + '</td></tr>' +
      '<tr><th>Date of birth</th><td>' + e(fmtDate(r.date_of_birth)) + '</td></tr>' +
      '<tr><th>Class applied</th><td>' + e(r.class_applied) + '</td></tr>' +
      '<tr><th>Guardian name</th><td>' + e(r.guardian_name) + '</td></tr>' +
      '<tr><th>Mobile number</th><td>' + e(r.phone) + '</td></tr>' +
      '<tr><th>Email</th><td>' + e(r.email) + '</td></tr>' +
      '<tr><th>Applied on</th><td>' + e(fmtDate(r.applied_date)) + '</td></tr>' +
      '<tr><th>Status</th><td>' + statusBadge(r.status) + '</td></tr></table>' +
      '<p class="slip-note">This slip confirms that your application was received. It is not an offer of admission. ' +
      'Keep the application ID to track your status online.</p></article>';
    $('#slip-actions').hidden = false;
  }

  function pageLogin() {
    if (isAdmin()) { location.replace('admin.html'); return; }
    var form = $('#login-form'), errBox = $('#login-error');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      errBox.innerHTML = '';
      var now = Date.now();
      var fails = sget('login_fail', []).filter(function (t) { return t > now - 600000; });
      if (fails.length >= 5) { errBox.innerHTML = alertHtml('error', 'Too many failed attempts. Please wait a few minutes.'); return; }

      var email = form.elements.email.value.trim().toLowerCase(), pass = form.elements.password.value;
      var u = load('users', []).filter(function (x) { return x.email.toLowerCase() === email && x.account_status === 'active'; })[0];
      if (u && sha256(u.salt + pass) === u.hash) {
        sset('user', { user_id: u.user_id, role: u.role, name: u.name });
        sset('login_fail', []);
        location.href = u.role === 'admin' ? 'admin.html' : 'index.html';
        return;
      }
      fails.push(now); sset('login_fail', fails);
      errBox.innerHTML = alertHtml('error', 'Incorrect email or password.');
    });
  }

  function pageAdmin() {
    if (!isAdmin()) {
      pushFlash('error', 'Please log in as an administrator to open that page.');
      location.replace('login.html');
      return;
    }
    var allowed = ['pending', 'accepted', 'rejected'], per = 15;

    function params() {
      var p = new URLSearchParams(location.search), f = p.get('status') || '';
      return {
        f: allowed.indexOf(f) >= 0 ? f : '',
        q: (p.get('q') || '').trim().slice(0, 60),
        page: Math.max(1, parseInt(p.get('page'), 10) || 1)
      };
    }
    function qs(o) {
      var p = new URLSearchParams();
      Object.keys(o).forEach(function (k) { if (o[k] !== '' && o[k] != null) { p.set(k, o[k]); } });
      var s = p.toString();
      return s ? '?' + s : '?';
    }

    function render() {
      var P = params(), rows = load('admissions', []), users = load('users', []);
      var counts = { pending: 0, accepted: 0, rejected: 0 };
      rows.forEach(function (r) { counts[r.status]++; });

      $('#stats').innerHTML =
        '<a class="stat" href="?"><strong>' + rows.length + '</strong><span>Total</span></a>' +
        '<a class="stat s-pending" href="?status=pending"><strong>' + counts.pending + '</strong><span>Pending</span></a>' +
        '<a class="stat s-accepted" href="?status=accepted"><strong>' + counts.accepted + '</strong><span>Accepted</span></a>' +
        '<a class="stat s-rejected" href="?status=rejected"><strong>' + counts.rejected + '</strong><span>Rejected</span></a>';

      $('#q').value = P.q; $('#status').value = P.f;
      $('#clear-filter').hidden = !(P.f || P.q);

      var list = rows.filter(function (r) {
        if (P.f && r.status !== P.f) { return false; }
        if (P.q) {
          var q = P.q.toLowerCase(), pid = appIdParse(P.q);
          return r.applicant_name.toLowerCase().indexOf(q) >= 0 || r.guardian_name.toLowerCase().indexOf(q) >= 0 ||
                 r.phone.toLowerCase().indexOf(q) >= 0 || (pid !== null && r.application_id === pid);
        }
        return true;
      }).sort(function (a, b) {
        var pa = a.status === 'pending' ? 1 : 0, pb = b.status === 'pending' ? 1 : 0;
        return pa !== pb ? pb - pa : b.application_id - a.application_id;
      });

      var pages = Math.max(1, Math.ceil(list.length / per)), page = Math.min(P.page, pages);
      var view = list.slice((page - 1) * per, page * per), h = '';

      if (!view.length) { $('#admission-list').innerHTML = '<p class="empty">No applications match.</p>'; $('#pager').innerHTML = ''; return; }

      h = '<div class="table-scroll"><table class="data-table"><thead><tr><th>ID</th><th>Applicant</th><th>Class</th>' +
          '<th>Applied</th><th>Status</th><th>Action</th></tr></thead><tbody>';
      view.forEach(function (r) {
        var aid = r.application_id, label = appIdFormat(aid);
        var acct = users.filter(function (u) { return u.email.toLowerCase() === r.email.toLowerCase(); })[0];
        var reviewer = users.filter(function (u) { return u.user_id === r.reviewed_by; })[0];
        var action;
        if (r.status === 'pending') {
          action = '<div class="inline-actions">' +
            '<button class="btn btn-small btn-ok" type="button" data-act="accept" data-id="' + aid + '" data-confirm="Accept application ' + e(label) + '?">Accept</button>' +
            '<button class="btn btn-small btn-danger" type="button" data-act="reject" data-id="' + aid + '" data-confirm="Reject application ' + e(label) + '?">Reject</button></div>';
        } else if (r.status === 'accepted' && !acct) {
          action = '<div class="inline-actions"><button class="btn btn-small btn-primary" type="button" data-act="convert" data-id="' + aid +
            '" data-confirm="Create a student account for ' + e(r.applicant_name) + '?">Convert to student</button></div>';
        } else if (r.status === 'accepted' && acct.role === 'student') { action = '<span class="muted">Student account created</span>'; }
        else if (r.status === 'accepted') { action = '<span class="muted">Email used by another account</span>'; }
        else { action = '<span class="muted">Reviewed</span>'; }

        h += '<tr><td data-label="ID">' + e(label) + '</td><td data-label="Applicant"><details><summary>' + e(r.applicant_name) +
          '</summary><dl class="details"><dt>Date of birth</dt><dd>' + e(fmtDate(r.date_of_birth)) + '</dd>' +
          '<dt>Guardian</dt><dd>' + e(r.guardian_name) + '</dd><dt>Phone</dt><dd>' + e(r.phone) + '</dd>' +
          '<dt>Email</dt><dd>' + e(r.email) + '</dd>' +
          (r.status !== 'pending' ? '<dt>Reviewed by</dt><dd>' + e(reviewer ? reviewer.name : 'Unknown') + '</dd>' : '') +
          '</dl></details></td><td data-label="Class">' + e(r.class_applied) + '</td><td data-label="Applied">' + e(fmtDate(r.applied_date)) +
          '</td><td data-label="Status">' + statusBadge(r.status) + '</td><td data-label="Action">' + action + '</td></tr>';
      });
      $('#admission-list').innerHTML = h + '</tbody></table></div>';
      pager($('#pager'), pages, page, function (i) { return qs({ status: P.f, q: P.q, page: i > 1 ? i : '' }); });
    }

    $('#admission-list').addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-act]');
      if (!btn) { return; }
      if (!window.confirm(btn.getAttribute('data-confirm'))) { return; }
      var id = parseInt(btn.getAttribute('data-id'), 10), act = btn.getAttribute('data-act');

      if (act === 'convert') {
        var res = convertApplicantToStudent(id);
        showFlash(res.ok ? 'success' : 'error', res.msg);
      } else {
        var rows = load('admissions', []), r = rows.filter(function (x) { return x.application_id === id; })[0];
        var next = act === 'accept' ? 'accepted' : 'rejected';
        if (r && r.status === 'pending') {
          r.status = next; r.reviewed_by = currentUser().user_id;
          save('admissions', rows);
          showFlash('success', 'Application ' + appIdFormat(id) + ' marked as ' + next + '.');
        } else {
          showFlash('error', 'That application was already reviewed or does not exist.');
        }
      }
      render();
      window.scrollTo(0, 0);
    });

    $('#reset-demo').addEventListener('click', function () {
      if (!window.confirm('Delete everything saved in this browser (applications, accounts, notices) and restore the sample data?')) { return; }
      resetAllData();
      sset('user', { user_id: 1, role: 'admin', name: 'Test Admin' });
      showFlash('success', 'Sample data restored.');
      render();
    });

    render();
  }

  /* ======================= 7. START-UP ======================= */
  var PAGES = {
    home: pageHome, notices: pageNotices, gallery: pageGallery, admission: pageAdmission,
    'admission-done': pageAdmissionDone, track: pageTrack, slip: pageSlip, login: pageLogin, admin: pageAdmin
  };

  seed();
  renderChrome();
  bindGlobalClicks();
  var run = PAGES[document.body.getAttribute('data-page')];
  if (run) { run(); }
})();

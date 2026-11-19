/* teacher-notices.js - post, edit and delete my own class notices */
(function () {
  if (!T.ready) return;

  var classes = T.myClasses();
  if (!classes.length) { T.$('no-class').hidden = false; T.$('content').hidden = true; return; }

  var form = T.$('notice-form'), message = T.$('message');
  var classSel = T.$('n-class'), titleInp = T.$('n-title'), detailsInp = T.$('n-details');
  var editingId = null;
  T.fillSelect(classSel, classes, function (c) { return c.class_id; }, T.classLabel);

  function setErr(field, input, text) {
    T.$('err-' + field).textContent = text || '';
    if (text) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
  }

  function resetForm() {
    editingId = null;
    form.reset();
    T.$('form-title').textContent = 'Post a notice';
    T.$('n-submit').textContent = 'Post notice';
    T.$('n-cancel').hidden = true;
    setErr('class', classSel); setErr('title', titleInp); setErr('details', detailsInp);
  }

  function render() {
    var list = T.myNotices().sort(function (a, b) { return b.date.localeCompare(a.date) || b.id - a.id; });
    T.$('list').innerHTML = list.length ? list.map(function (n) {
      return '<article class="notice"><h3>' + T.esc(n.title) + '</h3>' +
        '<div class="t-notice-meta"><span class="t-class-tag">' + T.esc(n.class_name || '') + '</span>' +
        '<time datetime="' + T.esc(n.date) + '">' + T.fmtDate(n.date) + '</time></div>' +
        '<p>' + T.esc(n.details) + '</p>' +
        '<div class="t-notice-actions">' +
        '<button class="btn btn-small btn-outline" type="button" data-action="edit" data-id="' + n.id + '">Edit</button>' +
        '<button class="btn btn-small btn-danger" type="button" data-action="delete" data-id="' + n.id + '">Delete</button></div></article>';
    }).join('') : '<p class="empty">You have not posted any class notices yet. Use the form to post your first one.</p>';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    message.hidden = true;
    var title = titleInp.value.trim().replace(/\s+/g, ' ');
    var details = detailsInp.value.trim();
    var cls = classes.filter(function (c) { return String(c.class_id) === classSel.value; })[0];

    var bad = null;
    if (!cls) { setErr('class', classSel, 'Choose one of your classes.'); bad = bad || classSel; } else setErr('class', classSel);
    if (title.length < 3) { setErr('title', titleInp, 'Title must be 3 to 100 characters.'); bad = bad || titleInp; } else setErr('title', titleInp);
    if (details.length < 5) { setErr('details', detailsInp, 'Details must be at least 5 characters.'); bad = bad || detailsInp; } else setErr('details', detailsInp);
    if (bad) { bad.focus(); return; }

    var all = T.load('sms_notices', []);
    if (editingId !== null) {
      var n = all.filter(function (x) { return x.id === editingId && x.posted_by === T.teacher.user_id; })[0];
      if (!n) { T.flash(message, 'That notice no longer exists or is not yours.', 'error'); resetForm(); render(); return; }
      n.title = title; n.details = details; n.class_id = cls.class_id; n.class_name = T.classLabel(cls);
      T.save('sms_notices', all);
      T.log('notice', 'Notice updated: ' + title);
      T.flash(message, 'Notice updated.', 'success');
    } else {
      all.push({ id: T.nextId(all, 'id'), title: title, details: details, date: T.today(), scope: 'class',
                 class_id: cls.class_id, class_name: T.classLabel(cls), posted_by: T.teacher.user_id });
      T.save('sms_notices', all);
      T.log('notice', 'Notice posted: ' + title);
      T.flash(message, 'Notice posted for ' + T.classLabel(cls) + '.', 'success');
    }
    resetForm();
    render();
    window.scrollTo(0, 0);
  });

  T.$('n-cancel').addEventListener('click', resetForm);

  T.$('list').addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-action]');
    if (!btn) return;
    var id = parseInt(btn.getAttribute('data-id'), 10);
    var all = T.load('sms_notices', []);
    var n = all.filter(function (x) { return x.id === id && x.posted_by === T.teacher.user_id; })[0];
    if (!n) return;

    if (btn.getAttribute('data-action') === 'edit') {
      editingId = id;
      classSel.value = String(n.class_id);
      titleInp.value = n.title;
      detailsInp.value = n.details;
      T.$('form-title').textContent = 'Edit notice';
      T.$('n-submit').textContent = 'Save changes';
      T.$('n-cancel').hidden = false;
      message.hidden = true;
      titleInp.focus();
    } else {
      if (!confirm('Delete the notice "' + n.title + '"?')) return;
      T.save('sms_notices', all.filter(function (x) { return x.id !== id; }));
      T.log('notice', 'Notice deleted: ' + n.title);
      if (editingId === id) resetForm();
      T.flash(message, 'Notice deleted.', 'success');
      render();
    }
  });

  render();
})();

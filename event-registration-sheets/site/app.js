// ================= EDIT THIS =================
// Paste your Apps Script Web app URL here (ends with /exec)
const SCRIPT_URL = 'https://script.google.com/macros/s/PASTE_YOUR_DEPLOYMENT_ID/exec';
// =============================================

const $ = (id) => document.getElementById(id);
const form = $('form');
const lookupForm = $('lookup');
const STORE_KEY = 'bgyf2026_me';

// ---------- small helpers ----------
function show(el, text) {
    if (text !== undefined) el.textContent = text;
    el.hidden = false;
}
function hide(el) { el.hidden = true; }

function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
}

function clearErrors(f, alertEl) {
    f.querySelectorAll('.err').forEach((e) => (e.textContent = ''));
    hide(alertEl);
}

function setErrors(f, errors) {
    let first = null;
    for (const [name, msg] of Object.entries(errors)) {
        const slot = f.querySelector(`.err[data-for="${name}"]`);
        if (slot) slot.textContent = msg;
        if (!first) first = f.querySelector(`[name="${name}"]`);
    }
    if (first) first.focus();
}

async function callApi(payload) {
    // text/plain avoids a CORS preflight, which Apps Script doesn't support
    const res = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
    });
    return res.json();
}

function churchValue(f) {
    const v = String(new FormData(f).get('local_church') || '').trim();
    return v === '__other' ? String(new FormData(f).get('local_church_other') || '').trim() : v;
}

function wireOther(select, other) {
    select.addEventListener('change', () => {
        const isOther = select.value === '__other';
        other.hidden = !isOther;
        if (isOther) other.focus();
    });
}

// Saved login on this device (wrapped: storage can be blocked)
function saveMe(list) { try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {} }
function loadMe() { try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { return null; } }
function forgetMe() { try { localStorage.removeItem(STORE_KEY); } catch (e) {} }

// ---------- tabs ----------
const tabs = { register: [$('t-register'), $('tab-register')], check: [$('t-check'), $('tab-check')] };
function openTab(name) {
    for (const [key, [btn, panel]] of Object.entries(tabs)) {
        const on = key === name;
        btn.setAttribute('aria-selected', on ? 'true' : 'false');
        panel.hidden = !on;
    }
}
$('t-register').addEventListener('click', () => openTab('register'));
$('t-check').addEventListener('click', () => openTab('check'));

// ================= REGISTER =================
const submitBtn = $('submit');
const church = $('church');
const churchOther = $('church-other');
wireOther(church, churchOther);

function readForm() {
    const f = new FormData(form);
    const t = (k) => String(f.get(k) || '').trim();
    return {
        full_name: t('full_name'),
        age: t('age'),
        sex: t('sex'),
        email: t('email').toLowerCase(),
        local_church: churchValue(form),
        role: t('role'),
        consent: f.get('consent') === '1',
        website: t('website'),
    };
}

function localCheck(d) {
    const e = {};
    if (!d.full_name) e.full_name = 'Please enter your full name.';
    if (!/^\d{1,3}$/.test(d.age) || +d.age < 5 || +d.age > 100) e.age = 'Please enter a valid age (5–100).';
    if (!d.sex) e.sex = 'Please select your sex.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) e.email = 'Please enter a valid email address.';
    if (!d.local_church) e.local_church = 'Please select or type your local church.';
    if (!d.role) e.role = 'Please select your role.';
    if (!d.consent) e.consent = 'Please agree to the data privacy notice.';
    return e;
}

form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearErrors(form, $('alert'));
    const data = readForm();
    const errs = localCheck(data);
    if (Object.keys(errs).length) return setErrors(form, errs);

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting…';
    try {
        const out = await callApi(data);
        if (out.ok) {
            $('s-name').textContent = out.full_name;
            $('s-code').textContent = out.reg_code;
            saveMe([{ reg_code: out.reg_code, full_name: out.full_name, local_church: data.local_church, role: data.role, registered_at: 'Just now' }]);
            renderMe();
            hide(form);
            show($('success'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (out.errors) {
            setErrors(form, out.errors);
        } else {
            show($('alert'), out.error || 'Something went wrong. Please try again.');
        }
    } catch (err) {
        show($('alert'), 'Could not reach the server. Check your internet connection and try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
});

$('again').addEventListener('click', () => {
    form.reset();
    churchOther.hidden = true;
    clearErrors(form, $('alert'));
    hide($('success'));
    show(form);
});

$('see-program').addEventListener('click', () => {
    openTab('check');
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ================= LOGIN / CHECK =================
const lChurch = $('l-church');
const lChurchOther = $('l-church-other');
lChurch.innerHTML = church.innerHTML; // same church list as the registration form
lChurch.selectedIndex = 0;
wireOther(lChurch, lChurchOther);

lookupForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearErrors(lookupForm, $('l-alert'));
    const payload = {
        action: 'lookup',
        full_name: String(new FormData(lookupForm).get('full_name') || '').trim(),
        local_church: churchValue(lookupForm),
    };
    const errs = {};
    if (!payload.full_name) errs.full_name = 'Please enter your full name.';
    if (!payload.local_church) errs.local_church = 'Please select or type your local church.';
    if (Object.keys(errs).length) return setErrors(lookupForm, errs);

    const btn = $('l-submit');
    btn.disabled = true;
    btn.textContent = 'Checking…';
    try {
        const out = await callApi(payload);
        if (out.ok) {
            saveMe(out.results);
            renderMe();
            lookupForm.reset();
            lChurchOther.hidden = true;
        } else if (out.errors) {
            setErrors(lookupForm, out.errors);
        } else if (out.notFound) {
            show($('l-alert'), "We couldn't find a registration with that name and church. Check the spelling, or register first.");
        } else {
            show($('l-alert'), out.error || 'Something went wrong. Please try again.');
        }
    } catch (err) {
        show($('l-alert'), 'Could not reach the server. Check your internet connection and try again.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Log in';
    }
});

$('logout').addEventListener('click', () => {
    forgetMe();
    closeEdit();
    hide($('saved'));
    renderMe();
});

// ================= EDIT PROFILE =================
const unlockForm = $('unlock');
const editForm = $('editform');
const eChurch = $('e-church');
const eChurchOther = $('e-church-other');
let editing = null; // { reg_code, auth_email }

// Reuse the registration form's choices so the lists never drift apart
$('e-sex').innerHTML = form.querySelector('.seg').innerHTML;
$('e-role').innerHTML = form.querySelector('.roles').innerHTML;
eChurch.innerHTML = church.innerHTML;
wireOther(eChurch, eChurchOther);

function startEdit(rec) {
    editing = { reg_code: rec.reg_code, auth_email: '' };
    $('edit-for').textContent = `${rec.full_name} · ${rec.reg_code}`;
    unlockForm.reset();
    clearErrors(unlockForm, $('u-alert'));
    clearErrors(editForm, $('e-alert'));
    hide($('saved'));
    show(unlockForm);
    hide(editForm);
    show($('edit'));
    $('edit').scrollIntoView({ behavior: 'smooth', block: 'start' });
    unlockForm.querySelector('input').focus({ preventScroll: true });
}

function closeEdit() {
    editing = null;
    hide($('edit'));
}

document.querySelectorAll('#edit [data-cancel]').forEach((b) => b.addEventListener('click', closeEdit));

function fillEdit(p) {
    editForm.reset();
    editForm.full_name.value = p.full_name;
    editForm.age.value = p.age;
    editForm.email.value = p.email;
    editForm.querySelectorAll('[name=sex]').forEach((i) => (i.checked = i.value === p.sex));
    editForm.querySelectorAll('[name=role]').forEach((i) => (i.checked = i.value === p.role));
    const listed = [...eChurch.options].some((o) => o.value === p.local_church);
    eChurch.value = listed ? p.local_church : '__other';
    eChurchOther.value = listed ? '' : p.local_church;
    eChurchOther.hidden = listed;
}

unlockForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearErrors(unlockForm, $('u-alert'));
    const email = String(unlockForm.auth_email.value || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return setErrors(unlockForm, { auth_email: 'Please enter a valid email address.' });
    }
    const btn = $('u-submit');
    btn.disabled = true;
    btn.textContent = 'Checking…';
    try {
        const out = await callApi({ action: 'unlock', reg_code: editing.reg_code, auth_email: email });
        if (out.ok) {
            editing.auth_email = email;
            fillEdit(out.profile);
            hide(unlockForm);
            show(editForm);
            editForm.full_name.focus();
        } else {
            show($('u-alert'), out.error || 'Something went wrong. Please try again.');
        }
    } catch (err) {
        show($('u-alert'), 'Could not reach the server. Check your internet connection and try again.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Continue';
    }
});

editForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    clearErrors(editForm, $('e-alert'));
    const f = new FormData(editForm);
    const t = (k) => String(f.get(k) || '').trim();
    const data = {
        full_name: t('full_name'),
        age: t('age'),
        sex: t('sex'),
        email: t('email').toLowerCase(),
        local_church: churchValue(editForm),
        role: t('role'),
        consent: true,
    };
    const errs = localCheck(data);
    if (Object.keys(errs).length) return setErrors(editForm, errs);

    const btn = $('e-submit');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
        const out = await callApi(Object.assign({ action: 'update', reg_code: editing.reg_code, auth_email: editing.auth_email }, data));
        if (out.ok) {
            const me = (loadMe() || []).map((r) => (r.reg_code === out.result.reg_code ? out.result : r));
            saveMe(me);
            closeEdit();
            renderMe();
            show($('saved'), 'Your profile was updated.');
            $('me').scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (out.errors) {
            setErrors(editForm, out.errors);
        } else {
            show($('e-alert'), out.error || 'Something went wrong. Please try again.');
        }
    } catch (err) {
        show($('e-alert'), 'Could not reach the server. Check your internet connection and try again.');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save changes';
    }
});

function renderMe() {
    const me = loadMe();
    const cards = $('me-cards');
    cards.replaceChildren();
    if (!me || !me.length) {
        hide($('me'));
        show(lookupForm);
        return;
    }
    me.forEach((r) => {
        const c = el('div', 'pass');
        c.append(el('p', 'kicker', 'Registered'));
        c.append(el('p', 'pass-name', r.full_name));
        c.append(el('p', 'code', r.reg_code));
        const dl = el('dl', 'pass-meta');
        [['Church', r.local_church], ['Role', r.role], ['Registered', r.registered_at]].forEach(([k, v]) => {
            const d = el('div');
            d.append(el('dt', '', k), el('dd', '', v));
            dl.append(d);
        });
        c.append(dl);
        const editBtn = el('button', 'btn small-dark', 'Edit profile');
        editBtn.type = 'button';
        editBtn.addEventListener('click', () => startEdit(r));
        c.append(editBtn);
        cards.append(c);
    });
    if (me.length > 1) cards.prepend(el('p', 'hint left', `${me.length} registrations match this name and church.`));
    hide(lookupForm);
    show($('me'));
}

// ================= PROGRAM =================
function renderDay(i) {
    $('daytabs').querySelectorAll('button').forEach((b, j) => b.setAttribute('aria-selected', i === j ? 'true' : 'false'));
    const list = $('timeline');
    list.replaceChildren();
    PROGRAM[i].items.forEach((it) => {
        const li = el('li', it.highlight ? 'hl' : '');
        li.append(el('span', 'time', it.time));
        const body = el('div', 'tl-body');
        body.append(el('p', 'tl-title', it.title));
        if (it.by) body.append(el('p', 'tl-by', it.by));
        if (it.details) {
            const det = el('details');
            det.append(el('summary', '', 'Details'));
            const ul = el('ul');
            it.details.forEach((d) => {
                if (typeof d === 'string') return ul.append(el('li', '', d));
                const sub = el('li', '', d.label);
                const inner = el('ul');
                d.items.forEach((x) => inner.append(el('li', '', x)));
                sub.append(inner);
                ul.append(sub);
            });
            det.append(ul);
            body.append(det);
        }
        li.append(body);
        list.append(li);
    });
}

function initProgram() {
    $('prog-updated').textContent = PROGRAM_UPDATED;
    const bar = $('daytabs');
    PROGRAM.forEach((d, i) => {
        const b = el('button');
        b.type = 'button';
        b.setAttribute('role', 'tab');
        b.append(el('b', '', d.day), el('span', '', d.date));
        b.addEventListener('click', () => renderDay(i));
        bar.append(b);
    });
    // Open today's day during the event, otherwise Day 1
    const today = new Date();
    const start = new Date(2026, 11, 27);
    const diff = Math.floor((today - start) / 86400000);
    renderDay(diff >= 0 && diff < PROGRAM.length ? diff : 0);
}

initProgram();
renderMe();

// Check whether registration is still open
fetch(SCRIPT_URL)
    .then((r) => r.json())
    .then((st) => {
        if (st && st.open === false) {
            hide(form);
            show($('notice'), st.message);
        }
    })
    .catch(() => {});

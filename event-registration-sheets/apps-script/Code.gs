/**
 * Event Registration backend — Google Apps Script
 * Paste this whole file into Extensions > Apps Script of your Google Sheet.
 * Then run setup() once, and deploy as a Web app (see README).
 */

// ================= SETTINGS =================
const REGISTRATION_OPEN = true;   // set to false to close registration
const MAX_REGISTRANTS   = 0;      // 0 = no limit, e.g. 200 to close when full
const SHEET_NAME        = 'Registrants';
// ============================================

const ROLES = ['Youth Delegate', 'Pastor', 'BGYF Officer', 'Workers', 'Church Member/Volunteer'];
const SEXES = ['Male', 'Female'];
const HEADERS = ['Reg Code', 'Full Name', 'Age', 'Sex', 'Email', 'Local Church', 'Role', 'Registered At', 'Last Edited'];

/** Run once from the editor: creates the Registrants and Summary tabs. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#1f4e79').setFontColor('#ffffff');
  sh.setFrozenRows(1);
  sh.getRange('C:C').setNumberFormat('0');
  sh.getRange('H:I').setNumberFormat('mmm d, yyyy h:mm AM/PM');

  let sum = ss.getSheetByName('Summary');
  if (!sum) sum = ss.insertSheet('Summary');
  sum.clear();
  const R = "'" + SHEET_NAME + "'!";
  const rows = [['Category', 'Count'], ['Total registrants', '=COUNTA(' + R + 'A2:A)']];
  ROLES.forEach(r => rows.push([r, '=COUNTIF(' + R + 'G2:G,"' + r + '")']));
  SEXES.forEach(s => rows.push([s, '=COUNTIF(' + R + 'D2:D,"' + s + '")']));
  rows.push(['Churches represented', '=IFERROR(COUNTUNIQUE(' + R + 'F2:F),0)']);
  sum.getRange(1, 1, rows.length, 2).setValues(rows);
  sum.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#1f4e79').setFontColor('#ffffff');
  sum.getRange(2, 1, 1, 2).setFontWeight('bold');
  sum.setColumnWidth(1, 220);

  const def = ss.getSheetByName('Sheet1');
  if (def && def.getLastRow() === 0 && ss.getSheets().length > 2) ss.deleteSheet(def);
}

/** GET: lets the form check whether registration is open. */
function doGet() {
  return json_(status_());
}

/** POST: saves one registration. */
function doPost(e) {
  let data;
  try {
    data = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'Invalid request.' });
  }

  if (data.website) return json_({ ok: false, error: 'Submission rejected.' }); // honeypot

  if (data.action === 'lookup') return json_(lookup_(data));
  if (data.action === 'unlock') return json_(unlock_(data));
  if (data.action === 'update') return json_(update_(data));

  const v = validate_(data);
  if (v.errors) return json_({ ok: false, errors: v.errors });

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return json_({ ok: false, error: 'The server is busy. Please try again in a moment.' });
  }

  try {
    const st = status_();
    if (!st.open) return json_({ ok: false, error: st.message });

    const sh = sheet_();
    const last = sh.getLastRow();
    if (last > 1) {
      const emails = sh.getRange(2, 5, last - 1, 1).getValues();
      for (let i = 0; i < emails.length; i++) {
        if (String(emails[i][0]).trim().toLowerCase() === v.clean.email) {
          return json_({ ok: false, errors: { email: 'This email is already registered.' } });
        }
      }
    }

    const code = 'REG-' + Utilities.getUuid().replace(/-/g, '').slice(0, 6).toUpperCase();
    const c = v.clean;
    sh.appendRow([code, safe_(c.full_name), c.age, c.sex, safe_(c.email), safe_(c.local_church), c.role, new Date()]);
    SpreadsheetApp.flush();
    return json_({ ok: true, reg_code: code, full_name: c.full_name });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Finds registrations by full name + local church.
 * Returns only the code, role, church and date — never email or age.
 */
function lookup_(d) {
  const norm = x => String(x == null ? '' : x).trim().replace(/\s+/g, ' ').toLowerCase().replace(/^'/, '');
  const name = norm(d.full_name);
  const church = norm(d.local_church);
  const errors = {};
  if (!name) errors.full_name = 'Please enter your full name.';
  if (!church) errors.local_church = 'Please select or type your local church.';
  if (Object.keys(errors).length) return { ok: false, errors };

  const sh = sheet_();
  const last = sh.getLastRow();
  const found = [];
  if (last > 1) {
    const rows = sh.getRange(2, 1, last - 1, 8).getValues();
    rows.forEach(r => {
      if (norm(r[1]) === name && norm(r[5]) === church) found.push(publicRecord_(r));
    });
  }
  return found.length ? { ok: true, results: found } : { ok: false, notFound: true };
}

/**
 * Step 1 of editing: proves ownership with reg code + the email used to register.
 * Returns the full profile so the edit form can be filled in.
 */
function unlock_(d) {
  const found = findOwned_(d.reg_code, d.auth_email);
  if (found.error) return found.error;
  const r = found.row;
  return {
    ok: true,
    profile: {
      reg_code: r[0],
      full_name: unsafe_(r[1]),
      age: r[2],
      sex: r[3],
      email: unsafe_(r[4]),
      local_church: unsafe_(r[5]),
      role: r[6],
    },
  };
}

/** Step 2 of editing: saves the changes (needs the same reg code + original email). */
function update_(d) {
  const v = validate_(Object.assign({}, d, { consent: true }));
  if (v.errors) return { ok: false, errors: v.errors };

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return { ok: false, error: 'The server is busy. Please try again in a moment.' };
  }

  try {
    const found = findOwned_(d.reg_code, d.auth_email);
    if (found.error) return found.error;

    const c = v.clean;
    const sh = sheet_();
    const last = sh.getLastRow();
    const emails = sh.getRange(2, 5, last - 1, 1).getValues();
    for (let i = 0; i < emails.length; i++) {
      if (i + 2 !== found.rowNum && String(emails[i][0]).trim().toLowerCase().replace(/^'/, '') === c.email) {
        return { ok: false, errors: { email: 'This email is already used by another registration.' } };
      }
    }

    sh.getRange(found.rowNum, 2, 1, 6).setValues([[safe_(c.full_name), c.age, c.sex, safe_(c.email), safe_(c.local_church), c.role]]);
    sh.getRange(found.rowNum, 9).setValue(new Date());
    if (!sh.getRange(1, 9).getValue()) sh.getRange(1, 9).setValue('Last Edited');
    SpreadsheetApp.flush();

    const row = sh.getRange(found.rowNum, 1, 1, 8).getValues()[0];
    return { ok: true, result: publicRecord_(row) };
  } finally {
    lock.releaseLock();
  }
}

/** Finds the row for a reg code and checks the email matches. */
function findOwned_(code, email) {
  const denied = { error: { ok: false, error: "That email doesn't match this registration. Use the email you registered with." } };
  code = String(code || '').trim().toUpperCase();
  email = String(email || '').trim().toLowerCase();
  if (!/^REG-[0-9A-F]{6}$/.test(code) || !email) return denied;

  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) return denied;
  const rows = sh.getRange(2, 1, last - 1, 8).getValues();
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]).toUpperCase() === code) {
      if (unsafe_(rows[i][4]).trim().toLowerCase() !== email) return denied;
      return { row: rows[i], rowNum: i + 2 };
    }
  }
  return denied;
}

function publicRecord_(r) {
  const when = r[7] instanceof Date
    ? Utilities.formatDate(r[7], 'Asia/Manila', 'MMMM d, yyyy h:mm a')
    : String(r[7]);
  return { reg_code: r[0], full_name: unsafe_(r[1]), local_church: unsafe_(r[5]), role: r[6], registered_at: when };
}

function unsafe_(v) {
  return String(v == null ? '' : v).replace(/^'/, '');
}

// ---------------- helpers ----------------

function validate_(d) {
  const errors = {};
  const s = x => String(x == null ? '' : x).trim().replace(/\s+/g, ' ');
  const clean = {
    full_name: s(d.full_name),
    age: s(d.age),
    sex: s(d.sex),
    email: s(d.email).toLowerCase(),
    local_church: s(d.local_church),
    role: s(d.role),
  };

  if (!clean.full_name || clean.full_name.length > 120) errors.full_name = 'Please enter your full name.';
  if (!/^\d{1,3}$/.test(clean.age) || +clean.age < 5 || +clean.age > 100) errors.age = 'Please enter a valid age (5–100).';
  if (SEXES.indexOf(clean.sex) === -1) errors.sex = 'Please select your sex.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean.email) || clean.email.length > 160) errors.email = 'Please enter a valid email address.';
  if (!clean.local_church || clean.local_church.length > 160) errors.local_church = 'Please enter your local church.';
  if (ROLES.indexOf(clean.role) === -1) errors.role = 'Please select your role.';
  if (d.consent !== true && d.consent !== '1' && d.consent !== 'on') errors.consent = 'Please agree to the data privacy notice.';

  clean.age = +clean.age;
  return Object.keys(errors).length ? { errors } : { clean };
}

function status_() {
  if (!REGISTRATION_OPEN) return { open: false, message: 'Registration is now closed.' };
  if (MAX_REGISTRANTS > 0 && sheet_().getLastRow() - 1 >= MAX_REGISTRANTS) {
    return { open: false, message: 'Registration is full. Thank you for your interest!' };
  }
  return { open: true };
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('Run setup() first.');
  return sh;
}

/** Stops typed text like "=HYPERLINK(...)" from running as a formula in the sheet. */
function safe_(v) {
  return /^[=+\-@]/.test(v) ? "'" + v : v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

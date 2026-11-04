# Event Registration — GitHub Pages + Google Sheets

The registration form is a static website on GitHub Pages. Every submission is saved as a new row in a Google Sheet you own. The Sheet is your admin dashboard: view, search, sort, filter, print or download it.

```
site/            → upload to GitHub (index.html, app.js, program.js, style.css, assets/)
apps-script/     → Code.gs, pasted into your Google Sheet's Apps Script
```

## Part 1 — Google Sheet (backend, ~10 minutes)

1. Go to **sheets.new** to create a new Google Sheet. Name it, e.g. *Youth Camp 2026 Registrations*.
2. Open **Extensions → Apps Script**.
3. Delete the sample code, paste in all of `apps-script/Code.gs`, and click **Save** (💾).
4. At the top, choose the **`setup`** function in the dropdown and click **Run**.
   - Google will ask for permission. Click **Review permissions** → choose your account → **Advanced** → **Go to (project name) (unsafe)** → **Allow**. This warning appears for every personal script; it only grants access to this Sheet.
   - Back in the Sheet you'll now see two tabs: **Registrants** and **Summary**.
5. Click **Deploy → New deployment**.
   - Click the gear ⚙ next to *Select type* → **Web app**.
   - *Execute as*: **Me**
   - *Who has access*: **Anyone**
   - Click **Deploy** and **copy the Web app URL** (ends with `/exec`).

## Part 2 — Website on GitHub Pages (~10 minutes)

1. Open `site/app.js` and replace the `SCRIPT_URL` value with the URL you copied.
2. (Optional) The event name, date and venue are already set in `site/index.html`. To change the banner, replace `site/assets/banner.jpg` with another 851×315 image.
3. On github.com, create a new **public** repository (e.g. `youth-camp-registration`).
4. Click **Add file → Upload files**, then drag in **everything inside** `site/`: `index.html`, `app.js`, `program.js`, `style.css` and the whole `assets` folder. Commit.
5. Go to **Settings → Pages**. Under *Build and deployment*, set *Source* to **Deploy from a branch**, branch **main**, folder **/ (root)**. Save.
6. After a minute your form is live at `https://YOUR-USERNAME.github.io/youth-camp-registration/`.

## Test it

Register a test person on the live site. A new row should appear in the **Registrants** tab, and the **Summary** tab should update. Delete the test row afterwards.

## Day-to-day

- **See registrants:** open the Sheet. Use *Data → Create a filter* to filter by role or church.
- **Summary tab:** totals per role, male/female, number of churches — updates automatically.
- **Export:** *File → Download → Microsoft Excel* or *CSV*.
- **Duplicate emails** are blocked, so each email registers only once.
- Each registrant sees a code like `REG-3F9A1C` to screenshot and show at the desk. Search it in the Sheet with Ctrl+F.

## Login and event program

The **My registration & program** tab lets people log in with their **full name and local church** (the same ones they registered with; capital letters and extra spaces don't matter). They then see:

- their registration code, church, role and date (never their email or age), and
- the full 4-day **Event Program**, with tap-to-open details for each service.

People are logged in automatically right after registering, and stay logged in on that phone until they tap **Log out**.

### Editing their own profile

On their pass card, people tap **Edit profile**, then confirm the **email they registered with**. Only after that can they change their name, age, sex, email, church or role. Their registration code and date stay the same, and the **Last Edited** column in the Sheet shows when they changed something.

- The email check stops others from changing someone's details just by knowing their name and church.
- An email already used by another registrant can't be taken.
- If someone forgets their registered email, look up their code in the Sheet and fix the row yourself.

**Updating the program:** edit `site/program.js` and upload it to GitHub again. No Apps Script redeploy is needed.

Note: logging in only needs a name and church, so anyone who knows them can see that person's code. Changing details always needs the registered email. The program itself is part of the website files, so treat it as public.

## Closing registration

Edit the settings at the top of `Code.gs`:

- `REGISTRATION_OPEN = false` closes the form.
- `MAX_REGISTRANTS = 200` closes it automatically when full.

**After any change to `Code.gs`, redeploy so it takes effect:** Deploy → **Manage deployments** → ✏️ Edit → *Version*: **New version** → **Deploy**. The URL stays the same, so you don't need to change `app.js`.

## Privacy

- The website holds no data. Registrations exist only in your Google Sheet, visible only to you and anyone you share the Sheet with.
- Share the Sheet only with organizers who need it.
- After the event, download a copy and delete what you no longer need (Data Privacy Act of 2012).

## Troubleshooting

| Problem | Fix |
|---|---|
| "Could not reach the server" | `SCRIPT_URL` in `app.js` is wrong, or *Who has access* isn't **Anyone**. |
| Changes to `Code.gs` don't apply | Redeploy with **New version** (see above). |
| Error "Run setup() first" | Run the `setup` function once in Apps Script. |
| Page shows old version | GitHub Pages can take 1–2 minutes to update; refresh with Ctrl+Shift+R. |

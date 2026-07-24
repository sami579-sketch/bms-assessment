# BMS Assessment — Deployment & Configuration Guide

Complete step-by-step for deploying to **Vercel**, setting up **Supabase**, and configuring **email** (Gmail / Outlook). Written for this exact project (Next.js + Supabase + Nodemailer).

> ⚠️ **Read the Email section first if email is important to you.** Microsoft retired basic‑auth (app‑password) SMTP for Microsoft 365 work/school mailboxes on **30 April 2026**. That date has passed, so the project's default `smtp.office365.com` + password setup will **not** work for a Microsoft 365 business mailbox anymore. **Gmail (app password) still works** and is the easiest path — see Option A.

---

## 0. Prerequisites (one‑time)

- A **GitHub** account (github.com) — free.
- A **Vercel** account (vercel.com) — sign up with GitHub, free "Hobby" tier is enough.
- A **Supabase** account (supabase.com) — free tier is enough.
- **Git** installed on your PC, and **Node.js 18+**.
- The project folder: `C:\Users\user\Documents\bms-assessment\bms-assessment`.

---

## 1. Supabase (database)

### 1.1 Create the project
1. Go to https://supabase.com → **New project**.
2. Name it (e.g. `bms-assessment`), set a **database password** (save it somewhere), pick a **region** close to Dubai (e.g. *Frankfurt (eu‑central‑1)* or *Bahrain (me‑south‑1)*).
3. Wait ~2 minutes for it to provision.

### 1.2 Create the table
1. In the Supabase dashboard → **SQL Editor** → **New query**.
2. Open the file `supabase-schema.sql` from this project, copy its entire contents, paste into the editor.
3. Click **Run**. You should see "Success". This creates the `assessments` table, indexes, RLS policy, and the auto‑`updated_at` trigger.

### 1.3 Get your keys
1. Go to **Project Settings** (gear icon) → **API Keys** (and **Data API** / **API** for the URL).
2. Copy these three values — you'll paste them into Vercel later:

| Value in Supabase | Env var it maps to |
|---|---|
| **Project URL** | `NEXT_PUBLIC_SUPABASE_URL` |
| **anon / public** key (newer dashboards call this the **Publishable key**) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| **service_role** key (newer dashboards call this the **Secret key**) | `SUPABASE_SERVICE_ROLE_KEY` |

> Supabase is migrating key names: **publishable** replaces **anon**, **secret** replaces **service_role**. Both the legacy and new keys work with this app — use whichever your dashboard shows. The service_role/secret key is powerful (bypasses security) — keep it server‑side only, never in client code (this project already does).

### 1.4 Row Level Security (note)
The schema enables RLS with an "allow all" policy — fine for an internal clinical tool with no public login. If you later add authentication, tighten this policy.

---

## 2. Push the code to GitHub

From **Command Prompt (cmd)** in the project folder:

```cmd
cd /d "C:\Users\user\Documents\bms-assessment\bms-assessment"
git init
git add .
git commit -m "BMS Assessment initial deploy"
```

Then create an **empty** repo on github.com (no README), copy its URL, and:

```cmd
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bms-assessment.git
git push -u origin main
```

> ✅ Make sure `.gitignore` excludes `node_modules`, `.next`, and `.env*`. **Never commit `.env.local`** — your keys and email password must not go to GitHub.

---

## 3. Deploy to Vercel

### 3.1 Import
1. Go to https://vercel.com → **Add New… → Project**.
2. **Import** your `bms-assessment` GitHub repo (authorize Vercel to access GitHub if prompted).
3. Vercel auto‑detects **Next.js** — leave build settings at defaults.

### 3.2 Add environment variables
Before clicking Deploy, expand **Environment Variables** and add all of these (see the full reference in section 5):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASS
ADMIN_EMAIL
NEXT_PUBLIC_APP_URL
```

Apply them to **Production, Preview, and Development**.

### 3.3 Deploy
1. Click **Deploy**. Wait for the build (~1–2 min).
2. You'll get a URL like `https://bms-assessment.vercel.app`.
3. Copy that URL, go to **Settings → Environment Variables**, set `NEXT_PUBLIC_APP_URL` to it, then **Deployments → … → Redeploy** so the value takes effect.

### 3.4 Custom domain (optional)
1. **Settings → Domains** → add e.g. `assess.bridgewayhealthcare.com`.
2. In your DNS provider, add the **CNAME** record Vercel shows (points the subdomain to Vercel). Wait for it to verify.
3. Update `NEXT_PUBLIC_APP_URL` to the custom domain and redeploy.

### 3.5 Redeploying later
Any `git push` to `main` auto‑redeploys. To change env vars, edit them in Vercel then redeploy.

---

## 4. Email configuration

The app emails the PDF report from `pages/api/send-email.js` using **Nodemailer over SMTP**. Pick **one** option below.

### Option A — Gmail  ✅ recommended, works today
1. Use a dedicated Gmail or Google Workspace account (e.g. a `noreply@` / clinic account).
2. Turn on **2‑Step Verification**: Google Account → **Security** → 2‑Step Verification → enable.
3. Create an **App Password**: go to https://myaccount.google.com/apppasswords (or Security → search "App passwords") → name it "BMS Assessment" → **Create** → copy the **16‑character** password (shown without spaces).
4. Set these env vars in Vercel:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=youraddress@gmail.com
EMAIL_PASS=the16charAppPassword
ADMIN_EMAIL=admin@yourdomain.com
```

5. **One small code change is needed.** The current transporter forces an old Outlook‑only TLS setting that breaks Gmail. In `pages/api/send-email.js`, change the transporter to:

```js
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,            // STARTTLS on port 587
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
})
```

(i.e. remove the `tls: { ciphers: 'SSLv3', rejectUnauthorized: false }` line — that's an Outlook workaround and it's both insecure and incompatible with Gmail.) *I can make this edit for you — just say so.*

### Option B — Outlook / Microsoft 365  ⚠️ read carefully
- **Microsoft 365 (work/school) mailboxes:** Basic auth / app‑password SMTP was **retired on 30 April 2026**. Since that date has passed, `smtp.office365.com` with `EMAIL_USER` + `EMAIL_PASS` will fail with an auth error (e.g. `535 5.7.139 SmtpClientAuthentication is disabled`). To use Outlook you must switch to **OAuth 2.0** (register an app in Microsoft Entra / Azure AD, get a client ID + secret, and use Nodemailer's OAuth2 transport). This is noticeably more setup.
- **Personal Outlook.com / Hotmail:** Microsoft is also phasing out basic auth for third‑party apps; an app password with 2FA may still work in some cases but is unreliable and being removed.
- **Bottom line:** for Outlook, plan on OAuth 2.0 — or use **Gmail (Option A)** or a **transactional service (Option C)** instead. If you specifically need Outlook + OAuth2 wired up, I can implement it.

### Option C — Transactional email service  ✅ best for production
Services like **Resend**, **SendGrid**, **Brevo**, or **Mailgun** are built for apps, have free tiers, better deliverability, and work cleanly on Vercel serverless (no personal‑account auth issues). They use a single **API key**. This needs a small rewrite of `send-email.js` (swap Nodemailer/SMTP for the provider's API). If you want this, tell me which provider and I'll wire it up.

---

## 5. Environment variables — full reference

| Variable | Where to get it | Example |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API | `https://abcd1234.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API Keys (anon / publishable) | `eyJhbGciOi...` or `sb_publishable_...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API Keys (service_role / secret) | `eyJhbGciOi...` or `sb_secret_...` |
| `EMAIL_HOST` | Your email provider | `smtp.gmail.com` (Gmail) |
| `EMAIL_PORT` | Provider | `587` |
| `EMAIL_USER` | The sending mailbox | `noreply@yourclinic.com` |
| `EMAIL_PASS` | App password (Gmail) | `abcdefghijklmnop` |
| `ADMIN_EMAIL` | Always CC'd on every report | `admin@bridgewayhealthcare.com` |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL | `https://bms-assessment.vercel.app` |

For **local development**, put the same variables in a file named `.env.local` in the project root (already git‑ignored), then run `npm run dev`.

---

## 6. Test it

1. Open your deployed URL.
2. Create a patient profile, fill an assessment, hit **Export & Send**.
3. Confirm: the PDF downloads, the assessor + `ADMIN_EMAIL` receive it, and a row appears in Supabase (**Table Editor → assessments**).

### Common issues
- **Email fails with `535` / `5.7.139` / auth disabled** → provider auth problem. For Outlook this is the basic‑auth retirement — switch to Gmail (Option A) or a service (Option C). For Gmail, confirm you used the **App Password**, not your normal password, and applied the code change in 4.A.5.
- **Gmail TLS / cipher error** → you still have the `ciphers: 'SSLv3'` line; remove it (step 4.A.5).
- **Data not saving to Supabase** → check the three Supabase env vars, that the SQL schema ran, and that the `assessments` table exists.
- **`NEXT_PUBLIC_*` change not taking effect** → these are baked in at build time; **redeploy** after changing them.

---

## 7. Quick recap

1. Supabase: create project → run `supabase-schema.sql` → copy URL + 2 keys.
2. GitHub: push the repo.
3. Vercel: import repo → add 9 env vars → deploy → set `NEXT_PUBLIC_APP_URL` → redeploy.
4. Email: **use Gmail app password** (Option A) + the small `send-email.js` tweak; Outlook needs OAuth2 now; or use Resend/SendGrid (Option C).

# BMS Assessment

A premium clinical assessment web app for wheelchair, seating, standing, and walking assessments.

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Vercel Serverless Functions (API Routes)
- **Database**: Supabase (PostgreSQL) + localStorage backup
- **PDF**: jsPDF (client-side generation)
- **Email**: Nodemailer via Outlook SMTP

---

## Setup Guide

### 1. Clone & Install

```bash
git clone <your-repo>
cd bms-assessment
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the SQL Editor, run the contents of `supabase-schema.sql`
3. Copy your project URL and keys from **Settings → API**

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Outlook SMTP
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_USER=your@outlook.com
EMAIL_PASS=your-app-password

# Admin always receives a copy
ADMIN_EMAIL=admin@yourclinic.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### Getting your Outlook App Password

If you have 2FA enabled on your Microsoft account:
1. Go to [account.microsoft.com/security](https://account.microsoft.com/security)
2. Click **Advanced security options**
3. Under **App passwords**, create a new app password
4. Use that password as `EMAIL_PASS`

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A: GitHub Integration (recommended)

1. Push your code to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add all environment variables in Vercel's dashboard under **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `ADMIN_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain, e.g. `https://bms-assessment.vercel.app`)
4. Click **Deploy**

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## Features

### Assessment Flow
1. **Patient Profile** — required before anything else
2. **Choose forms** — Wheelchair & Seating and/or Standing & Walking (either or both)
3. **Complete measurements** — validated required fields, optional fields clearly labelled
4. **Review** — see all measurements in a clean summary
5. **Export PDF** — professional A4 report with clinic branding
6. **Send by Email** — auto-sends to assessor + admin; confirm before sending

### Data Storage
- **localStorage** — instant, no setup, offline-capable
- **Supabase** — cloud backup, assessments accessible from any device
- **Draft recovery** — auto-restores incomplete assessment on page reload

### PDF Report
- Patient + assessor details
- All completed form measurements with numbered reference
- Clinical notes
- BMS branding header and footer with page numbers
- Generated client-side, no server round-trip

---

## File Structure

```
bms-assessment/
├── pages/
│   ├── index.jsx              # Main app (step orchestrator)
│   ├── _app.jsx               # App wrapper
│   └── api/
│       ├── assessments.js     # Supabase CRUD API
│       └── send-email.js      # Nodemailer email API
├── components/
│   ├── PatientProfile.jsx     # Step 1: patient details form
│   ├── AssessmentSelector.jsx # Step 2: choose form type
│   ├── WheelchairForm.jsx     # Wheelchair & seating measurements
│   ├── StandingForm.jsx       # Standing & walking measurements
│   ├── ReviewPanel.jsx        # Review + PDF + email export
│   └── FormElements.jsx       # Reusable UI components
├── lib/
│   ├── pdf.js                 # jsPDF report generation
│   ├── storage.js             # localStorage utilities
│   └── supabase.js            # Supabase client + schema notes
├── styles/
│   └── globals.css            # Tailwind + custom design tokens
├── supabase-schema.sql        # Run in Supabase SQL Editor
├── .env.example               # Environment variable template
└── vercel.json                # Vercel deployment config
```

---

## Customisation

### Add your clinic logo to PDF
In `lib/pdf.js`, replace the text header with an image:
```js
// doc.addImage(logoBase64, 'PNG', margin, 4, 40, 20)
```

### Change measurement units
Fields default to `mm`. Update the `unit` prop in form components and PDF labels.

### Add authentication
Replace the Supabase open policy with Supabase Auth RLS policies to restrict access per user/team.

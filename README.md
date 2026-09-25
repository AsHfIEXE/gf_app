# The Application — GF Archive

A dark, anonymous relationship-application experience styled as a private archive. The interface includes the public application journey, report receipt, status lookup, selected-report page, consent-based contact reveal, and reviewer dashboard.

## Run locally

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/how-it-works` | Archive explanation |
| `/apply` | One-question-at-a-time application flow |
| `/application/submitted` | Generated report-ID receipt |
| `/status` | Applicant status lookup |
| `/selected` | Publicly announced selected report IDs |
| `/reveal` | Applicant-controlled contact reveal |
| `/admin-login` | Reviewer sign-in |
| `/admin` | Protected reviewer dashboard |
| `/admin/applications/[id]` | Protected report and assessment controls |

## Protecting the admin area

The admin pages and future `/api/admin/*` endpoints are gated by a signed, HTTP-only session cookie. The cookie expires after eight hours. Set these variables in the local environment and in Vercel before signing in:

```text
ADMIN_PASSWORD=<private password, at least 16 characters>
ADMIN_SESSION_SECRET=<random secret, at least 32 characters>
```

Generate a session secret in PowerShell with:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

In Vercel, open the `gf-application` project settings, add both variables to Production (and Preview if needed), then redeploy. The dashboard stays locked when either value is missing or too short. Keep both values private; changing the session secret invalidates existing sessions.

## Current data boundary

Application records still live in the submitting browser's `localStorage`; authentication protects the admin routes but does not move application data to a shared server. The reviewer can only see records in the browser that collected them. The dashboard can filter by status, search report IDs, answers, and private notes, sort by date or overall-interest rating, and export a register containing IDs/status/date/rating (not answers or notes).

This remains a UX prototype and should not collect real applicants' private information until storage is moved to an authenticated server-side database with server validation, durable shared rate limiting (the current login throttle is per server instance), encrypted contact data, retention/deletion controls, and appropriate monitoring.

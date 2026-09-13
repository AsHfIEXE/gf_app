# The Application — GF Archive

A dark, anonymous relationship-application experience styled as a private intelligence archive. The interface includes the public application journey, report receipt, status lookup, selected-report page, consent-based contact reveal, and reviewer dashboard.

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
| `/admin` | Local reviewer dashboard |
| `/admin/applications/[id]` | Reviewer report and assessment controls |

## Prototype boundary

This version persists records in the current browser's `localStorage`, so it is useful for reviewing the complete UX but **is not safe for real applicants or deployment**. Do not collect personal information with this version.

Before production, replace `lib/application-store.ts` with authenticated server-side API routes and a database, then add:

- Admin authentication and authorization
- Server-side input validation and output escaping
- Cryptographically secure report-ID generation on the server
- Rate limiting, anti-bot protection, and monitoring
- Encrypted contact storage and a retention/deletion policy
- CSRF protection if using cookie sessions

The browser-local implementation deliberately keeps the public report ID separate from optional reveal details, preserving the intended privacy boundary in the UX.

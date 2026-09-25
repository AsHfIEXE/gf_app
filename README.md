# The Application — GF Archive

A dark, anonymous relationship-application experience styled as a private archive. The public application journey, status lookup, selection announcements, contact reveal, and reviewer dashboard share a server-side Postgres archive.

## Backend and storage

The Next.js API routes run as Vercel Functions. Neon Postgres is connected to the Vercel project through the Vercel Marketplace; Vercel injects pooled `DATABASE_URL` for application traffic and direct `DATABASE_URL_UNPOOLED` for schema migrations. Applicant answers, review state, private admin notes, selected IDs, revealed contact, and privacy-preserving rate-limit counters are persisted in Postgres. No application answers or contact details are stored in browser `localStorage`.

The production database is named `gf-application-db`, uses the Neon Free plan, and is provisioned in `iad1` near the Vercel Functions region. Keep database credentials in Vercel environment variables; do not commit them. For local development, use a separate Neon development branch and place its URL in `.env.local` (see `.env.example`).

## Run locally

```cmd
npm install
npm run dev
```

Ensure `.env.local` contains `DATABASE_URL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` for your development environment. Use a separate Neon development branch; the production database connection should not be copied into a local file unless you intend local submissions and review edits to change production data.

## Database migrations

Schema changes live in `db/migrations/` and are tracked in `gf_schema_migrations`. For the initial Production setup, pull the production connection variables to the ignored temporary file and run the migration once:

```cmd
vercel env pull .env.migration --environment production --scope salahin0ashfigmailcoms-projects
npm run db:migrate
```

The migration runner prefers the direct, unpooled connection. Do not commit `.env.migration` or print its contents.

## Admin access

The `/admin` pages and `/api/admin/*` endpoints require a signed, HTTP-only session cookie. Sessions expire after eight hours. Set `ADMIN_PASSWORD` (at least 8 characters) and `ADMIN_SESSION_SECRET` (at least 32 random characters) in Vercel Production before signing in. Generate the session secret in CMD with:

```cmd
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

The login endpoint throttles failed attempts per server instance. Public application, status, and reveal requests use database-backed rate limits keyed by hashed network addresses; raw IP addresses are not stored.

## API routes

| Route | Purpose |
| --- | --- |
| `POST /api/applications` | Validate an application, create a random report ID, and save it in Postgres |
| `GET /api/applications/status?id=...` | Return only report ID, status, and submission date |
| `POST /api/applications/reveal` | Save applicant-approved contact details for selected reports |
| `GET /api/selected` | Return only IDs currently selected for public announcement |
| `GET /api/admin/applications` | Authenticated, paginated reviewer list with server-side search and filters |
| `GET /api/admin/applications/:id` | Authenticated report detail |
| `PATCH /api/admin/applications/:id` | Authenticated status, rating, and private-note updates |
| `POST /api/admin/login` | Validate reviewer password and issue the session cookie |
| `POST /api/admin/logout` | Revoke the browser's session cookie |

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/how-it-works` | Archive explanation |
| `/apply` | One-question-at-a-time application flow |
| `/application/submitted` | Report-ID receipt |
| `/status` | Applicant status lookup |
| `/selected` | Publicly announced selected report IDs |
| `/reveal` | Applicant-controlled contact reveal |
| `/admin-login` | Reviewer sign-in |
| `/admin` | Protected reviewer dashboard |
| `/admin/applications/[id]` | Protected report and assessment controls |

## Data handling boundary

Postgres gives the application a shared durable store across applicants and reviewers. Database-provider backups, access, retention, and deletion are managed through the connected Neon resource. Contact values are stored only after an applicant submits the reveal form. Establish a retention/deletion policy and review provider access before collecting real applicants' sensitive personal information.

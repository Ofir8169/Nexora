# Nexora Operations & Business OS

Unified operations workspace for tasks, fleet, sites, employees, customers,
invoices, expenses, reports and AI-assisted decisions.

## Included workspace tools

- Customizable dashboard widgets and live smart alerts.
- Customer 360° with related tasks, invoices and documents.
- Drag-and-drop business task Kanban.
- Document center with customer linking and file storage up to 5 MB.
- Monthly calendar for tasks, invoices and expenses.
- AI daily briefs, customer-message drafts and approved task creation.
- Global search across operations, customers, invoices and documents.
- Active invoice follow-up automations and audit history.
- First-run onboarding and downloadable JSON backups.
- Role-focused `My Workday` flow for field teams, including service status,
  navigation, completion photos and performer confirmation.
- Team accounts with salted password hashes and server-enforced permissions.
- Accessibility controls for text size, contrast and reduced motion.
- Installable PWA shell with safe partial offline access.
- Trial and plan preview for product packaging; external billing remains disabled
  until a payment provider is connected.

## Start the workspace

```bash
npm install
npm run dev
```

One command starts both Vite and the local API. Open the URL printed by Vite.
Operational and business records are stored in `server/data/database.json`.

For the most stable single-server mode, use:

```bash
npm run serve
```

Then open `http://127.0.0.1:4000`. Express serves the production build and API
from the same origin, without the Vite development proxy.

The local development login is `ofir@nexora.ai` with password `nexora-demo`.
Before exposing the server, change `NEXORA_ADMIN_EMAIL`,
`NEXORA_ADMIN_PASSWORD` and `NEXORA_AUTH_SECRET` in `.env`. API requests use a
signed, expiring server token and expired sessions return to the login screen.
The login screen also supports rate-limited recovery requests. In local mode,
rotate the administrator password with `NEXORA_ADMIN_PASSWORD` and restart the
server after receiving a recovery request.

## Optional cloud AI

Nexora always includes a deterministic local AI fallback. To enable OpenAI,
copy `.env.example` to `.env` and provide a server-side key:

```bash
cp .env.example .env
```

Then set `OPENAI_API_KEY` in `.env` and restart `npm run dev`. The key is read
only by the server and is never included in the browser bundle.

## Access roles

- `Admin`: all modules and settings.
- `Manager`: all operational and business modules.
- `Finance`: dashboard, Business, reports, AI and personal settings.
- `Operator`: operational modules and AI.

Role and English/Hebrew direction can be selected at login or in Settings.
The server, rather than the browser, is the source of truth for a signed-in
user's role. Operators can access operational work only, while finance users
are blocked from operational and team-management endpoints.

## Verification

```bash
npm run lint
npm run build
npm run test:smoke
```

The smoke check verifies authentication, operational and business APIs, and
the main SPA routes against the running local server.

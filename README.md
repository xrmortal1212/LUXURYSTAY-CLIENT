# LuxuryStay Hospitality

A full-stack hospitality management platform for running a multi-branch hotel business: guest-facing
website, role-based staff dashboards, reservations, front-desk billing, housekeeping & maintenance
operations, guest services, loyalty, dynamic pricing, analytics and an AI concierge.

The backend is an Express + MongoDB REST API (`/api/v1`). The frontend is a React 19 + Vite single
page application with a public marketing site and five role dashboards
(**admin**, **manager**, **receptionist**, **housekeeping**, **guest**).

---

## Table of contents

- [Highlights](#highlights)
- [Feature overview](#feature-overview)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Demo / seed accounts](#demo--seed-accounts)
- [What the seeder creates](#what-the-seeder-creates)
- [Multi-branch model & branch scoping](#multi-branch-model--branch-scoping)
- [Roles & permissions](#roles--permissions)
- [API overview](#api-overview)
- [Testing & quality checks](#testing--quality-checks)
- [Continuous integration](#continuous-integration)
- [Troubleshooting](#troubleshooting)
- [Known limitations](#known-limitations)

---

## Highlights

- **Five role dashboards** driven by one permission catalogue (server + client mirror), so grants and
  restrictions never drift apart.
- **Permission-driven tool surfacing** — if a staff member is granted an extra permission (e.g.
  `users:create` for a receptionist, or `rooms:edit` for a housekeeping member), the matching form/tool
  appears on their dashboard automatically.
- **Multi-branch (Property) support** with **Home Branch** on every staff member, **Branch Transfer**,
  and **branch-scoped data visibility** across reservations, rooms, housekeeping, maintenance, guest
  services, analytics, billing, CSV reports and audit logs.
- **Reservation lifecycle**: search availability → create booking → confirm → check-in → checkout, with
  coupon validation, atomic coupon claiming, loyalty accrual and billing settlement rules.
- **Front-desk billing**: itemized charges, part payments, invoice numbering, PDF invoice generation and
  invoice email dispatch.
- **Operations workflows**: housekeeping task queue with inspection returning rooms to inventory,
  maintenance issues with room-blocking rules, guest service requests with notification updates.
- **Analytics & AI**: occupancy/revenue KPIs, popularity trends, operational performance, demand
  forecasting, smart cleaning schedules and a Groq-powered AI concierge / review-sentiment tooling.
- **Security**: JWT access + rotating refresh tokens, bcrypt hashing, account lockout, email
  verification, password reset, OAuth (Google/GitHub), rate limiting, permission middleware and an
  audit trail.

---

## Feature overview

### Public website
Home, Work, Services, About, Blog, Contact, Profile, plus auth pages
(`/login`, `/register`, `/forgot-password`, `/reset-password`, `/auth/callback`).

### Guest dashboard
Browse/search rooms, create and manage own reservations, apply coupons, view stay details and bills,
download/email invoices, submit service requests and maintenance reports during a stay, track their
status, view loyalty tier and points, and receive live notifications.

### Receptionist dashboard
Reservation desk (search, create, modify, confirm, cancel), check-in / check-out, front-desk billing
(add charges, record payments, generate & email invoices), maintenance reporting/assignment and service
request assignment.

### Housekeeping dashboard
Assigned task queue (start, complete, inspect & approve), service request progression, assigned
maintenance issues, room status/cleanliness updates and AI smart-cleaning schedule.

### Manager dashboard
Everything a receptionist can do, plus room & room-type management, dynamic pricing rules, occupancy and
revenue analytics, popular room types, operational performance, demand forecast, feedback management,
review sentiment analysis, coupons, audit logs, CSV/PDF reports and staff management (create, edit,
deactivate, delete, grant extra permissions, assign/transfer home branch).

### Admin dashboard
Full permission set: all of the above plus system settings and role/permission administration.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS 4, Chart.js + react-chartjs-2, GSAP + AOS + Lenis, lucide-react, Leaflet, axios, react-hot-toast |
| Backend | Node.js, Express 5, Mongoose 9 (MongoDB) |
| Auth & security | jsonwebtoken, bcrypt/bcryptjs, Passport (Google, GitHub), cookie-parser, cookie-session, express-rate-limit, Joi validation |
| Documents & files | PDFKit (invoices/reports), Nodemailer (transactional email), Multer + Cloudinary (image uploads) |
| AI | Groq SDK (concierge, sentiment analysis, housekeeping scheduling) |
| Testing | Node built-in test runner (`node --test`) on the server, Vitest + jsdom on the client, Oxlint |
| CI | GitHub Actions (`.github/workflows/quality.yml`) |

---

## Project structure

```
Project/
├─ .github/workflows/quality.yml     # CI: server tests, client tests, lint, production build
├─ Server/
│  ├─ Server.js                      # Express app, route mounting, health check, error handling
│  ├─ Seeder.js                      # Idempotent demo data seeder (npm run seed)
│  ├─ Config/                        # db.js, passport.js, permissions.js (PERMISSIONS + ROLE_PERMISSIONS)
│  ├─ Controllers/                   # One controller per domain
│  ├─ Models/                        # Mongoose schemas
│  ├─ Routes/                        # Route groups mounted under /api/v1/*
│  ├─ Services/                      # notificationService (SSE hub, email helpers)
│  ├─ Utils/                         # branchScope.js, pdfGenerator.js, emailService.js, validators
│  ├─ Middleware/                    # protect, authorizePermission, rate limiters
│  ├─ tests/                         # node --test suites (12 files)
│  ├─ ENTERPRISE_INTEGRATIONS.md     # OAuth / AI / Cloudinary integration notes
│  └─ OAUTH_SETUP.md                 # OAuth provider setup guide
└─ Client/
   ├─ vite.config.js
   ├─ .env.local                     # Vite env (not committed)
   └─ src/
      ├─ App.jsx                     # AuthProvider + ConfirmProvider + Toaster
      ├─ Config/                     # api.js (axios + refresh interceptor), auth.js, Routing.jsx
      ├─ Core/                       # AuthContext, AuthHooks
      ├─ Components/                 # Header, Footer, CustomCursor, ProtectedRoute
      └─ Pages/
         ├─ Home, About, Work, Services, Blog, Contact, Profile   # public site
         ├─ Auth/                                                 # Login, Register, OAuth callback, recovery
         └─ App/
            ├─ DashboardRouter.jsx, DashboardLayout.jsx, DashboardShell*, DashboardParts, DashboardCharts
            ├─ permissions.js / usePermissions.js / PermissionTools.jsx   # permission-driven tools
            ├─ StaffManagement.jsx, RoomManagement.jsx, ReservationTools.jsx, BillingWorkflow.jsx
            ├─ BranchScopeBadge.jsx
            ├─ Admin/                                                # Admin shell + panels
            └─ Dashboards/                                           # Manager, Receptionist, Housekeeping, Guest
```

---

## Prerequisites

- **Node.js 22+** (CI uses Node 22; npm scripts assume a modern Node)
- **npm** (both `Server/package-lock.json` and `Client/package-lock.json` are committed)
- **MongoDB** — a local `mongodb://127.0.0.1:27017/...` instance or a MongoDB Atlas connection string

Optional, only for the features that use them: SMTP credentials (invoice email), Groq API key (AI
features), Cloudinary credentials (image uploads), Google Maps key (profile address picker), and
Google/GitHub OAuth apps (social login).

---

## Getting started

### 1. Install dependencies

```sh
cd Server
npm install

cd ../Client
npm install
```

### 2. Configure the server environment

Create `Server/.env` (see [Environment variables](#environment-variables) for the full list).
Minimum required to boot:

```ini
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/luxurystay
JWT_SECRET=replace-with-a-long-random-string
JWT_REFRESH_SECRET=replace-with-another-long-random-string
```

### 3. Seed the demo data

```sh
cd Server
npm run seed
```

The seeder refuses to run when `NODE_ENV=production` and requires `SEED_DEMO_PASSWORD`
(**at least 12 characters**). It is **idempotent**: every record is upserted, so re-running it never
creates duplicates and never destroys existing data. It also prints the demo accounts and their home
branch at the end.

### 4. Start the API

```sh
cd Server
npm run dev        # nodemon Server.js  (or: npm start)
```

The API listens on `http://localhost:5000` (`PORT`). Health check: `GET http://localhost:5000/api/health`.

### 5. Start the client

```sh
cd Client
npm run dev
```

Open `http://localhost:5173`. Log in with any account from
[Demo / seed accounts](#demo--seed-accounts); you are redirected to `/app/<role>`.

> Tip: the client talks to the API at `VITE_API_BASE_URL` (default `http://localhost:5000`) and the
> server only accepts browser calls from `CLIENT_URL` (default `http://localhost:5173`) — keep the two
> in sync if you change ports.

### Production build (client)

```sh
cd Client
npm run build      # outputs Client/dist
npm run preview    # serve the production build locally
```

---

## Environment variables

### `Server/.env`

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | no | API port (default `5000`) |
| `NODE_ENV` | no | `development` / `production`; the seeder is disabled in production |
| `CLIENT_URL` | recommended | Allowed CORS origin for the browser (default `http://localhost:5173`) |
| `MONGO_URI` | **yes** | MongoDB connection string |
| `JWT_SECRET` | **yes** | Signs access tokens; also the OAuth state-session fallback |
| `JWT_REFRESH_SECRET` | **yes** | Signs refresh tokens |
| `SESSION_SECRET` | no | Optional dedicated key for the OAuth cookie session |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | no | Invoice/receipt email dispatch |
| `GROQ_API_KEY` | no | AI concierge, sentiment analysis, smart scheduling |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | no | Room/property image uploads |
| `GOOGLE_MAP_KEY` | no | Maps key used by server-side integrations |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | no | Google social login |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | no | GitHub social login |
| `SEED_DEMO_PASSWORD` | for seeding | Password applied to all demo accounts (≥ 12 characters) |

### `Client/.env.local`

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | no | API origin (default `http://localhost:5000`) |
| `VITE_GOOGLE_MAPS_API_KEY` | no | Google Maps key for the profile address picker |
| `VITE_GOOGLE_CLIENT_ID` | no | Google OAuth client id for the client-side flow |

Never commit real `.env` / `.env.local` files — they hold secrets.

---

## Demo / seed accounts

All seeded accounts share **one password**: the value of `SEED_DEMO_PASSWORD`. Staff roles use the
`@luxurystay.local` domain by default (each email can be overridden with a `SEED_*_EMAIL` variable in
`Server/.env`).

| Role | Email | Home branch |
| --- | --- | --- |
| admin | `admin@luxurystay.local` | brand-wide (all branches) |
| manager | `manager@luxurystay.local` | brand-wide (all branches) |
| receptionist | `desk@luxurystay.local` | brand-wide (all branches) |
| housekeeping | `housekeeping@luxurystay.local` | brand-wide (all branches) |
| guest | `guest@luxurystay.local` | — |
| receptionist | `downtown.desk@luxurystay.local` | LuxuryStay Downtown |
| housekeeping | `downtown.housekeeping@luxurystay.local` | LuxuryStay Downtown |
| manager | `riverside.manager@luxurystay.local` | LuxuryStay Riverside |
| receptionist | `riverside.desk@luxurystay.local` | LuxuryStay Riverside |
| housekeeping | `riverside.housekeeping@luxurystay.local` | LuxuryStay Riverside |

**Why two kinds of accounts?**

- **Brand-wide** accounts have no home branch, so they see every branch — handy for exploring the full
  dataset (e.g. checking in the Riverside OTA booking).
- **Branch-posted** accounts are pinned to one property, so they demonstrate branch scoping: log in as
  `riverside.manager@luxurystay.local` and every list shows only Riverside data, with a
  **Riverside** chip next to the page heading.

You can also move any staff member between branches from the UI:
**Admin → Staff & access → Manage → Branch transfer** (audited as `STAFF_BRANCH_TRANSFERRED`).

Quick manual role smoke test: sign in as `guest` (own reservations only), `desk` (check-in/check-out,
billing) and `admin` (everything), then compare `riverside.desk` against `desk` to see branch scoping
in action.

---

## What the seeder creates

`npm run seed` produces a complete, consistent demo portfolio:

- **Branches (Properties)**: `LUX-DOWNTOWN-01` — *LuxuryStay Downtown*, `LUX-RIVERSIDE-02` — *LuxuryStay Riverside*
- **Rooms**: 8 Downtown rooms (101–106, 201, 202) and 2 Riverside rooms (301, 401) with mixed statuses
  (available, reserved, occupied, cleaning, maintenance) and demo images
- **Room types**: Single, Deluxe, Suite with base prices, capacities and image galleries
- **Bookings**: arrival, in-house, upcoming, pending, completed and an OTA-sourced Riverside booking
  (`DEMO-OTA-001`), each with a matching bill
- **Payments**: completed card/cash payments linked to their bills
- **Guest loyalty**: points history and tier derived from the completed stay
- **Operations**: housekeeping tasks (queued / inspected, Downtown + Riverside), maintenance tasks,
  a service request, and guest feedback
- **Pricing rules**: high-occupancy rule for Downtown, weekend demand rule for Riverside
- **Coupons**: `WELCOME10` (10% off), `WELCOME25` ($25 off), `EXPIRED10` (expired, for negative testing)
- **Notifications** for guest and staff recipients
- **Audit log entries**, including a `STAFF_BRANCH_TRANSFERRED` record and per-branch booking/room
  activity, so the audit views are populated and branch-scoped out of the box

---

## Multi-branch model & branch scoping

A **branch is a `Property`** document. Rooms, bookings, pricing rules and staff carry a `propertyId`
reference.

- `User.propertyId` is the staff member's **Home Branch**.
- `propertyId` **unset** = **brand-wide** staff member → unrestricted visibility.
- `propertyId` **set** = the staff member is scoped to that branch for **every** list, read and write.

Scoping is centralised in `Server/Utils/branchScope.js` and applied across:

| Area | Behaviour when a staff member is branch-posted |
| --- | --- |
| Rooms (list, create, update, delete, status, availability search, calendar) | Only own branch; create/update pin `propertyId` to the home branch and refuse another branch (403) |
| Reservations (list, read, create, modify, confirm, cancel) | Only own branch; cross-branch single-record access returns 404 so existence is not leaked |
| Housekeeping (lists, history, performance, create/update/assign) | Scoped via the branch's room ids; assignee must belong to the same branch |
| Maintenance & guest services (list, read, report, update, assign) | Scoped via room ids; assignee must belong to the same branch |
| Analytics (KPIs, revenue, popularity, operational performance, demand forecast) | Occupancy/revenue/payment calculations filtered to the branch |
| Billing (overview, invoices, my-bills, single invoice, download, email, charges, payments, finalize) | Scoped through the branch's bookings; writes against another branch's bill return 403 |
| Reports (`/reports/bookings/csv`, `/reports/revenue/csv`) | Only own branch rows |
| Audit logs (`/reports/audit-logs`, PDF) | Actions performed by staff posted to the branch (audit entries themselves carry no branch) |
| Housekeeping/AI schedules | Only the branch's rooms |

Two deliberate behaviours worth knowing:

- **Guests are not branch-scoped.** Their access boundary is *ownership of their own bookings*, which is
  stricter than a branch filter.
- **Notifications are not branch-filtered.** Every notification is addressed to one specific recipient
  and the list endpoint is keyed on the signed-in user, which is a tighter boundary than a branch;
  cross-branch assignment notifications cannot be created because assignees are branch-checked first.

Branch transfers go through a dedicated endpoint (`PATCH /api/v1/users/staff/:staffId/branch`) rather
than the general staff update, so a branch move can never happen silently, and it supports unassigning a
staff member back to brand-wide.

---

## Roles & permissions

Permissions live in `Server/Config/permissions.js` (`PERMISSIONS` + `ROLE_PERMISSIONS`) and are mirrored
on the client (`Client/src/Pages/App/permissions.js`) so the UI and API agree. The API enforces them with
`authorizePermission(...)` middleware; the client uses the `usePermissions()` hook to show or hide tools.

| Capability area | admin | manager | receptionist | housekeeping | guest |
| --- | :-: | :-: | :-: | :-: | :-: |
| Staff management (`users:*`) | ✅ | create/edit/deactivate/delete | view | — | — |
| Rooms (`rooms:*`) | ✅ | full CRUD | view | view | — |
| Reservations (`bookings:*`) | ✅ | full | full | — | own bookings |
| Pricing (`pricing:*`) | ✅ | calculate + manage | — | — | calculate |
| Billing (`billing:*`) | ✅ | all incl. refund | view/charge/generate/email/pay | — | view/email (own) |
| Services / housekeeping / maintenance | ✅ | all | services + maintenance view/assign | services + housekeeping + maintenance manage | report issues |
| Analytics (`analytics:view`) | ✅ | ✅ | — | — | — |
| Audit logs, coupons, hotels, loyalty | ✅ | view/manage | — | — | loyalty view/redeem |
| AI tools (`ai:*`) | ✅ | sentiment + schedule | — | schedule | — |
| Role administration (`users:manage-roles`) | ✅ | — (admin only) | — | — | — |
| System settings | ✅ | ✅ | — | — | — |

`users:manage-roles` is intentionally admin-only: non-admin staff can grant extra permissions but can
never grant the role-management permission itself (privilege-escalation guard).

---

## API overview

Base path: **`/api/v1`**. Authentication uses an httpOnly JWT access token (with rotating refresh
tokens via `POST /api/v1/auth/refresh-token`). Protected routes require `Authorization: Bearer <token>`.

| Route group | Purpose |
| --- | --- |
| `/api/v1/auth` | Register, login, email verification, forgot/reset password, refresh token, logout, OAuth (`/oauth/google`, `/oauth/github`) |
| `/api/v1/users` | Profile, staff list/CRUD, permission grants, role permissions, **staff branch transfer** |
| `/api/v1/properties` | Property/branch list (`/locations` is public and powers branch dropdowns) |
| `/api/v1/hotels` | Hotel profile & policies |
| `/api/v1/rooms` | Room inventory CRUD, status updates, availability search, room calendar |
| `/api/v1/bookings` | Reservation list/create/read/modify/confirm/cancel |
| `/api/v1/services` | Guest service requests (create, assign, progress, complete) |
| `/api/v1/housekeeping` | Task queue, assignment, history, performance, inspection |
| `/api/v1/maintenance` | Report, assign and resolve maintenance issues |
| `/api/v1/billing` | Overview, invoices, my-bills, charges, payments, invoice download/email |
| `/api/v1/analytics` | Dashboard KPIs, revenue, popularity trends, operations, demand forecast |
| `/api/v1/dynamic-pricing` | Pricing rules and dynamic price calculation |
| `/api/v1/reports` | Bookings CSV, revenue CSV, audit logs + audit logs PDF |
| `/api/v1/feedback` | Guest feedback and staff responses |
| `/api/v1/loyalty` | Loyalty points, tiers, redemption |
| `/api/v1/coupons` | Coupon validation and management |
| `/api/v1/channels` | OTA / channel bookings |
| `/api/v1/ai` | Concierge, review sentiment analysis, smart housekeeping schedule |
| `/api/v1/uploads` | Image uploads (Cloudinary) |
| `/api/v1/system` | System settings |
| `/api/v1/notifications` | Server-sent-events stream, list, mark as read |

Health: `GET /api/health` → `{ status: 'OK', uptimeSeconds, dependencies: { database } }`.

See `Server/ENTERPRISE_INTEGRATIONS.md` and `Server/OAUTH_SETUP.md` for integration-specific details.

---

## Testing & quality checks

Server API + unit tests (Node's built-in runner, no database required — models are stubbed):

```sh
cd Server
npm test            # 78 tests across 12 suites, including branch-scoping coverage
```

Client tests, lint and production build:

```sh
cd Client
npm run test:ci     # Vitest + jsdom
npm run lint        # Oxlint
npm run build       # production build
```

From the project root you can also use:

```sh
npm --prefix Server test
npm --prefix Client run test:ci
npm --prefix Client run lint
npm --prefix Client run build
```

Coverage highlights: reservation ownership, billing settlement and write guards, housekeeping and
maintenance workflows, role/permission gates, inactive/invalid sessions, logout token revocation, audit
records, property/location lookups, room management and image uploads, OAuth callback handling, and
branch scoping (rooms, reservations, housekeeping, analytics, billing reads/writes, CSV exports, audit
logs).

---

## Continuous integration

`.github/workflows/quality.yml` runs on every push and pull request:

1. `Server` → `npm ci` → `npm test`
2. `Client` → `npm ci` → `npm run test:ci` → `npm run lint` → `npm run build`

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `MONGO_URI is required` / server exits at boot | Ensure `Server/.env` exists with a valid `MONGO_URI` and MongoDB is running |
| Health check returns `NOT_READY` (503) | The database is not connected — check credentials, network access or Atlas IP allow-list |
| `Set SEED_DEMO_PASSWORD to a value at least 12 characters long` | Add a ≥12-character `SEED_DEMO_PASSWORD` to `Server/.env` |
| CORS error in the browser | `CLIENT_URL` must exactly match the client origin (scheme, host, port) |
| Login succeeds but API calls 401 | The axios interceptor refreshes once automatically; verify `JWT_SECRET` / `JWT_REFRESH_SECRET` are stable across restarts and cookies are allowed |
| Invoice email fails | Configure `SMTP_*`; without SMTP the email endpoint reports an error while invoice download keeps working |
| AI features fail | Set `GROQ_API_KEY` |
| Image upload fails | Set the three `CLOUDINARY_*` variables |
| A staff member sees less data than expected | They are branch-posted — check their home branch in **Staff & access**, or transfer them back to brand-wide |
| Port already in use | Change `PORT` (server) and/or run the client on another port, keeping `CLIENT_URL` in sync |

---

## Known limitations

- **No payment gateway.** Guests do not pay online; payment recording is for payments collected by
  staff at the front desk.
- **Invoice email requires working SMTP**; PDF generation and download are independent of it.
- **Notifications use server-sent events** and are per-recipient (not branch-filtered by design).
- The automated suites are **not browser E2E or an accessibility audit** — responsive behaviour across
  Chrome/Firefox/Safari/Edge, load/uptime monitoring and backup-restore drills still need manual or
  environment-specific validation.
- Some third-party features (maps, OAuth, Cloudinary, Groq) are optional and degrade gracefully when
  their keys are absent.

---

## License

Released under the **ISC** license (see `Server/package.json`).

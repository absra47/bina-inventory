# Bina Inventory

Multi-branch inventory management for a food / restaurant / supermarket group.
Tracks goods from the **main store** out to each **branch** — receipts, issues,
rejections, expiry and stock movement — with reports that reconcile to the unit.

A clean rebuild of the original PHP "Bina Software" system.

---

## Stack

| Layer     | Choice |
|-----------|--------|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language  | TypeScript |
| Styling   | Tailwind CSS v4 |
| ORM       | Drizzle ORM |
| Database  | SQLite (libsql) for dev — **Postgres-ready** for production |
| Auth      | bcrypt + JWT session cookie (jose) |
| Charts    | Recharts |

> **Why SQLite by default?** Zero setup — `npm install && npm run dev` just works,
> no database server to stand up. The Drizzle schema is dialect-agnostic; moving to
> Postgres for production is a driver + connection-string change (see below).

---

## Quick start

```bash
npm install
npm run db:reset     # create the SQLite db and seed demo data
npm run dev          # http://localhost:3000
```

Login with the seeded admin account:

```
Email:    admin@bina.et
Password: admin123
```

`npm run db:reset` wipes and reseeds. The seed reproduces the reference report
exactly: **25 receipts, 759 issued, 739 received, 97.4% acceptance.**

---

## What's built

**Working end-to-end (real DB queries):**
- Authentication — login, JWT session cookie, route guard, logout
- App shell — Bina-style dark sidebar + blue top bar, active-link highlighting
- Dashboard — item/branch counts, receipt KPIs, recent receipts
- **Received Items Report** — filters (date range, branch), four KPI cards,
  acceptance-rate bar, daily receiving trend chart, full receipts table
- Inventory Report — current main-store balance (stock in − issued), low-stock flags
- Items — full catalogue with category/unit joins
- Branches — branch list with status

**Scaffolded (data model + nav in place, UI stubbed):**
Users, Categories, Units, Main Inventory, Stock In, Issue Materials,
Stock Movement, Expiry Report, Rejected Items, Activity Logs, System Settings.
Each has a placeholder page so navigation never 404s.

---

## Data model

`lib/db/schema.ts` — branches, users, categories, units, items, stock-ins
(+ lines), issues (+ lines). The **Issue -> IssueLine** pair models a dispatch
from the main store to a branch and what the branch actually received; this
drives the Received Items Report (`lib/reports.ts`).

---

## Switching to PostgreSQL (production)

1. `npm install postgres`
2. In `lib/db/index.ts`, swap the libsql driver for `drizzle-orm/postgres-js`.
3. In `drizzle.config.ts`, set `dialect: "postgresql"`.
4. In `lib/db/schema.ts`, change `sqliteTable`/column imports to the
   `pg-core` equivalents (`pgTable`, `timestamp`, `boolean`, ...).
5. Set `DATABASE_URL` to your Postgres URL, then `npm run db:push`.

---

## Project layout

```
app/
  login/                 public login page
  (app)/                 auth-guarded shell (sidebar + topbar)
    page.tsx             dashboard
    items/  branches/    management
    reports/received/    the reference report screen
    reports/inventory/
  actions.ts             login / logout server actions
lib/
  db/      schema.ts, index.ts, seed.ts
  auth.ts  reports.ts  format.ts  nav.ts  id.ts
components/
  Sidebar  Topbar  Icon  ui  Placeholder
```

---

## Notes

- Change `AUTH_SECRET` in `.env` before any real deployment.
- The seed admin password is for local demo only.

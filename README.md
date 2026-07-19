# Contest Hub

### Competitive Programming Dashboard  
**GitHub + LeetCode + Codeforces + Notion + Spotify Wrapped for CP**

Contest Hub is a modern, production-oriented monorepo that unifies contests, multi-platform stats, problem search, AI-assisted practice, roadmaps, social ranking, notes, and analytics into one developer-first SaaS experience.

It is designed to feel like a premium product inspired by:

| Product | What we take from it |
|---------|----------------------|
| **GitHub** | Contribution heatmap, profile portfolio, activity graph |
| **Linear** | Dense keyboard UX, command palette, clean density |
| **Vercel** | Dashboard polish, dark mode, gradients |
| **Stripe** | Stats cards, clarity, premium SaaS feel |
| **Notion** | Notes, roadmaps, structured content |
| **LeetCode / Codeforces** | Contests, ratings, problems, practice workflows |
| **Raycast** | ⌘K global search |

---

## Table of contents

1. [Vision](#1-vision)
2. [Feature map](#2-feature-map)
3. [Tech stack](#3-tech-stack)
4. [Repository structure](#4-repository-structure)
5. [Prerequisites](#5-prerequisites)
6. [Quick start](#6-quick-start)
7. [Environment variables](#7-environment-variables)
8. [Database (Prisma + PostgreSQL)](#8-database-prisma--postgresql)
9. [Docker](#9-docker)
10. [Running the apps](#10-running-the-apps)
11. [Frontend guide](#11-frontend-guide)
12. [Backend / API guide](#12-backend--api-guide)
13. [API reference](#13-api-reference)
14. [Demo data & user](#14-demo-data--user)
15. [Design system & UX](#15-design-system--ux)
16. [Scripts cheat sheet](#16-scripts-cheat-sheet)
17. [Deployment](#17-deployment)
18. [Security notes](#18-security-notes)
19. [Production roadmap](#19-production-roadmap)
20. [Troubleshooting](#20-troubleshooting)
21. [Contributing](#21-contributing)
22. [License](#22-license)

---

## 1. Vision

Competitive programmers juggle **many platforms** (Codeforces, LeetCode, AtCoder, CodeChef, GFG, CSES, …), **spreadsheets for tracking**, **scattered notes**, and **no unified analytics**.

Contest Hub’s goal is a single intelligent dashboard where you can:

- Discover every major contest in one calendar  
- Connect all handles and auto-sync ratings / solved counts  
- Analyze performance with heatmaps, graphs, and topic mastery  
- Practice smarter with AI-generated sheets and an AI coach  
- Compete with friends via XP, streaks, and leaderboards  
- Showcase a beautiful public coding portfolio  

**Tagline:** *Compete · Analyze · Grow*

---

## 2. Feature map

### Core modules (implemented in the UI)

| # | Module | Route | Status |
|---|--------|-------|--------|
| 1 | Global Contest Calendar | `/contests` | ✅ Demo UI |
| 2 | Multi-platform accounts | `/settings` | ✅ Demo UI |
| 3 | Unified coding dashboard | `/dashboard` | ✅ Demo UI |
| 4 | GitHub-style heatmap | Dashboard / Analytics / Profile | ✅ |
| 5 | Submission analytics | `/analytics` | ✅ |
| 6 | Universal problem search | `/problems` | ✅ |
| 7 | Smart practice generator | `/practice` | ✅ |
| 8 | AI Coach | `/coach` | ✅ Demo mentor |
| 9 | Contest performance charts | `/analytics` | ✅ |
| 10 | Friends system | `/friends` | ✅ |
| 11 | Coding goals | `/goals` | ✅ |
| 12 | Achievements / XP / levels | `/achievements` | ✅ |
| 13 | DSA roadmaps | `/roadmaps`, `/roadmaps/[slug]` | ✅ |
| 14 | AI problem recommendation | Practice + Coach | ✅ Demo |
| 15 | Company interview prep | `/companies` | ✅ |
| 16 | Contest prediction | Coach rating forecast | ✅ Demo |
| 17 | Notes system | `/notes` | ✅ |
| 18 | Code playground | `/playground` | ✅ Demo runner |
| 19 | Discussions | `/discussions` | ✅ |
| 20 | Notifications prefs | `/settings` | ✅ UI |
| 21 | Public profile / portfolio | `/profile/[username]` | ✅ |
| — | Leaderboard | `/leaderboard` | ✅ |
| — | Command palette | ⌘K / Ctrl+K | ✅ |
| — | Landing page | `/` | ✅ |
| — | PWA manifest | `/manifest.webmanifest` | ✅ |

### Platforms covered (data model + UI labels)

LeetCode · Codeforces · CodeChef · AtCoder · GeeksforGeeks · HackerRank · HackerEarth · Coding Ninjas · CSES · TopCoder · Kick Start · Meta Hacker Cup · ICPC · Advent of Code · GitHub

### Premium / future extras (scaffolded, not fully wired)

- Weekly emailed coding report  
- Resume-ready stats export  
- Real LLM coach (Grok / OpenAI)  
- Live judge (Judge0 / Piston)  
- BullMQ platform sync workers  
- Browser / VS Code extensions  
- Discord / Slack integrations  
- College clubs & private leaderboards  

---

## 3. Tech stack

### Frontend (`web/`)

| Layer | Choice |
|-------|--------|
| Framework | **Next.js** (App Router) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** |
| Components | Radix primitives + shadcn-style UI |
| Animation | **Framer Motion** |
| Charts | **Recharts** |
| Server/client state | **TanStack Query**, **Zustand** |
| Theme | **next-themes** (dark / light) |
| Command palette | **cmdk** |
| Toasts | **Sonner** |
| Icons | **lucide-react** |

### Backend (`api/`)

| Layer | Choice |
|-------|--------|
| Server | **Fastify** |
| Language | **TypeScript** |
| ORM | **Prisma** |
| Database | **PostgreSQL** |
| Cache / queues | **Redis** + **BullMQ** (deps + job stubs) |
| Validation | **Zod** (ready) |
| Security | Helmet, CORS, rate limiting |

### Infra & hosting targets

| Concern | Target |
|---------|--------|
| Frontend | Vercel |
| API | Railway / Fly / Render |
| Database | Prisma Postgres / Neon / Supabase / Railway |
| Cache | Upstash Redis / Redis Cloud |
| CDN / DNS | Cloudflare |
| Local infra | Docker Compose (Postgres + Redis) |

---

## 4. Repository structure

```text
grok-contest/
├── package.json                 # npm workspaces root
├── docker-compose.yml           # local Postgres + Redis (+ optional API image)
├── .env                         # root secrets (gitignored)
├── .gitignore
├── README.md
│
├── web/                         # Next.js frontend
│   ├── public/
│   │   ├── icon.svg
│   │   └── manifest.webmanifest
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                 # Landing
│   │   │   ├── layout.tsx               # Root layout + providers
│   │   │   └── (app)/                   # Authenticated shell routes
│   │   │       ├── layout.tsx           # Sidebar + header shell
│   │   │       ├── dashboard/
│   │   │       ├── contests/
│   │   │       ├── problems/
│   │   │       ├── practice/
│   │   │       ├── analytics/
│   │   │       ├── coach/
│   │   │       ├── roadmaps/
│   │   │       ├── companies/
│   │   │       ├── friends/
│   │   │       ├── leaderboard/
│   │   │       ├── goals/
│   │   │       ├── achievements/
│   │   │       ├── notes/
│   │   │       ├── discussions/
│   │   │       ├── playground/
│   │   │       ├── settings/
│   │   │       └── profile/[username]/
│   │   ├── components/
│   │   │   ├── ui/                      # Button, Card, Badge, …
│   │   │   ├── layout/                  # Sidebar, Header, Command palette
│   │   │   ├── charts/                  # Heatmap, rating, stats
│   │   │   └── providers.tsx
│   │   ├── lib/
│   │   │   ├── mock-data.ts             # Rich demo dataset
│   │   │   └── utils.ts                 # cn(), platform helpers
│   │   └── store/
│   │       └── ui-store.ts              # Sidebar + command palette state
│   ├── package.json
│   ├── tailwind.config.ts
│   └── next.config.ts
│
└── api/                         # Fastify backend
    ├── prisma/
    │   └── schema.prisma        # Full production data model
    ├── src/
    │   ├── index.ts             # Fastify bootstrap
    │   ├── routes/index.ts      # REST routes
    │   ├── data/mock.ts         # API demo dataset
    │   └── jobs/sync-platforms.ts
    ├── Dockerfile
    ├── package.json
    └── .env                     # API env (gitignored)
```

---

## 5. Prerequisites

- **Node.js** ≥ 20  
- **npm** ≥ 10  
- **Docker** (optional, for local Postgres/Redis)  
- A **PostgreSQL** database (local Docker or hosted Prisma / Neon / Supabase)

---

## 6. Quick start

### Option A — Frontend only (fastest)

The UI ships with full **demo data**. No database required to explore the product.

```bash
git clone <your-repo-url> grok-contest
cd grok-contest/web
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** → click **Open Dashboard**.

### Option B — Full stack (web + API)

```bash
cd grok-contest

# Install root tooling + each package (packages are isolated, not npm workspaces)
npm run install:all

# Configure DB (api/.env)
cp api/.env.example api/.env
# Edit DATABASE_URL in api/.env

# Push Prisma schema
cd api && npx prisma generate && npx prisma db push && cd ..

# Run both
npm run dev
# web → http://localhost:3000
# api → http://localhost:4000
```

### Option C — Run packages separately

```bash
# API
cd api && npm install && npm run dev

# Web (other terminal)
cd web && npm install && npm run dev
```

---

## 7. Environment variables

> **Never commit real secrets.** `.env` and `.env.local` are gitignored.

### `api/.env`

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes (for Prisma) | PostgreSQL connection string | `postgres://USER:PASS@HOST:5432/DB?sslmode=require` |
| `REDIS_URL` | No (demo) | Redis for cache / BullMQ | `redis://localhost:6379` |
| `JWT_SECRET` | Yes (prod auth) | JWT signing secret | long random string |
| `PORT` | No | API port (default `4000`) | `4000` |
| `CORS_ORIGIN` | No | Allowed frontend origin(s), comma-separated | `http://localhost:3000` |
| `NODE_ENV` | No | `development` / `production` | `development` |

**Example `api/.env`:**

```env
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/postgres?sslmode=require
REDIS_URL=redis://localhost:6379
JWT_SECRET=change-me-in-production-use-long-random-string
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

> For **Prisma Postgres** (or any hosted pooler), keep `?sslmode=require` (or the provider’s recommended SSL query params).

### Root `.env` (optional)

You can keep a root-level `DATABASE_URL` for monorepo tooling. The API reads **`api/.env`** via `dotenv` when the API process starts from `api/`.

### `web/.env.local` (optional)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Base URL of the Fastify API, e.g. `http://localhost:4000` |

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Currently the UI primarily uses **client-side mock data** so pages work offline. Pointing at the API is ready for progressive integration.

### `api/.env.example`

A safe template lives at `api/.env.example` — copy it when onboarding:

```bash
cd api && cp .env.example .env
# then edit DATABASE_URL
```

---

## 8. Database (Prisma + PostgreSQL)

### Schema overview

The Prisma schema (`api/prisma/schema.prisma`) models:

| Model | Purpose |
|-------|---------|
| `User` | Profile, XP, level, streak, social links |
| `PlatformAccount` | Connected CF/LC/… handles & stats |
| `Contest` / `ContestResult` | Calendar + personal contest history |
| `Problem` | Cross-platform problem catalog |
| `Submission` | Verdicts, language, runtime, memory |
| `Bookmark` / `Note` / `Flashcard` | Personal study tools |
| `Goal` / `Achievement` / `UserAchievement` | Goals & gamification |
| `Follow` | Friends graph |
| `Roadmap` | DSA learning paths (JSON nodes) |
| `Collection` | Custom problem lists |
| `Discussion` / `Comment` | Community |
| `Announcement` | Admin announcements |

Enums cover `Platform`, `Difficulty`, `Verdict`, `ContestStatus`, `GoalPeriod`.

### Apply schema to your database

This project uses **Prisma ORM v7**:

- Connection URL lives in `api/prisma.config.ts` (via `DATABASE_URL`)
- Client is generated to `api/src/generated/prisma`
- Runtime client uses the `@prisma/adapter-pg` driver adapter (`api/src/lib/prisma.ts`)

With `DATABASE_URL` set in `api/.env`:

```bash
cd api
npx prisma generate    # generate Prisma Client → src/generated/prisma
npx prisma db push     # push schema to the database (great for demos/prototypes)
# or, for migration history:
# npx prisma migrate dev --name init
```

### Prisma Studio (visual DB browser)

```bash
cd api
npm run db:studio
# opens http://localhost:5555
```

### Local Postgres via Docker

```bash
# from repo root
docker compose up -d postgres redis

# then set api/.env to:
# DATABASE_URL=postgresql://cphub:cphub_secret@localhost:5432/cphub
```

Default local credentials (from `docker-compose.yml`):

| Field | Value |
|-------|-------|
| User | `cphub` |
| Password | `cphub_secret` |
| Database | `cphub` |
| Port | `5432` |

### Hosted Prisma Postgres

1. Create a project in the Prisma Data Platform (or your host).  
2. Copy the **pooled** connection string.  
3. Put it in `api/.env` as `DATABASE_URL`.  
4. Run `npx prisma db push`.

---

## 9. Docker

`docker-compose.yml` services:

| Service | Image | Port | Role |
|---------|-------|------|------|
| `postgres` | `postgres:16-alpine` | `5432` | Primary database |
| `redis` | `redis:7-alpine` | `6379` | Cache / queues |
| `api` | build `./api` | `4000` | Optional containerized API |

```bash
# Start only data services
docker compose up -d postgres redis

# Stop
docker compose down

# Stop and wipe volumes (destructive)
docker compose down -v
```

Root npm helpers:

```bash
npm run docker:up
npm run docker:down
```

---

## 10. Running the apps

| App | Dev URL | Command |
|-----|---------|---------|
| Landing + Dashboard | http://localhost:3000 | `cd web && npm run dev` |
| API health | http://localhost:4000/health | `cd api && npm run dev` |
| Both | — | `npm run dev` (repo root) |

### Production build (local)

```bash
# API
cd api && npm run build && npm start

# Web
cd web && npm run build && npm start
```

Or from root:

```bash
npm run build
npm start
```

---

## 11. Frontend guide

### Route groups

- `/` — marketing landing  
- `/(app)/*` — app shell (sidebar + header + command palette)

### Key UI building blocks

| Path | Responsibility |
|------|----------------|
| `components/layout/sidebar.tsx` | Navigation + streak widget |
| `components/layout/header.tsx` | Search trigger, theme, XP, avatar |
| `components/layout/command-palette.tsx` | ⌘K global search |
| `components/charts/heatmap.tsx` | Contribution graph |
| `components/charts/rating-chart.tsx` | Rating area chart |
| `components/charts/stat-cards.tsx` | KPI cards |
| `components/ui/*` | Design system primitives |
| `lib/mock-data.ts` | Contests, problems, friends, roadmaps, … |
| `store/ui-store.ts` | Sidebar open + command open |

### Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘K` / `Ctrl+K` | Open command palette |
| `Esc` | Close command palette |

### Theme

Default theme is **dark**. Toggle via the sun/moon button in the header (`next-themes`).

### Demo profile

- Username: **`alexchen`**  
- Name: Alex Chen  
- Profile URL: `/profile/alexchen`  

---

## 12. Backend / API guide

### Bootstrap

`api/src/index.ts`:

- Loads env (`dotenv`)  
- Registers **CORS**, **Helmet**, **rate limit**  
- Mounts routes  
- Listens on `PORT` (default `4000`)

### Current data strategy

Routes serve rich **mock data** from `api/src/data/mock.ts` so the API works without a populated DB. Prisma schema is ready for real persistence.

### Background jobs

`api/src/jobs/sync-platforms.ts` documents the intended BullMQ flow:

1. User connects a platform handle  
2. Enqueue `platform-sync` job  
3. Worker calls CF / LC / AtCoder APIs  
4. Upsert `PlatformAccount` + `Submission`  
5. Invalidate Redis dashboard keys  

---

## 13. API reference

Base URL (local): `http://localhost:4000`

### Health

```http
GET /health
```

```json
{ "ok": true, "service": "cp-hub-api", "time": "..." }
```

### User & dashboard

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/me` | Demo user + platform accounts |
| `GET` | `/api/dashboard` | Stats, heatmap, rating history, goals, practice |
| `GET` | `/api/analytics` | Charts: verdicts, langs, topics, platforms |
| `GET` | `/api/profile/:username` | Public profile (`alexchen` or friend handles) |

### Contests & problems

| Method | Path | Query params |
|--------|------|--------------|
| `GET` | `/api/contests` | `status`, `platform`, `search` |
| `GET` | `/api/problems` | `search`, `platform`, `difficulty`, `tag`, `company`, `solved`, `bookmarked`, `page`, `limit` |
| `GET` | `/api/submissions` | `platform`, `verdict`, `limit` |

### Practice & AI

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/practice` | Daily sheet + curated sheets |
| `GET` | `/api/coach/analyze` | Strengths, weaknesses, rating forecast |
| `POST` | `/api/coach/chat` | Body: `{ "message": "how to reach expert" }` |

### Social & meta

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/friends` | Friends list + leaderboard slice |
| `GET` | `/api/leaderboard` | `?scope=global\|friends\|…` |
| `GET` | `/api/goals` | Daily / weekly / monthly goals |
| `GET` | `/api/achievements` | Badge catalog |
| `GET` | `/api/companies` | Company interview sheets |
| `GET` | `/api/notes` | User notes |
| `GET` | `/api/discussions` | Community threads |
| `GET` | `/api/roadmaps` | All DSA roadmaps |
| `GET` | `/api/roadmaps/:slug` | Roadmap detail + related problems |
| `GET` | `/api/search?q=` | Global search (problems, contests, users, roadmaps) |

### Example curls

```bash
curl http://localhost:4000/health

curl 'http://localhost:4000/api/contests?status=UPCOMING'

curl 'http://localhost:4000/api/problems?tag=DP&difficulty=MEDIUM&page=1'

curl -X POST http://localhost:4000/api/coach/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"Build me a 7-day DP plan"}'
```

---

## 14. Demo data & user

The demo experience is built around **Alex Chen** (`alexchen`):

| Field | Value |
|-------|--------|
| CF rating | ~1624 Specialist |
| LC rating | ~1842 Knight |
| Streak | 47 days |
| XP / Level | 12450 XP · Level 28 |
| College | IIT Delhi |

Included mock assets:

- Upcoming / live / ended contests  
- ~100 aggregate problems with tags & company labels  
- 80 submissions with verdicts  
- 365-day heatmap  
- 40-point rating history  
- Friends, leaderboard, roadmaps, goals, achievements  

---

## 15. Design system & UX

### Principles

- Dark-first, light-mode capable  
- Glass panels + subtle mesh gradients  
- Dense but readable dashboard layouts  
- Skeleton-friendly cards, empty states  
- Motion used for hierarchy, not noise  
- Mobile-responsive sidebar shell  

### CSS tokens

Defined in `web/src/app/globals.css` as HSL CSS variables:

- `--background`, `--foreground`, `--card`, `--primary`, …  
- Dark mode overrides under `.dark`  
- Utilities: `.glass`, `.mesh-bg`, `.gradient-text`, `.heatmap-0…4`

### Accessibility

- Focus rings on interactive controls  
- Radix primitives for dialogs/tabs/tooltips  
- Semantic headings and labels on forms  
- Keyboard access to command palette  

---

## 16. Scripts cheat sheet

### Root (`package.json`)

| Script | Action |
|--------|--------|
| `npm run dev` | Web + API concurrent |
| `npm run dev:web` | Web only |
| `npm run dev:api` | API only |
| `npm run build` | Build API then web |
| `npm run start` | Start both (production builds) |
| `npm run db:generate` | Prisma generate |
| `npm run db:push` | Prisma db push |
| `npm run db:studio` | Prisma Studio |
| `npm run docker:up` | Start Postgres + Redis |
| `npm run docker:down` | Stop Compose services |
| `npm run lint` | Lint web |

### Web

| Script | Action |
|--------|--------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

### API

| Script | Action |
|--------|--------|
| `npm run dev` | `tsx watch` Fastify |
| `npm run build` | `tsc` → `dist/` |
| `npm start` | `node dist/index.js` |
| `npm run db:generate` | Prisma Client |
| `npm run db:push` | Push schema |
| `npm run db:studio` | Studio UI |

---

## 17. Deployment

### Frontend → Vercel

1. Import the repo; set **root directory** to `web` (or monorepo filter).  
2. Build: `npm run build`  
3. Output: Next.js default  
4. Env: `NEXT_PUBLIC_API_URL=https://your-api.example.com`

### API → Railway / Fly / Render

1. Root: `api/`  
2. Build: `npm install && npx prisma generate && npm run build`  
3. Start: `npx prisma db push && npm start` (or use migrations)  
4. Env: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `REDIS_URL`, `PORT`

### Database

- Prefer **pooled** connection strings for serverless / many connections  
- Use `sslmode=require` for cloud Postgres  
- Run `prisma db push` or `prisma migrate deploy` in CI/CD  

### Suggested architecture

```text
Browser → Vercel (Next.js)
              ↓ NEXT_PUBLIC_API_URL
         Railway API (Fastify)
              ↓
    Prisma Postgres  ·  Redis (Upstash)
              ↓
      BullMQ workers (platform sync)
```

---

## 18. Security notes

1. **Never commit** `.env`, `.env.local`, or production connection strings.  
2. Rotate DB passwords if they appear in chat, screenshots, or public repos.  
3. Use a long random `JWT_SECRET` in production.  
4. Restrict `CORS_ORIGIN` to your real frontend domain(s).  
5. Rate limiting is enabled on the API; tune limits for production traffic.  
6. Prefer managed secrets (Vercel/Railway env vars) over files on servers.  
7. When wiring real scrapers/APIs, store platform tokens encrypted at rest.  

---

## 19. Production roadmap

### Phase 1 — Auth & persistence

- [ ] Clerk or Auth.js (email, Google, GitHub OAuth)  
- [ ] Persist users/problems/submissions via Prisma  
- [ ] Replace mock-only routes with DB queries  

### Phase 2 — Platform sync

- [ ] Codeforces public API  
- [ ] LeetCode GraphQL / unofficial endpoints (careful with ToS)  
- [ ] AtCoder / CodeChef adapters  
- [ ] BullMQ workers + Redis cache  

### Phase 3 — AI & practice

- [ ] Grok / OpenAI for coach + daily sheet generation  
- [ ] Weak-topic embeddings / recommendation scoring  
- [ ] Weekly email report  

### Phase 4 — Judge & social

- [ ] Judge0 / Piston for playground  
- [ ] Real-time notifications (web push / email)  
- [ ] College orgs, team contests  

### Phase 5 — Extensions

- [ ] Browser extension (auto track solved)  
- [ ] VS Code extension  
- [ ] Public developer API  

---

## 20. Troubleshooting

### `ECONNREFUSED` on database

- Confirm `DATABASE_URL` host/port/user/password  
- For cloud DB: ensure IP allowlist / SSL params  
- For Docker: `docker compose ps` and wait for healthy  

### Prisma errors after schema change

```bash
cd api
npx prisma generate
npx prisma db push
```

### CORS errors from the browser

- Set `CORS_ORIGIN=http://localhost:3000` (or your deployed web URL)  
- Restart the API after env changes  

### Port already in use

```bash
# API
PORT=4001 npm run dev

# Web
npx next dev -p 3001
```

### Next.js / Turbopack monorepo root warning

`web/next.config.ts` sets `turbopack.root` to the web package to avoid picking a parent lockfile.

### Lucide icon import errors

Icon names can change across `lucide-react` major versions. Prefer icons that exist in your installed version (e.g. generic `Link2` instead of brand icons if missing).

### UI works but API data not shown

The frontend currently renders **mock data by design** for a zero-config demo. Wire pages to `NEXT_PUBLIC_API_URL` when integrating live endpoints.

---

## 21. Contributing

1. Fork / branch from `main`  
2. Keep UI changes in `web/`, API in `api/`  
3. Prefer TypeScript strictness; avoid `any`  
4. Do not commit secrets  
5. Run builds before PR:

```bash
cd api && npm run build
cd ../web && npm run build
```

### Code style

- Functional React components  
- Tailwind utility classes; shared tokens in `globals.css`  
- Colocate route pages under `app/(app)/`  
- Shared helpers in `lib/`  

---

## 22. License

MIT — free to use for portfolio, hackathons, and products. Attribution appreciated.

---

## Appendix A — Screens you should click through

1. `/` — landing  
2. `/dashboard` — full snapshot  
3. `/contests` — filter LIVE / UPCOMING  
4. `/problems` — try tag **DP** or company **Google**  
5. `/practice` — AI daily sheet  
6. `/coach` — ask “How do I reach Expert?”  
7. `/analytics` — heatmaps + topic mastery  
8. `/roadmaps/graphs` — roadmap detail  
9. `/profile/alexchen` — portfolio view  
10. Press **⌘K** and search “Binary Search”

---

## Appendix B — Health checklist for reviewers

| Check | Command / URL | Expected |
|-------|---------------|----------|
| Web dev | `cd web && npm run dev` | 200 on `/` and `/dashboard` |
| Web build | `cd web && npm run build` | Success |
| API dev | `cd api && npm run dev` | Listens on `:4000` |
| API health | `curl localhost:4000/health` | `{ "ok": true, ... }` |
| API build | `cd api && npm run build` | `dist/` emitted |
| DB push | `cd api && npx prisma db push` | Schema applied (with valid `DATABASE_URL`) |

---

**Contest Hub** — *One dashboard. Every platform. Smarter practice.*

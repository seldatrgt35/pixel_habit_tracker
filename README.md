# Little by Little · Pixel Habit Tracker

A cozy habit garden for iOS and Android. Small actions, room to grow.

## Status

**Phase 1 is implemented and verified locally:** architecture, tooling, and an interactive local mobile foundation. It is not a released or production-complete service. The mobile preview stores data on this device; it does not sign in, sync to the API, or schedule notifications. The API exposes health endpoints only. See [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) for acceptance gates and remaining work.

## Workspace

```
apps/mobile          Expo Router, React Native, original SVG pixel artwork
apps/api             NestJS modular-monolith foundation
packages/shared-types  Contracts and framework-independent domain calculations
docs/architecture    Architecture decision records
docs/design-system   Art and accessibility guidance
docs/api             HTTP examples
infra                PostgreSQL, API container, load-test scenario
```

Use Node 24 LTS (24.15+) and npm 10.9+. `.nvmrc` and `.node-version` pin the tested runtime family. Install dependencies from the repository root:

```sh
npm ci
npm run dev:mobile
# Press a for Android, i for iOS (macOS required), or w for browser preview.
npm run dev:web
npm run dev:api
```

To preview a browser export, run `npm run build:web` followed by `npm run preview:web`, then open http://localhost:8081. Refresh the browser after exporting a new build so its route chunks match. The original companion, habit flows, calendar, journal, and themes are interactive in this preview.

The API listens on port 3000. `GET /v1/health/live` checks the process. `GET /v1/health/ready` checks PostgreSQL and returns 503 if unconfigured or unavailable. Development OpenAPI: http://localhost:3000/docs. It is disabled in production.

## Daily titles and activity lists

Choose **Add daily details** on any habit card. Save book/film titles, project names or individual tasks as separate items, alongside the day's quantity or completion check-in. **Add another item** adds a row; the minus button removes one. Press **Save progress** to save the whole daily entry, or **Cancel** to discard the draft.

Saved items appear directly on the card. In **Garden**, select a past day to see or edit that day's own list; the habit-detail history works the same way. Up to 20 items of 160 characters fit in one daily record. Notes alone do not complete a habit. Quick check/undo and quantity changes preserve its saved details. Existing local preview records remain compatible; no reset is required. These details currently stay in local preview storage, like the other habit data.

## Overall and per-habit green calendars

In **Today**, tap a square in the overall progress map to see that day's completed, in-progress and uncompleted habits immediately below it. The summary includes quantities, original daily targets and saved book/film/project details.

In **Garden**, **All habits** combines the habits scheduled for each day. Choose a habit's name to show only its own progress. Each habit also has a separate miniature map under **A garden for every habit**; open one for its interactive history. Green intensity follows progress toward that day's target, so individual and overall maps can have different shades on the same date. Rest days do not count as failures.

Select **Edit this day** to edit the selected date's existing entries, or **Open monthly calendar** for month/year navigation. Existing local data remains compatible without migration or reset. For browser QA with separate local storage, set `PREVIEW_PORT` before `npm run preview:web` (for example, `8082`); the default remains `8081`.

For the database, copy `.env.example` to `.env`, choose a local database password, and set the matching `DATABASE_URL` (host `localhost`, port `55432`, database `pixel`). Then run:

```sh
docker compose -f infra/compose.yml --env-file .env up -d db
npm run db:generate
npm run db:migrate
```

Never commit `.env` or service-account credentials. A Docker daemon must be running. Database integration tests require a disposable PostgreSQL database and `TEST_DATABASE_URL`; their script applies migrations to that database.

PostgreSQL binds to loopback port 55432 by default (`POSTGRES_PORT` can override it); use that port in your host `DATABASE_URL`. Containers use `db:5432`. To run the optional API container, set `DOCKER_DATABASE_URL`, apply migrations first, then use `docker compose -f infra/compose.yml --env-file .env --profile api up -d --build`.

```sh
npm run check       # strict TypeScript, ESLint, formatting, unit/API/component tests
npm run test:integration
npm run build:api
npm run build:web
```

See [ARCHITECTURE.md](ARCHITECTURE.md), [DATABASE_DESIGN.md](DATABASE_DESIGN.md), [API_DESIGN.md](API_DESIGN.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [SCALING_STRATEGY.md](SCALING_STRATEGY.md), and [DECISIONS.md](DECISIONS.md). Exact validation results and limitations are recorded in [docs/VALIDATION.md](docs/VALIDATION.md).

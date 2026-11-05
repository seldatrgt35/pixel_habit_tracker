# Implementation milestones

The initial request is architecture/design foundations followed by Phase 1. Each later phase requires implementation and verification; this checklist records actual status rather than promises of completion.

| Phase              | Deliverable and acceptance gate                                                                                                                                                     | Status                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1 · Foundation     | npm workspace, strict TS, lint/format, CI, API health/security plumbing, Expo Router, tokens/art, persistent interactive local preview, reviewed schema/migration, meaningful tests | Verified locally; see docs/VALIDATION.md            |
| 2 · Database/auth  | Firebase email/Google flows, verified guard, user bootstrap, secure sessions, scoped repositories, DB integration and cross-user tests, resumable account deletion                  | Planned                                             |
| 3 · Habits/entries | Transactional CRUD/version transitions, ownership/date validation, idempotent writes, mobile Query adapter, conflict/loading/error UX                                               | Planned                                             |
| 4 · Design system  | Complete native component states, light/dark, accessibility/device audit, polished companion reactions                                                                              | Foundation in Phase 1; audit planned                |
| 5 · Screens        | Full onboarding/auth/today/editor/detail wired to real API, offline limitations and retry behavior                                                                                  | Local preview only in Phase 1                       |
| 6 · Statistics     | Bounded SQL heatmap, streaks and unit-aware quantity totals; query plans measured on representative data                                                                            | Shared rules/local visualization first; API planned |
| 7 · Reminders      | Per-weekday local schedules, permission flow, reschedule on edits/timezone, native device verification                                                                              | Planned                                             |
| 8 · Release        | EAS builds, crash/latency observability, account deletion recovery, load tests, restore rehearsal, store/privacy material                                                           | Planned                                             |

## Phase 1 sequence

1. Inspect empty repository and document architecture, database policy, risks, visual identity and decisions.
2. Set up shared contracts/calendar/progress functions with rule tests.
3. Add API startup validation, safe logging/errors, limits and health tests.
4. Add Prisma schema, reviewed migration, local Docker and CI.
5. Build a clearly labeled local preview with original art, creation/edit/archive, numeric/binary entry, historical selection and useful statistics. Persist locally; do not expose fake authentication.
6. Run type/lint/format/tests, API smoke checks, production browser export, and visual/interaction QA. Record real results and environmental blockers in `docs/VALIDATION.md`.

No Firebase credentials, EAS project, cloud database, production domains, or mobile signing identities are assumed. These are configuration/deployment dependencies, not reasons to stop implementing the authorized foundation.

## Phase 1 completion

All foundation deliverables above are present. The local preview supports onboarding, creation/editing, future-effective target and recurrence changes, numeric and binary entries, historical editing, archiving, heatmaps, period statistics, themes, and explicit timezone selection. It includes original SVG artwork and a regenerated launcher icon. PostgreSQL constraints, production API container readiness, and 18 automated tests were checked locally. Native release verification and authenticated integration remain separate milestones. The GitHub workflow and k6 baseline are authored; no remote CI run or representative load test is claimed.

Next implementation milestone: AuthModule and UsersModule with Firebase token verification, owner-scoped repositories, recent-auth deletion recovery, and cross-user integration tests before exposing feature routes. Address the dependency maintenance findings in the validation report before release.

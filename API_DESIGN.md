# REST API

Base path `/v1`. JSON, UTC ISO timestamp strings, local calendar dates `YYYY-MM-DD`, decimal quantities serialized as numbers constrained to three decimal places. Breaking changes require a new version. OpenAPI documents implemented routes only.

## Implemented foundation

| Method | Path          | Result                               |
| ------ | ------------- | ------------------------------------ |
| GET    | /health/live  | 200 process status                   |
| GET    | /health/ready | 200 database ready or 503 safe error |

Responses carry `X-Request-Id`. Errors use `{ error: { code, message, requestId } }`; no stack traces or SQL details. Rate limit returns 429. Production docs are disabled; configure `CORS_ORIGINS` for the browser preview if needed. Native requests are not controlled by browser CORS.

## Contract proposal · not exposed yet

| Method    | Path                           | Behavior                                            |
| --------- | ------------------------------ | --------------------------------------------------- |
| GET/PATCH | /me                            | Profile and explicit timezone settings              |
| DELETE    | /me                            | Recently authenticated, resumable account deletion  |
| GET       | /habits?cursor=&limit=         | Owned habits; default 30, maximum 100               |
| POST      | /habits                        | Habit and first version in one transaction          |
| GET/PATCH | /habits/:id                    | Cosmetic edits now; rule version effective tomorrow |
| POST      | /habits/:id/archive            | Archive from tomorrow; preserve completed history   |
| GET       | /habits/:id/entries?from=&to=  | At most 366 days                                    |
| PUT       | /habits/:id/entries/:date      | Idempotent raw quantity upsert                      |
| GET       | /statistics?from=&to=&habitId= | SQL aggregates and normalized daily heatmap         |

Feature routes will require `Authorization: Bearer <Firebase ID token>`. Unknown or unowned IDs return 404; invalid token 401; malformed request 400; conflicting version 409. Reject unknown body properties. Handle quantities with decimal arithmetic at the persistence boundary. Request body cap 16 KiB; per-token and ingress limits must complement the foundation's process-local IP limiter before multi-instance release.

Use optimistic concurrency (`updatedAt` or revision) for habit configuration. Entry PUT is last acknowledged write wins; do not queue offline writes until a conflict policy and retry UX have been tested. Mobile API adapter should refresh a token once on 401 and propagate a friendly sign-in prompt if it fails. Use explicit timeouts and bounded retries only for safe reads and idempotent writes.

See [docs/api/examples.http](docs/api/examples.http) for runnable health requests. Proposed contracts do not imply feature implementation.

## Daily details contract proposal

The local preview implements date-specific item lists. The future entry PUT/read contracts will include optional `items: [{ id, text }]` with at most 20 ordered items, each a nonblank plain-text string of at most 160 characters. API IDs use UUIDs. Example: a value of `1` film with a single item whose text is `Interstellar`, or 20 pages with a book title and a chapter note.

Omitted `items` preserves the previous list for older clients and quick actions; `items: []` deliberately clears it. A supplied list replaces the previous list atomically with the raw quantity upsert after validating ownership, bounds, uniqueness and the local entry date. Never let another entry's item ID move between owners. Item text is rendered as plain text and excluded from logs. Completion is computed from the raw value and historical target; the number of notes never counts as progress. These feature endpoints remain unexposed until authenticated repositories are implemented.

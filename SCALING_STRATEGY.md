# Scaling and measurement

100,000 registered users is a product sizing assumption, not a concurrency claim. Example planning model: 20,000 daily active users, 20 API requests per active user per day gives 400,000 requests/day (~4.6 average requests/s). A 20× concentration is about 93 requests/s. Concurrent in-flight requests depend on request duration; 100 requests/s at 200 ms is approximately 20 in flight. Open app sessions and in-flight API requests are different measures.

Start with a stateless API and managed PostgreSQL, automated backups, tested restores and migration deployment as a separate job. Bound each instance's pool (default 5, including timeouts); ensure replica count × pool size plus migration/admin headroom fits the database connection budget. Use PgBouncer/managed transaction pooling when measurements and provider requirements justify it. No in-process user state, file storage or caches needed for correctness.

Bound date intervals, paginate habits, inspect `EXPLAIN (ANALYZE, BUFFERS)` for aggregation queries, and observe database CPU, IO, pool wait, slow queries, p50/p95/p99 duration, throughput and errors. Do not run statistics by downloading every user's full history to Node. Review indexes against representative multi-year and high-habit-count accounts.

## Load tests

`infra/load/health.js` is a reproducible process-health baseline only. It has configurable base URL and rate, p95 <250 ms and errors <1% thresholds. Run `k6 run -e BASE_URL=http://localhost:3000 infra/load/health.js` against an isolated environment. Record API replicas, CPU/RAM, PostgreSQL size, seeded distribution, test duration, warmup, network location and results. A health-only test does not measure habit or statistics capacity.

Add authenticated mixed workloads after Phase 3/6: 60% today/list, 20% entry PUT, 15% 90-day heatmap, 5% profile/config edits; diverse owners and data volumes, not one hot record. Ramp 10→50→100 requests/s, sustain 15 minutes and run a recovery spike. Observe DB and token-verification behavior. No capacity numbers have been measured or claimed in this increment.

## Evidence-based additions

- Redis: sustained repeated expensive reads and a measured cache hit opportunity, or a distributed rate-limit requirement that cannot be met at ingress. Preserve source-of-truth correctness and invalidation on historical edits.
- Workers: deletion retries, long exports or tasks that exceed request budgets; use an idempotent database outbox before introducing a broker.
- Precomputed statistics: SQL aggregation is the measured latency/CPU bottleneck; invalidate/rebuild from versioned raw entries after historical changes.
- Read replicas: sustained read pressure after query/index/pool work, with a clear replica-lag UX policy.
- Partitioning: only when measured table maintenance/index size requires it. 100,000 registered users alone is insufficient justification.

Process-local rate limiting in the foundation is suitable for local development, not a global quota across replicas. Configure shared ingress quotas and trusted proxy topology before production.

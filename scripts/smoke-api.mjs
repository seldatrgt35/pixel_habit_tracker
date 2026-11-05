import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

const port = 3137;
const child = spawn(process.execPath, ['apps/api/dist/main.js'], {
  env: {
    ...process.env,
    PORT: String(port),
    NODE_ENV: 'test',
    DATABASE_URL: '',
    CORS_ORIGINS: 'http://localhost:8081',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let output = '';
child.stdout.on('data', (d) => {
  output += d;
});
child.stderr.on('data', (d) => {
  output += d;
});
const base = `http://127.0.0.1:${port}`;
try {
  let ready = false;
  for (let attempt = 0; attempt < 300; attempt++) {
    if (child.exitCode !== null) throw new Error(`API exited during startup: ${output}`);
    try {
      if ((await fetch(`${base}/v1/health/live`)).ok) {
        ready = true;
        break;
      }
    } catch {
      /* awaiting startup */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.ok(ready, `API should start within the startup grace period. ${output}`);
  const live = await fetch(`${base}/v1/health/live`);
  assert.equal((await live.json()).status, 'ok');
  assert.ok(live.headers.get('x-request-id'));
  assert.equal(live.headers.get('x-content-type-options'), 'nosniff');
  const unavailable = await fetch(`${base}/v1/health/ready`);
  assert.equal(unavailable.status, 503);
  assert.equal((await unavailable.json()).error.code, 'NOT_READY');
  const unknown = await fetch(`${base}/v1/habits/another-users-habit`);
  assert.equal(unknown.status, 404, 'feature routes must remain unexposed');
  const unknownBody = await unknown.json();
  assert.equal(unknownBody.error.code, 'NOT_FOUND');
  assert.ok(!JSON.stringify(unknownBody).includes('stack'));
  const allowed = await fetch(`${base}/v1/health/live`, {
    headers: { Origin: 'http://localhost:8081' },
  });
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:8081');
  const denied = await fetch(`${base}/v1/health/live`, {
    headers: { Origin: 'https://untrusted.example' },
  });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
  const oversized = await fetch(`${base}/unknown`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: 'x'.repeat(20000) }),
  });
  assert.equal(oversized.status, 413);
  for (let i = 0; i < 120; i++) await fetch(`${base}/v1/health/ready`);
  const limited = await fetch(`${base}/v1/health/ready`);
  assert.equal(limited.status, 429);
  assert.equal((await limited.json()).error.code, 'RATE_LIMITED');
  assert.equal(
    (await fetch(`${base}/v1/health/live`)).status,
    200,
    'liveness stays available under rate limiting',
  );
  console.log(
    'API smoke passed: liveness, readiness failure, safe 404, headers, CORS, body limit, rate limit.',
  );
} finally {
  if (child.exitCode === null) {
    child.kill();
    await once(child, 'exit');
  }
}

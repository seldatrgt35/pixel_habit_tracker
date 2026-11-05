import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    baseline: {
      executor: 'constant-arrival-rate',
      rate: Number(__ENV.RATE || 20),
      timeUnit: '1s',
      duration: __ENV.DURATION || '1m',
      preAllocatedVUs: 10,
      maxVUs: 50,
    },
  },
  thresholds: { http_req_duration: ['p(95)<250'], http_req_failed: ['rate<0.01'] },
};

export default function () {
  const response = http.get(`${__ENV.BASE_URL || 'http://localhost:3000'}/v1/health/live`);
  check(response, { alive: (r) => r.status === 200 });
}

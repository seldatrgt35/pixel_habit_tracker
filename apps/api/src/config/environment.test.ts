import { describe, expect, it } from 'vitest';
import { readEnvironment } from './environment';

describe('startup configuration', () => {
  it('has bounded development defaults', () => {
    expect(readEnvironment({}).DB_POOL_MAX).toBe(5);
  });
  it('rejects unbounded pools, malformed origins and production without a database', () => {
    expect(() => readEnvironment({ DB_POOL_MAX: '200' })).toThrow();
    expect(() => readEnvironment({ CORS_ORIGINS: 'https://example.com/path' })).toThrow();
    expect(() => readEnvironment({ NODE_ENV: 'production' })).toThrow();
  });
  it('never echoes a secret in a validation error', () => {
    expect(() => readEnvironment({ DATABASE_URL: 'secret-value' })).toThrow('DATABASE_URL');
    try {
      readEnvironment({ DATABASE_URL: 'secret-value' });
    } catch (error) {
      expect(String(error)).not.toContain('secret-value');
    }
  });
});

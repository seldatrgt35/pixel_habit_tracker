import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z
    .string()
    .regex(/^postgres(ql)?:\/\//)
    .optional(),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(20).default(5),
  CORS_ORIGINS: z.string().default(''),
});
export type Environment = z.infer<typeof schema>;
export const ENVIRONMENT = Symbol('ENVIRONMENT');
export function readEnvironment(input: NodeJS.ProcessEnv): Environment {
  const parsed = schema.safeParse({ ...input, DATABASE_URL: input.DATABASE_URL || undefined });
  if (!parsed.success) {
    // Values may contain credentials. Report field names only.
    throw new Error(
      `Invalid configuration: ${parsed.error.issues.map((i) => i.path.join('.')).join(', ')}`,
    );
  }
  if (parsed.data.NODE_ENV === 'production' && !parsed.data.DATABASE_URL)
    throw new Error('Production requires DATABASE_URL.');
  for (const origin of parsed.data.CORS_ORIGINS.split(',').filter(Boolean)) {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin)
      throw new Error('CORS_ORIGINS must contain exact HTTP origins.');
  }
  return parsed.data;
}

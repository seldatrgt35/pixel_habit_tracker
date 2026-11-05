import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

config({ path: '../../.env', quiet: true });
if (process.argv.includes('migrate') && !process.env.DATABASE_URL) {
  throw new Error('Set DATABASE_URL before applying migrations.');
}
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: { url: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/pixel' },
});

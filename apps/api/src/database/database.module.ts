import { Global, Inject, Injectable, Module, OnApplicationShutdown } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { ENVIRONMENT, type Environment } from '../config/environment';

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  private client: PrismaClient | undefined;
  constructor(@Inject(ENVIRONMENT) private readonly env: Environment) {}

  async ready(): Promise<boolean> {
    if (!this.env.DATABASE_URL) return false;
    this.client ??= new PrismaClient({
      adapter: new PrismaPg({
        connectionString: this.env.DATABASE_URL,
        max: this.env.DB_POOL_MAX,
        connectionTimeoutMillis: 2000,
        idleTimeoutMillis: 30000,
        statement_timeout: 2000,
      }),
    });
    try {
      // Check the expected schema as well as connectivity.
      await this.client.$queryRaw`SELECT 1 FROM "User" LIMIT 1`;
      return true;
    } catch {
      return false;
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.client?.$disconnect();
  }
}

@Global()
@Module({ providers: [DatabaseService], exports: [DatabaseService] })
export class DatabaseModule {}

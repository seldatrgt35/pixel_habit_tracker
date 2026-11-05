import 'reflect-metadata';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { LoggerService, ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import pino from 'pino';
import { AppModule } from './app.module';
import { readEnvironment } from './config/environment';
import { SafeErrors } from './http/safe-errors';

async function bootstrap(): Promise<void> {
  config({ path: resolve(__dirname, '../../../.env'), quiet: true });
  const env = readEnvironment(process.env);
  const log = pino({ level: env.NODE_ENV === 'test' ? 'silent' : 'info', base: undefined });
  const logger: LoggerService = {
    log: (message: unknown) => log.info({ event: String(message) }),
    warn: (message: unknown) => log.warn({ event: String(message) }),
    error: () => log.error({ event: 'framework_error' }),
  };
  const app = await NestFactory.create<NestExpressApplication>(AppModule.register(env), {
    logger,
    bodyParser: false,
  });
  app.enableShutdownHooks();
  app.set('trust proxy', false);
  app.use(helmet());
  app.use(
    (
      req: import('express').Request,
      res: import('express').Response,
      next: import('express').NextFunction,
    ) => {
      const requestId = randomUUID();
      const started = performance.now();
      res.setHeader('X-Request-Id', requestId);
      res.on('finish', () =>
        log.info({
          requestId,
          method: req.method,
          route: req.route?.path ?? 'unmatched',
          status: res.statusCode,
          durationMs: Math.round(performance.now() - started),
        }),
      );
      next();
    },
  );
  app.use(
    rateLimit({
      windowMs: 60000,
      limit: 120,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      skip: (req) => req.path === '/v1/health/live',
      handler: (_req, res) =>
        res.status(429).json({
          error: {
            code: 'RATE_LIMITED',
            message: 'Take a little breath and try again shortly.',
            requestId: res.getHeader('X-Request-Id'),
          },
        }),
    }),
  );
  app.useBodyParser('json', { limit: '16kb' });
  app.useGlobalFilters(new SafeErrors());
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.enableCors({
    origin: env.CORS_ORIGINS.split(',').filter(Boolean),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.setGlobalPrefix('v1');
  if (env.NODE_ENV !== 'production') {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Little by Little API')
        .setDescription('Phase 1 health endpoints. Feature routes are not yet exposed.')
        .setVersion('0.1.0')
        .build(),
    );
    SwaggerModule.setup('docs', app, document);
  }
  await app.listen(env.PORT, '0.0.0.0');
}

bootstrap().catch(() => {
  // Configuration and driver errors can contain secrets; do not dump exception objects.
  process.stderr.write('API startup failed. Check configuration and dependency setup.\n');
  process.exitCode = 1;
});

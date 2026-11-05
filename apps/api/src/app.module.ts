import { DynamicModule, Global, Module } from '@nestjs/common';
import { ENVIRONMENT, type Environment } from './config/environment';
import { HealthModule } from './health/health.module';

@Global()
@Module({})
class EnvironmentModule {
  static register(env: Environment): DynamicModule {
    return {
      module: EnvironmentModule,
      providers: [{ provide: ENVIRONMENT, useValue: env }],
      exports: [ENVIRONMENT],
    };
  }
}

@Module({})
export class AppModule {
  static register(env: Environment): DynamicModule {
    return { module: AppModule, imports: [EnvironmentModule.register(env), HealthModule] };
  }
}

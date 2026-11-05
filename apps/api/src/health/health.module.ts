import { Controller, Get, Inject, Module, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DatabaseModule, DatabaseService } from '../database/database.module';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  @Get('live')
  @ApiOperation({ summary: 'Process liveness' })
  live() {
    return { status: 'ok', service: 'little-by-little-api' };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Database connectivity and migration readiness' })
  @ApiResponse({ status: 503, description: 'Database unavailable or schema not migrated' })
  async ready() {
    if (!(await this.database.ready()))
      throw new ServiceUnavailableException('The garden is warming up. Try again shortly.');
    return { status: 'ok', database: 'ready' };
  }
}

@Module({ imports: [DatabaseModule], controllers: [HealthController] })
export class HealthModule {}

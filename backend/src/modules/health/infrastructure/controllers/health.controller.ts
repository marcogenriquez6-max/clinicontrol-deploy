import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../../../common/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { HealthService } from '../../application/health.service';

@ApiTags('Health')
@Controller('health')
@Public()
@SkipThrottle()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check completo del sistema' })
  async check() {
    return this.healthService.fullCheck();
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness probe simple' })
  live() {
    return this.healthService.live();
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async ready() {
    return this.healthService.ready();
  }
}

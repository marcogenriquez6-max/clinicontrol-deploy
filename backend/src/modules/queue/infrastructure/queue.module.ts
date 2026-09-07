import { Module, DynamicModule, Logger } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({})
export class QueueModule {
  private static readonly logger = new Logger(QueueModule.name);

  static forRoot(): DynamicModule {
    const redisEnabled = process.env.REDIS_ENABLED === 'true';

    if (!redisEnabled) {
      this.logger.warn('Redis disabled — queue module skipped');
      return { module: QueueModule };
    }

    return {
      module: QueueModule,
      imports: [
        BullModule.forRootAsync({
          useFactory: () => ({
            redis: {
              host: process.env.REDIS_HOST || 'localhost',
              port: parseInt(process.env.REDIS_PORT || '6379', 10),
              password: process.env.REDIS_PASSWORD || undefined,
            },
            defaultJobOptions: {
              attempts: 3,
              backoff: { type: 'exponential', delay: 2000 },
              removeOnComplete: true,
              removeOnFail: false,
            },
          }),
        }),
        BullModule.registerQueue(
          { name: 'pdf-generation' },
          { name: 'notifications' },
          { name: 'print-jobs' },
          { name: 'email' },
        ),
      ],
      exports: [BullModule],
    };
  }
}

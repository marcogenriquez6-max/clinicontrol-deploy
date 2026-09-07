import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import compression from 'compression';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Request, Response, NextFunction } from 'express';

function validateEnv(configService: ConfigService): void {
  const required = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
  const missing = required.filter(
    (key) =>
      !configService.get<string>(
        `app.jwt.${key === 'JWT_SECRET' ? 'secret' : 'refreshSecret'}`,
      ),
  );
  if (missing.length > 0) {
    const envMissing = required.filter((key) => !process.env[key]);
    if (envMissing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${envMissing.join(', ')}`,
      );
    }
  }

  const jwtSecret = process.env.JWT_SECRET || '';
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || '';

  if (jwtSecret && jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  if (jwtRefreshSecret && jwtRefreshSecret.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
  }

  if (
    process.env.NODE_ENV === 'production' &&
    jwtSecret.toLowerCase().includes('dev')
  ) {
    throw new Error(
      'JWT_SECRET contains "dev" which is not allowed in production',
    );
  }
}

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  validateEnv(configService);

  app.set('trust proxy', 1);

  const isProduction = configService.get('app.nodeEnv') === 'production';

  app.use(
    helmet({
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'"],
              styleSrc: ["'self'"],
              imgSrc: ["'self'", 'data:', 'blob:'],
              connectSrc: ["'self'"],
              fontSrc: ["'self'"],
              objectSrc: ["'none'"],
              frameAncestors: ["'none'"],
            },
          }
        : false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
      hidePoweredBy: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  app.use(compression());
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      (req as any).cookies = Object.fromEntries(
        cookieHeader.split(';').map((c) => {
          const [key, ...val] = c.trim().split('=');
          return [key, decodeURIComponent(val.join('='))];
        }),
      );
    } else {
      (req as any).cookies = {};
    }
    next();
  });
  app.useGlobalFilters(new GlobalExceptionFilter());

  const corsOrigins = configService.get<string[]>('app.corsOrigins') || [
    'http://localhost:4200',
  ];

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-User-ID',
      'X-Session-ID',
    ],
    exposedHeaders: ['X-Request-ID'],
    credentials: true,
    maxAge: 86400,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    }),
  );

  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('CliniControl API')
      .setDescription('API REST para gestión hospitalaria')
      .setVersion('2.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
    logger.log('Swagger docs enabled at /api');
  }

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
  logger.log(`Server running on http://localhost:${port}`);
  if (!isProduction) {
    logger.log(`Swagger docs at http://localhost:${port}/api`);
  }
  logger.log(`Environment: ${configService.get('app.nodeEnv')}`);
}

void bootstrap();

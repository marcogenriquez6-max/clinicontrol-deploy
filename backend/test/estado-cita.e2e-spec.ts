import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';

describe('EstadoCitaController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );

    const jwtService = moduleFixture.get<JwtService>(JwtService);
    authToken = jwtService.sign({
      sub: 1,
      email: 'admin@hospital.com',
      rol: 'admin',
      permissions: ['*'],
    });

    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  describe('/estados-cita (GET)', () => {
    it('should return list of estados cita', async () => {
      const response = await request(app.getHttpServer())
        .get('/estados-cita')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer()).get('/estados-cita').expect(401);
    });
  });

  describe('/estados-cita/:id (GET)', () => {
    it('should return an estado cita by id', async () => {
      const response = await request(app.getHttpServer())
        .get('/estados-cita/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('nombre');
    });

    it('should return 404 for nonexistent estado cita', async () => {
      return request(app.getHttpServer())
        .get('/estados-cita/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});

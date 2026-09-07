import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';

describe('EspecialidadController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdId: number;

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

  describe('/especialidades (GET)', () => {
    it('should return list of especialidades', async () => {
      const response = await request(app.getHttpServer())
        .get('/especialidades')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer()).get('/especialidades').expect(401);
    });
  });

  describe('/especialidades (POST)', () => {
    it('should create a new especialidad', async () => {
      const response = await request(app.getHttpServer())
        .post('/especialidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'Test Especialidad', descripcion: 'Test desc' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nombre).toBe('Test Especialidad');
      createdId = response.body.id;
    });

    it('should return 400 with invalid data', () => {
      return request(app.getHttpServer())
        .post('/especialidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'ab' })
        .expect(400);
    });
  });

  describe('/especialidades/:id (GET)', () => {
    it('should return an especialidad by id', async () => {
      const response = await request(app.getHttpServer())
        .get('/especialidades/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('nombre');
    });

    it('should return 404 for nonexistent especialidad', async () => {
      return request(app.getHttpServer())
        .get('/especialidades/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/especialidades/:id (PUT)', () => {
    it('should update an especialidad', async () => {
      const response = await request(app.getHttpServer())
        .put(`/especialidades/${createdId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'Updated Especialidad' })
        .expect(200);

      expect(response.body.nombre).toBe('Updated Especialidad');
    });
  });

  describe('/especialidades/:id (DELETE)', () => {
    it('should delete an especialidad', async () => {
      await request(app.getHttpServer())
        .delete(`/especialidades/${createdId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});

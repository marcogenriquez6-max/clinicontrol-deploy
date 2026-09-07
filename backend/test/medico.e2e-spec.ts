import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';

describe('MedicoController (e2e)', () => {
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

  describe('/medicos (POST)', () => {
    it('should create a new medico', async () => {
      const response = await request(app.getHttpServer())
        .post('/medicos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Test',
          apellido: 'Medico',
          especialidadId: 1,
          telefono: '71234567',
          email: 'test.medico@hospital.com',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.nombre).toBe('Test');
      expect(response.body.apellido).toBe('Medico');
      createdId = response.body.id;
    });

    it('should return 400 with invalid data', () => {
      return request(app.getHttpServer())
        .post('/medicos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'X' })
        .expect(400);
    });
  });

  describe('/medicos (GET)', () => {
    it('should return list of medicos', async () => {
      const response = await request(app.getHttpServer())
        .get('/medicos')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer()).get('/medicos').expect(401);
    });
  });

  describe('/medicos/:id (GET)', () => {
    it('should return a medico by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/medicos/${createdId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdId);
      expect(response.body).toHaveProperty('nombre');
    });

    it('should return 404 for nonexistent medico', async () => {
      return request(app.getHttpServer())
        .get('/medicos/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/medicos/especialidad/:especialidadId (GET)', () => {
    it('should return medicos by especialidad', async () => {
      const response = await request(app.getHttpServer())
        .get('/medicos/especialidad/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('/medicos/:id (PUT)', () => {
    it('should update a medico', async () => {
      const response = await request(app.getHttpServer())
        .put(`/medicos/${createdId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'Updated', apellido: 'Name' })
        .expect(200);

      expect(response.body.nombre).toBe('Updated');
      expect(response.body.apellido).toBe('Name');
    });
  });

  describe('/medicos/:id (DELETE)', () => {
    it('should delete a medico', async () => {
      await request(app.getHttpServer())
        .delete(`/medicos/${createdId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});

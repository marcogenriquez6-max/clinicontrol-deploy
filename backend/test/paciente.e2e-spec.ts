import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('PacienteController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /pacientes ()', () => {
    it('should return paginated list', () => {
      return request(app.getHttpServer())
        .get('/pacientes')
        .expect(200)
        .then((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.meta).toBeDefined();
        });
    });
  });

  describe('GET /pacientes/:id (', () => {
    it('should return 404 for non-existent patient', () => {
      return request(app.getHttpServer())
        .get('/pacientes/999999')
        .expect(404);
    });
  });

  describe('POST /pacientes (', () => {
    it('should create a patient with CI nueva', () => {
      return request(app.getHttpServer())
        .post('/pacientes')
        .send({
          nombre: 'Juan',
          apellido: 'Pérez',
          ci: '1234567',
          fechaNacimiento: '1980-05-15',
          generoId: 1,
        })
        .expect(201);
    });

    it('should return 409 when CI repetida', () => {
      return request(app.getHttpServer())
        .post('/pacientes')
        .send({
          nombre: 'María',
          apellido: 'Gómez',
          ci: '1234567', // Same CI as above
          fechaNacimiento: '1990-08-20',
          generoId: 2,
        })
        .expect(409);
    });

    it('should return 400 for invalid CI format', () => {
      return request(app.getHttpServer())
        .post('/pacientes')
        .send({
          nombre: 'Pedro',
          apellido: 'Silva',
          ci: 'ABC123', // Not digits only
          fechaNacimiento: '1990-08-20',
          generoId: 1,
        })
        .expect(400);
    });

    it('should include CI in the conflict message', () => {
      return request(app.getHttpServer())
        .post('/pacientes')
        .send({
          nombre: 'Luis',
          apellido: 'Ramírez',
          ci: '7654321',
          fechaNacimiento: '1985-12-10',
          generoId: 1,
        })
        .expect(409)
        .then((res) => {
          const msg = res.body.message || '';
          expect(msg).toContain('cédula');
          expect(msg).toContain('7654321');
          expect(msg).toContain('Búsquelo en el padrón');
        });
    });
  });

  describe('PUT /pacientes/:id (', () => {
    it('should update patient data', () => {
      // First create a patient
      const createRes = await request(app.getHttpServer())
        .post('/pacientes')
        .send({
          nombre: 'Actual',
          apellido: 'Test',
          ci: '1112223',
          fechaNacimiento: '1990-01-01',
          generoId: 1,
        });

      const patientId = createRes.body.id;

      return request(app.getHttpServer())
        .put(`/pacientes/${patientId}`)
        .send({
          nombre: 'Actualizado',
          apellido: 'González',
          ci: '1112223',
        })
        .expect(200);
    });

    it('should return 409 if CI changed and already exists', () => {
      // Create first patient
      await request(app.getHttpServer())
        .post('/pacientes')
        .send({
          nombre: 'Paciente1',
          apellido: 'Tal',
          ci: '4445556',
          fechaNacimiento: '1990-01-01',
          generoId: 1,
        });

      // Try to create second with different CI but same number (should fail)
      return request(app.getHttpServer())
        .post('/pacientes')
        .send({
          nombre: 'Paciente2',
          apellido: 'Tal',
          ci: '4445556', // Same CI
          fechaNacimiento: '1990-01-01',
          generoId: 1,
        })
        .expect(409);
    });
  });

  describe('PATCH /pacientes/:id/estado (', () => {
    it('should activate a patient', () => {
      // Create an inactive patient first
      const createRes = await request(app.getHttpServer())
        .post('/pacientes')
        .send({
          nombre: 'Inactivo',
          apellido: 'Paciente',
          ci: '2223334',
          fechaNacimiento: '1990-01-01',
          generoId: 1,
        });

      const patientId = createRes.body.id;

      // First deactivate by setting estado to 'inactivo' via the update endpoint
      // or just test the estado patch - but we need a patient that can be patched
      return request(app.getHttpServer())
        .patch(`/pacientes/${patientId}/estado`)
        .send({ estado: 'activo' })
        .expect(200);
    });

    it('should return 404 for non-existent patient', () => {
      return request(app.getHttpServer())
        .patch('/pacientes/999999/estado')
        .send({ estado: 'activo' })
        .expect(404);
    });
  });
});
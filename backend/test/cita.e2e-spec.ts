import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('CitaController (e2e)', () => {
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

  describe('GET /citas (', () => {
    it('should return paginated list', () => {
      return request(app.getHttpServer())
        .get('/citas')
        .expect(200)
        .then((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.meta).toBeDefined();
        });
    });
  });

  describe('POST /citas (', () => {
    it('should create a cita with free horario', () => {
      return request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: '2024-05-20',
          horaInicio: '09:00',
          horaFin: '09:30',
          motivo: 'Consulta de rutina',
        })
        .expect(201);
    });

    it('should return 409 when horario overlaps with existing cita', () => {
      // First create a cita
      await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: '2024-05-20',
          horaInicio: '10:00',
          horaFin: '10:30',
          motivo: 'Primera cita',
        });

      // Try to create another cita at the same time
      return request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 2,
          medicoId: 1,
          fecha: '2024-05-20',
          horaInicio: '10:00',
          horaFin: '10:30',
          motivo: 'Segunda cita',
        })
        .expect(409);
    });

    it('should return the conflict message with real hours', () => {
      // Create first cita
      await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: '2024-05-20',
          horaInicio: '10:00',
          horaFin: '10:30',
          motivo: 'Primera cita',
        });

      return request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 2,
          medicoId: 1,
          fecha: '2024-05-20',
          horaInicio: '10:00',
          horaFin: '10:30',
          motivo: 'Segunda cita',
        })
        .expect(409)
        .then((res) => {
          const msg = res.body.message || '';
          expect(msg).toContain('ya tiene una cita');
          expect(msg).toContain('10:00');
          expect(msg).toContain('10:30');
        });
    });

    it('should return 400 for fecha pasada', () => {
      return request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: '2020-01-01',
          horaInicio: '09:00',
          horaFin: '09:30',
          motivo: 'Cita pasada',
        })
        .expect(400);
    });

    it('should return 400 for hora inicio después que hora fin', () => {
      return request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: '2024-05-20',
          horaInicio: '10:30',
          horaFin: '09:00',
          motivo: 'Hora invertida',
        })
        .expect(400);
    });
  });

  describe('PUT /citas/:id (', () => {
    it('should update a cita', () => {
      // First create a cita
      const createRes = await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: '2024-05-20',
          horaInicio: '09:00',
          horaFin: '09:30',
          motivo: 'Consulta de rutina',
        });

      const citaId = createRes.body.id;

      return request(app.getHttpServer())
        .put(`/citas/${citaId}`)
        .send({
          fecha: '2024-05-21',
          horaInicio: '11:00',
          horaFin: '11:30',
          motivo: 'Consulta actualizada',
        })
        .expect(200);
    });

    it('should return 409 if updating creates a superposition', () => {
      // Create a cita
      await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: '2024-05-20',
          horaInicio: '09:00',
          horaFin: '09:30',
          motivo: 'Primera',
        });

      // Try to update to overlap with another existing cita
      // First create another cita at 10:00
      await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 2,
          medicoId: 1,
          fecha: '2024-05-20',
          horaInicio: '10:00',
          horaFin: '10:30',
          motivo: 'Segunda',
        });

      // Now update the first cita to overlap
      const createRes = await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: '2024-05-20',
          horaInicio: '09:00',
          horaFin: '09:30',
          motivo: 'Original',
        });

      const citaId = createRes.body.id;

      return request(app.getHttpServer())
        .put(`/citas/${citaId}`)
        .send({
          fecha: '2024-05-20',
          horaInicio: '09:00',
          horaFin: '10:00', // overlap with the second cita
          motivo: 'Actualizada',
        })
        .expect(409);
    });
  });

  describe('PATCH /citas/:id/cancelar (', () => {
    it('should cancel a cita with motivo', () => {
      // Create a cita
      const createRes = await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: '2024-05-20',
          horaInicio: '09:00',
          horaFin: '09:30',
          motivo: 'Consulta de rutina',
        });

      const citaId = createRes.body.id;

      return request(app.getHttpServer())
        .patch(`/citas/${citaId}/estado`)
        .send({ estado: 5, motivo: 'Motivo de cancelación' })
        .expect(200);
    });

    it('should return 400 if motivo is missing', () => {
      // Create a cita
      await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: '2024-05-20',
          horaInicio: '09:00',
          horaFin: '09:30',
          motivo: 'Consulta de rutina',
        });

      return request(app.getHttpServer())
        .patch(`/citas/1/estado`)
        .send({ estado: 5 })
        .expect(400);
    });
  });

  describe('POST /citas/:id/llegada (', () => {
    it('should register llegada for cita de hoy in estado pendiente', async () => {
      // Create a cita for today in pendiente state
      const createRes = await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: new Date().toISOString().split('T')[0],
          horaInicio: '09:00',
          horaFin: '09:30',
          motivo: 'Consulta de rutina',
        });

      const citaId = createRes.body.id;

      return request(app.getHttpServer())
        .post(`/citas/${citaId}/llegada`)
        .expect(200)
        .then((res) => {
          expect(res.body.cita).toBeDefined();
          expect(res.body.turno).toBeDefined();
        });
    });

    it('should return 400 if cita is not from hoy', () => {
      // Create a cita for a past date
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const createRes = await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: pastDate.toISOString().split('T')[0],
          horaInicio: '09:00',
          horaFin: '09:30',
          motivo: 'Consulta pasada',
        });

      const citaId = createRes.body.id;

      return request(app.getHttpServer())
        .post(`/citas/${citaId}/llegada`)
        .expect(400);
    });

    it('should return 400 if cita is not in pendiente or confirmada state', () => {
      // Create a cita in completada state
      const createRes = await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: new Date().toISOString().split('T')[0],
          horaInicio: '09:00',
          horaFin: '09:30',
          motivo: 'Consulta de rutina',
        });

      // Change state to completada (simulating already attended)
      const citaId = createRes.body.id;
      await request(app.getHttpServer())
        .patch(`/citas/${citaId}/estado`)
        .send({ estado: 4 }) // completada
        .expect(200);

      return request(app.getHttpServer())
        .post(`/citas/${citaId}/llegada`)
        .expect(400);
    });

    it('should return 409 if cita already has a turno previo', () => {
      // Create a cita
      const createRes = await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: new Date().toISOString().split('T')[0],
          horaInicio: '09:00',
          horaFin: '09:30',
          motivo: 'Consulta de rutina',
        });

      const citaId = createRes.body.id;

      // First llegada should succeed
      await request(app.getHttpServer())
        .post(`/citas/${citaId}/llegada`)
        .expect(200);

      // Second llegada should fail with 409
      return request(app.getHttpServer())
        .post(`/citas/${citaId}/llegada`)
        .expect(409);
    });

    it('should mark cita as en_curso after llegada', () => {
      // Create a cita for today
      const createRes = await request(app.getHttpServer())
        .post('/citas')
        .send({
          pacienteId: 1,
          medicoId: 1,
          fecha: new Date().toISOString().split('T')[0],
          horaInicio: '09:00',
          horaFin: '09:30',
          motivo: 'Consulta de rutina',
        });

      const citaId = createRes.body.id;

      return request(app.getHttpServer())
        .post(`/citas/${citaId}/llegada`)
        .expect(200)
        .then(() => {
          // Verify cita state changed to en_curso
          return request(app.getHttpServer())
            .get(`/citas/${citaId}`)
            .expect(200)
            .then((res) => {
              const estado = res.body.estado?.nombre || res.body.estado;
              expect(estado).toBe('en_curso');
            });
        });
    });
  });
});
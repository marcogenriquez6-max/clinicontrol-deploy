import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('TurnoController (e2e)', () => {
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

  describe('GET /turno', () => {
    it('should return list of turnos', () => {
      return request(app.getHttpServer())
        .get('/turno')
        .expect(200)
        .then((res) => {
          expect(res.body.data).toBeDefined();
        });
    });
  });

  describe('GET /turno/TV', () => {
    it('should return turnos with state TV', () => {
      return request(app.getHttpServer())
        .get('/turno/TV')
        .expect(200)
        .then((res) => {
          expect(res.body.data).toBeDefined();
        });
    });
  });

  describe('POST /turno', () => {
    it('should create a new turno', () => {
      return request(app.getHttpServer())
        .post('/turno')
        .send({
          fecha: '2024-01-15',
          horaInicio: '09:00',
          horaFin: '10:00',
          medicoId: 1,
          pacienteId: 1,
          tipoAtencionId: 1,
          tipo: 'consulta',
          monto: 50,
        })
        .expect(201)
        .then((res) => {
          expect(res.body.numero).toBeDefined();
        });
    });

    it('should fail if horario conflict', () => {
      return request(app.getHttpServer())
        .post('/turno')
        .send({
          fecha: '2024-01-15',
          horaInicio: '09:00',
          horaFin: '10:00',
          medicoId: 1,
          pacienteId: 1,
          tipoAtencionId: 1,
          tipo: 'consulta',
          monto: 50,
        })
        .expect(409);
    });
  });

  describe('PUT /turno/:id/estado', () => {
    it('should update turno estado to llamado', () => {
      return request(app.getHttpServer())
        .put('/turno/1/estado')
        .send({ estado: 'llamado' })
        .expect(200)
        .then((res) => {
          expect(res.body.estado).toBe('llamado');
        });
    });
  });

  describe('PUT /turno/:id/marcar-pagado', () => {
    it('should mark turno as pagado', () => {
      return request(app.getHttpServer())
        .put('/turno/1/marcar-pagado')
        .expect(200)
        .then((res) => {
          expect(res.body.pagado).toBe(true);
        });
    });
  });

  describe('DELETE /turno/:id', () => {
    it('should remove a turno', () => {
      return request(app.getHttpServer())
        .delete('/turno/999999')
        .expect(404);
    });
  });
});

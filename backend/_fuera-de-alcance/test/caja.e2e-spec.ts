import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('CajaController (e2e)', () => {
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

  describe('GET /caja', () => {
    it('should return list of sessions', () => {
      return request(app.getHttpServer())
        .get('/caja')
        .expect(200)
        .then((res) => {
          expect(res.body.data).toBeDefined();
        });
    });
  });

  describe('GET /caja/actual', () => {
    it('should return current open session or null', () => {
      return request(app.getHttpServer())
        .get('/caja/actual')
        .expect(200)
        .then((res) => {
          expect(res.body).toBeDefined();
        });
    });
  });

  describe('GET /caja/:id', () => {
    it('should return 404 for non-existent session', () => {
      return request(app.getHttpServer())
        .get('/caja/999999')
        .expect(404);
    });
  });

  describe('POST /caja/abrir', () => {
    it('should open a new session', () => {
      return request(app.getHttpServer())
        .post('/caja/abrir')
        .send({ montoInicial: 100, usuarioId: 1 })
        .expect(200)
        .then((res) => {
          expect(res.body.estado).toBe('abierta');
        });
    });

    it('should fail if session already open', () => {
      return request(app.getHttpServer())
        .post('/caja/abrir')
        .send({ montoInicial: 50, usuarioId: 1 })
        .expect(400);
    });
  });

  describe('PUT /caja/:id/cerrar', () => {
    it('should close a session', () => {
      return request(app.getHttpServer())
        .put('/caja/1/cerrar')
        .send({ montoFinal: 150, observaciones: 'Test close' })
        .expect(200)
        .then((res) => {
          expect(res.body.estado).toBe('cerrada');
        });
    });

    it('should fail if session already closed', () => {
      return request(app.getHttpServer())
        .put('/caja/1/cerrar')
        .send({ montoFinal: 100, observaciones: 'Test' })
        .expect(400);
    });
  });

  describe('POST /caja/cobrar', () => {
    it('should register a cobro', () => {
      return request(app.getHttpServer())
        .post('/caja/cobrar')
        .send({ montoRecibido: 200 })
        .expect(200)
        .then((res) => {
          expect(res.body.valido).toBe(true);
        });
    });

    it('should fail if no session open', () => {
      return request(app.getHttpServer())
        .post('/caja/cobrar')
        .send({ montoRecibido: 100 })
        .expect(200)
        .then((res) => {
          expect(res.body.mensaje).toBe('No hay una sesión de caja abierta');
        });
    });
  });

  describe('GET /caja/arqueo', () => {
    it('should returnarqueo for closed session', () => {
      return request(app.getHttpServer())
        .get('/caja/arqueo')
        .expect(200)
        .then((res) => {
          expect(res.body.montoInicial).toBeDefined();
          expect(res.body.montoFinal).toBeDefined();
          expect(res.body.vuelto).toBeDefined();
        });
    });

    it('should fail if no closed session', () => {
      return request(app.getHttpServer())
        .get('/caja/arqueo')
        .expect(200)
        .then((res) => {
          expect(res.body.mensaje).toBe('No hay una sesión cerrada para hacerarqueo');
        });
    });
  });
});

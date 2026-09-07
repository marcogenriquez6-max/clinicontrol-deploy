import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';

describe('DiagnosticoModule (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let consultaId: number;
  let diagnosticoId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    const jwtService = moduleFixture.get<JwtService>(JwtService);
    authToken = jwtService.sign({
      sub: '1',
      email: 'admin@hospital.com',
      rol: 'admin',
      permissions: ['*'],
    });

    consultaId = 1;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /diagnosticos should create', async () => {
    const res = await request(app.getHttpServer())
      .post('/diagnosticos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        consultaId,
        cie10Id: 1,
        descripcion: 'Hipertensión esencial diagnosticada',
      })
      .expect(201);
    diagnosticoId = res.body.data?.id ?? res.body.id;
    expect(diagnosticoId).toBeDefined();
  });

  it('POST /diagnosticos should return 400 for invalid data', async () => {
    await request(app.getHttpServer())
      .post('/diagnosticos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
      .expect(400);
  });

  it('GET /diagnosticos should list', async () => {
    const res = await request(app.getHttpServer())
      .get('/diagnosticos')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('GET /diagnosticos/1 should get one', async () => {
    const res = await request(app.getHttpServer())
      .get('/diagnosticos/1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    const data = res.body.data ?? res.body;
    expect(data.id).toBe(1);
  });

  it('GET /diagnosticos/consulta/:id should filter', async () => {
    const res = await request(app.getHttpServer())
      .get(`/diagnosticos/consulta/${consultaId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('GET /diagnosticos/cie10?q= should search', async () => {
    const res = await request(app.getHttpServer())
      .get('/diagnosticos/cie10?q=hipert')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('PUT /diagnosticos/1 should update', async () => {
    const res = await request(app.getHttpServer())
      .put('/diagnosticos/1')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ descripcion: 'Diagnóstico actualizado' })
      .expect(200);
    const data = res.body.data ?? res.body;
    expect(data).toBeDefined();
  });

  it('DELETE /diagnosticos/:id should delete', async () => {
    if (!diagnosticoId) return;
    await request(app.getHttpServer())
      .delete(`/diagnosticos/${diagnosticoId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('GET /diagnosticos should return 401 without auth', async () => {
    await request(app.getHttpServer()).get('/diagnosticos').expect(401);
  });
});

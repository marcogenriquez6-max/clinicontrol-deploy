import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';

describe('RecetaModule (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let consultaId: number;
  let recetaId: number;
  let medItemId: number;

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

  it('POST /recetas should create with medicamentos', async () => {
    const res = await request(app.getHttpServer())
      .post('/recetas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        consultaId,
        instrucciones: 'Tomar con abundante agua',
        medicamentos: [
          { medicamentoId: 1, dosis: '1 tableta', frecuencia: 'Cada 8 horas' },
        ],
      })
      .expect(201);
    recetaId = res.body.data?.id ?? res.body.id;
    expect(recetaId).toBeDefined();
  });

  it('POST /recetas should return 400 for invalid data', async () => {
    await request(app.getHttpServer())
      .post('/recetas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
      .expect(400);
  });

  it('GET /recetas should list', async () => {
    const res = await request(app.getHttpServer())
      .get('/recetas')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('GET /recetas/1 should get one', async () => {
    const res = await request(app.getHttpServer())
      .get('/recetas/1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    const data = res.body.data ?? res.body;
    expect(data.id).toBe(1);
  });

  it('GET /recetas/consulta/:id should filter', async () => {
    const res = await request(app.getHttpServer())
      .get(`/recetas/consulta/${consultaId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('PUT /recetas/1 should update', async () => {
    const res = await request(app.getHttpServer())
      .put('/recetas/1')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ instrucciones: 'Instrucciones actualizadas' })
      .expect(200);
    const data = res.body.data ?? res.body;
    expect(data).toBeDefined();
  });

  it('POST /recetas/1/medicamentos should add medicamento', async () => {
    const res = await request(app.getHttpServer())
      .post('/recetas/1/medicamentos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        medicamentoId: 2,
        dosis: '1 cápsula',
        frecuencia: 'Cada 12 horas',
      })
      .expect(201);
    medItemId = res.body.data?.id ?? res.body.id;
    expect(medItemId).toBeDefined();
  });

  it('DELETE /recetas/medicamentos/:id should remove', async () => {
    if (!medItemId) return;
    await request(app.getHttpServer())
      .delete(`/recetas/medicamentos/${medItemId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('GET /recetas should return 401 without auth', async () => {
    await request(app.getHttpServer()).get('/recetas').expect(401);
  });
});

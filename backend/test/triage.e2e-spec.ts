import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';

describe('TriageModule (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let pacienteId: number;
  let triageId: number;

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

    const pRes = await request(app.getHttpServer())
      .post('/pacientes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        nombre: 'TestTri',
        apellido: 'Paciente',
        ci: 'TRI-TEST-01',
        fechaNacimiento: '1990-01-01',
        generoId: 1,
      })
      .expect(201);
    pacienteId = pRes.body.data?.id ?? pRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /triage should create with vitals', async () => {
    const res = await request(app.getHttpServer())
      .post('/triage')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        pacienteId,
        esiNivel: 3,
        temperatura: 36.5,
        frecuenciaCardiaca: 80,
        presionSistolica: 120,
        presionDiastolica: 80,
        frecuenciaRespiratoria: 16,
        spo2: 98,
        motivoConsulta: 'Dolor abdominal intenso',
      })
      .expect(201);
    triageId = res.body.data?.id ?? res.body.id;
    expect(triageId).toBeDefined();
  });

  it('POST /triage should return 400 for invalid data', async () => {
    await request(app.getHttpServer())
      .post('/triage')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
      .expect(400);
  });

  it('GET /triage should list', async () => {
    const res = await request(app.getHttpServer())
      .get('/triage')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('GET /triage/activos should list active', async () => {
    const res = await request(app.getHttpServer())
      .get('/triage/activos')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('GET /triage/1 should get one', async () => {
    if (!triageId) return;
    const res = await request(app.getHttpServer())
      .get(`/triage/${triageId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    const data = res.body.data ?? res.body;
    expect(data).toBeDefined();
  });

  it('GET /triage/paciente/1 should get history', async () => {
    const res = await request(app.getHttpServer())
      .get(`/triage/paciente/${pacienteId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('PUT /triage/1 should update estado', async () => {
    if (!triageId) return;
    const res = await request(app.getHttpServer())
      .put(`/triage/${triageId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ estado: 'en_atencion' })
      .expect(200);
    const data = res.body.data ?? res.body;
    expect(data).toBeDefined();
  });

  it('GET /triage should return 401 without auth', async () => {
    await request(app.getHttpServer()).get('/triage').expect(401);
  });
});

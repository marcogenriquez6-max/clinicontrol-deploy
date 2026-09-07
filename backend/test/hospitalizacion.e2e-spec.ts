import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';

describe('HospitalizacionModule (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let pacienteId: number;
  let medicoId: number;
  let camaId: number;
  let hospId: number;

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
        nombre: 'TestHosp',
        apellido: 'Paciente',
        ci: 'HOSP-TEST-01',
        fechaNacimiento: '1990-01-01',
        generoId: 1,
      })
      .expect(201);
    pacienteId = pRes.body.data?.id ?? pRes.body.id;

    const mRes = await request(app.getHttpServer())
      .post('/medicos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ nombre: 'TestMH', apellido: 'Medico', especialidadId: 1 })
      .expect(201);
    medicoId = mRes.body.data?.id ?? mRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /camas should create a cama', async () => {
    const res = await request(app.getHttpServer())
      .post('/camas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ codigoCama: 'CAMA-TEST-01', servicio: 'Urgencias' })
      .expect(201);
    camaId = res.body.data?.id ?? res.body.id;
    expect(camaId).toBeDefined();
  });

  it('GET /camas should list', async () => {
    const res = await request(app.getHttpServer())
      .get('/camas')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('GET /camas/disponibles', async () => {
    const res = await request(app.getHttpServer())
      .get('/camas/disponibles')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('POST /hospitalizacion should admit patient', async () => {
    const res = await request(app.getHttpServer())
      .post('/hospitalizacion')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        pacienteId,
        medicoTratanteId: medicoId,
        camaId,
        fechaIngreso: new Date().toISOString(),
        motivoIngreso: 'Dolor abdominal agudo',
      })
      .expect(201);
    hospId = res.body.data?.id ?? res.body.id;
    expect(hospId).toBeDefined();
  });

  it('GET /hospitalizacion should list', async () => {
    const res = await request(app.getHttpServer())
      .get('/hospitalizacion')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('GET /hospitalizacion/stats', async () => {
    const res = await request(app.getHttpServer())
      .get('/hospitalizacion/stats')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('GET /hospitalizacion/1 should get one', async () => {
    if (!hospId) return;
    const res = await request(app.getHttpServer())
      .get(`/hospitalizacion/${hospId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    const data = res.body.data ?? res.body;
    expect(data).toBeDefined();
  });

  it('POST /hospitalizacion/1/alta should discharge', async () => {
    if (!hospId) return;
    const res = await request(app.getHttpServer())
      .post(`/hospitalizacion/${hospId}/alta`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        fechaAlta: new Date().toISOString(),
        notasAlta: 'Paciente dado de alta',
      })
      .expect(201);
    expect(res.body).toBeDefined();
  });

  it('POST /hospitalizacion/1/notas should create note', async () => {
    if (!hospId) return;
    const res = await request(app.getHttpServer())
      .post(`/hospitalizacion/${hospId}/notas`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        fecha: new Date().toISOString(),
        nota: 'Paciente evoluciona favorablemente',
      })
      .expect(201);
    expect(res.body).toBeDefined();
  });

  it('GET /hospitalizacion should return 401 without auth', async () => {
    await request(app.getHttpServer()).get('/hospitalizacion').expect(401);
  });
});

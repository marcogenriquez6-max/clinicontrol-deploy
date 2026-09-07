import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';

describe('ConsultaModule (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let pacienteId: number;
  let medicoId: number;
  let consultaId: number;

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
        nombre: 'TestCons',
        apellido: 'Paciente',
        ci: 'CONS-TEST-01',
        fechaNacimiento: '1990-01-01',
        generoId: 1,
      })
      .expect(201);
    pacienteId = pRes.body.data?.id ?? pRes.body.id;

    const mRes = await request(app.getHttpServer())
      .post('/medicos')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ nombre: 'TestM2', apellido: 'Medico', especialidadId: 1 })
      .expect(201);
    medicoId = mRes.body.data?.id ?? mRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /consultas should create', async () => {
    const res = await request(app.getHttpServer())
      .post('/consultas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        pacienteId,
        medicoId,
        motivo: 'Dolor de cabeza',
        sintomas: 'Cefalea frontal',
        examenFisico: 'Normal',
      })
      .expect(201);
    consultaId = res.body.data?.id ?? res.body.id;
    expect(consultaId).toBeDefined();
  });

  it('POST /consultas should return 400 for invalid data', async () => {
    await request(app.getHttpServer())
      .post('/consultas')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})
      .expect(400);
  });

  it('GET /consultas should list', async () => {
    const res = await request(app.getHttpServer())
      .get('/consultas')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('GET /consultas/1 should get one', async () => {
    const res = await request(app.getHttpServer())
      .get('/consultas/1')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    const data = res.body.data ?? res.body;
    expect(data.id).toBe(1);
  });

  it('GET /consultas/999 should return 404', async () => {
    await request(app.getHttpServer())
      .get('/consultas/999')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  it('GET /consultas/paciente/:id/timeline', async () => {
    const res = await request(app.getHttpServer())
      .get(`/consultas/paciente/${pacienteId}/timeline`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body).toBeDefined();
  });

  it('PUT /consultas/1 should update', async () => {
    const res = await request(app.getHttpServer())
      .put('/consultas/1')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ motivo: 'Motivo actualizado' })
      .expect(200);
    const data = res.body.data ?? res.body;
    expect(data).toBeDefined();
  });

  it('GET /consultas should return 401 without auth', async () => {
    await request(app.getHttpServer()).get('/consultas').expect(401);
  });
});

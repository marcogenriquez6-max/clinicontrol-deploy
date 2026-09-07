import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from '../src/entities/rol.entity';
import { AppModule } from '../src/app.module';

describe('UsuarioController (e2e)', () => {
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

    // RolesGuard checks user.rol === 'admin' (lowercase).
    // The seeder creates 'ADMIN' (uppercase). Update to lowercase so the guard passes.
    const rolRepo = moduleFixture.get<Repository<Rol>>(getRepositoryToken(Rol));
    const adminRol = await rolRepo.findOne({ where: { nombre: 'ADMIN' } });
    if (adminRol) {
      await rolRepo.update(adminRol.id, { nombre: 'admin' });
    }

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

  describe('/usuarios (POST)', () => {
    it('should create a new usuario', async () => {
      const response = await request(app.getHttpServer())
        .post('/usuarios')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Test',
          apellido: 'User',
          email: 'newuser@test.com',
          password: 'TestPass1!',
          ci: 'V-12345678',
          rolId: 2,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('newuser@test.com');
      createdId = response.body.id;
    });

    it('should return 400 with invalid data', () => {
      return request(app.getHttpServer())
        .post('/usuarios')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'X' })
        .expect(400);
    });
  });

  describe('/usuarios (GET)', () => {
    it('should return list of usuarios', async () => {
      const response = await request(app.getHttpServer())
        .get('/usuarios')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should return 401 without auth token', () => {
      return request(app.getHttpServer()).get('/usuarios').expect(401);
    });
  });

  describe('/usuarios/:id (GET)', () => {
    it('should return a usuario by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/usuarios/${createdId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', createdId);
      expect(response.body).toHaveProperty('email');
    });

    it('should return 404 for nonexistent usuario', async () => {
      return request(app.getHttpServer())
        .get('/usuarios/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/usuarios/:id (PUT)', () => {
    it('should update a usuario', async () => {
      const response = await request(app.getHttpServer())
        .put(`/usuarios/${createdId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nombre: 'Updated', apellido: 'Name' })
        .expect(200);

      expect(response.body.nombre).toBe('Updated');
    });
  });

  describe('/usuarios/:id (DELETE)', () => {
    it('should delete a usuario', async () => {
      await request(app.getHttpServer())
        .delete(`/usuarios/${createdId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });
});

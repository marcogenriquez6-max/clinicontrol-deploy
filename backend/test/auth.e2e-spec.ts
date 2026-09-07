import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();

    // Register a test user available for all login tests
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        nombre: 'Test',
        apellido: 'User',
        email: 'e2e@test.com',
        password: 'Password1!',
      });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/register', () => {
    it('should return 409 for duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          nombre: 'Test',
          apellido: 'User',
          email: 'e2e@test.com',
          password: 'Password1!',
        })
        .expect(409);
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          nombre: 'Test',
          apellido: 'User',
          email: 'invalid-email',
          password: 'Password1!',
        })
        .expect(400);
    });

    it('should return 400 for short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          nombre: 'Test',
          apellido: 'User',
          email: 'test@test.com',
          password: 'short',
        })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'wrong@test.com',
          password: 'Password1!',
        })
        .expect(401);
    });

    it('should return 400 for missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({})
        .expect(400);
    });

    it('should return 200 with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'e2e@test.com',
          password: 'Password1!',
        })
        .expect(200)
        .then((res) => {
          accessToken = res.body.accessToken;
        });
    });
  });

  describe('POST /auth/refresh', () => {
    it('should return 401 for invalid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });

    it('should return 200 with valid refresh token', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: accessToken,
        })
        .expect(200);
    });
  });
});

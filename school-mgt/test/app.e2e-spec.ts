import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;

  const email = `e2e-${Date.now()}@example.com`;
  const password = 'TestPassword123';
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200);
  });

  it('/auth/register (POST) -> 201 with access_token and user', async () => {
    const res = await request(app.getHttpServer()).post('/auth/register').send({
      firstName: 'Test',
      lastName: 'User',
      email,
      password,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
    expect(res.body).toHaveProperty('user');
    const body = res.body as { access_token: string; user: { email: string } };
    expect(body.user.email).toBe(email);
    accessToken = body.access_token;
  });

  it('/auth/register (POST) -> 400 with invalid payload', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        firstName: 'X',
        lastName: '',
        email: 'not-an-email',
        password: 'short',
      })
      .expect(400);
  });

  it('/auth/login (POST) -> 201 with access_token', async () => {
    const res = await request(app.getHttpServer()).post('/auth/login').send({
      email,
      password,
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('access_token');
  });

  it('/auth/profile (GET) -> 200 with token', () => {
    return request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });

  it('/auth/profile (GET) -> 401 without token', () => {
    return request(app.getHttpServer()).get('/auth/profile').expect(401);
  });
});

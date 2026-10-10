import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { prisma } from '@kuruta/database';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let refreshToken: string;
  let userId: string;

  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'StrongPass123',
    displayName: 'Test User',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    // Cleanup test user
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await app.close();
  });

  describe('Registration', () => {
    it('POST /api/v1/auth/register - should register new user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(testUser.email);
          expect(res.body.displayName).toBe(testUser.displayName);
          userId = res.body.id;
        });
    });

    it('POST /api/v1/auth/register - should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(409);
    });

    it('POST /api/v1/auth/register - should fail with weak password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/register')
        .send({
          email: 'weak@example.com',
          password: 'weak',
        })
        .expect(400);
    });
  });

  describe('Login', () => {
    it('POST /api/v1/auth/login - should login user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          accessToken = res.body.accessToken;
          
          // Check refresh token cookie
          const cookies = res.headers['set-cookie'];
          expect(cookies).toBeDefined();
          const refreshCookie = cookies.find((c: string) => c.includes('refreshToken'));
          expect(refreshCookie).toBeDefined();
          expect(refreshCookie).toContain('HttpOnly');
          expect(refreshCookie).toContain('SameSite=Strict');
          refreshToken = refreshCookie.split(';')[0].split('=')[1];
        });
    });

    it('POST /api/v1/auth/login - should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPass123',
        })
        .expect(401);
    });

    it('POST /api/v1/auth/login - should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);
    });
  });

  describe('Get Me', () => {
    it('GET /api/v1/auth/me - should get current user', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.email).toBe(testUser.email);
          expect(res.body).toHaveProperty('roles');
        });
    });

    it('GET /api/v1/auth/me - should fail without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .expect(401);
    });
  });

  describe('Refresh Token', () => {
    it('POST /api/v1/auth/refresh - should refresh access token', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          // New refresh token should be set in cookie
          const cookies = res.headers['set-cookie'];
          expect(cookies).toBeDefined();
        });
    });

    it('POST /api/v1/auth/refresh - should fail with old refresh token (rotation)', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refreshToken=${refreshToken}`])
        .expect(401);
    });

    it('POST /api/v1/auth/refresh - should revoke all sessions on token reuse', async () => {
      // Login to get new tokens
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const newRefreshToken = loginRes.headers['set-cookie']
        .find((c: string) => c.includes('refreshToken'))
        .split(';')[0]
        .split('=')[1];

      // Use refresh token once
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refreshToken=${newRefreshToken}`])
        .expect(200);

      // Try to use same token again - should fail and revoke all sessions
      const reuseRes = await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .set('Cookie', [`refreshToken=${newRefreshToken}`])
        .expect(401);

      expect(reuseRes.body.message).toContain('reuse detected');

      // Verify all sessions are revoked
      const sessions = await prisma.session.findMany({
        where: { userId, revokedAt: null },
      });
      expect(sessions.length).toBe(0);
    });
  });

  describe('Logout', () => {
    it('POST /api/v1/auth/logout - should logout user', async () => {
      // Login first
      const loginRes = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const newRefreshToken = loginRes.headers['set-cookie']
        .find((c: string) => c.includes('refreshToken'))
        .split(';')[0]
        .split('=')[1];

      const newAccessToken = loginRes.body.accessToken;

      return request(app.getHttpServer())
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .set('Cookie', [`refreshToken=${newRefreshToken}`])
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          // Check that refresh token cookie is cleared
          const cookies = res.headers['set-cookie'];
          expect(cookies).toBeDefined();
        });
    });
  });

  describe('TOTP 2FA', () => {
    it('POST /api/v1/auth/totp/enable - should initiate TOTP setup', () => {
      return request(app.getHttpServer())
        .post('/api/v1/auth/totp/enable')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('secret');
          expect(res.body).toHaveProperty('qrCodeUrl');
        });
    });
  });
});

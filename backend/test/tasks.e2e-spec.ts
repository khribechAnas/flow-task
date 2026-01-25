import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Tasks (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  it('/POST tasks (valid)', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Test Task',
        dueAt: '2026-01-30T00:00:00.000Z',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
        expect(res.body.title).toBe('Test Task');
      });
  });

  it('/POST tasks (missing title)', () => {
    return request(app.getHttpServer())
      .post('/tasks')
      .send({
        dueAt: '2026-01-30T00:00:00.000Z',
      })
      .expect(400);
  });

  afterAll(async () => {
    await app.close();
  });
});

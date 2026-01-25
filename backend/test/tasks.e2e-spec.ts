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

  // TEST (GET /tasks ordered)
  it('/GET tasks (ordered by order)', async () => {
    // create tasks with different order values
    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task A',
        dueAt: '2026-01-30T00:00:00.000Z',
        order: 2,
      });

    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: 'Task B',
        dueAt: '2026-01-30T00:00:00.000Z',
        order: 1,
      });

    return request(app.getHttpServer())
      .get('/tasks')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);

        // check order sorting
        expect(res.body[0].order).toBeLessThanOrEqual(res.body[1].order);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});

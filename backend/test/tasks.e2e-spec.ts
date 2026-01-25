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
        expect(Array.isArray(res.body.items)).toBe(true);
        expect(res.body.items.length).toBeGreaterThanOrEqual(2);
        expect(res.body.items[0].order).toBeLessThanOrEqual(res.body.items[1].order);

      });
  });

  // TEST (GET/tasks/:id found and not found)
  it('/GET tasks/:id (found)', async () => {
  const created = await request(app.getHttpServer())
    .post('/tasks')
    .send({
      title: 'Task Found',
      dueAt: '2026-01-30T00:00:00.000Z',
    });

  const id = created.body.id;

  return request(app.getHttpServer())
    .get(`/tasks/${id}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.id).toBe(id);
      expect(res.body.title).toBe('Task Found');
    });
});

it('/GET tasks/:id (not found)', () => {
  return request(app.getHttpServer())
    .get('/tasks/999999')
    .expect(404);
});

// PUT /tasks/:id (success)
it('/PUT tasks/:id (update)', async () => {
  const created = await request(app.getHttpServer())
    .post('/tasks')
    .send({
      title: 'Task Update',
      dueAt: '2026-01-30T00:00:00.000Z',
    });

  const id = created.body.id;

  return request(app.getHttpServer())
    .put(`/tasks/${id}`)
    .send({
      title: 'Updated Title',
      description: 'Updated Description',
      status: 'IN_PROGRESS',
      dueAt: '2026-02-01T00:00:00.000Z',
    })
    .expect(200)
    .expect((res) => {
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.status).toBe('IN_PROGRESS');
    });
});

// PUT /tasks/:id (not found)
it('/PUT tasks/:id (not found)', () => {
  return request(app.getHttpServer())
    .put('/tasks/999999')
    .send({
      title: 'Updated Title',
    })
    .expect(404);
});

// DELETE /tasks/:id (success)
it('/DELETE tasks/:id (success)', async () => {
  const created = await request(app.getHttpServer())
    .post('/tasks')
    .send({
      title: 'Task Delete',
      dueAt: '2026-01-30T00:00:00.000Z',
    });

  const id = created.body.id;

  return request(app.getHttpServer())
    .delete(`/tasks/${id}`)
    .expect(204);
});

// DELETE /tasks/:id (not found)
it('/DELETE tasks/:id (not found)', () => {
  return request(app.getHttpServer())
    .delete('/tasks/999999')
    .expect(404);
});

// POST /tasks/:id/duplicate
it('/POST tasks/:id/duplicate', async () => {
  // create 2 tasks
  const task1 = await request(app.getHttpServer())
    .post('/tasks')
    .send({ title: 'Task 1', dueAt: '2026-01-30T00:00:00.000Z', order: 1 });

  const task2 = await request(app.getHttpServer())
    .post('/tasks')
    .send({ title: 'Task 2', dueAt: '2026-01-30T00:00:00.000Z', order: 2 });

  // duplicate task1
  const duplicate = await request(app.getHttpServer())
    .post(`/tasks/${task1.body.id}/duplicate`)
    .expect(201);

  // check the duplicated task has correct order
  expect(duplicate.body.id).toBeDefined();
  expect(duplicate.body.id).not.toBe(task1.body.id);
  expect(duplicate.body.order).toBeGreaterThanOrEqual(3);

  // check count increased
  const all = await request(app.getHttpServer()).get('/tasks?limit=100');
  expect(all.body.items.length).toBeGreaterThanOrEqual(3);
});

// GET /tasks (pagination)
it('/GET tasks (pagination)', async () => {
  // create 12 tasks
  for (let i = 1; i <= 12; i++) {
    await request(app.getHttpServer())
      .post('/tasks')
      .send({
        title: `Task ${i}`,
        dueAt: '2026-01-30T00:00:00.000Z',
      });
  }

  return request(app.getHttpServer())
    .get('/tasks?page=2&limit=5')
    .expect(200)
    .expect((res) => {
      expect(res.body.items.length).toBe(5);
      expect(res.body.page).toBe(2);
      expect(res.body.limit).toBe(5);
      expect(res.body.total).toBeGreaterThanOrEqual(12);
    });
});

// GET tasks (filter by status)
it('/GET tasks (filter by status)', async () => {
  await request(app.getHttpServer())
    .post('/tasks')
    .send({
      title: 'Filter Task 1',
      dueAt: '2026-01-30T00:00:00.000Z',
      status: 'TODO',
    });

  await request(app.getHttpServer())
    .post('/tasks')
    .send({
      title: 'Filter Task 2',
      dueAt: '2026-01-30T00:00:00.000Z',
      status: 'DONE',
    });

  return request(app.getHttpServer())
    .get('/tasks?status=TODO')
    .expect(200)
    .expect((res) => {
      expect(res.body.items.every((t) => t.status === 'TODO')).toBe(true);
    });
});

// GET tasks (order DESC)
it('/GET tasks (order DESC)', async () => {
  await request(app.getHttpServer())
    .post('/tasks')
    .send({ title: 'Order 1', dueAt: '2026-01-30T00:00:00.000Z', order: 1 });

  await request(app.getHttpServer())
    .post('/tasks')
    .send({ title: 'Order 2', dueAt: '2026-01-30T00:00:00.000Z', order: 2 });

  return request(app.getHttpServer())
    .get('/tasks?order=DESC')
    .expect(200)
    .expect((res) => {
      expect(res.body.items[0].order).toBeGreaterThanOrEqual(res.body.items[1].order);
    });
});



  afterAll(async () => {
    await app.close();
  });
});

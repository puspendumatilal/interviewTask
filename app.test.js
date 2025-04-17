const request = require('supertest');
const app = require('./app');

let token = '';
let taskId = null;

beforeAll(async () => {
  const res = await request(app)
    .post('/login')
    .send({ username: 'admin', password: 'admin' });

  token = res.body.token;
});

describe('Task API tests', () => {
  test('Login should return token', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'admin' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('POST /tasks should create a task', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('token', token)
      .send({ title: 'Test Task', description: 'Test Description' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    taskId = res.body.id;
  });

  test('GET /tasks should return tasks', async () => {
    const res = await request(app)
      .get('/tasks')
      .set('token', token);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PUT /tasks/:id should update a task', async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set('token', token)
      .send({ title: 'Updated Task', description: 'Updated Desc' });

    expect(res.statusCode).toBe(204);
  });

  test('DELETE /tasks/:id should soft delete a task', async () => {
    const res = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('token', token);

    expect(res.statusCode).toBe(204);
  });
});

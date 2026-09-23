import request from 'supertest';
import { createApp } from '../../app.js';
import User from '../../models/User.js';
import { jest } from '@jest/globals';

const app = createApp();

describe('Auth API', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
    
    const user = await User.findOne({ email: 'test@example.com' });
    expect(user).toBeTruthy();
    expect(user.name).toBe('Test User');
  });

  it('should not register user with existing email', async () => {
    await User.create({
      name: 'Existing',
      email: 'exist@example.com',
      password: 'hashedpassword',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Test User',
      email: 'exist@example.com',
      password: 'password123',
    });

    expect([400, 409]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('success', false);
  });

  it('should login an existing user', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User',
      email: 'login@example.com',
      password: 'password123',
    });

    const res = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('token');
  });
});

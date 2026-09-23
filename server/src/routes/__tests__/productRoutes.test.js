import request from 'supertest';
import { createApp } from '../../app.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js';
import { jest } from '@jest/globals';

const app = createApp();

describe('Product API', () => {
  let adminToken;
  let userToken;
  let categoryId;

  beforeAll(async () => {
    // create an admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    
    // create a normal user
    const user = await User.create({
      name: 'User',
      email: 'user@example.com',
      password: 'password123',
      role: 'user',
    });

    const resAdmin = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com',
      password: 'password123',
    });
    adminToken = resAdmin.body.token;

    const resUser = await request(app).post('/api/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    });
    userToken = resUser.body.token;

    const Category = (await import('../../models/Category.js')).default;
    const cat = await Category.create({ name: 'Test Category', slug: 'test-category' });
    categoryId = cat._id.toString();
  });

  it('should create a product if admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        description: 'A test product description',
        price: 99.99,
        stock: 10,
        category: categoryId,
        images: ['https://example.com/image.jpg'],
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.product.name).toBe('Test Product');
    expect(res.body.product.slug).toBe('test-product');
  });

  it('should not create a product if not admin', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Test Product 2',
        description: 'Desc',
        price: 10,
        stock: 5,
        category: categoryId,
        images: ['img'],
      });

    expect(res.statusCode).toEqual(403);
  });

  it('should get a list of products', async () => {
    // we already created one
    const res = await request(app).get('/api/products');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThanOrEqual(1);
  });

  it('should notify stock when user subscribes', async () => {
    const product = await Product.findOne();
    
    // update stock to 0
    await request(app)
      .patch(`/api/products/${product._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: 0 });

    const subRes = await request(app)
      .post(`/api/products/${product._id}/notify-stock`)
      .send({ email: 'notify@example.com' });

    expect(subRes.statusCode).toEqual(201);
    expect(subRes.body.success).toBe(true);
  });
});

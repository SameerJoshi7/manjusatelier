import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { initCache, closeCache } from '../utils/cache.js';
import { jest } from '@jest/globals';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Mock redis caching so we don't need real redis
  await initCache();
});

afterAll(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  await mongoose.disconnect();
  await mongoServer.stop();
  await closeCache();
});

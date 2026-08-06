import { createClient } from 'redis';
import NodeCache from 'node-cache';

// In-memory fallback (TTL: 1 hour)
const memoryCache = new NodeCache({ stdTTL: 3600 });
let redisClient = null;
let useRedis = false;

export const initCache = async () => {
  if (process.env.REDIS_URL) {
    try {
      redisClient = createClient({ url: process.env.REDIS_URL });
      
      redisClient.on('error', (err) => {
        console.error('Redis Client Error', err);
        useRedis = false; // fallback to memory on error
      });

      await redisClient.connect();
      useRedis = true;
      console.log('✅ Connected to Redis cache');
    } catch (error) {
      console.error('Failed to connect to Redis, falling back to in-memory cache:', error.message);
      useRedis = false;
    }
  } else {
    console.log('ℹ️ No REDIS_URL provided. Using in-memory cache fallback.');
  }
};

export const setCache = async (key, data, ttlSeconds = 3600) => {
  try {
    if (useRedis && redisClient) {
      await redisClient.setEx(key, ttlSeconds, JSON.stringify(data));
    } else {
      memoryCache.set(key, data, ttlSeconds);
    }
  } catch (err) {
    console.error('Cache Set Error:', err);
  }
};

export const getCache = async (key) => {
  try {
    if (useRedis && redisClient) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } else {
      return memoryCache.get(key) || null;
    }
  } catch (err) {
    console.error('Cache Get Error:', err);
    return null;
  }
};

// Clears all cache matching a prefix pattern
export const clearCachePattern = async (pattern) => {
  try {
    if (useRedis && redisClient) {
      // In a real prod environment with many keys, SCAN should be used instead of KEYS
      const keys = await redisClient.keys(`*${pattern}*`);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } else {
      const keys = memoryCache.keys().filter((k) => k.includes(pattern));
      if (keys.length > 0) {
        memoryCache.del(keys);
      }
    }
  } catch (err) {
    console.error('Cache Clear Error:', err);
  }
};

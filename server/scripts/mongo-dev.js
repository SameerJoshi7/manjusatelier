// Starts a local MongoDB (via mongodb-memory-server) on a fixed port with an
// on-disk data path, so the seed script and the API server can share the same
// database across processes. Use this only when you don't have a real MongoDB.
//
//   node scripts/mongo-dev.js
//
import { MongoMemoryServer } from 'mongodb-memory-server';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../.mongo-data');
mkdirSync(dbPath, { recursive: true });

const PORT = Number(process.env.MONGO_DEV_PORT || 27017);

const server = await MongoMemoryServer.create({
  instance: { port: PORT, dbPath, storageEngine: 'wiredTiger' },
});

console.log('✓ Local dev MongoDB running at', server.getUri());
console.log('  (data persisted to server/.mongo-data — press Ctrl+C to stop)');

const shutdown = async () => {
  await server.stop();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

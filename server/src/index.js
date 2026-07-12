import 'dotenv/config';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { initCronJobs } from './utils/cron.js';

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('✗ MONGODB_URI is not set. Copy .env.example to .env and configure it.');
    process.exit(1);
  }
  await connectDB(process.env.MONGODB_URI);
  initCronJobs();
  const app = createApp();

  app.listen(PORT, () => console.log(`✓ API listening on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

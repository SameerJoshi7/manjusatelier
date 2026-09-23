import 'dotenv/config';
import http from 'http';
import mongoose from 'mongoose';
import { createApp } from './app.js';
import { connectDB } from './config/db.js';
import { initCronJobs, stopCronJobs } from './utils/cron.js';
import { initSocket } from './socket.js';
import { initCache, closeCache } from './utils/cache.js';

const PORT = process.env.PORT || 5000;

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error('✗ MONGODB_URI is not set. Copy .env.example to .env and configure it.');
    process.exit(1);
  }
  await connectDB(process.env.MONGODB_URI);
  await initCache();
  initCronJobs();
  
  const app = createApp();
  const server = http.createServer(app);
  
  // Initialize Socket.io
  initSocket(server);

  server.listen(PORT, () => console.log(`✓ API listening on http://localhost:${PORT}`));

  const gracefulShutdown = async (signal) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    
    server.close(async (err) => {
      if (err) {
        console.error('Error closing HTTP server:', err);
      } else {
        console.log('HTTP server closed.');
      }
      
      try {
        stopCronJobs();
        console.log('Cron jobs stopped.');
        
        await closeCache();
        console.log('Cache connection closed.');
        
        await mongoose.connection.close();
        console.log('MongoDB connection closed.');
        
        console.log('Graceful shutdown complete.');
        process.exit(0);
      } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

import mongoose from 'mongoose';

/**
 * Connect to MongoDB. Retries are handled by the mongoose driver.
 */
export async function connectDB(uri) {
  mongoose.set('strictQuery', true);
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✓ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    throw err;
  }
}

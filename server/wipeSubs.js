import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;

async function wipe() {
  if (!uri) {
    console.error('No MONGODB_URI found in env');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const PushSubscription = mongoose.model('PushSubscription', new mongoose.Schema({}, { strict: false }));
  const result = await PushSubscription.deleteMany({});
  console.log('Wiped subscriptions:', result.deletedCount);
  process.exit(0);
}

wipe();

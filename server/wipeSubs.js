import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://sameer:Manjus2024Atelier@cluster0.o5pge.mongodb.net/manjus-atelier?retryWrites=true&w=majority&appName=Cluster0';

async function wipe() {
  await mongoose.connect(uri);
  const PushSubscription = mongoose.model('PushSubscription', new mongoose.Schema({}, { strict: false }));
  const result = await PushSubscription.deleteMany({});
  console.log('Wiped subscriptions:', result.deletedCount);
  process.exit(0);
}

wipe();

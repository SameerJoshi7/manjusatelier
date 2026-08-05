import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

// FORCE VAPID KEYS FOR TEST
process.env.VAPID_PUBLIC_KEY = 'BFkSg_bNIILtmGrj-gg7xtn6TE30t0W9dyP9FcBzaOtbDyVnjtaaTxjsnmfn8C5uMm6Qeo2FYgLfv8wX_HEb0Uk';
process.env.VAPID_PRIVATE_KEY = 'vT6F7x5nSfNegbGxYLqNXcwhNhPMANKIX2C33Iee7nQ';

async function run() {
  const PushSubscription = (await import('./src/models/PushSubscription.js')).default;
  const { sendBatchPushNotification } = await import('./src/utils/push.js');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const subs = await PushSubscription.find({});
  console.log(`Found ${subs.length} subscriptions`);

  await sendBatchPushNotification(subs, {
    title: 'Hello from Manjus Atelier!',
    body: 'This is a test notification. Did you get it?',
    url: '/'
  });

  console.log('Done');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

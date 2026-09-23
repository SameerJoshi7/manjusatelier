import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

import PushSubscription from './server/src/models/PushSubscription.js';
import { sendBatchPushNotification } from './server/src/utils/push.js';

async function run() {
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

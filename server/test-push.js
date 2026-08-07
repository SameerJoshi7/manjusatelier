import mongoose from 'mongoose';
import 'dotenv/config';
import PushSubscription from './src/models/PushSubscription.js';
import { sendBatchPushNotification } from './src/utils/push.js';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const subs = await PushSubscription.find({});
  console.log(`Found ${subs.length} total subscriptions in DB.`);
  
  const results = await sendBatchPushNotification(subs, {
    title: 'Diagnostic Test',
    body: 'Testing web push delivery from a raw script',
    url: '/'
  });
  
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}
test();

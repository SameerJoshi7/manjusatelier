import mongoose from 'mongoose';
import 'dotenv/config';
import User from './src/models/User.js';
import PushSubscription from './src/models/PushSubscription.js';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const allSubs = await PushSubscription.find({}).populate('user', 'email preferences');
  console.log('--- ALL SUBSCRIPTIONS ---');
  allSubs.forEach(sub => {
    console.log(`Endpoint: ${sub.endpoint.slice(0, 30)}...`);
    if (sub.user) {
      console.log(`  User: ${sub.user.email} (Newsletter: ${sub.user.preferences?.newsletter})`);
    } else {
      console.log(`  User: NULL (Guest)`);
    }
  });

  process.exit(0);
}
test();

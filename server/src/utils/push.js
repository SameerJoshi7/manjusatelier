import webpush from 'web-push';
import PushSubscription from '../models/PushSubscription.js';

const publicVapidKey = process.env.VAPID_PUBLIC_KEY;
const privateVapidKey = process.env.VAPID_PRIVATE_KEY;

export const recentPushErrors = [];


if (publicVapidKey && privateVapidKey) {
  webpush.setVapidDetails(
    `mailto:${process.env.EMAIL_FROM || 'help@manjusatelier.in'}`,
    publicVapidKey,
    privateVapidKey
  );
} else {
  console.warn('⚠️ Web Push is not configured. Missing VAPID keys in environment variables.');
}

/**
 * Send a push notification to a specific subscription endpoint
 */
export const sendPushNotification = async (subscription, payload) => {
  try {
    const stringifiedPayload = JSON.stringify(payload);
    await webpush.sendNotification(subscription, stringifiedPayload);
    return true;
  } catch (error) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      // The subscription has expired or is no longer valid
      console.log('Push subscription expired/invalid, deleting from database:', subscription.endpoint);
      await PushSubscription.findOneAndDelete({ endpoint: subscription.endpoint });
    } else {
      console.error('Error sending push notification:', error);
      recentPushErrors.unshift({ time: new Date().toISOString(), error: error.message, statusCode: error.statusCode, body: error.body });
      if (recentPushErrors.length > 20) recentPushErrors.pop();
    }
    return false;
  }
};

/**
 * Send a push notification to multiple subscriptions (e.g., all users for a broadcast)
 */
export const sendBatchPushNotification = async (subscriptions, payload) => {
  const promises = subscriptions.map((sub) => sendPushNotification(sub, payload));
  const results = await Promise.allSettled(promises);
  const successful = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
  console.log(`Push Broadcast: ${successful}/${subscriptions.length} sent successfully.`);
  return results;
};

/**
 * Send a push notification to a specific user (all their active subscriptions)
 */
export const sendPushToUser = async (userId, payload) => {
  try {
    const subs = await PushSubscription.find({ user: userId });
    if (subs.length === 0) return false;
    
    await Promise.all(subs.map(sub => sendPushNotification(sub, payload)));
    return true;
  } catch (error) {
    console.error('Error sending push to user:', error);
    return false;
  }
};

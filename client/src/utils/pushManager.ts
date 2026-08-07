// Helper to convert base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Ask the user for permission to send push notifications
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return 'denied';
  }
  return await Notification.requestPermission();
}

/**
 * Subscribe the user to push notifications and send the subscription to the backend
 */
export async function subscribeToPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported by the browser');
  }

  const registration = await navigator.serviceWorker.ready;
  
  // 1. Fetch the VAPID public key from our backend
  const response = await fetch('/api/push/vapid-public-key');
  const { publicKey } = await response.json();
  
  if (!publicKey) {
    throw new Error('VAPID public key not found');
  }

  const applicationServerKey = urlBase64ToUint8Array(publicKey);

  // Unsubscribe from any existing subscription to ensure we use the new VAPID key
  const existingSubscription = await registration.pushManager.getSubscription();
  if (existingSubscription) {
    await existingSubscription.unsubscribe();
  }

  // 2. Subscribe to the push manager
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  });

  // 3. Send the subscription to our backend
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const saveResponse = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers,
    body: JSON.stringify({ subscription }),
  });

  if (!saveResponse.ok) {
    throw new Error('Failed to save push subscription to the server');
  }

  // Fire a local test notification to bypass the server completely
  try {
    if (registration && registration.showNotification) {
      await registration.showNotification('Local OS Test', {
        body: 'If you see this, your OS is allowing notifications!',
      });
    }
  } catch (e) {
    console.error('Local notification failed', e);
  }

  return subscription;
}

/**
 * Silently sync an existing push subscription with the backend,
 * ensuring it's tied to the currently logged-in user.
 */
export async function syncPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return;
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  
  if (!subscription) return; // Not subscribed on this device

  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers,
      body: JSON.stringify({ subscription }),
    });
  } catch (e) {
    console.error('Failed to sync push subscription', e);
  }
}

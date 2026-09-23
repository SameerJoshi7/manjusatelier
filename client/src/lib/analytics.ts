import { api } from './api';

function getSessionId() {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

export function trackEvent(eventType: string, metadata: any = {}, productId?: string) {
  try {
    const sessionId = getSessionId();
    api.post('/analytics/track', {
      eventType,
      productId,
      sessionId,
      metadata,
    }).catch(() => {
      // Silently fail analytics tracking
    });
  } catch (e) {
    // Ignore
  }
}

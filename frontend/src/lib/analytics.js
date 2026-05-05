import { api } from './api';

const SESSION_KEY = 'bharatmart-visitor-session';
const DEDUPE_PREFIX = 'bharatmart-analytics-dedupe:';

const createSessionId = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `bm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export function getAnalyticsSessionId() {
  if (typeof window === 'undefined') return '';

  const existing = window.localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const nextId = createSessionId();
  window.localStorage.setItem(SESSION_KEY, nextId);
  return nextId;
}

const isDuplicateEvent = (dedupeKey, dedupeWindowMs) => {
  if (!dedupeKey || !dedupeWindowMs || typeof window === 'undefined') return false;

  const storageKey = `${DEDUPE_PREFIX}${dedupeKey}`;
  const lastSentAt = Number(window.sessionStorage.getItem(storageKey) || 0);
  const now = Date.now();

  if (lastSentAt && now - lastSentAt < dedupeWindowMs) {
    return true;
  }

  window.sessionStorage.setItem(storageKey, String(now));
  return false;
};

export function trackAnalyticsEvent({
  eventType,
  productId = null,
  path,
  referrer,
  dedupeKey = '',
  dedupeWindowMs = 0
}) {
  if (typeof window === 'undefined' || !eventType) {
    return Promise.resolve();
  }

  if (isDuplicateEvent(dedupeKey, dedupeWindowMs)) {
    return Promise.resolve();
  }

  const sessionId = getAnalyticsSessionId();

  return api
    .post('/analytics/events', {
      sessionId,
      eventType,
      productId,
      path: String(path || window.location.pathname).slice(0, 255),
      referrer: String(referrer || document.referrer || '').slice(0, 255)
    })
    .catch(() => null);
}

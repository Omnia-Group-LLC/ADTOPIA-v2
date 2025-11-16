// src/lib/utils/hold.ts
import { APP } from '@/config/appConfig';
import { qp } from './url';
import { safeStorage } from './safeStorage';

const HOLD_EMAIL_KEY = 'holdEmail';
const HOLD_UNTIL_KEY = 'holdUntil';

export function applyHoldFromQuery() {
  // Check if window is available
  if (typeof window === 'undefined') return;
  
  const email = qp('email') || qp('e');
  const hold  = qp('hold'); // '30' | 'true'
  if (email && (hold === '30' || hold === 'true')) {
    safeStorage.set(HOLD_EMAIL_KEY, email);
    const until = Date.now() + APP.HOLD_PREVIEW_DAYS * 24 * 3600 * 1000;
    safeStorage.set(HOLD_UNTIL_KEY, String(until));
  }
}

export function getHoldEmail() {
  if (typeof window === 'undefined') return undefined;
  const until = safeStorage.get(HOLD_UNTIL_KEY);
  if (!until) return undefined;
  const untilMs = parseInt(until, 10);
  if (untilMs <= Date.now()) return undefined;
  return safeStorage.get(HOLD_EMAIL_KEY) || undefined;
}

export function holdActive(): boolean {
  if (typeof window === 'undefined') return false;
  const until = safeStorage.get(HOLD_UNTIL_KEY);
  if (!until) return false;
  const untilMs = parseInt(until, 10);
  return untilMs > Date.now();
}

export function previewExpiry(baseCreatedAtMs: number) {
  const days = holdActive() ? APP.HOLD_PREVIEW_DAYS : APP.DEFAULT_PREVIEW_DAYS;
  return baseCreatedAtMs + days * 24 * 3600 * 1000;
}

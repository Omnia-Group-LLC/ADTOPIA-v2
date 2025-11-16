// src/lib/utils/pay.ts
import { APP } from '@/config/appConfig';
import { getHoldEmail } from './hold';
import { Analytics } from './analytics';

export type TierKey = keyof typeof APP.PAY | 'analytics.monthly_19' | 'analytics.oneoff_29';

// Map legacy keys to current pricing structure (for backwards compatibility)
export const LEGACY_KEY_MAP: Record<string, TierKey> = {
  'STARTER_49': 'STARTER_29',
  'BASIC_497': 'GROWTH_79', 
  'PRO_997': 'PRO_149',
  'ULTIMATE_1997': 'FULL_297'
};

export function payHref(key: TierKey, source: string) {
  let base: string;
  
  // Handle nested analytics keys
  if (key === 'analytics.monthly_19') {
    base = APP.PAY.analytics.monthly_19;
  } else if (key === 'analytics.oneoff_29') {
    base = APP.PAY.analytics.oneoff_29;
  } else {
    base = APP.PAY[key as keyof typeof APP.PAY] as string;
  }
  
  const url = new URL(base);
  
  // Preserve redirect
  url.searchParams.set('success_url', APP.SUCCESS_URL);
  url.searchParams.set('cancel_url',  APP.CANCEL_URL);
  
  // UTM + email prefill
  const email = getHoldEmail();
  if (email) url.searchParams.set('prefilled_email', email);
  url.searchParams.set('utm_source', 'adtopia');
  url.searchParams.set('utm_medium', 'beta');
  url.searchParams.set('utm_campaign', source || 'site');
  
  return url.toString();
}

export function openPaymentLink(key: TierKey, source: string = 'site') {
  // Track GA event using unified Analytics class
  Analytics.track({
    event_name: 'payment_link_opened',
    event_category: 'commerce',
    event_label: key,
    custom_parameters: { tier: key, source }
  });
  
  // Open payment link in new tab
  const href = payHref(key, source);
  window.open(href, '_blank');
}
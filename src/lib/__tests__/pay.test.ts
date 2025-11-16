// src/lib/utils/__tests__/pay.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { payHref, openPaymentLink, LEGACY_KEY_MAP, TierKey } from '../pay';
import { getHoldEmail } from '../hold';
import { Analytics } from '../analytics';

// Mock dependencies
vi.mock('../hold', () => ({
  getHoldEmail: vi.fn(() => null),
}));

vi.mock('../analytics', () => ({
  Analytics: {
    track: vi.fn(),
  },
}));

vi.mock('@/config/appConfig', () => ({
  APP: {
    PAY: {
      STARTER_29: 'https://buy.stripe.com/test_starter',
      GROWTH_79: 'https://buy.stripe.com/test_growth',
      PRO_149: 'https://buy.stripe.com/test_pro',
      FULL_297: 'https://buy.stripe.com/test_full',
      BULK_149: 'https://buy.stripe.com/test_bulk_149',
      BULK_297: 'https://buy.stripe.com/test_bulk_297',
      BULK_499: 'https://buy.stripe.com/test_bulk_499',
      ADDON_TRANSLATION_29: 'https://buy.stripe.com/test_addon_translation',
      ADDON_DOMAIN_SSL_49: 'https://buy.stripe.com/test_addon_domain',
      ADDON_EXTRA_CARDS_39: 'https://buy.stripe.com/test_addon_cards',
      ADDON_ANALYTICS_29: 'https://buy.stripe.com/test_addon_analytics',
      ADDON_SOCIAL_35: 'https://buy.stripe.com/test_addon_social',
      analytics: {
        monthly_19: 'https://buy.stripe.com/test_analytics_monthly',
        oneoff_29: 'https://buy.stripe.com/test_analytics_oneoff',
      },
    },
    SUCCESS_URL: 'https://adtopia.lovable.app/payment-success',
    CANCEL_URL: 'https://adtopia.lovable.app/payment-canceled',
  },
}));

// Mock window.open
const mockWindowOpen = vi.fn();
Object.defineProperty(window, 'open', {
  writable: true,
  value: mockWindowOpen,
});

describe('payHref', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getHoldEmail).mockReturnValue(null);
  });

  it('should generate URL for STARTER_29 tier', () => {
    const url = payHref('STARTER_29', 'test-source');
    const parsedUrl = new URL(url);
    
    expect(parsedUrl.hostname).toBe('buy.stripe.com');
    expect(parsedUrl.pathname).toContain('test_starter');
    expect(parsedUrl.searchParams.get('success_url')).toBe('https://adtopia.lovable.app/payment-success');
    expect(parsedUrl.searchParams.get('cancel_url')).toBe('https://adtopia.lovable.app/payment-canceled');
    expect(parsedUrl.searchParams.get('utm_source')).toBe('adtopia');
    expect(parsedUrl.searchParams.get('utm_medium')).toBe('beta');
    expect(parsedUrl.searchParams.get('utm_campaign')).toBe('test-source');
  });

  it('should generate URL for GROWTH_79 tier', () => {
    const url = payHref('GROWTH_79', 'checkout');
    const parsedUrl = new URL(url);
    
    expect(parsedUrl.pathname).toContain('test_growth');
    expect(parsedUrl.searchParams.get('utm_campaign')).toBe('checkout');
  });

  it('should generate URL for PRO_149 tier', () => {
    const url = payHref('PRO_149', 'pricing-page');
    const parsedUrl = new URL(url);
    
    expect(parsedUrl.pathname).toContain('test_pro');
    expect(parsedUrl.searchParams.get('utm_campaign')).toBe('pricing-page');
  });

  it('should generate URL for FULL_297 tier', () => {
    const url = payHref('FULL_297', 'landing');
    const parsedUrl = new URL(url);
    
    expect(parsedUrl.pathname).toContain('test_full');
    expect(parsedUrl.searchParams.get('utm_campaign')).toBe('landing');
  });

  it('should generate URL for analytics.monthly_19 tier', () => {
    const url = payHref('analytics.monthly_19', 'analytics');
    const parsedUrl = new URL(url);
    
    expect(parsedUrl.pathname).toContain('test_analytics_monthly');
    expect(parsedUrl.searchParams.get('utm_campaign')).toBe('analytics');
  });

  it('should generate URL for analytics.oneoff_29 tier', () => {
    const url = payHref('analytics.oneoff_29', 'snapshot');
    const parsedUrl = new URL(url);
    
    expect(parsedUrl.pathname).toContain('test_analytics_oneoff');
    expect(parsedUrl.searchParams.get('utm_campaign')).toBe('snapshot');
  });

  it('should include email prefill when hold email exists', () => {
    vi.mocked(getHoldEmail).mockReturnValue('test@example.com');
    
    const url = payHref('STARTER_29', 'test');
    const parsedUrl = new URL(url);
    
    expect(parsedUrl.searchParams.get('prefilled_email')).toBe('test@example.com');
  });

  it('should not include email prefill when hold email is null', () => {
    vi.mocked(getHoldEmail).mockReturnValue(null);
    
    const url = payHref('STARTER_29', 'test');
    const parsedUrl = new URL(url);
    
    expect(parsedUrl.searchParams.get('prefilled_email')).toBeNull();
  });

  it('should set default campaign to "site" when source is empty', () => {
    const url = payHref('STARTER_29', '');
    const parsedUrl = new URL(url);
    
    expect(parsedUrl.searchParams.get('utm_campaign')).toBe('site');
  });

  it('should always include utm_source as "adtopia"', () => {
    const url = payHref('STARTER_29', 'any-source');
    const parsedUrl = new URL(url);
    
    expect(parsedUrl.searchParams.get('utm_source')).toBe('adtopia');
  });

  it('should always include utm_medium as "beta"', () => {
    const url = payHref('GROWTH_79', 'test');
    const parsedUrl = new URL(url);
    
    expect(parsedUrl.searchParams.get('utm_medium')).toBe('beta');
  });

  it('should generate URL for bulk tiers', () => {
    const bulk149Url = payHref('BULK_149', 'bulk');
    const bulk297Url = payHref('BULK_297', 'bulk');
    const bulk499Url = payHref('BULK_499', 'bulk');
    
    expect(bulk149Url).toContain('test_bulk_149');
    expect(bulk297Url).toContain('test_bulk_297');
    expect(bulk499Url).toContain('test_bulk_499');
  });

  it('should generate URL for add-on tiers', () => {
    const translationUrl = payHref('ADDON_TRANSLATION_29', 'addon');
    const domainUrl = payHref('ADDON_DOMAIN_SSL_49', 'addon');
    const cardsUrl = payHref('ADDON_EXTRA_CARDS_39', 'addon');
    const analyticsUrl = payHref('ADDON_ANALYTICS_29', 'addon');
    const socialUrl = payHref('ADDON_SOCIAL_35', 'addon');
    
    expect(translationUrl).toContain('test_addon_translation');
    expect(domainUrl).toContain('test_addon_domain');
    expect(cardsUrl).toContain('test_addon_cards');
    expect(analyticsUrl).toContain('test_addon_analytics');
    expect(socialUrl).toContain('test_addon_social');
  });
});

describe('openPaymentLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWindowOpen.mockClear();
  });

  it('should track analytics event when opening payment link', () => {
    openPaymentLink('STARTER_29', 'test-source');
    
    expect(Analytics.track).toHaveBeenCalledWith({
      event_name: 'payment_link_opened',
      event_category: 'commerce',
      event_label: 'STARTER_29',
      custom_parameters: { tier: 'STARTER_29', source: 'test-source' },
    });
  });

  it('should use default source "site" when not provided', () => {
    openPaymentLink('GROWTH_79');
    
    expect(Analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        custom_parameters: { tier: 'GROWTH_79', source: 'site' },
      })
    );
  });

  it('should open payment link in new tab', () => {
    openPaymentLink('PRO_149', 'checkout');
    
    expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    const [url, target] = mockWindowOpen.mock.calls[0];
    expect(target).toBe('_blank');
    expect(url).toContain('test_pro');
    expect(url).toContain('utm_campaign=checkout');
  });

  it('should call payHref with correct parameters', () => {
    openPaymentLink('FULL_297', 'pricing');
    
    expect(mockWindowOpen).toHaveBeenCalled();
    const [url] = mockWindowOpen.mock.calls[0];
    const parsedUrl = new URL(url);
    expect(parsedUrl.searchParams.get('utm_campaign')).toBe('pricing');
  });

  it('should handle analytics tier keys', () => {
    openPaymentLink('analytics.monthly_19', 'dashboard');
    
    expect(Analytics.track).toHaveBeenCalledWith(
      expect.objectContaining({
        event_label: 'analytics.monthly_19',
      })
    );
    expect(mockWindowOpen).toHaveBeenCalled();
    const [url] = mockWindowOpen.mock.calls[0];
    expect(url).toContain('test_analytics_monthly');
  });
});

describe('LEGACY_KEY_MAP', () => {
  it('should map legacy STARTER_49 to STARTER_29', () => {
    expect(LEGACY_KEY_MAP['STARTER_49']).toBe('STARTER_29');
  });

  it('should map legacy BASIC_497 to GROWTH_79', () => {
    expect(LEGACY_KEY_MAP['BASIC_497']).toBe('GROWTH_79');
  });

  it('should map legacy PRO_997 to PRO_149', () => {
    expect(LEGACY_KEY_MAP['PRO_997']).toBe('PRO_149');
  });

  it('should map legacy ULTIMATE_1997 to FULL_297', () => {
    expect(LEGACY_KEY_MAP['ULTIMATE_1997']).toBe('FULL_297');
  });
});


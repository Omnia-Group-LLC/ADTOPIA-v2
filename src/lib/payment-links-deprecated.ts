import type { PackageTier } from "@/types/ad-cards";

export interface PaymentLinkConfig {
  url: string;
  utmSource?: string;
  enabled: boolean;
}

// Stripe Payment Link configuration for main packages - DISABLED FOR TESTING
export const PAYMENT_LINKS: Record<PackageTier, PaymentLinkConfig> = {
  FILE_ONLY: {
    url: "https://buy.stripe.com/3cIdR8cq3ghHgIvaFNbfO06",
    utmSource: "adcards",
    enabled: false, // Disabled to prevent live charges
  },
  HOST_6M: {
    url: "https://buy.stripe.com/9B6aEWfCfc1rbobbJRbfO03",
    utmSource: "adcards",
    enabled: false, // Disabled to prevent live charges
  },
  HOST_12M: {
    url: "https://buy.stripe.com/9B64gy9dR9Tj8bZdRZbfO01",
    utmSource: "adcards",
    enabled: false, // Disabled to prevent live charges
  },
  LUCKY_SPA_EXCLUSIVE: {
    url: "https://buy.stripe.com/14A4gygGj6H71NB9BJbfO00",
    utmSource: "adcards",
    enabled: false, // Disabled to prevent live charges
  },
};

// Pick Your Price Payment Links - for MVP pricing model
export const PICK_YOUR_PRICE_LINKS: Record<string, PaymentLinkConfig> = {
  minimum: {
    url: "https://buy.stripe.com/placeholder-minimum-29", // Replace with actual Stripe link
    utmSource: "adcards",
    enabled: false, // Enable when ready with real links
  },
  standard: {
    url: "https://buy.stripe.com/placeholder-standard-79", // Replace with actual Stripe link  
    utmSource: "adcards",
    enabled: false, // Enable when ready with real links
  },
  supporter: {
    url: "https://buy.stripe.com/placeholder-supporter-149", // Replace with actual Stripe link
    utmSource: "adcards", 
    enabled: false, // Enable when ready with real links
  },
};

// Stripe Payment Link configuration for add-ons - DISABLED FOR TESTING
export const ADDON_PAYMENT_LINKS: Record<string, PaymentLinkConfig> = {
  "extra-translation": {
    url: "https://buy.stripe.com/7sY7sKdu73uV77V3dlbfO02",
    utmSource: "adcards",
    enabled: false, // Disabled to prevent live charges
  },
  "custom-domain": {
    url: "https://buy.stripe.com/cNi28q4XB2qR9g37tBbfO05",
    utmSource: "adcards",
    enabled: false, // Disabled to prevent live charges
  },
  "extra-cards": {
    url: "https://buy.stripe.com/3cI6oG0Hl1mN4ZN6pxbfO0g",
    utmSource: "adcards", 
    enabled: true, // Now available with real Stripe link
  },
  "premium-analytics": {
    url: "",
    enabled: false, // Coming soon
  },
  "social-media-pack": {
    url: "",
    enabled: false, // Coming soon
  },
};

export function buildPaymentUrl(tier: PackageTier, email?: string): string | null {
  const config = PAYMENT_LINKS[tier];
  if (!config.enabled || !config.url) {
    return null;
  }

  const url = new URL(config.url);
  
  // Add UTM parameters
  if (config.utmSource) {
    url.searchParams.set('utm_source', config.utmSource);
    url.searchParams.set('utm_medium', 'web');
    url.searchParams.set('utm_campaign', 'checkout');
  }
  
  // Prefill email if provided (Stripe will auto-fill customer email)
  if (email) {
    url.searchParams.set('prefilled_email', email);
  }
  
  return url.toString();
}

export function buildAddonPaymentUrl(addonId: string, email?: string): string | null {
  const config = ADDON_PAYMENT_LINKS[addonId];
  if (!config.enabled || !config.url) {
    return null;
  }

  const url = new URL(config.url);
  
  // Add UTM parameters
  if (config.utmSource) {
    url.searchParams.set('utm_source', config.utmSource);
    url.searchParams.set('utm_medium', 'web');
    url.searchParams.set('utm_campaign', 'addon');
  }
  
  // Prefill email if provided
  if (email) {
    url.searchParams.set('prefilled_email', email);
  }
  
  return url.toString();
}

export function isPaymentAvailable(tier: PackageTier): boolean {
  return PAYMENT_LINKS[tier].enabled;
}

export function isAddonPaymentAvailable(addonId: string): boolean {
  return ADDON_PAYMENT_LINKS[addonId]?.enabled || false;
}

export function buildPickYourPriceUrl(priceId: string, email?: string): string | null {
  const config = PICK_YOUR_PRICE_LINKS[priceId];
  if (!config.enabled || !config.url) {
    return null;
  }

  const url = new URL(config.url);
  
  // Add UTM parameters
  if (config.utmSource) {
    url.searchParams.set('utm_source', config.utmSource);
    url.searchParams.set('utm_medium', 'web');
    url.searchParams.set('utm_campaign', 'pick_your_price');
  }
  
  // Prefill email if provided
  if (email) {
    url.searchParams.set('prefilled_email', email); 
  }
  
  return url.toString();
}

export function isPickYourPriceAvailable(priceId: string): boolean {
  return PICK_YOUR_PRICE_LINKS[priceId]?.enabled || false;
}
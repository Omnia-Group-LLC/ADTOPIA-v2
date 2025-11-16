// LEGACY: This file is deprecated in favor of src/config/appConfig.ts
// All payment links are now managed through APP.PAY configuration
// This file is kept for reference only - DO NOT USE

import type { PackageTier } from "@/types/ad-cards";

export interface PaymentLinkConfig {
  url: string;
  utmSource?: string;
  enabled: boolean;
}

// DEPRECATED: Use APP.PAY from appConfig.ts instead
export const PAYMENT_LINKS: Record<PackageTier, PaymentLinkConfig> = {
  FILE_ONLY: {
    url: "",
    utmSource: "adcards",
    enabled: false, // DEPRECATED - Use APP.PAY.STARTER_29
  },
  HOST_6M: {
    url: "",
    utmSource: "adcards",
    enabled: false, // DEPRECATED - Use APP.PAY.GROWTH_79
  },
  HOST_12M: {
    url: "",
    utmSource: "adcards",
    enabled: false, // DEPRECATED - Use APP.PAY.PRO_149
  },
  LUCKY_SPA_EXCLUSIVE: {
    url: "",
    utmSource: "adcards",
    enabled: false, // DEPRECATED - Use APP.PAY.FULL_297
  },
};

// DEPRECATED: Use openPaymentLink from src/lib/utils/pay.ts instead
export function buildPaymentUrl(): null {
  console.warn('buildPaymentUrl is deprecated. Use openPaymentLink from src/lib/utils/pay.ts');
  return null;
}

export function isPaymentAvailable(): boolean {
  console.warn('isPaymentAvailable is deprecated. All payments use validated APP.PAY links');
  return false;
}
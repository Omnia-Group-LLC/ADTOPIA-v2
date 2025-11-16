import type { AdCard, ShortRecord } from "@/types/ad-cards";

// Compression utilities
function compressData(data: string): { compressed: string } {
  // Simple compression using repeated pattern replacement
  const compressed = data
    .replace(/"imageDataUrl"/g, '"i"')
    .replace(/"description"/g, '"d"')
    .replace(/"keywords"/g, '"k"')
    .replace(/"language"/g, '"l"')
    .replace(/"createdAt"/g, '"c"')
    .replace(/"title"/g, '"t"')
    .replace(/data:image\/[^;]+;base64,/g, '~');
  
  return { compressed };
}

function decompressData(compressed: string): string {
  return compressed
    .replace(/~/g, 'data:image/jpeg;base64,')
    .replace(/"i"/g, '"imageDataUrl"')
    .replace(/"d"/g, '"description"')
    .replace(/"k"/g, '"keywords"')
    .replace(/"l"/g, '"language"')
    .replace(/"c"/g, '"createdAt"')
    .replace(/"t"/g, '"title"');
}

// LocalStorage keys
export const LS_CARDS = "ad_mvp.cards.v1";
export const LS_SHORTS = "ad_mvp.shortlinks.v1";
export const LS_EMAIL = "ad_mvp.email.v1";
export const LS_GIFT = "ad_mvp.gift_claimed.v1";
export const LS_QR_CODES = "ad_mvp.qr_codes.v1";

// Card storage
export function loadCards(): AdCard[] {
  if (typeof window === 'undefined') return [];
  try { 
    return JSON.parse(localStorage.getItem(LS_CARDS) || "[]"); 
  } catch { 
    return []; 
  }
}

export function saveCards(cards: AdCard[]) {
  if (typeof window === 'undefined') return;
  try {
    const cardsToSave = cards.slice(-20); // Keep last 20 cards
    const dataToSave = JSON.stringify(cardsToSave);
    
    // Compress if data is large
    if (dataToSave.length > 100000) { // 100KB threshold
      const { compressed } = compressData(dataToSave);
      const compressedPayload = JSON.stringify({
        version: 'v2',
        compressed,
        timestamp: Date.now()
      });
      
      console.log(`Compressed cards data: ${dataToSave.length} → ${compressedPayload.length} bytes`);
      localStorage.setItem(LS_CARDS, compressedPayload);
    } else {
      localStorage.setItem(LS_CARDS, dataToSave);
    }
  } catch (error) {
    if (error instanceof DOMException && error.code === 22) {
      console.warn('LocalStorage quota exceeded, reducing data size');
      
      try {
        const limitedCards = cards.slice(-10);
        const limitedData = JSON.stringify(limitedCards);
        const { compressed } = compressData(limitedData);
        const payload = JSON.stringify({
          version: 'v2',
          compressed,
          timestamp: Date.now()
        });
        
        localStorage.setItem(LS_CARDS, payload);
      } catch (retryError) {
        console.error('Failed to save even with reduced data:', retryError);
      }
    } else {
      console.error('Failed to save cards:', error);
    }
  }
}

// Short link storage
export function loadShorts(): ShortRecord[] {
  if (typeof window === 'undefined') return [];
  try { 
    const data = localStorage.getItem(LS_SHORTS);
    return data ? JSON.parse(data) : [];
  } catch { 
    return []; 
  }
}

export function saveShorts(list: ShortRecord[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_SHORTS, JSON.stringify(list));
  } catch (error) {
    console.warn('Failed to save short links:', error);
  }
}

// Email storage
export function loadEmail(): string {
  if (typeof window === 'undefined') return "";
  try {
    return localStorage.getItem(LS_EMAIL) || "";
  } catch {
    return "";
  }
}

export function saveEmail(email: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_EMAIL, email);
  } catch (error) {
    console.warn('Failed to save email:', error);
  }
}

// Gift status storage
export function loadGiftStatus(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(LS_GIFT) === 'true';
  } catch {
    return false;
  }
}

export function saveGiftStatus(claimed: boolean) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_GIFT, claimed ? 'true' : 'false');
  } catch (error) {
    console.warn('Failed to save gift status:', error);
  }
}

// QR code storage
export function loadQRCodes(cardId: string): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const allQRs = JSON.parse(localStorage.getItem(LS_QR_CODES) || '{}');
    return allQRs[cardId] || {};
  } catch {
    return {};
  }
}

export function saveQRCodes(cardId: string, qrCodes: Record<string, string>) {
  if (typeof window === 'undefined') return;
  try {
    const allQRs = JSON.parse(localStorage.getItem(LS_QR_CODES) || '{}');
    allQRs[cardId] = qrCodes;
    localStorage.setItem(LS_QR_CODES, JSON.stringify(allQRs));
  } catch (error) {
    console.warn('Failed to save QR codes:', error);
  }
}

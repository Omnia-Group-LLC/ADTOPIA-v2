// Package sold status management
const PACKAGE_SOLD_KEY = 'ad_mvp.package_sold';

export function getPackageSoldStatus(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const stored = localStorage.getItem(PACKAGE_SOLD_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
}

export function setPackageSoldStatus(sold: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PACKAGE_SOLD_KEY, sold.toString());
  } catch {
    // Ignore localStorage errors
  }
}

export function isPackageSold(): boolean {
  return getPackageSoldStatus();
}
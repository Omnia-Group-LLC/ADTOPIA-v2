// src/lib/utils/ga.ts
export function gaEvent(name: string, params: Record<string, any> = {}) {
  // @ts-ignore
  if (window.gtag) window.gtag('event', name, params);
}
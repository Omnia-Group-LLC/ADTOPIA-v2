// src/lib/utils/url.ts
export const q = () => typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
export const qp = (k: string) => q().get(k) || undefined;
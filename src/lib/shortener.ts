import { customAlphabet } from 'nanoid';
import type { ShortRecord } from '@/types/ad-cards';
import { loadShorts, saveShorts } from './storage';

// Generate short, readable slugs
const nano = customAlphabet("123456789abcdefghjkmnpqrstuvwxyz", 7);

export const Shortener = {
  async create(target: string): Promise<ShortRecord> {
    const list = loadShorts();
    const slug = nano();
    const rec = { slug, target, createdAt: new Date().toISOString() };
    list.unshift(rec);
    saveShorts(list);
    return rec;
  },

  async list(): Promise<ShortRecord[]> {
    return loadShorts();
  }
};

// Production URL helper using validated domain
export function makeHostedUrl(base: string, cardId: string, variant: string) {
  return `${base}/landing/${variant.toLowerCase()}/${cardId}`;
}
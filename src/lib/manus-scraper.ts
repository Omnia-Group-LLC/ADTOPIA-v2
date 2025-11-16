/**
 * Manus Scraper - Custom scrapes for FB/Instagram ads
 * Tier 5: Cost-Efficient Utils
 * Fallback to Exa if Manus API unavailable
 */

import { Exa } from 'exa-js';

export interface ManusScrapeRequest {
  query: string;
  sources?: string[];
  maxResults?: number;
}

export interface ManusScrapeResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  timestamp: string;
}

/**
 * Scrape ads using Manus API
 */
export async function scrapeWithManus(
  request: ManusScrapeRequest
): Promise<ManusScrapeResult[]> {
  try {
    const response = await fetch('https://api.manus.ai/v1/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MANUS_API_KEY || process.env.VITE_MANUS_API_KEY || ''}`,
      },
      body: JSON.stringify({
        query: request.query,
        sources: request.sources || ['facebook', 'instagram'],
        maxResults: request.maxResults || 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`Manus API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.warn('Manus API unavailable, falling back to Exa:', error);
    return await scrapeWithExa(request);
  }
}

/**
 * Fallback to Exa if Manus unavailable
 */
async function scrapeWithExa(
  request: ManusScrapeRequest
): Promise<ManusScrapeResult[]> {
  try {
    const exa = new Exa({
      apiKey: process.env.EXA_API_KEY || process.env.VITE_EXA_API_KEY || '',
    });

    const results = await exa.search(request.query, {
      numResults: request.maxResults || 10,
      useSnippets: true,
      type: 'web',
    });

    return results.results.map((result: any) => ({
      title: result.title || '',
      url: result.url || '',
      snippet: result.snippet || '',
      source: 'exa',
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Exa fallback failed:', error);
    return [];
  }
}

/**
 * Scout.new proto integration for bento grid mocks
 */
export async function generateScoutMock(
  prompt: string,
  count: number = 60
): Promise<any> {
  try {
    const response = await fetch('https://api.scout.new/v1/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SCOUT_API_KEY || process.env.VITE_SCOUT_API_KEY || ''}`,
      },
      body: JSON.stringify({
        prompt,
        type: 'bento-grid',
        count,
      }),
    });

    if (!response.ok) {
      throw new Error(`Scout.new API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.warn('Scout.new API unavailable:', error);
    // Return mock data structure
    return {
      items: Array.from({ length: count }, (_, i) => ({
        id: `mock-${i}`,
        title: `Mock Item ${i + 1}`,
        description: prompt,
        type: 'bento-grid',
      })),
      fallback: true,
    };
  }
}

export default {
  scrapeWithManus,
  generateScoutMock,
};


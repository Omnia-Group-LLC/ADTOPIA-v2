import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAIAd } from '@modules/api/hooks/useAIAd';
import { supabase } from '@modules/api/supabase/client';
import React from 'react';

/**
 * useAIAd Hook Unit Tests
 * 
 * Tests:
 * - Zod validation for input (title, description required)
 * - Invoke 'generate-ai-ad' Edge Function
 * - FOMO prompt for pro tier ("Killer Deal! Limited time")
 * - Realtime subscription to activity_log
 * - Toast notifications (FOMO added, ad generated)
 * - Error handling
 * 
 * Quality: 100% coverage, mock OpenAI response, expect 'Killer Deal!' in copy
 */

// Mock Supabase client
vi.mock('@modules/api/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

// Mock useAuth hook
vi.mock('@modules/auth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'user-id' },
    role: 'pro',
    loading: false,
  })),
}));

// Mock useToast
const mockToast = vi.fn();
vi.mock('@modules/ui/components/use-toast', () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}));

describe('useAIAd Hook', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    vi.clearAllMocks();
    mockToast.mockClear();

    // Mock channel for realtime subscription
    const mockChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    };
    (supabase.channel as any).mockReturnValue(mockChannel);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should validate input with Zod (title and description required)', async () => {
    const { result } = renderHook(() => useAIAd({ title: '', description: '' }), { wrapper });

    await result.current.generateAd();

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Validation Error',
          variant: 'destructive',
        })
      );
    });
  });

  it('should invoke generate-ai-ad function with validated input', async () => {
    const { result } = renderHook(
      () =>
        useAIAd({
          title: 'Test Ad',
          description: 'Test description',
          tier: 'pro',
        }),
      { wrapper }
    );

    // Mock successful response
    (supabase.functions.invoke as any).mockResolvedValue({
      data: {
        success: true,
        ad_copy: 'Killer Deal! Limited time offer - Test Ad',
        metadata: {
          tokens: 150,
          fomo: true,
          tier: 'pro',
        },
      },
      error: null,
    });

    await result.current.generateAd();

    await waitFor(() => {
      expect(supabase.functions.invoke).toHaveBeenCalledWith('generate-ai-ad', {
        body: expect.objectContaining({
          title: 'Test Ad',
          description: 'Test description',
          tier: 'pro',
          userId: 'user-id',
        }),
      });
    });
  });

  it('should include FOMO text in ad copy for pro tier', async () => {
    const { result } = renderHook(
      () =>
        useAIAd({
          title: 'Test Ad',
          description: 'Test description',
          tier: 'pro',
        }),
      { wrapper }
    );

    // Mock response with FOMO
    (supabase.functions.invoke as any).mockResolvedValue({
      data: {
        success: true,
        ad_copy: 'Killer Deal! Limited time offer - Test Ad',
        metadata: {
          tokens: 150,
          fomo: true,
          tier: 'pro',
        },
      },
      error: null,
    });

    await result.current.generateAd();

    await waitFor(() => {
      expect(result.current.adCopy).toContain('Killer Deal!');
      expect(result.current.metadata?.fomo).toBe(true);
    });
  });

  it('should show FOMO toast notification for pro tier', async () => {
    const { result } = renderHook(
      () =>
        useAIAd({
          title: 'Test Ad',
          description: 'Test description',
          tier: 'pro',
        }),
      { wrapper }
    );

    (supabase.functions.invoke as any).mockResolvedValue({
      data: {
        success: true,
        ad_copy: 'Killer Deal! Limited time offer - Test Ad',
        metadata: {
          tokens: 150,
          fomo: true,
        },
      },
      error: null,
    });

    await result.current.generateAd();

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'FOMO Added!',
          description: 'Killer Deal! Limited time offer added to your ad',
        })
      );
    });
  });

  it('should subscribe to realtime activity_log updates', async () => {
    renderHook(
      () =>
        useAIAd({
          title: 'Test Ad',
          description: 'Test description',
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(supabase.channel).toHaveBeenCalledWith('ai-ad-updates');
    });
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(
      () =>
        useAIAd({
          title: 'Test Ad',
          description: 'Test description',
        }),
      { wrapper }
    );

    // Mock error response
    (supabase.functions.invoke as any).mockResolvedValue({
      data: null,
      error: { message: 'Failed to generate ad' },
    });

    await result.current.generateAd();

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Generation Failed',
          variant: 'destructive',
        })
      );
    });
  });

  it('should validate template_id as UUID if provided', async () => {
    const { result } = renderHook(
      () =>
        useAIAd({
          title: 'Test Ad',
          description: 'Test description',
          template_id: 'invalid-uuid',
        }),
      { wrapper }
    );

    await result.current.generateAd();

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Validation Error',
          variant: 'destructive',
        })
      );
    });
  });

  it('should set isGenerating state during generation', async () => {
    const { result } = renderHook(
      () =>
        useAIAd({
          title: 'Test Ad',
          description: 'Test description',
        }),
      { wrapper }
    );

    // Mock slow response
    (supabase.functions.invoke as any).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                data: {
                  success: true,
                  ad_copy: 'Test ad copy',
                  metadata: { tokens: 100 },
                },
                error: null,
              }),
            100
          )
        )
    );

    const generatePromise = result.current.generateAd();

    // Should be generating (check after a brief delay to allow state update)
    await waitFor(() => {
      expect(result.current.isGenerating).toBe(true);
    }, { timeout: 1000 });

    await generatePromise;

    // Should be done generating
    await waitFor(() => {
      expect(result.current.isGenerating).toBe(false);
    });
  });
});


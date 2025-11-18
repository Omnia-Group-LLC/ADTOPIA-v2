import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { supabase } from '../supabase/client';
import { useToast } from '@modules/ui/components/use-toast';
import { useAuth } from '@modules/auth';

/**
 * AI Ad Generation Input Schema
 */
const aiAdInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  style: z.string().optional(),
  category: z.string().optional(),
  tier: z.enum(['free', 'pro', 'enterprise']).optional().default('free'),
  template_id: z.string().uuid().optional(),
});

type AIAdInput = z.infer<typeof aiAdInputSchema>;

/**
 * AI Ad Generation Hook
 * 
 * Generates AI-powered ad copy with FOMO for pro tier
 * Subscribes to realtime activity_log updates
 * 
 * Features:
 * - Zod validation for input
 * - FOMO prompts for pro tier ("Killer Deal! Limited time")
 * - Realtime subscription to activity_log
 * - Error handling and loading states
 * 
 * @param options - Generation options (validated with Zod)
 * @returns Ad generation state and functions
 */
export function useAIAd(options?: Partial<AIAdInput>) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [adCopy, setAdCopy] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [metadata, setMetadata] = useState<{
    tokens?: number;
    fomo?: boolean;
  } | null>(null);

  /**
   * Generate AI ad with Zod validation
   */
  const generateAd = async () => {
    // Validate input with Zod
    const validationResult = aiAdInputSchema.safeParse(options);

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((e) => e.message).join(', ');
      toast({
        title: 'Validation Error',
        description: errors,
        variant: 'destructive',
      });
      return;
    }

    const validatedInput = validationResult.data;

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-ad', {
        body: {
          title: validatedInput.title,
          description: validatedInput.description,
          style: validatedInput.style,
          category: validatedInput.category,
          tier: validatedInput.tier,
          userId: user?.id,
          template_id: validatedInput.template_id,
        },
      });

      if (error) {
        throw error;
      }

      // Validate response
      if (!data?.ad_copy) {
        throw new Error('Invalid response from AI ad generation');
      }

      setAdCopy(data.ad_copy);
      setMetadata(data.metadata);

      // Show FOMO toast if applicable
      if (data.metadata?.fomo) {
        toast({
          title: 'FOMO Added!',
          description: 'Killer Deal! Limited time offer added to your ad',
        });
      } else {
        toast({
          title: 'Ad Generated',
          description: 'Your AI-powered ad is ready',
        });
      }
    } catch (error) {
      console.error('Error generating ad:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate ad',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Subscribe to realtime activity_log updates
   */
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('ai-ad-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_log',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const metadata = payload.new.metadata as {
            action?: string;
            fomo?: boolean;
          };
          if (metadata?.action === 'generate_ai_ad' && metadata?.fomo) {
            toast({
              title: 'FOMO Added!',
              description: 'Killer Deal! Limited time offer added to your ad',
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    adCopy,
    isGenerating,
    metadata,
    generateAd,
  };
}


import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import OpenAI from 'https://deno.land/x/openai@v4.20.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Generate AI Ad Request Schema
 */
interface GenerateAIAdRequest {
  title: string;
  description: string;
  style?: string;
  category?: string;
  tier?: 'free' | 'pro' | 'enterprise';
  userId?: string;
}

/**
 * Generate AI Ad Edge Function
 * 
 * Generates Craigslist-style ad copy with FOMO for pro tier
 * Logs to activity_log for realtime updates
 * 
 * Usage:
 * POST /functions/v1/generate-ai-ad
 * Body: { title, description, style?, category?, tier?, userId? }
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const {
      title,
      description,
      style = 'casual',
      category = 'general',
      tier = 'free',
      userId,
    }: GenerateAIAdRequest = await req.json();

    if (!title || !description) {
      return new Response(
        JSON.stringify({ error: 'title and description are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY'),
    });

    // Build prompt with FOMO for pro tier
    const fomoText = tier === 'pro' || tier === 'enterprise' 
      ? 'Killer Deal! Limited time offer - ' 
      : '';
    
    const prompt = `Generate a Craigslist-style ad for:
Title: ${title}
Description: ${description}
Style: ${style}
Category: ${category}
${fomoText ? `Add FOMO: "${fomoText}"` : ''}

Create engaging, concise ad copy (max 200 words) that:
- Highlights key features
- Uses casual, friendly tone
- Includes a clear call-to-action
${fomoText ? '- Emphasizes urgency and limited availability' : ''}`;

    // Generate ad copy
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at writing engaging Craigslist-style ads that convert.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const adCopy = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    const hasFOMO = tier === 'pro' || tier === 'enterprise' || adCopy.toLowerCase().includes('killer deal');

    // Log to activity_log for realtime updates
    if (userId) {
      await supabaseClient.from('activity_log').insert({
        user_id: userId,
        action: 'generate_ai_ad',
        metadata: {
          title,
          category,
          tier,
          tokens: tokensUsed,
          fomo: hasFOMO,
          ad_copy: adCopy,
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        ad_copy: adCopy,
        metadata: {
          tokens: tokensUsed,
          fomo: hasFOMO,
          tier,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating AI ad:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate ad' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


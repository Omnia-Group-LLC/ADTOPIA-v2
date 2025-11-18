import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AnalyticsEventType = 'view' | 'conversion' | 'click';

interface AnalyticsMetadata {
  source?: string;
  referrer?: string;
  device?: string;
  [key: string]: any;
}

interface TrackEventOptions {
  adId: string;
  eventType: AnalyticsEventType;
  metadata?: AnalyticsMetadata;
}

export function useAnalyticsTracker() {
  const trackEvent = useCallback(async ({ adId, eventType, metadata }: TrackEventOptions) => {
    if (!adId) {
      console.warn('Analytics: No ad ID provided');
      return;
    }

    try {
      // Call the edge function asynchronously (fire and forget)
      const { error } = await supabase.functions.invoke('track-analytics', {
        body: {
          ad_id: adId,
          event_type: eventType,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
          },
        },
      });

      if (error) {
        // Log error but don't throw - analytics shouldn't block user experience
        console.error('Analytics tracking error:', error);
      }
    } catch (error) {
      // Silently fail - analytics should never break the app
      console.error('Analytics tracking failed:', error);
    }
  }, []);

  const trackView = useCallback(
    (adId: string, metadata?: AnalyticsMetadata) => {
      return trackEvent({ adId, eventType: 'view', metadata });
    },
    [trackEvent]
  );

  const trackConversion = useCallback(
    (adId: string, metadata?: AnalyticsMetadata) => {
      return trackEvent({ adId, eventType: 'conversion', metadata });
    },
    [trackEvent]
  );

  const trackClick = useCallback(
    (adId: string, metadata?: AnalyticsMetadata) => {
      return trackEvent({ adId, eventType: 'click', metadata });
    },
    [trackEvent]
  );

  return {
    trackEvent,
    trackView,
    trackConversion,
    trackClick,
  };
}


import { useState, useEffect } from 'react';
import { supabase } from '@modules/api/supabase/client';
import { useAuth } from './useAuth';

export interface UserAccess {
  id: string;
  email: string;
  access_level: 'FREE' | 'STARTER' | 'GROWTH' | 'PRO' | 'FULL';
  features: Record<string, boolean>;
  usage_limits: Record<string, number>;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureCheck {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: boolean;
  usageLeft?: number;
  limit?: number;
}

export function useFeatureAccess() {
  const { user } = useAuth();
  const [userAccess, setUserAccess] = useState<UserAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserAccess();
    } else {
      setUserAccess(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserAccess = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        setUserAccess(null);
        return;
      }

      const { data, error } = await supabase
        .from('user_access')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setUserAccess(data as UserAccess);
      } else {
        // Default to FREE tier if no access record found
        setUserAccess({
          id: '',
          email: user?.email || '',
          access_level: 'FREE',
          features: {
            ad_generation: false,
            analytics_dashboard: false,
            competitive_analysis: false,
            a_b_testing: false,
            api_access: false
          },
          usage_limits: {
            ad_generations_per_month: 0,
            analytics_requests_per_month: 0
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error fetching user access:', error);
      // Default to FREE tier if no access record found
      setUserAccess({
        id: '',
        email: user?.email || '',
        access_level: 'FREE',
        features: {
          ad_generation: false,
          analytics_dashboard: false,
          competitive_analysis: false,
          a_b_testing: false,
          api_access: false
        },
        usage_limits: {
          ad_generations_per_month: 0,
          analytics_requests_per_month: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const checkFeatureAccess = (featureName: string): FeatureCheck => {
    if (!userAccess) {
      return {
        allowed: false,
        reason: 'User access not loaded',
        upgradeRequired: true
      };
    }

    // Check if feature is enabled for user's tier
    const hasFeature = userAccess.features[featureName];
    if (!hasFeature) {
      return {
        allowed: false,
        reason: `${featureName} not available in ${userAccess.access_level} tier`,
        upgradeRequired: true
      };
    }

    // Check usage limits if applicable
    const usageLimitKey = `${featureName}_per_month`;
    const limit = userAccess.usage_limits[usageLimitKey];
    
    if (limit && limit > 0) {
      // For now, assume unlimited if limit is -1
      if (limit === -1) {
        return { allowed: true };
      }
      // TODO: Check actual usage against limit
      // For now, allow if limit exists and is positive
      return { allowed: true };
    }

    return { allowed: true };
  };

  const getAccessLevelBenefits = (level: string) => {
    const benefits = {
      FREE: {
        name: 'Free',
        features: ['Basic ad templates'],
        limits: ['No ad generation', 'No analytics']
      },
      STARTER: {
        name: 'Starter',
        features: ['5 ad generations/month', 'Basic templates', 'Email support'],
        limits: ['No analytics dashboard', 'No A/B testing']
      },
      GROWTH: {
        name: 'Growth',
        features: ['25 ad generations/month', 'Analytics dashboard', '10 analytics requests/month', 'Priority support'],
        limits: ['No competitive analysis', 'No A/B testing']
      },
      PRO: {
        name: 'Pro',
        features: ['100 ad generations/month', 'Full analytics suite', 'Competitive analysis', 'A/B testing', '50 analytics requests/month'],
        limits: ['No API access']
      },
      FULL: {
        name: 'Enterprise',
        features: ['Unlimited ad generations', 'Full analytics suite', 'Competitive analysis', 'A/B testing', 'API access', 'White-label options'],
        limits: []
      }
    };

    return benefits[level as keyof typeof benefits] || benefits.FREE;
  };

  const canUpgrade = () => {
    if (!userAccess) return true;
    return userAccess.access_level !== 'FULL';
  };

  const getNextTier = () => {
    if (!userAccess) return 'STARTER';
    
    const tiers = ['FREE', 'STARTER', 'GROWTH', 'PRO', 'FULL'];
    const currentIndex = tiers.indexOf(userAccess.access_level);
    
    if (currentIndex < tiers.length - 1) {
      return tiers[currentIndex + 1];
    }
    
    return null;
  };

  const refreshAccess = async () => {
    await fetchUserAccess();
  };

  return {
    userAccess,
    loading,
    checkFeatureAccess,
    getAccessLevelBenefits,
    canUpgrade,
    getNextTier,
    refreshAccess
  };
}
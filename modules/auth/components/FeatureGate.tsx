import { ReactNode } from 'react';
import { useFeatureAccess, type FeatureCheck } from '../hooks/useFeatureAccess';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, Crown, Rocket } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FeatureGateProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback, 
  showUpgrade = true 
}: FeatureGateProps) {
  const { checkFeatureAccess, userAccess, getAccessLevelBenefits, getNextTier } = useFeatureAccess();
  const access = checkFeatureAccess(feature);
  
  if (access.allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgrade) {
    return null;
  }

  const nextTier = getNextTier();
  const nextTierBenefits = nextTier ? getAccessLevelBenefits(nextTier) : null;

  const handleUpgrade = () => {
    toast({
      title: "Upgrade Required",
      description: "Redirecting to upgrade options...",
    });
    window.location.href = '/pricing';
  };

  const getIcon = (tier?: string) => {
    switch (tier) {
      case 'STARTER': return <Zap className="w-5 h-5" />;
      case 'GROWTH': return <Rocket className="w-5 h-5" />;
      case 'PRO': return <Crown className="w-5 h-5" />;
      case 'FULL': return <Crown className="w-5 h-5" />;
      default: return <Lock className="w-5 h-5" />;
    }
  };

  return (
    <Card className="border-dashed border-2">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex items-center justify-center w-12 h-12 rounded-full bg-muted">
          {getIcon(nextTier)}
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <Lock className="w-4 h-4" />
          Feature Locked
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div>
          <p className="text-muted-foreground mb-2">{access.reason}</p>
          {userAccess && (
            <Badge variant="outline">
              Current: {userAccess.access_level}
            </Badge>
          )}
        </div>

        {nextTierBenefits && (
          <div className="text-left bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              {getIcon(nextTier)}
              Unlock with {nextTierBenefits.name}
            </h4>
            <ul className="text-sm space-y-1">
              {nextTierBenefits.features.slice(0, 3).map((benefit, index) => (
                <li key={index} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <Button onClick={handleUpgrade} className="w-full">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
          <p className="text-xs text-muted-foreground">
            30-day money-back guarantee
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

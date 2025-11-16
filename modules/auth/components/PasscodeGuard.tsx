// components/auth/PasscodeGuard.tsx - Passcode entry with container lookup
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@modules/api/supabase/client';
import { Loader2 } from 'lucide-react';

interface PasscodeGuardProps {
  initialPasscode?: string;
  onSuccess: (containerId: string) => void;
  onFallback?: () => void;
}

export function PasscodeGuard({ initialPasscode, onSuccess, onFallback }: PasscodeGuardProps) {
  const [passcode, setPasscode] = useState(initialPasscode || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);

  // Auto-submit if initialPasscode is provided
  useEffect(() => {
    if (initialPasscode && !isUnlocked && !isLoading && passcode.length >= 4) {
      handleSubmit(new Event('submit') as any);
    }
  }, [initialPasscode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passcode.length < 4) {
      setError('Passcode must be at least 4 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Look up container by passcode
      const { data: container, error: lookupError } = await supabase
        .from('containers')
        .select('id, is_active, is_public')
        .eq('passcode', passcode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (lookupError || !container) {
        // If not found, check if it's the PUBLIC passcode
        if (passcode.toUpperCase() === 'PUBLIC') {
          // Use the public container ID
          const publicContainerId = '00000000-0000-0000-0000-000000000000';
          setIsUnlocked(true);
          onSuccess(publicContainerId);
          return;
        }
        
        setError('Invalid passcode. Please try again or browse the public gallery.');
        setIsLoading(false);
        return;
      }

      // Success - container found
      setIsUnlocked(true);
      onSuccess(container.id);
    } catch (err) {
      console.error('Passcode lookup error:', err);
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-border bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-foreground text-center">
            Enter Your Access Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Enter passcode (e.g., PUBLIC)"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value.toUpperCase());
                  setError(null);
                }}
                disabled={isLoading}
                className="text-center text-lg font-mono uppercase"
                maxLength={20}
                autoFocus
              />
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || passcode.length < 4}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Access Gallery'
              )}
            </Button>

            {onFallback && (
              <Button
                type="button"
                variant="outline"
                onClick={onFallback}
                disabled={isLoading}
                className="w-full"
              >
                Browse Public Gallery
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

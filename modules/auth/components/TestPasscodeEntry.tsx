import { useState } from 'react';
import { supabase } from '@modules/api/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestPasscodeEntryProps {
  onSuccess: () => void;
}

export function TestPasscodeEntry({ onSuccess }: TestPasscodeEntryProps) {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Direct passcode check for testing - bypass auth requirement
      if (passcode === 'MANUS2025') {
        toast({
          title: 'Access Granted',
          description: 'Test admin access granted',
        });
        
        setTimeout(() => {
          onSuccess();
        }, 500);
      } else {
        setError('Invalid passcode');
        setLoading(false);
      }
    } catch (err) {
      console.error('Passcode verification error:', err);
      setError(err instanceof Error ? err.message : 'Failed to verify passcode');
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle>Test Access</CardTitle>
          <CardDescription>
            Enter the test passcode to gain temporary admin access for 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter test passcode"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                disabled={loading}
                className="text-center text-lg tracking-widest"
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !passcode}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Grant Access'
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <p>Enter MANUS2025 to access admin panel</p>
              <p className="mt-1">Testing mode - no authentication required</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

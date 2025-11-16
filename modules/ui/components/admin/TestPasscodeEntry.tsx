import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@modules/api/supabase/client";
import { Button } from "./button";
import { Input } from "./input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Alert, AlertDescription } from "../alert";
import { Loader2, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function TestPasscodeEntry() {
  const [passcode, setPasscode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Check if user is authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // User not authenticated, trigger sign in
        setError("Please sign in first to use the test passcode");
        setIsLoading(false);
        
        // Redirect to login
        toast({
          title: "Authentication Required",
          description: "Please sign in to access admin features",
          variant: "default",
        });
        
        navigate("/login?redirect=/admin");
        return;
      }

      // Call verify-test-passcode Edge Function
      const { data, error: functionError } = await supabase.functions.invoke(
        "verify-test-passcode",
        {
          body: { passcode: passcode.toUpperCase().trim() },
        }
      );

      if (functionError) {
        throw functionError;
      }

      if (!data.success) {
        setError(data.error || "Invalid passcode");
        setIsLoading(false);
        return;
      }

      // Success!
      setSuccess(true);
      
      // Save to LocalStorage for persistence
      if (data.expiresAt) {
        const { setAdminAccess } = await import('@modules/core/utils/adminAccess');
        setAdminAccess(data.expiresAt);
      }
      
      toast({
        title: "Admin Access Granted! 🎉",
        description: `Access granted for 24 hours until ${new Date(data.expiresAt).toLocaleString()}`,
        variant: "default",
      });

      // Refresh the page to update admin status
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error("Error verifying passcode:", err);
      setError(err.message || "Failed to verify passcode");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
            <CardTitle>Access Granted!</CardTitle>
          </div>
          <CardDescription>
            Admin access has been granted for 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Refreshing page to load admin features...
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-6 w-6 text-primary" />
          <CardTitle>Test Passcode Access</CardTitle>
        </div>
        <CardDescription>
          Enter the test passcode to gain 24-hour admin access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter passcode (e.g., MANUS2025)"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              disabled={isLoading}
              className="text-center text-lg tracking-wider uppercase"
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !passcode.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Verify Passcode
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>This passcode grants temporary admin access for testing purposes.</p>
            <p>Access will automatically expire after 24 hours.</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}


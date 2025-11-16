import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestPasscodeEntry } from '@/components/ui/admin/TestPasscodeEntry';
import { hasAdminAccess } from '@modules/core/utils/adminAccess';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [showPasscodeEntry, setShowPasscodeEntry] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // Check LocalStorage on mount
  useEffect(() => {
    const checkAccess = () => {
      const access = hasAdminAccess();
      setHasAccess(access);
      setShowPasscodeEntry(!access);
      setLoading(false);
    };

    checkAccess();
  }, []);

  const handlePasscodeSuccess = () => {
    setShowPasscodeEntry(false);
    setHasAccess(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (showPasscodeEntry && !hasAccess) {
    return <TestPasscodeEntry onSuccess={handlePasscodeSuccess} />;
  }

  return <>{children}</>;
}

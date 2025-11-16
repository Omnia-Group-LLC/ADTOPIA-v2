// Auth Page - Login/Registration
import React, { useState } from 'react';
import { useAuth } from '@modules/auth';
import { AuthModal } from '@modules/auth/components';
import { Button } from '@modules/ui';

export function AuthPage() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  if (user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Welcome, {user.email}!</h1>
        <p>You are logged in.</p>
        <Button onClick={logout}>Logout</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Sign In to AdTopia</h1>
      <Button onClick={() => setShowAuthModal(true)}>Sign In</Button>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}


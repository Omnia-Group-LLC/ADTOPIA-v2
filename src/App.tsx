// POC: Minimal App to test auth module
import React from 'react';
import { AuthProvider, useAuth } from '@modules/auth';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading auth...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>AdTopia v2 - Auth Module POC</h1>
      <p style={{ color: '#666' }}>✅ React is rendering!</p>
      <p style={{ color: '#666' }}>✅ AuthProvider is working!</p>
      <p style={{ color: '#666' }}>
        {user ? `Logged in as: ${user.email}` : 'Not logged in'}
      </p>
      <button 
        onClick={() => alert('Button works!')}
        style={{ padding: '10px 20px', marginTop: '20px', cursor: 'pointer' }}
      >
        Test Button
      </button>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;

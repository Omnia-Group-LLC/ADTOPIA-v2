// AdTopia v2 Main App Component
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@modules/auth';
import { Button } from '@modules/ui';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>AdTopia v2</h1>
      <p style={{ color: '#666' }}>✅ React Router working!</p>
      <p style={{ color: '#666' }}>
        {user ? `Logged in as: ${user.email}` : 'Not logged in'}
      </p>
      <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/auth">
          <Button>Go to Auth</Button>
        </Link>
        <Link to="/dashboard">
          <Button>Go to Dashboard</Button>
        </Link>
        <Link to="/gallery">
          <Button>Go to Gallery</Button>
        </Link>
      </div>
    </div>
  );
}

export default App;

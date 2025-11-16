// Dashboard Page - Admin/Analytics stub
import React from 'react';
import { useAuth } from '@modules/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@modules/ui';

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.email || 'Guest'}</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Analytics dashboard coming soon...</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Admin panel coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


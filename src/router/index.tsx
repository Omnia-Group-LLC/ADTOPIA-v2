// React Router setup for ADTOPIA-v2
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from '@modules/auth';
import { ProtectedRoute } from '@modules/auth/components';
import { AuthPage, DashboardPage, GalleryPage } from '../pages';
import App from '../App';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/gallery',
    element: <GalleryPage />,
  },
  {
    path: '/gallery/:id',
    element: <GalleryPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export function Router() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}


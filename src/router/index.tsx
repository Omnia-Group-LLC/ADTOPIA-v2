// React Router setup for ADTOPIA-v2
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@modules/auth';
import { ProtectedRoute } from '@modules/auth/components';
import { AuthPage, DashboardPage, GalleryPage, GalleryDetail } from '../pages';
import { BatchOptimize } from '../pages/Admin/BatchOptimize';
import App from '../App';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

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
    element: <GalleryDetail />,
  },
  {
    path: '/admin/batch-optimize',
    element: (
      <ProtectedRoute>
        <BatchOptimize />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export function Router() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}


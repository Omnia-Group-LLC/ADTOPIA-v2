// React Router setup for ADTOPIA-v2
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';

// Placeholder routes - will be expanded as modules migrate
export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/auth',
    element: <App />, // Will be replaced with AuthPage component
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}


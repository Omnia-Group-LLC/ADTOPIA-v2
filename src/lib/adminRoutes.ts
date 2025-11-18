import {
  Home,
  LayoutDashboard,
  Users,
  Settings,
  Shield,
  BarChart3,
  FileText,
  Image,
  QrCode,
} from 'lucide-react';
import type { UserRole } from '@/types';

export interface AdminRoute {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  section: 'public' | 'user' | 'admin' | 'super_admin';
  requiredRole: UserRole | 'public';
}

export const adminRoutes: AdminRoute[] = [
  // Public routes
  {
    path: '/',
    label: 'Home',
    icon: Home,
    section: 'public',
    requiredRole: 'public',
  },
  {
    path: '/gallery',
    label: 'Gallery',
    icon: Image,
    section: 'public',
    requiredRole: 'public',
  },
  // User routes
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    section: 'user',
    requiredRole: 'user',
  },
  {
    path: '/my-ads',
    label: 'My Ads',
    icon: FileText,
    section: 'user',
    requiredRole: 'user',
  },
  // Admin routes
  {
    path: '/admin/users',
    label: 'Users',
    icon: Users,
    section: 'admin',
    requiredRole: 'admin',
  },
  {
    path: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    section: 'admin',
    requiredRole: 'admin',
  },
  {
    path: '/admin/settings',
    label: 'Settings',
    icon: Settings,
    section: 'admin',
    requiredRole: 'admin',
  },
  // Super admin routes
  {
    path: '/admin/system',
    label: 'System',
    icon: Shield,
    section: 'super_admin',
    requiredRole: 'super_admin',
  },
];


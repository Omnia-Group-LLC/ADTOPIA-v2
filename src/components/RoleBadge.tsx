import { UserRole } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Shield, Star, Edit, User } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  showIcon?: boolean;
}

const roleConfig: Record<UserRole, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Shield; className: string }> = {
  super_admin: {
    label: 'Super Admin',
    variant: 'destructive',
    icon: Star,
    className: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0',
  },
  admin: {
    label: 'Admin',
    variant: 'default',
    icon: Shield,
    className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0',
  },
  editor: {
    label: 'Editor',
    variant: 'secondary',
    icon: Edit,
    className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0',
  },
  user: {
    label: 'User',
    variant: 'outline',
    icon: User,
    className: 'border-muted-foreground/20 text-muted-foreground',
  },
  enterprise: {
    label: 'Enterprise',
    variant: 'default',
    icon: Shield,
    className: 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-0',
  },
};

/**
 * RoleBadge - Visual indicator for user roles
 * @component
 */
export const RoleBadge = ({ role, showIcon = true }: RoleBadgeProps) => {
  const config = roleConfig[role];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={config.className}>
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
};


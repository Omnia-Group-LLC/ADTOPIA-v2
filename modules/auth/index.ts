// Auth Module Barrel Exports
export { AuthProvider, useAuth, type AuthContextType } from './AuthContext';
export { useAuth as useAuthHook } from './hooks/useAuth';
export { useFeatureAccess, type UserAccess, type FeatureCheck } from './hooks/useFeatureAccess';
export { AuthService, type AuthResult } from './services/AuthService';
export * from './components';
export * from './middleware/routeProtection';
// Re-export User type from core for convenience
export type { User } from '@modules/core/types';

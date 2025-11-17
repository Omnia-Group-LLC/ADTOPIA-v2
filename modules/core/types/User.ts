// Shared User type - consolidated from auth/api modules
export interface User {
  id: string;
  email: string;
  name: string;
  tenant_id: string;
  mfa_enabled: boolean;
  email_verified: boolean;
  created_at: string;
}



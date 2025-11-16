import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@modules/core/types';

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

export interface InviteCode {
  id: string;
  code: string;
  tenant_id: string;
  email: string;
  expires_at: string;
  used_at?: string;
}

export class AuthService {
  private supabase;
  private jwtSecret: string;
  private resendApiKey: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    this.jwtSecret = process.env.JWT_SECRET || 'fallback-secret';
    this.resendApiKey = process.env.RESEND_API_KEY!;
  }

  /**
   * Hash password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  generateToken(payload: { userId: string; tenantId: string }): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '24h' });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): { userId: string; tenantId: string } | null {
    try {
      return jwt.verify(token, this.jwtSecret) as { userId: string; tenantId: string };
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate unique invite code
   */
  generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }

  /**
   * Create invite code for tenant
   */
  async createInviteCode(
    tenantId: string,
    email: string,
    createdBy: string
  ): Promise<{ success: boolean; code?: string; message?: string }> {
    try {
      const code = this.generateInviteCode();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const { data, error } = await this.supabase
        .from('auth.invite_codes')
        .insert({
          code,
          tenant_id: tenantId,
          created_by: createdBy,
          email,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, message: 'Failed to create invite code' };
      }

      // Send email via Resend
      await this.sendInviteEmail(email, code);

      return { success: true, code };
    } catch (error) {
      return { success: false, message: 'Failed to create invite code' };
    }
  }

  /**
   * Validate invite code
   */
  async validateInviteCode(code: string): Promise<{
    isValid: boolean;
    tenantId?: string;
    message?: string;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('auth.invite_codes')
        .select('*')
        .eq('code', code)
        .single();

      if (error || !data) {
        return { isValid: false, message: 'Invalid invite code' };
      }

      const now = new Date();
      const expiresAt = new Date(data.expires_at);

      if (expiresAt < now || data.used_at) {
        return { isValid: false, message: 'Invite code expired or already used' };
      }

      return { isValid: true, tenantId: data.tenant_id };
    } catch (error) {
      return { isValid: false, message: 'Failed to validate invite code' };
    }
  }

  /**
   * Register user with invite code
   */
  async registerUser(
    inviteCode: string,
    email: string,
    password: string,
    name: string
  ): Promise<AuthResult> {
    try {
      // Validate invite code
      const inviteValidation = await this.validateInviteCode(inviteCode);
      if (!inviteValidation.isValid) {
        return { success: false, message: inviteValidation.message };
      }

      // Check if user already exists
      const { data: existingUser } = await this.supabase
        .from('auth.users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return { success: false, message: 'User already exists' };
      }

      // Hash password
      const passwordHash = await this.hashPassword(password);

      // Create user
      const { data: user, error: userError } = await this.supabase
        .from('auth.users')
        .insert({
          email,
          password_hash: passwordHash,
          tenant_id: inviteValidation.tenantId,
          name
        })
        .select()
        .single();

      if (userError) {
        return { success: false, message: 'Failed to create user' };
      }

      // Mark invite as used
      await this.supabase
        .from('auth.invite_codes')
        .update({ used_at: new Date().toISOString() })
        .eq('code', inviteCode);

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        tenantId: user.tenant_id
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tenant_id: user.tenant_id,
          mfa_enabled: user.mfa_enabled,
          email_verified: user.email_verified,
          created_at: user.created_at
        },
        token
      };
    } catch (error) {
      return { success: false, message: 'Registration failed' };
    }
  }

  /**
   * Login user
   */
  async loginUser(email: string, password: string): Promise<AuthResult> {
    try {
      // Get user by email
      const { data: user, error } = await this.supabase
        .from('auth.users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return { success: false, message: 'Invalid credentials' };
      }

      // Update last login
      await this.supabase
        .from('auth.users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      // Generate JWT token
      const token = this.generateToken({
        userId: user.id,
        tenantId: user.tenant_id
      });

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tenant_id: user.tenant_id,
          mfa_enabled: user.mfa_enabled,
          email_verified: user.email_verified,
          created_at: user.created_at
        },
        token
      };
    } catch (error) {
      return { success: false, message: 'Login failed' };
    }
  }

  /**
   * Send invite email via Resend
   */
  private async sendInviteEmail(email: string, code: string): Promise<void> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'AdTopia <noreply@adtopia.com>',
          to: [email],
          subject: 'Invitation to AdTopia',
          html: `
            <h2>You're invited to AdTopia!</h2>
            <p>Use this invite code to create your account:</p>
            <h3 style="background: #f0f0f0; padding: 20px; text-align: center; font-family: monospace; letter-spacing: 2px;">${code}</h3>
            <p>This code expires in 7 days.</p>
            <p>Visit <a href="https://adtopia.com/register">https://adtopia.com/register</a> to get started.</p>
          `
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Failed to send invite email:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data: user, error } = await this.supabase
        .from('auth.users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        tenant_id: user.tenant_id,
        mfa_enabled: user.mfa_enabled,
        email_verified: user.email_verified,
        created_at: user.created_at
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; message?: string }> {
    try {
      const { error } = await this.supabase
        .from('auth.users')
        .update(updates)
        .eq('id', userId);

      if (error) {
        return { success: false, message: 'Failed to update user' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to update user' };
    }
  }
}

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from '../AuthService';
import { createClient } from '@supabase/supabase-js';

// Mock the createClient function
vi.mock('@supabase/supabase-js', () => {
  // Track builders by table name so from() returns same builder for same table
  const buildersByTable: Record<string, any> = {};
  
  const createQueryBuilder = (tableName?: string) => {
    const key = tableName || 'default';
    if (!buildersByTable[key]) {
      buildersByTable[key] = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
        then: vi.fn((callback) => {
          const result = { data: [], error: null };
          if (callback && typeof callback === 'function') {
            return Promise.resolve(result).then(callback);
          }
          return Promise.resolve(result);
        }),
      };
    }
    return buildersByTable[key];
  };

  const mockSupabase = {
    from: vi.fn((tableName?: string) => createQueryBuilder(tableName)),
    rpc: vi.fn(() => Promise.resolve({ data: null, error: null })),
    // Expose method to clear builders between tests
    _clearBuilders: () => {
      Object.keys(buildersByTable).forEach(key => delete buildersByTable[key]);
    },
  };

  return {
    createClient: vi.fn(() => mockSupabase),
  };
});

// Mock fetch for Resend API
global.fetch = vi.fn();

describe('AuthService', () => {
  let authService: AuthService;
  let mockSupabase: any;

  beforeEach(() => {
    // Get the mocked client - this is the same instance AuthService will use
    mockSupabase = createClient('test-url', 'test-key');
    // Clear builders between tests to ensure isolation
    if (mockSupabase._clearBuilders) {
      mockSupabase._clearBuilders();
    }
    // Create AuthService AFTER we have the mocked client
    // AuthService constructor will call createClient and get the same mock instance
    authService = new AuthService();
    // Clear mocks
    vi.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPassword123';
      const hash = await authService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await authService.hashPassword(password);
      const hash2 = await authService.hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123';
      const hash = await authService.hashPassword(password);
      const isValid = await authService.verifyPassword('WrongPassword', hash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const payload = { userId: '123', tenantId: '456' };
      const token = authService.generateToken(payload);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate different tokens for different payloads', () => {
      const payload1 = { userId: '123', tenantId: '456' };
      const payload2 = { userId: '789', tenantId: '456' };
      
      const token1 = authService.generateToken(payload1);
      const token2 = authService.generateToken(payload2);
      
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const payload = { userId: '123', tenantId: '456' };
      const token = authService.generateToken(payload);
      const decoded = authService.verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe('123');
      expect(decoded?.tenantId).toBe('456');
    });

    it('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      const decoded = authService.verifyToken(invalidToken);
      
      expect(decoded).toBeNull();
    });
  });

  describe('generateInviteCode', () => {
    it('should generate unique invite codes', () => {
      const code1 = authService.generateInviteCode();
      const code2 = authService.generateInviteCode();
      
      expect(code1).toBeDefined();
      expect(code2).toBeDefined();
      expect(code1).not.toBe(code2);
      expect(code1.length).toBe(8);
      expect(code2.length).toBe(8);
    });
  });

  describe('createInviteCode', () => {
    it('should create invite code successfully', async () => {
      const mockInsert = {
        data: { id: '1', code: 'ABC12345' },
        error: null
      };
      
      // Mock the query chain
      const queryChain = mockSupabase.from('auth.invite_codes');
      const insertChain = queryChain.insert({});
      const selectChain = insertChain.select();
      vi.mocked(selectChain.single).mockResolvedValue(mockInsert);
      
      // Mock fetch for Resend API
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ id: 'email-123' })
      });

      const result = await authService.createInviteCode('tenant-123', 'test@example.com', 'user-123');
      
      expect(result.success).toBe(true);
      expect(result.code).toBeDefined();
      expect(result.code?.length).toBe(8);
    });

    it('should handle database errors', async () => {
      const mockInsert = {
        data: null,
        error: { message: 'Database error' }
      };
      
      // Mock the query chain with error
      const queryChain = mockSupabase.from('auth.invite_codes');
      queryChain.single = vi.fn().mockResolvedValue(mockInsert);

      const result = await authService.createInviteCode('tenant-123', 'test@example.com', 'user-123');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to create invite code');
    });
  });

  describe('validateInviteCode', () => {
    it('should validate valid invite code', async () => {
      const mockSelect = {
        data: {
          id: '1',
          code: 'ABC12345',
          tenant_id: 'tenant-123',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          used_at: null
        },
        error: null
      };
      
      // Mock the query chain - AuthService calls: this.supabase.from('auth.invite_codes').select('*').eq('code', code).single()
      // The key is that from() must return the SAME builder instance for the same table name
      // So we get the builder first and set up the mock before AuthService uses it
      const queryChain = mockSupabase.from('auth.invite_codes');
      queryChain.single = vi.fn().mockResolvedValue(mockSelect);

      const result = await authService.validateInviteCode('ABC12345');
      
      expect(result.isValid).toBe(true);
      expect(result.tenantId).toBe('tenant-123');
    });

    it('should reject expired invite code', async () => {
      const mockSelect = {
        data: {
          id: '1',
          code: 'ABC12345',
          tenant_id: 'tenant-123',
          expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          used_at: null
        },
        error: null
      };
      
      // Mock the query chain - directly set the mock implementation
      const queryChain = mockSupabase.from('auth.invite_codes');
      queryChain.single = vi.fn().mockResolvedValue(mockSelect);

      const result = await authService.validateInviteCode('ABC12345');
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invite code expired or already used');
    });

    it('should reject used invite code', async () => {
      const mockSelect = {
        data: {
          id: '1',
          code: 'ABC12345',
          tenant_id: 'tenant-123',
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          used_at: new Date().toISOString()
        },
        error: null
      };
      
      // Mock the query chain
      const queryChain = mockSupabase.from('auth.invite_codes');
      vi.mocked(queryChain.single).mockResolvedValue(mockSelect);

      const result = await authService.validateInviteCode('ABC12345');
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invite code expired or already used');
    });

    it('should reject invalid invite code', async () => {
      const mockSelect = {
        data: null,
        error: { message: 'Not found' }
      };
      
      // Mock the query chain with error
      const queryChain = mockSupabase.from('auth.invite_codes');
      vi.mocked(queryChain.single).mockResolvedValue(mockSelect);

      const result = await authService.validateInviteCode('INVALID');
      
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Invalid invite code');
    });
  });

  describe('registerUser', () => {
    it('should register user successfully', async () => {
      const mockInviteValidation = {
        isValid: true,
        tenantId: 'tenant-123'
      };
      
      const mockUserInsert = {
        data: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
          tenant_id: 'tenant-123',
          mfa_enabled: false,
          email_verified: false,
          created_at: new Date().toISOString()
        },
        error: null
      };
      
      // Mock validateInviteCode
      vi.spyOn(authService, 'validateInviteCode').mockResolvedValue(mockInviteValidation);
      
      // Mock user operations - AuthService makes TWO calls:
      // 1. Check if user exists: .from('auth.users').select('id').eq('email', ...).single()
      // 2. Create user: .from('auth.users').insert({}).select().single()
      const userBuilder = mockSupabase.from('auth.users');
      let singleCallCount = 0;
      userBuilder.single = vi.fn(() => {
        singleCallCount++;
        if (singleCallCount === 1) {
          // First call: check if user exists (should return null - user doesn't exist)
          return Promise.resolve({ data: null, error: null });
        } else {
          // Second call: create user (should return the new user)
          return Promise.resolve(mockUserInsert);
        }
      });
      
      // Mock invite update - AuthService calls: .from('auth.invite_codes').update({}).eq('code', ...)
      // The update() method needs to return a builder with eq() that returns a promise
      // Since we're using the same builder instance (cached by table name), we need to override update
      const inviteBuilder = mockSupabase.from('auth.invite_codes');
      // Create a new update chain builder
      const updateBuilder = {
        eq: vi.fn().mockResolvedValue({ error: null })
      };
      inviteBuilder.update = vi.fn().mockReturnValue(updateBuilder);

      const result = await authService.registerUser('ABC12345', 'test@example.com', 'password123', 'Test User');
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should reject registration with invalid invite code', async () => {
      const mockInviteValidation = {
        isValid: false,
        message: 'Invalid invite code'
      };
      
      vi.spyOn(authService, 'validateInviteCode').mockResolvedValue(mockInviteValidation);

      const result = await authService.registerUser('INVALID', 'test@example.com', 'password123', 'Test User');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid invite code');
    });

    it('should reject registration for existing user', async () => {
      const mockInviteValidation = {
        isValid: true,
        tenantId: 'tenant-123'
      };
      
      const mockExistingUser = {
        data: { id: 'existing-user' },
        error: null
      };
      
      vi.spyOn(authService, 'validateInviteCode').mockResolvedValue(mockInviteValidation);
      
      // Mock existing user check - AuthService calls: .from('auth.users').select('id').eq('email', ...).single()
      const userBuilder = mockSupabase.from('auth.users');
      userBuilder.single = vi.fn().mockResolvedValue(mockExistingUser);

      const result = await authService.registerUser('ABC12345', 'test@example.com', 'password123', 'Test User');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('User already exists');
    });
  });

  describe('loginUser', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        data: {
          id: 'user-123',
          email: 'test@example.com',
          password_hash: 'hashed-password',
          name: 'Test User',
          tenant_id: 'tenant-123',
          mfa_enabled: false,
          email_verified: false,
          created_at: new Date().toISOString()
        },
        error: null
      };
      
      // Mock user lookup - AuthService calls: .from('auth.users').select('*').eq('email', ...).single()
      const userBuilder = mockSupabase.from('auth.users');
      userBuilder.single = vi.fn().mockResolvedValue(mockUser);
      
      // Mock last login update - AuthService calls: .from('auth.users').update({}).eq('id', ...)
      // The update().eq() chain needs to return a promise
      userBuilder.update = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      });
      
      // Mock password verification
      vi.spyOn(authService, 'verifyPassword').mockResolvedValue(true);

      const result = await authService.loginUser('test@example.com', 'password123');
      
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
    });

    it('should reject login with invalid credentials', async () => {
      const mockUser = {
        data: null,
        error: { message: 'Not found' }
      };
      
      mockSupabase.from().select().eq().single.mockResolvedValue(mockUser);

      const result = await authService.loginUser('test@example.com', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });

    it('should reject login with wrong password', async () => {
      const mockUser = {
        data: {
          id: 'user-123',
          email: 'test@example.com',
          password_hash: 'hashed-password',
          name: 'Test User',
          tenant_id: 'tenant-123',
          mfa_enabled: false,
          email_verified: false,
          created_at: new Date().toISOString()
        },
        error: null
      };
      
      mockSupabase.from().select().eq().single.mockResolvedValue(mockUser);
      
      // Mock password verification failure
      vi.spyOn(authService, 'verifyPassword').mockResolvedValue(false);

      const result = await authService.loginUser('test@example.com', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });
  });
});

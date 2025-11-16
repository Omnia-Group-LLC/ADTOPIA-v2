
// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('PasscodeGuard', () => {
  const mockOnSuccess = vi.fn();
  const mockOnFallback = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

    await waitFor(() => {
      expect(mockOnFallback).toHaveBeenCalled();
    });
  });


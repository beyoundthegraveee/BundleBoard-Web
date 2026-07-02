import React from 'react';
import { render, screen, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSession } from 'next-auth/react';
import { createClient } from '@supabase/supabase-js';
import { SupabaseProvider, useSupabase } from './SupabaseProvider';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('SupabaseProvider', () => {
  const mockUseSession = useSession as jest.Mock;
  const mockCreateClient = createClient as jest.Mock;
  const mockSupabaseClient = { auth: {} }; 

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockReturnValue(mockSupabaseClient);
  });

  it('renders children correctly', () => {
    mockUseSession.mockReturnValue({ data: null });

    render(
      <SupabaseProvider>
        <div data-testid="child-element">Test Content</div>
      </SupabaseProvider>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('initializes Supabase client WITHOUT auth header if no supabaseToken is present', () => {
    mockUseSession.mockReturnValue({ data: { user: { name: 'Test' } } }); 

    render(
      <SupabaseProvider>
        <div>Test</div>
      </SupabaseProvider>
    );

    expect(mockCreateClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      expect.objectContaining({
        global: { headers: {} }, 
        auth: { persistSession: false, autoRefreshToken: false },
      })
    );
  });

  it('initializes Supabase client WITH auth header if supabaseToken is present', () => {
    const fakeToken = 'fake-jwt-token-123';
    mockUseSession.mockReturnValue({ 
      data: { supabaseToken: fakeToken } 
    });

    render(
      <SupabaseProvider>
        <div>Test</div>
      </SupabaseProvider>
    );

    expect(mockCreateClient).toHaveBeenCalledWith(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      expect.objectContaining({
        global: { 
          headers: { Authorization: `Bearer ${fakeToken}` } 
        },
      })
    );
  });

  describe('useSupabase Hook', () => {
    it('returns the supabase client when used within SupabaseProvider', () => {
      mockUseSession.mockReturnValue({ data: null });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SupabaseProvider>{children}</SupabaseProvider>
      );

      const { result } = renderHook(() => useSupabase(), { wrapper });

      expect(result.current).toBe(mockSupabaseClient);
    });

    it('throws an error when used outside of SupabaseProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useSupabase());
      }).toThrow('useSupabase must be used within a SupabaseProvider');

      consoleSpy.mockRestore();
    });
  });
});
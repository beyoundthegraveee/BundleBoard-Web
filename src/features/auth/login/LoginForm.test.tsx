import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import '@testing-library/jest-dom';
import { LoginForm } from './LoginForm';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('LoginForm Component', () => {
  const mockPush = jest.fn();
  const mockRefresh = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush, refresh: mockRefresh });
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
  });

  it('submits successfully with correct credentials', async () => {
    const user = userEvent.setup();
    (signIn as jest.Mock).mockResolvedValue({ error: null });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/Username or Email/i), 'testuser');
    await user.type(screen.getByLabelText(/Password/i), 'password12345');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', expect.objectContaining({
        identifier: 'testuser',
        password: 'password12345',
      }));
      expect(toast.success).toHaveBeenCalledWith('Authorization successful');
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('shows error toast on invalid credentials', async () => {
    const user = userEvent.setup();
    (signIn as jest.Mock).mockResolvedValue({ error: 'CredentialsSignin' });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/Username or Email/i), 'wronguser');
    await user.type(screen.getByLabelText(/Password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials or password');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it('validates minimum length for username and password', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/Username or Email/i), 'ab');
    await user.type(screen.getByLabelText(/Password/i), '123');
    await user.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(await screen.findByText(/Username must be at least 3 characters/i)).toBeInTheDocument();
    expect(await screen.findByText(/Min length is 12/i)).toBeInTheDocument();
  });
});
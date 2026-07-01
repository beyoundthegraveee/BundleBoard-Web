import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import '@testing-library/jest-dom';
import { RegisterForm } from './RegisterForm';

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/components/terms/TermsDialog', () => {
  return {
    __esModule: true,
    default: ({ trigger }: { trigger: React.ReactNode }) => <>{trigger}</>,
  };
});

describe('RegisterForm Component', () => {
  const mockPush = jest.fn();
  const mockExecuteRegister = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useMutation as jest.Mock).mockReturnValue([mockExecuteRegister, { loading: false }]);
    (useSession as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
  });

  it('submits successfully with valid fields and accepted terms', async () => {
    const user = userEvent.setup();
    mockExecuteRegister.mockResolvedValue({ data: { register: { error: null } } });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/^Username$/i), 'newuser');
    await user.type(screen.getByLabelText(/^Email$/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'Password123!!');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'Password123!!');
    await user.click(screen.getByRole('checkbox', { name: /remember session identity|i agree to the/i }));
    await user.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(mockExecuteRegister).toHaveBeenCalledWith({
        variables: {
          input: {
            username: 'newuser',
            email: 'newuser@example.com',
            password: 'Password123!!',
            role: 'client',
          },
        },
      });
      expect(toast.success).toHaveBeenCalledWith('Identity registered. Proceeding to setup...');
      expect(mockPush).toHaveBeenCalledWith(`/select-role?email=${encodeURIComponent('newuser@example.com')}`);
    });
  });

  it('shows validation errors for invalid data formats', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    await user.click(screen.getByRole('checkbox'));

    await user.type(screen.getByLabelText(/^Username$/i), 'ab');
    await user.type(screen.getByLabelText(/^Password$/i), 'short');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'differentPassword');

    await user.click(screen.getByRole('button', { name: /Sign Up/i }));

    expect(await screen.findByText(/Min length is 3/i)).toBeInTheDocument();
    expect(await screen.findByText(/Min length is 12/i)).toBeInTheDocument();
    expect(await screen.findByText(/Passwords do not match/i)).toBeInTheDocument();
  });

  it('keeps submit button disabled if terms are not accepted', async () => {
    render(<RegisterForm />);

    const signUpButton = screen.getByRole('button', { name: /Sign Up/i });
    
    expect(signUpButton).toBeDisabled();
  });

  it('handles server side error when email is already taken', async () => {
    const user = userEvent.setup();
    
    mockExecuteRegister.mockResolvedValue({
      data: { register: { error: 'This email is already registered' } },
    });

    render(<RegisterForm />);

    await user.type(screen.getByLabelText(/^Username$/i), 'existinguser');
    await user.type(screen.getByLabelText(/^Email$/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^Password$/i), 'Password123!!');
    await user.type(screen.getByLabelText(/Confirm Password/i), 'Password123!!');
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Account already exists with this email.');
      expect(screen.getByText(/This email is already registered/i)).toBeInTheDocument();
    });
  });

  it('calls next-auth signIn when Google button is clicked', async () => {
    const user = userEvent.setup();
    render(<RegisterForm />);

    const googleButton = screen.getByRole('button', { name: /Continue with Google/i });
    await user.click(googleButton);

    expect(signIn).toHaveBeenCalledWith('google');
  });

  it('redirects new Google users via useEffect when session status becomes authenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({
      data: { isNewUser: true, user: { email: 'googleuser@example.com' } },
      status: 'authenticated',
    });

    render(<RegisterForm />);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Google account linked successfully!');
      expect(mockPush).toHaveBeenCalledWith(`/select-role?email=${encodeURIComponent('googleuser@example.com')}`);
    });
  });
});
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import '@testing-library/jest-dom';

import { RoleSelection } from './RoleSelection';
import { UpdateUserRoleDocument } from '@/graphql/generated';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockEmail = 'test@example.com';

const successClientMock = {
  request: {
    query: UpdateUserRoleDocument,
    variables: {
      input: { email: mockEmail, role: 'client' },
    },
  },
  result: {
    data: {
      updateUserRole: {
        success: true,
        message: null,
      },
    },
  },
};

const successAuthorMock = {
  request: {
    query: UpdateUserRoleDocument,
    variables: {
      input: { email: mockEmail, role: 'author' },
    },
  },
  result: {
    data: {
      updateUserRole: {
        success: true,
        message: null,
      },
    },
  },
};

const errorMock = {
  request: {
    query: UpdateUserRoleDocument,
    variables: {
      input: { email: mockEmail, role: 'client' },
    },
  },
  result: {
    data: {
      updateUserRole: {
        success: false,
        message: 'Configuration failed',
      },
    },
  },
};

describe('RoleSelection Component', () => {
  const mockPush = jest.fn();
  const mockUpdateSession = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
  });

  it('renders correctly and button is initially disabled', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });

    render(
      <MockedProvider mocks={[]}>
        <RoleSelection email={mockEmail} />
      </MockedProvider>
    );

    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();

    const confirmButton = screen.getByRole('button', { name: /Confirm Identity/i });
    expect(confirmButton).toBeDisabled();
  });

  it('enables the confirm button when a role is selected', async () => {
    const user = userEvent.setup();
    (useSession as jest.Mock).mockReturnValue({ data: null });

    render(
      <MockedProvider mocks={[]}>
        <RoleSelection email={mockEmail} />
      </MockedProvider>
    );

    const clientCard = screen.getByText('Client');
    const confirmButton = screen.getByRole('button', { name: /Confirm Identity/i });

    await user.click(clientCard);

    expect(confirmButton).toBeEnabled();
  });

  it('handles UNAUTHENTICATED flow successfully (Email registration)', async () => {
    const user = userEvent.setup();
    (useSession as jest.Mock).mockReturnValue({ data: null });

    render(
      <MockedProvider mocks={[successClientMock]}>
        <RoleSelection email={mockEmail} />
      </MockedProvider>
    );

    await user.click(screen.getByText('Client'));
    await user.click(screen.getByRole('button', { name: /Confirm Identity/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Identity configured. Please check your email to verify account.');
      expect(mockPush).toHaveBeenCalledWith(`/mail/verify-email?email=${encodeURIComponent(mockEmail)}`);
    });
  });

  it('handles AUTHENTICATED flow successfully (OAuth registration)', async () => {
    const user = userEvent.setup();
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { email: mockEmail } },
      update: mockUpdateSession,
    });

    render(
      <MockedProvider mocks={[successAuthorMock]}>
        <RoleSelection email={mockEmail} />
      </MockedProvider>
    );

    await user.click(screen.getByText('Author'));
    await user.click(screen.getByRole('button', { name: /Confirm Identity/i }));

    await waitFor(() => {
      expect(mockUpdateSession).toHaveBeenCalledWith(
        expect.objectContaining({
          isNewUser: false,
          roles: ['client', 'author'],
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Profile setup complete!');
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('displays an error toast when the mutation fails', async () => {
    const user = userEvent.setup();
    (useSession as jest.Mock).mockReturnValue({ data: null });

    render(
      <MockedProvider mocks={[errorMock]}>
        <RoleSelection email={mockEmail} />
      </MockedProvider>
    );

    await user.click(screen.getByText('Client'));
    await user.click(screen.getByRole('button', { name: /Confirm Identity/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Configuration failed');
      expect(mockPush).not.toHaveBeenCalled();
    });
  });
});
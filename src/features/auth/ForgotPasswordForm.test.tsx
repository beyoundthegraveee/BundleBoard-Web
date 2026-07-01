import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing/react';
import '@testing-library/jest-dom';

import { ForgotPasswordForm } from './ForgotPasswordForm';
import { RequestPasswordResetDocument } from '@/graphql/generated';

jest.mock('next/navigation', () => require('next-router-mock'));

const successMock = {
  request: {
    query: RequestPasswordResetDocument,
    variables: {
      input: { email: 'test@example.com' },
    },
  },
  result: {
    data: {
      requestPasswordReset: {
        success: true,
        message: null,
      },
    },
  },
};

describe('ForgotPasswordForm Component', () => {
  it('renders the initial form elements correctly', () => {
    render(
      <MockedProvider mocks={[successMock]}>
        <ForgotPasswordForm />
      </MockedProvider>
    );
    
    expect(screen.getByText('Reset Password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
  });

  it('displays a validation error when submitting an empty email', async () => {
    const user = userEvent.setup();
    render(
      <MockedProvider mocks={[successMock]}>
        <ForgotPasswordForm />
      </MockedProvider>
    );

    const submitButton = screen.getByRole('button', { name: /Request Reset Link/i });
    
    await user.click(submitButton);

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
  });

  it('submits the form successfully and displays the success message', async () => {
    const user = userEvent.setup();
    render(
      <MockedProvider mocks={[successMock]}>
        <ForgotPasswordForm />
      </MockedProvider>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    const submitButton = screen.getByRole('button', { name: /Request Reset Link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);
    expect(await screen.findByText('Reset Link Sent To Email')).toBeInTheDocument();
  });
});
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthSessionProvider } from './SessionProvider';
import { SessionProvider } from 'next-auth/react';

jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-session-provider">{children}</div>
  ),
}));

describe('AuthSessionProvider', () => {
  it('renders children correctly inside SessionProvider', () => {
    render(
      <AuthSessionProvider>
        <span data-testid="child-element">Test Content</span>
      </AuthSessionProvider>
    );

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();

    expect(screen.getByTestId('mock-session-provider')).toBeInTheDocument();
  });
});
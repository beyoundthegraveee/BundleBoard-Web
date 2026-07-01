import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SplashProvider } from './SplashProvider';

jest.mock('@/components/splash/SplashScreen', () => ({
  __esModule: true,
  default: ({ onAnimationComplete }: { onAnimationComplete: () => void }) => (
    <div data-testid="splash-screen" onClick={onAnimationComplete} />
  ),
}));

describe('SplashProvider', () => {
  const CHILD_TEXT = 'Protected Content';

  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
  });

  test('shows splash screen for new users (session storage empty)', async () => {
    render(
      <SplashProvider>
        <div>{CHILD_TEXT}</div>
      </SplashProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('splash-screen')).toBeInTheDocument();
    });

    expect(screen.queryByText(CHILD_TEXT)).not.toBeInTheDocument();
  });

  test('skips splash screen for returning users', async () => {
    sessionStorage.setItem('platform_splash_executed', 'true');

    render(
      <SplashProvider>
        <div>{CHILD_TEXT}</div>
      </SplashProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(CHILD_TEXT)).toBeInTheDocument();
    });

    expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
  });

  test('renders children after splash animation completes', async () => {
    render(
      <SplashProvider>
        <div>{CHILD_TEXT}</div>
      </SplashProvider>
    );

    const splash = await screen.findByTestId('splash-screen');
    expect(splash).toBeInTheDocument();

    fireEvent.click(splash);

    await waitFor(() => {
      expect(screen.queryByTestId('splash-screen')).not.toBeInTheDocument();
      expect(screen.getByText(CHILD_TEXT)).toBeInTheDocument();
    });

    expect(sessionStorage.getItem('platform_splash_executed')).toBe('true');
  });
});
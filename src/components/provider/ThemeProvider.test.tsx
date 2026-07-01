import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider } from './ThemeProvider';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

jest.mock('next-themes', () => ({
  ThemeProvider: ({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) => (
    <div data-testid="mock-theme-provider" {...props}>
      {children}
    </div>
  ),
}));

describe('ThemeProvider', () => {
  it('renders children correctly', () => {
    render(
      <ThemeProvider>
        <div data-testid="child">Test Content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('passes props to NextThemesProvider', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system">
        <div>Content</div>
      </ThemeProvider>
    );

    const provider = screen.getByTestId('mock-theme-provider');
    
    expect(provider).toBeInTheDocument();
    expect(provider).toHaveAttribute('attribute', 'class');
  });
});
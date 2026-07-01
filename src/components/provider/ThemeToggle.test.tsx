import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from 'next-themes';

jest.mock('next-themes');

describe('ThemeToggle Component', () => {
  const mockSetTheme = jest.fn();
  
  const mockedUseTheme = useTheme as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme });
  });

  test('renders placeholder before mounting', () => {
    render(<ThemeToggle />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('renders button after mounting and displays correct icon', async () => {
    render(<ThemeToggle />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Toggle Theme/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  test('calls setTheme with "dark" when clicking in light mode', async () => {
    mockedUseTheme.mockReturnValue({ theme: 'light', setTheme: mockSetTheme });
    
    render(<ThemeToggle />);
    
    const button = await screen.findByRole('button', { name: /Toggle Theme/i });
    fireEvent.click(button);
    
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  test('calls setTheme with "light" when clicking in dark mode', async () => {
    mockedUseTheme.mockReturnValue({ theme: 'dark', setTheme: mockSetTheme });
    
    render(<ThemeToggle />);
    
    const button = await screen.findByRole('button', { name: /Toggle Theme/i });
    fireEvent.click(button);
    
    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });
});
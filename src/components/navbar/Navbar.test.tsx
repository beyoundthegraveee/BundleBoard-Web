import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from '@apollo/client/react';
import { useAuthActions } from '@/lib/useAuthActions';
import { Navbar } from './Navbar';

jest.mock('next-auth/react');
jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));
jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));
jest.mock('@/lib/useAuthActions', () => ({
  useAuthActions: jest.fn(),
}));

jest.mock('../search/SearchOverlay', () => ({
  SearchOverlay: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="mock-search-overlay"><button onClick={onClose}>Close Search</button></div> : null,
}));

jest.mock('./components/CartDrawer', () => ({
  CartDrawer: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => 
    isOpen ? <div data-testid="mock-cart-drawer"><button onClick={onClose}>Close Cart</button></div> : null,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      fill?: boolean;
      unoptimized?: boolean;
      priority?: boolean;
    }
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, unoptimized, priority, alt, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt={alt || 'mock-image'} />;
  },
}));

describe('Navbar Component', () => {
  const mockSetTheme = jest.fn();
  const mockTerminateSession = jest.fn();
  const mockRouterPush = jest.fn();

  beforeAll(() => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    (useTheme as unknown as jest.Mock).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    });
    
    (useAuthActions as unknown as jest.Mock).mockReturnValue({
      terminateSession: mockTerminateSession,
    });

    (useRouter as unknown as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (usePathname as unknown as jest.Mock).mockReturnValue('/');
  });

  test('renders Sign In link when user is unauthenticated', () => {
    (useSession as unknown as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    (useQuery as unknown as jest.Mock).mockReturnValue({ data: null });

    render(<Navbar />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.queryByLabelText('Active Session')).not.toBeInTheDocument();
  });

  test('loads cart count from localStorage on mount', async () => {
    (useSession as unknown as jest.Mock).mockReturnValue({ data: null, status: 'unauthenticated' });
    (useQuery as unknown as jest.Mock).mockReturnValue({ data: null });

    localStorage.setItem('bundleboard_cart', JSON.stringify([{ id: 1 }, { id: 2 }, { id: 3 }]));

    render(<Navbar />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
});
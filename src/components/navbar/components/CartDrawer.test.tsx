import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartDrawer } from './CartDrawer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';

// --- Моки внешних зависимостей ---
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('@apollo/client/react', () => ({
  useMutation: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

// Мок для Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, unoptimized, ...props }: any) => <img {...props} />,
}));

// --- Тестовые данные ---
const mockCartItems = [
  {
    id: 'item-1',
    name: 'Cyberpunk City Pack',
    price: 49.99,
    category: '3D Models',
    previewImage: '/cyberpunk.png',
    ownerId: 'user-2',
  },
  {
    id: 'item-2',
    name: 'Basic Material Node',
    price: 0,
    category: 'Materials',
    previewImage: '/material.png',
    ownerId: 'user-3',
  },
];

const mockSession = {
  user: {
    id: 'user-1',
    name: 'Test User',
  },
};

describe('CartDrawer Component', () => {
  const mockOnClose = jest.fn();
  const mockRouterPush = jest.fn();
  const mockExecuteCreateCheckout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    (useRouter as jest.Mock).mockReturnValue({ push: mockRouterPush });
    (useSession as jest.Mock).mockReturnValue({ data: mockSession });
    (useMutation as jest.Mock).mockReturnValue([
      mockExecuteCreateCheckout,
      { loading: false }
    ]);
  });

  test('does not render when isOpen is false', () => {
    render(<CartDrawer isOpen={false} onClose={mockOnClose} />);
    expect(screen.queryByText('Your Cart')).not.toBeInTheDocument();
  });

  test('renders empty cart placeholder when localStorage is empty', () => {
    render(<CartDrawer isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Your Cart')).toBeInTheDocument();
    expect(screen.getByText('Your shopping cart is empty')).toBeInTheDocument();
    expect(screen.getByText('USD $0.00')).toBeInTheDocument(); 
  });

  test('loads and renders items from localStorage correctly', () => {
    localStorage.setItem('bundleboard_cart', JSON.stringify(mockCartItems));
    
    render(<CartDrawer isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('Cyberpunk City Pack')).toBeInTheDocument();
    expect(screen.getByText('Basic Material Node')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    
    const freeLabels = screen.getAllByText('FREE'); 
    expect(freeLabels.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('USD $49.99')).toBeInTheDocument();
  });

  test('removes an item when trash icon is clicked', () => {
    localStorage.setItem('bundleboard_cart', JSON.stringify(mockCartItems));
    
    render(<CartDrawer isOpen={true} onClose={mockOnClose} />);
    
    const removeButtons = screen.getAllByRole('button', { name: /Remove item/i });
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByText('Cyberpunk City Pack')).not.toBeInTheDocument();
    
    const updatedCart = JSON.parse(localStorage.getItem('bundleboard_cart') || '[]');
    expect(updatedCart).toHaveLength(1);
    expect(updatedCart[0].id).toBe('item-2');
  });

  test('shows error toast when trying to checkout unauthenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
    localStorage.setItem('bundleboard_cart', JSON.stringify(mockCartItems));
    
    render(<CartDrawer isOpen={true} onClose={mockOnClose} />);
    
    const checkoutBtn = screen.getByRole('button', { name: /Proceed to Checkout/i });
    fireEvent.click(checkoutBtn);

    expect(toast.error).toHaveBeenCalledWith('Please sign in to proceed.');
    expect(mockExecuteCreateCheckout).not.toHaveBeenCalled();
  });

  test('calls executeCreateCheckout and redirects via router on successful checkout', async () => {
    localStorage.setItem('bundleboard_cart', JSON.stringify(mockCartItems));
    
    const mockRelativeUrl = '/checkout/test-session';
    
    mockExecuteCreateCheckout.mockResolvedValueOnce({
      data: { createCheckoutSession: mockRelativeUrl }
    });

    render(<CartDrawer isOpen={true} onClose={mockOnClose} />);
    
    const checkoutBtn = screen.getByRole('button', { name: /Proceed to Checkout/i });
    fireEvent.click(checkoutBtn);

    await waitFor(() => {
      expect(mockExecuteCreateCheckout).toHaveBeenCalledWith({
        variables: {
          input: {
            userId: 'user-1',
            currency: 'USD',
            collectionIds: ['item-1', 'item-2']
          }
        }
      });
    });

    await waitFor(() => {
      expect(localStorage.getItem('bundleboard_cart')).toBeNull();
      expect(mockRouterPush).toHaveBeenCalledWith(mockRelativeUrl);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
import { render, screen, act } from '@testing-library/react';
import { CollectionGrid } from './CollectionGrid';
import { useQuery } from '@apollo/client/react';
import { useSession } from 'next-auth/react';

// Mock dependencies
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

// Mock child components to isolate CollectionGrid
jest.mock('./BatchGrid', () => ({
  BatchGrid: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="batch-grid">{children}</div>
  ),
}));

jest.mock('./item/CollectionItem', () => ({
  CollectionItem: () => <div data-testid="collection-item" />,
}));

// Safely cast hooks to jest.Mock without using 'any'
const mockedUseQuery = useQuery as unknown as jest.Mock;
const mockedUseSession = useSession as unknown as jest.Mock;

describe('CollectionGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default session state
    mockedUseSession.mockReturnValue({ status: 'authenticated' });
  });

  it('renders loading state when query is loading', () => {
    mockedUseQuery.mockReturnValue({ loading: true, data: null, error: null });
    
    render(<CollectionGrid />);
    
    expect(screen.getByText(/Syncing active registry.../i)).toBeInTheDocument();
  });

  it('renders error state when query fails', () => {
    mockedUseQuery.mockReturnValue({ 
      loading: false, 
      data: null, 
      error: { message: 'Network Error' } 
    });
    
    render(<CollectionGrid />);
    
    expect(screen.getByText(/Registry connection error:/i)).toBeInTheDocument();
    expect(screen.getByText(/Network Error/i)).toBeInTheDocument();
  });

  it('renders the grid when data is loaded', async () => {
    const mockCollections = [
      { id: '1', name: 'Item 1', description: 'Desc 1', price: 10, author: { username: 'user1', totalSales: 0 }, galleryImages: [] },
      { id: '2', name: 'Item 2', description: 'Desc 2', price: 20, author: { username: 'user2', totalSales: 0 }, galleryImages: [] },
    ];

    mockedUseQuery.mockReturnValue({
      loading: false,
      error: null,
      data: { getAllCollections: mockCollections },
    });

    render(<CollectionGrid />);

    // Wait for useEffect to finish shuffling
    await act(async () => {
      // Small tick to allow the state update (shuffling) to happen
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const items = screen.getAllByTestId('collection-item');
    expect(items).toHaveLength(2);
    expect(screen.getByTestId('batch-grid')).toBeInTheDocument();
  });
});
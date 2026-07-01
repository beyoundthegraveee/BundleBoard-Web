import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SortCollectionGrid } from './SortCollectionGrid';
import { useQuery } from '@apollo/client/react';

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

jest.mock('./BatchGrid', () => ({
  BatchGrid: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="batch-grid">{children}</div>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt || ''} />
  ),
}));

const mockedUseQuery = useQuery as unknown as jest.Mock;

describe('SortCollectionGrid', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders collections and handles pagination correctly', async () => {
    const mockData = {
      getSortedCollections: Array.from({ length: 12 }, (_, i) => ({
        id: `${i}`,
        name: `Item ${i}`,
        price: 10,
        galleryImages: [],
        description: 'Test',
        author: { username: 'testuser' }
      }))
    };

    mockedUseQuery.mockReturnValue({
      loading: false,
      data: mockData,
      error: null
    });

    render(<SortCollectionGrid sortBy="date" mimeTypes={[]} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    
    expect(nextButton).not.toBeDisabled();
    
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockedUseQuery).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          variables: expect.objectContaining({ page: 1 })
        })
      );
    });
  });
});
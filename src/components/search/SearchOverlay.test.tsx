import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useQuery, useLazyQuery } from '@apollo/client/react';
import { SearchOverlay } from './SearchOverlay';


jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
  useLazyQuery: jest.fn(),
}));

jest.mock('framer-motion', () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    div: ({ initial, animate, exit, variants, ...props }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => (
      <div {...props} />
    ),
  },
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

const mockLatestCollections = [
  { id: '1', name: 'Latest Cyberpack', price: 0, galleryImages: [] },
  { id: '2', name: 'Latest Fonts', price: 15.5, galleryImages: [] },
];

const mockSearchResults = [
  { id: '3', name: 'Found Neon Textures', price: 10.0, galleryImages: [] },
];

describe('SearchOverlay Component', () => {
  const mockOnClose = jest.fn();
  const mockExecuteSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useLazyQuery as jest.Mock).mockReturnValue([
      mockExecuteSearch,
      { loading: false, data: { searchCollections: mockSearchResults } },
    ]);

    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      data: { getLatestCollections: mockLatestCollections },
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(<SearchOverlay isOpen={false} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders "New Arrivals" and latest collections initially', () => {
    render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);

    expect(screen.getByText('New Arrivals')).toBeInTheDocument();
    expect(screen.getByText('Latest Cyberpack')).toBeInTheDocument();
    expect(screen.getByText('FREE')).toBeInTheDocument();
    expect(screen.getByText('Latest Fonts')).toBeInTheDocument();
  });

  test('triggers search and renders "Live Results" when typing > 2 characters', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    
    render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);

    const input = screen.getByPlaceholderText('Querying BundleBoard...');

    await user.type(input, 'Neon');

    act(() => {
      jest.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(mockExecuteSearch).toHaveBeenCalledWith({
        variables: { query: 'Neon', page: 0, size: 6 },
      });
    });

    expect(screen.getByText('Live Results')).toBeInTheDocument();
    expect(screen.getByText('Found Neon Textures')).toBeInTheDocument();
    
    expect(screen.queryByText('New Arrivals')).not.toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchOverlay isOpen={true} onClose={mockOnClose} />);
    const closeButtons = screen.getAllByRole('button');
    
    await user.click(closeButtons[0]);

    expect(mockOnClose).toHaveBeenCalled();
  });
});
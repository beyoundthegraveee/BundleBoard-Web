import React from 'react';
import { render, screen } from '@testing-library/react';
import { useQuery } from '@apollo/client/react';
import { HighestRatedCarousel } from './HighestRatedCarousel';

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      fill?: boolean;
      unoptimized?: boolean;
      priority?: boolean;
      sizes?: string;
    }
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, unoptimized, priority, sizes, alt, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt={alt || 'mock-image'} />;
  },
}));

jest.mock('@/components/ui/3d-card', () => ({
  CardContainer: ({ children, className }: { children: React.ReactNode; className?: string; containerClassName?: string }) => (
    <div data-testid="card-container" className={className}>{children}</div>
  ),
  CardBody: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-body" className={className}>{children}</div>
  ),
  CardItem: ({ children, className }: { children: React.ReactNode; className?: string; translateZ?: string | number }) => (
    <div data-testid="card-item" className={className}>{children}</div>
  ),
}));

const mockCollection1 = {
  id: 'col-1',
  name: 'Cyberpunk Asset',
  description: 'High quality 3d models',
  price: 0,
  likesCount: 150,
  isLiked: true,
  author: { username: 'NeonCreator' },
  galleryImages: [{ filePath: 'https://cdn.example.com/img1.webp' }],
};

const mockCollection2 = {
  id: 'col-2',
  name: 'Vintage Textures',
  description: 'Old paper textures',
  price: 15.99,
  likesCount: 45,
  isLiked: false,
  author: { username: 'RetroDesigner' },
  galleryImages: [],
};

describe('HighestRatedCarousel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state correctly', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: true,
      data: undefined,
      error: undefined,
    });

    render(<HighestRatedCarousel />);
    expect(screen.getByText('Compiling trending materials...')).toBeInTheDocument();
  });

  test('renders error/empty state when no collections are returned', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      data: { getTopLikedCollections: [] },
      error: undefined,
    });

    render(<HighestRatedCarousel />);
    expect(screen.getByText('[SYSTEM]: No collections available yet.')).toBeInTheDocument();
  });

  test('renders error/empty state when GraphQL throws an error', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      data: undefined,
      error: new Error('Network failure'),
    });

    render(<HighestRatedCarousel />);
    expect(screen.getByText('[SYSTEM]: No collections available yet.')).toBeInTheDocument();
  });

  test('renders static layout when there are less than 4 items', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      data: { getTopLikedCollections: [mockCollection1, mockCollection2] },
      error: undefined,
    });

    const { container } = render(<HighestRatedCarousel />);

    expect(screen.getByText('Cyberpunk Asset')).toBeInTheDocument();
    expect(screen.getByText('Vintage Textures')).toBeInTheDocument();
    
    expect(screen.getByText('Free')).toBeInTheDocument();
    
    expect(container.querySelector('.animate-marquee')).not.toBeInTheDocument();
  });

  test('renders marquee layout when there are 4 or more items', () => {
    const fourItems = [
      mockCollection1, 
      mockCollection2, 
      { ...mockCollection1, id: 'col-3' }, 
      { ...mockCollection2, id: 'col-4' }
    ];

    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      data: { getTopLikedCollections: fourItems },
      error: undefined,
    });

    const { container } = render(<HighestRatedCarousel />);

    expect(container.querySelector('.animate-marquee')).toBeInTheDocument();
    
    const duplicateElements = screen.getAllByText('Cyberpunk Asset');
    expect(duplicateElements.length).toBe(4);
  });
});
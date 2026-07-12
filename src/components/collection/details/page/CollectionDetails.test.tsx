import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import CollectionDetails from './CollectionDetails';
import { GetCollectionBySlugQuery } from '@/graphql/generated';

type CollectionType = NonNullable<GetCollectionBySlugQuery['getCollectionBySlug']>;

const createMockCollection = (overrides: Partial<CollectionType> = {}): CollectionType => ({
  id: 'col-123',
  name: 'Cyberpunk Asset',
  description: 'Detailed description',
  price: 19.99,
  likesCount: 5,
  isLiked: false,
  externalLink: null,
  author: {
    id: 'auth-13',
    userId: 'user-17', 
    username: 'cyber_creator',
    __typename: 'AuthorResponse'
  },
  galleryImages: [{ filePath: 'img1.jpg', __typename: 'GalleryImage' }],
  mediaResource: { 
    mimeType: 'image/png', fileName: 'test.png', fileSize: 1024, provider: 'supabase', __typename: 'MediaResource' 
  },
  __typename: 'Collection',
  ...overrides,
} as unknown as CollectionType);

jest.mock('@/components/ui/3d-card', () => ({
  CardContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardItem: ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
    <div onClick={onClick} role="button" aria-hidden="true">{children}</div>
  ),
}));

jest.mock('@/components/navbar/components/LikeButton', () => ({
  __esModule: true,
  default: () => <button>Like</button>,
}));

jest.mock('@/components/banner/BmacBanner', () => ({
  __esModule: true,
  default: () => <div data-testid="bmac-banner" />,
}));

describe('CollectionDetails Component', () => {
  const mockAddToCart = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders collection details correctly', () => {
    render(<CollectionDetails collection={createMockCollection()} onAddToCart={mockAddToCart} />);
    
    expect(screen.getByText(/Cyberpunk Asset/i)).toBeInTheDocument();
    
    const assetValueLabel = screen.getByText(/Asset Value/i);
    const priceContainer = assetValueLabel.parentElement;
    
    expect(within(priceContainer!).getByText(/\$19.99/i)).toBeInTheDocument();
  });

  test('calls onAddToCart with correct data including author userId', () => {
    render(<CollectionDetails collection={createMockCollection()} onAddToCart={mockAddToCart} />);
    
    const addButton = screen.getByRole('button', { name: /Add to Cart/i });
    fireEvent.click(addButton);

    expect(mockAddToCart).toHaveBeenCalledWith(expect.objectContaining({
      id: 'col-123',
      name: 'Cyberpunk Asset',
      ownerId: 'user-17'
    }));
  });

  test('shows correct external link when externalLink is provided', () => {
    const externalCol = createMockCollection({ externalLink: 'https://test.link' });
    
    render(<CollectionDetails collection={externalCol} onAddToCart={mockAddToCart} />);
    
    const link = screen.getByRole('link', { name: /Get Original Asset/i });
    expect(link).toHaveAttribute('href', 'https://test.link');
  });
});
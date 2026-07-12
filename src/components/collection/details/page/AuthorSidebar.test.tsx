import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthorSidebar from './AuthorSidebar';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={src as string} 
      alt={alt as string} 
      className={className} 
      data-testid="mock-avatar-image" 
      {...props} 
    />
  ),
}));

jest.mock('@/lib/socialLinks', () => ({
  ALLOWED_PLATFORMS: [
    { id: 'twitter', label: 'Twitter', icon: () => <svg data-testid="twitter-icon" /> },
    { id: 'github', label: 'GitHub', icon: () => <svg data-testid="github-icon" /> },
  ],
}));

jest.mock('lucide-react', () => ({
  User: () => <svg data-testid="lucide-user" />,
  Star: () => <svg data-testid="lucide-star" />,
  ShoppingCart: () => <svg data-testid="lucide-cart" />,
  Share2: () => <svg data-testid="lucide-share" />,
  ExternalLink: () => <svg data-testid="lucide-external" />,
  Download: () => <svg data-testid="lucide-download" />,
}));

type AuthorData = React.ComponentProps<typeof AuthorSidebar>['author'];
type MockAuthorData = AuthorData & { downloadCount?: number | null };

const baseAuthor: MockAuthorData = {
  id: 'auth-123',
  userId: 'user-456',
  email: 'cyber@example.com',
  username: 'cyber_architect',
  bio: 'Professional developer',
  rating: 4.86,
  totalSales: 142,
  downloadCount: 1050,
  avatarUrl: 'https://example.com/avatar.jpg',
  socialLinks: [
    { platform: 'twitter', url: 'https://twitter.com/cyber_arch' },
  ],
};

describe('AuthorSidebar Component', () => {
  
  test('renders author profile with complete data and formatted metrics', () => {
    render(<AuthorSidebar author={baseAuthor} />);

    expect(screen.getByText('Author Profile')).toBeInTheDocument();
    expect(screen.getByText('@cyber_architect')).toBeInTheDocument();
    
    expect(screen.getByText('4.9')).toBeInTheDocument();
    expect(screen.getByText('142')).toBeInTheDocument();
    expect(screen.getByText('1050')).toBeInTheDocument();

    expect(screen.getByText('Twitter')).toBeInTheDocument();
    const twitterLink = screen.getByRole('link');
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/cyber_arch');

    const avatar = screen.getByTestId('mock-avatar-image');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  test('applies fallback values when metrics are null', () => {
    const brokenAuthor = {
      ...baseAuthor,
      rating: null,
      totalSales: null,
      downloadCount: null,
      avatarUrl: null,
      socialLinks: null,
    } as unknown as AuthorData;

    render(<AuthorSidebar author={brokenAuthor} />);

    expect(screen.getByText('0.0')).toBeInTheDocument();
    
    const zeroCounters = screen.getAllByText('0');
    expect(zeroCounters.length).toBeGreaterThanOrEqual(2);
    
    expect(screen.queryByTestId('mock-avatar-image')).not.toBeInTheDocument();
    expect(screen.getByTestId('lucide-user')).toBeInTheDocument();
  });

  test('renders empty placeholder when socialLinks array is empty', () => {
    const authorNoLinks: AuthorData = {
      ...baseAuthor,
      socialLinks: [],
    };

    render(<AuthorSidebar author={authorNoLinks} />);
    expect(screen.getByText('No external links submitted')).toBeInTheDocument();
  });

  test('uses platform raw ID as fallback when platform is unknown', () => {
    const authorUnknownPlatform: AuthorData = {
      ...baseAuthor,
      socialLinks: [
        { platform: 'unknown-net', url: 'https://unknown.com' },
      ],
    };

    render(<AuthorSidebar author={authorUnknownPlatform} />);
    
    expect(screen.getByText('unknown-net')).toBeInTheDocument();
  });

  test('handles missing url gracefully', () => {
    const authorBrokenUrl: AuthorData = {
      ...baseAuthor,
      socialLinks: [
        { platform: 'twitter', url: null as unknown as string },
      ],
    };

    render(<AuthorSidebar author={authorBrokenUrl} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#');
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import AuthorSidebar from './AuthorSidebar';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src as string} alt={alt as string} {...props} />
  ),
}));

jest.mock('@/lib/socialLinks', () => ({
  ALLOWED_PLATFORMS: [
    { id: 'twitter', label: 'Twitter', icon: () => null },
    { id: 'github', label: 'GitHub', icon: () => null },
  ],
}));

type AuthorData = React.ComponentProps<typeof AuthorSidebar>['author'];

const baseAuthor: AuthorData = {
  id: 'auth-123',
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
    const twitterLink = screen.getByRole('link', { name: /twitter/i });
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/cyber_arch');
  });

  test('applies fallback values when metrics are null', () => {
    const brokenAuthor: AuthorData = {
      ...baseAuthor,
      rating: null,
      totalSales: null,
      downloadCount: null,
      avatarUrl: null,
      socialLinks: null as unknown as AuthorData['socialLinks'], 
    };

    render(<AuthorSidebar author={brokenAuthor} />);

    expect(screen.getByText('0.0')).toBeInTheDocument();
    const zeroCounters = screen.getAllByText('0');
    expect(zeroCounters.length).toBeGreaterThanOrEqual(2);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
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
        { 
          platform: 'twitter', 
          url: null as unknown as string
        },
      ],
    };

    render(<AuthorSidebar author={authorBrokenUrl} />);
    const link = screen.getByRole('link', { name: /twitter/i });
    expect(link).toHaveAttribute('href', '#');
  });
});
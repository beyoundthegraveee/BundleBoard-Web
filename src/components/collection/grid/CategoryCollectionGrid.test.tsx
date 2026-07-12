import React from 'react';
import { render, screen } from '@testing-library/react';
import { CategoryCollectionGrid } from './CategoryCollectionGrid';

jest.mock('./BatchGrid', () => ({
  BatchGrid: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('CategoryCollectionGrid', () => {
  interface MockCollection {
    id: string;
    name: string;
    description: string;
    price: number;
    slug: string | null;
    author: { username: string };
    galleryImages: { filePath: string }[] | null;
  }

  it('renders empty state when collections array is empty', () => {
    render(<CategoryCollectionGrid collections={[]} />);

    expect(screen.getByText(/Data Stream Terminal Empty/i)).toBeInTheDocument();
    expect(screen.getByText(/No deployed registry packages/i)).toBeInTheDocument();
  });

  it('renders a list of collections correctly', () => {
    const mockCollections: MockCollection[] = [
      {
        id: '1',
        name: 'Test Item One',
        price: 9.99,
        description: 'First item description',
        slug: 'test-item-one',
        author: { username: 'dev_user' },
        galleryImages: [{ filePath: 'image1.png' }],
      },
      {
        id: '2',
        name: 'Free Item',
        price: 0,
        description: '',
        slug: 'free-item',
        author: { username: 'system' },
        galleryImages: [],
      },
    ];

    render(<CategoryCollectionGrid collections={mockCollections as any} />);

    expect(screen.getByText('Test Item One')).toBeInTheDocument();
    expect(screen.getByText('Free Item')).toBeInTheDocument();

    expect(screen.getByText('$9.99')).toBeInTheDocument();
    expect(screen.getByText('FREE')).toBeInTheDocument();

    expect(screen.getByText(/@dev_user/i)).toBeInTheDocument();
    expect(screen.getByText(/@system/i)).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import { CollectionItem } from './CollectionItem';
import '@testing-library/jest-dom';
import { JSX } from 'react/jsx-runtime';

type GalleryImage = { filePath: string };
type Author = { username: string };

type CollectionItemData = {
  id: string;
  name: string;
  description: string;
  price: number;
  author: Author | null;
  galleryImages: GalleryImage[];
};

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: JSX.IntrinsicElements['img']) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('CollectionItem Component', () => {
  const supabaseBase = 'https://supabase.co/storage/v1/object/public';

  const mockItem: CollectionItemData = {
    id: 'col-1',
    name: 'Test Collection',
    description: 'This is a test description',
    price: 19.99,
    author: { username: 'dev_user' },
    galleryImages: [{ filePath: 'images/test.png' }],
  };

  it('renders correctly with all provided data', () => {
    render(<CollectionItem item={mockItem} supabaseBase={supabaseBase} />);

    expect(screen.getByText('Test Collection')).toBeInTheDocument();
    expect(screen.getByText('$19.99')).toBeInTheDocument();
    expect(screen.getByText(/@dev_user/i)).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('renders "FREE" when price is 0', () => {
    const freeItem: CollectionItemData = { 
      ...mockItem, 
      price: 0 
    };
    render(<CollectionItem item={freeItem} supabaseBase={supabaseBase} />);
    
    expect(screen.getByText('FREE')).toBeInTheDocument();
  });

  it('shows default values when description and author are missing', () => {
    const minimalItem: CollectionItemData = {
      id: 'col-2',
      name: 'Minimal',
      description: '',
      price: 10,
      author: null, 
      galleryImages: [],
    };

    render(<CollectionItem item={minimalItem} supabaseBase={supabaseBase} />);

    expect(screen.getByText('No parameters or description data submitted.')).toBeInTheDocument();
    expect(screen.getByText(/@system/i)).toBeInTheDocument();
  });
});
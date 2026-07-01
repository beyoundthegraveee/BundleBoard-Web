import React from 'react';
import { render, screen } from '@testing-library/react';
import { useQuery } from '@apollo/client/react';
import UserCommentsLog from './UserCommentsLog';

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

const mockComments = [
  {
    id: 'c1',
    content: 'Awesome design!',
    createdAt: '2026-07-01T12:00:00Z',
    collection: { id: 'col-1', name: 'Cyberpunk Assets' },
  },
  {
    id: 'c2',
    content: 'Waiting for update.',
    createdAt: '2026-07-01T14:30:00Z',
    collection: { id: 'col-2', name: 'Retro UI Kit' },
  },
];

describe('UserCommentsLog Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({ loading: true, data: null, error: null });

    render(<UserCommentsLog userId="user-123" />);
    expect(screen.getByText(/Loading communication logs.../i)).toBeInTheDocument();
  });

  test('renders error state', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({ loading: false, data: null, error: new Error('Failed') });

    render(<UserCommentsLog userId="user-123" />);
    expect(screen.getByText(/Error retrieving logs./i)).toBeInTheDocument();
  });

  test('renders empty state when no comments exist', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({ 
        loading: false, 
        data: { getCommentsByUserId: [] }, 
        error: null 
    });

    render(<UserCommentsLog userId="user-123" />);
    expect(screen.getByText(/No communication logs found for this user./i)).toBeInTheDocument();
  });

  test('renders list of comments correctly', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({ 
        loading: false, 
        data: { getCommentsByUserId: mockComments }, 
        error: null 
    });

    render(<UserCommentsLog userId="user-123" />);

    expect(screen.getByText('Awesome design!')).toBeInTheDocument();
    expect(screen.getByText('Waiting for update.')).toBeInTheDocument();

    const link1 = screen.getByRole('link', { name: /Cyberpunk Assets/i });
    expect(link1).toHaveAttribute('href', '/collection/col-1');

    const link2 = screen.getByRole('link', { name: /Retro UI Kit/i });
    expect(link2).toHaveAttribute('href', '/collection/col-2');
  });
});
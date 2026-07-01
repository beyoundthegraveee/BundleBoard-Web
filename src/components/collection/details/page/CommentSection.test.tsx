import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useQuery, useMutation } from '@apollo/client/react';
import { useSession } from 'next-auth/react';
import CommentsSection from './CommentSection';

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

const mockComments = [
  { id: '1', content: 'Great collection!', createdAt: '2026-07-01T10:00:00Z', user: { username: 'user_dev' } },
];

describe('CommentsSection Component', () => {
  const mockRefetch = jest.fn();
  
  const mockAddCommentTrigger = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useMutation as unknown as jest.Mock).mockImplementation((_doc, options) => {
      const execute = async (args: unknown) => {
        await mockAddCommentTrigger(args);
        if (options?.onCompleted) options.onCompleted();
        return { data: { addComment: true } };
      };
      return [execute, { loading: false }];
    });
  });

  test('renders loading state correctly', () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({ loading: true, data: null, refetch: mockRefetch });
    (useSession as unknown as jest.Mock).mockReturnValue({ data: null });

    render(<CommentsSection targetId="col-123" />);
    expect(screen.getByText(/Loading logs.../i)).toBeInTheDocument();
  });

  test('submits a comment and calls refetch on success', async () => {
    (useQuery as unknown as jest.Mock).mockReturnValue({
      loading: false,
      data: { getCommentsByCollectionId: [] },
      refetch: mockRefetch,
    });
    (useSession as unknown as jest.Mock).mockReturnValue({ data: { user: { name: 'test' } } });

    render(<CommentsSection targetId="col-123" />);

    const input = screen.getByPlaceholderText(/Enter log entry.../i);
    const button = screen.getByRole('button');

    fireEvent.change(input, { target: { value: 'New comment' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockAddCommentTrigger).toHaveBeenCalled();
      expect(mockRefetch).toHaveBeenCalled();
    });
  });
});
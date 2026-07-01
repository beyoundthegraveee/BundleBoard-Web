import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import LikeButton from './LikeButton';

jest.mock('next-auth/react');
jest.mock('@apollo/client/react', () => ({
  useMutation: jest.fn(),
}));
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('LikeButton Component', () => {
  const mockCollectionId = 'col-123';
  const mockOnToggle = jest.fn();
  const mockExecuteToggleFavorite = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useMutation as jest.Mock).mockReturnValue([mockExecuteToggleFavorite]);
  });

  test('renders correctly with default props (unliked)', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
    render(<LikeButton collectionId={mockCollectionId} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Add to Favorites');
    expect(button.className).not.toContain('text-red-500');
  });

  test('renders correctly with initialLiked=true', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
    render(<LikeButton collectionId={mockCollectionId} initialLiked={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Remove from Favorites');
    expect(button.className).toContain('text-red-500');
  });

  test('shows authentication error toast if clicked when not logged in', () => {
    (useSession as jest.Mock).mockReturnValue({ data: null });
    
    render(<LikeButton collectionId={mockCollectionId} />);
    
    fireEvent.click(screen.getByRole('button'));

    expect(mockExecuteToggleFavorite).not.toHaveBeenCalled();
    
    expect(toast.error).toHaveBeenCalledWith("System Notice", {
      description: "Authentication required to save to favorites."
    });
  });

  test('toggles state optimistically and calls mutation when authenticated', async () => {
    (useSession as jest.Mock).mockReturnValue({ data: { user: { id: 'user-1' } } });
    
    render(<LikeButton collectionId={mockCollectionId} onToggle={mockOnToggle} />);
    
    const button = screen.getByRole('button');
    
    fireEvent.click(button);

    expect(button).toHaveAttribute('title', 'Remove from Favorites');
    
    expect(mockOnToggle).toHaveBeenCalledWith(true);
    
    expect(mockExecuteToggleFavorite).toHaveBeenCalledWith({
      variables: { collectionId: mockCollectionId }
    });
  });

  test('rolls back state and shows error if mutation fails', async () => {
    mockExecuteToggleFavorite.mockRejectedValueOnce(new Error('DB Error'));
    (useSession as jest.Mock).mockReturnValue({ data: { user: { id: 'user-1' } } });
    
    render(<LikeButton collectionId={mockCollectionId} onToggle={mockOnToggle} />);
    
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(mockOnToggle).toHaveBeenCalledWith(true);

    await waitFor(() => {
      expect(mockOnToggle).toHaveBeenCalledWith(false);
      expect(button).toHaveAttribute('title', 'Add to Favorites');
      
      expect(toast.error).toHaveBeenCalledWith("Data Stream Error", {
        description: "Failed to update favorites. Please try again."
      });
    });
  });
});
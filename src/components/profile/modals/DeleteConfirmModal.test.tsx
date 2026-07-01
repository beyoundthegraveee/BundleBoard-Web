import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DeleteConfirmModal } from './DeleteConfirmModal';

describe('DeleteConfirmModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();
  
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    collectionName: 'Vaporwave Grid Assets',
    isLoading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not render anything when isOpen is false', () => {
    const { container } = render(<DeleteConfirmModal {...defaultProps} isOpen={false} />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with correct scifi-text and collection name when active', () => {
    render(<DeleteConfirmModal {...defaultProps} />);

    expect(screen.getByText('Registry Destruction')).toBeInTheDocument();
    
    expect(screen.getByText(/"Vaporwave Grid Assets"/i)).toBeInTheDocument();
    
    expect(screen.getByRole('button', { name: /Abort/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Purge Core/i })).toBeInTheDocument();
  });

  it('triggers onClose callback when Abort button or X-icon icon is clicked', async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Abort/i }));
    expect(mockOnClose).toHaveBeenCalledTimes(1);

    const allButtons = screen.getAllByRole('button');
    const closeIconButton = allButtons[0]; 
    
    await user.click(closeIconButton);
    expect(mockOnClose).toHaveBeenCalledTimes(2);
  });

  it('triggers onConfirm callback when clicking Purge Core button', async () => {
    const user = userEvent.setup();
    render(<DeleteConfirmModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /Purge Core/i }));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('enters purge freeze-state when isLoading is activated', () => {
    render(<DeleteConfirmModal {...defaultProps} isLoading={true} />);

    expect(screen.getByText('Purging...')).toBeInTheDocument();
    expect(screen.queryByText('Purge Core')).not.toBeInTheDocument();

    const allButtons = screen.getAllByRole('button');
    expect(allButtons).toHaveLength(3);
    
    allButtons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
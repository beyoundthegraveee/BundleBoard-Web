import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SortSidebar } from './SortSidebar';

describe('SortSidebar Component', () => {
  const mockSetActiveSort = jest.fn();
  const mockToggleFormat = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    activeSort: 'newest',
    setActiveSort: mockSetActiveSort,
    activeFormats: ['jpeg', 'pdf'],
    toggleFormat: mockToggleFormat,
  };

  test('renders all sort options and file formats correctly', () => {
    render(<SortSidebar {...defaultProps} />);

    expect(screen.getByText('Latest Init')).toBeInTheDocument();
    expect(screen.getByText('Top Rated')).toBeInTheDocument();
    expect(screen.getByText('Alphabetical')).toBeInTheDocument();

    expect(screen.getByText('.jpeg')).toBeInTheDocument();
    expect(screen.getByText('.mp4')).toBeInTheDocument();
  });

  test('calls setActiveSort when a new sort option is selected', () => {
    render(<SortSidebar {...defaultProps} />);

    const sortOption = screen.getByText('Top Rated');
    fireEvent.click(sortOption);

    expect(mockSetActiveSort).toHaveBeenCalledTimes(1);
    expect(mockSetActiveSort).toHaveBeenCalledWith('likes');
  });

  test('calls toggleFormat when a file format is clicked', () => {
    render(<SortSidebar {...defaultProps} />);

    const formatOption = screen.getByText('.png');
    fireEvent.click(formatOption);

    expect(mockToggleFormat).toHaveBeenCalledTimes(1);
    expect(mockToggleFormat).toHaveBeenCalledWith('png');
  });

  test('applies visual styles for active items', () => {
    render(<SortSidebar {...defaultProps} />);
    const activeSortLabel = screen.getByText('Latest Init');
    expect(activeSortLabel).toHaveClass('font-bold');

    const inactiveSortLabel = screen.getByText('Date: Oldest');
    expect(inactiveSortLabel).toHaveClass('font-medium');
  });
});
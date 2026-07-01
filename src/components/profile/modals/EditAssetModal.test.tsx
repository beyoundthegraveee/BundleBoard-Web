import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditAssetModal } from './EditAssetModal';

jest.mock('@/hooks/useSupabase', () => ({
  useSupabase: jest.fn(() => ({
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn(),
        getPublicUrl: jest.fn(),
      }),
    },
  })),
}));

jest.mock('@/lib/imageProcessor', () => ({
  convertToWebP: jest.fn(),
}));

jest.mock('@/lib/constants', () => ({
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024,
  EXTERNAL_URL_REGEX: /^https:\/\/[^\s/$.?#].[^\s]*$/i,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: function MockImage(
    props: React.ImgHTMLAttributes<HTMLImageElement> & {
      fill?: boolean;
      unoptimized?: boolean;
      priority?: boolean;
    }
  ) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { fill, unoptimized, priority, alt, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt={alt || 'mock-image'} />;
  },
}));

const validLongDescription = 'This is a very long description that easily exceeds the one hundred character limit imposed by the validation rules. It contains enough detail to pass.';

const mockInitialData = {
  id: 'asset-123',
  name: 'Cyber Neon Shaders',
  price: 25.0,
  description: validLongDescription,
  galleryImages: [{ filePath: 'https://cdn.io/old-image.webp' }],
  externalLink: 'https://example.com/demo',
};

describe('EditAssetModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSave = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSave: mockOnSave,
    isLoading: false,
    initialData: mockInitialData,
  };

  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockOnSave.mockResolvedValue(undefined);
  });

  test('does not render when isOpen is false', () => {
    const { container } = render(<EditAssetModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders correctly and populates with initial data', async () => {
    render(<EditAssetModal {...defaultProps} />);
    
    expect(await screen.findByText('Modify Asset Manifest')).toBeInTheDocument();

    expect(screen.getByDisplayValue('Cyber Neon Shaders')).toBeInTheDocument();
    expect(screen.getByDisplayValue(validLongDescription)).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/demo')).toBeInTheDocument();
    
    const image = screen.getByAltText('Preview');
    expect(image).toHaveAttribute('src', 'https://cdn.io/old-image.webp');
  });

  test('shows validation error when description is too short', async () => {
    render(<EditAssetModal {...defaultProps} />);
    await screen.findByText('Modify Asset Manifest');

    const descInput = screen.getByDisplayValue(validLongDescription);
    
    fireEvent.change(descInput, { target: { value: 'Too short' } });
    
    const submitBtn = screen.getByRole('button', { name: /Commit Changes/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText(/Description too short/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('calls onSave with updated text fields and retains existing images', async () => {
    const user = userEvent.setup();
    render(<EditAssetModal {...defaultProps} />);
    await screen.findByText('Modify Asset Manifest');

    const nameInput = screen.getByDisplayValue('Cyber Neon Shaders');
    
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Shaders Pack');

    const submitBtn = screen.getByRole('button', { name: /Commit Changes/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        'Updated Shaders Pack',
        25.0,
        validLongDescription,
        [
          {
            filePath: 'https://cdn.io/old-image.webp',
            fileName: undefined,
            mimeType: undefined,
            width: undefined,
            height: undefined,
            fileSize: undefined,
          }
        ],
        'https://example.com/demo'
      );
    });
  });
});
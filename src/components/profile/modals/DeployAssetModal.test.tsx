import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSupabase } from '@/hooks/useSupabase';
import { useMutation } from '@apollo/client/react';
import { convertToWebP } from '@/lib/imageProcessor';
import '@testing-library/jest-dom';
import { DeployAssetModal } from './DeployAssetModal';

jest.mock('@/hooks/useSupabase', () => ({
  useSupabase: jest.fn(),
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: jest.fn(),
}));

jest.mock('@/lib/imageProcessor', () => ({
  convertToWebP: jest.fn(),
}));

jest.mock('@/lib/constants', () => ({
  MAX_FILE_SIZE_BYTES: 300 * 1024 * 1024,
  MAX_IMAGE_SIZE_BYTES: 10 * 1024 * 1024,
  EXTERNAL_URL_REGEX: /^https:\/\/[^\s/$.?#].[^\s]*$/i,
  ALLOWED_EXTENSIONS: ['zip', 'rar', 'pdf', 'jpeg', 'jpg', 'png', 'webp', 'mp4'],
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
    const { fill, unoptimized, priority, alt, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...rest} alt={alt || 'mock-image'} />;
  },
}));

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({
    id,
    checked,
    onCheckedChange,
    disabled,
  }: {
    id?: string;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    disabled?: boolean;
  }) => (
    <input
      type="checkbox"
      id={id}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}));

describe('DeployAssetModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockExecuteCreate = jest.fn();

  const mockUpload = jest.fn();
  const mockGetPublicUrl = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  class MockHTMLImageElement {
    onload: () => void = () => {};
    onerror: () => void = () => {};
    width: number = 1920;
    height: number = 1080;
    private _src: string = '';

    set src(val: string) {
      this._src = val;
      setTimeout(() => this.onload(), 0);
    }
    get src() {
      return this._src;
    }
  }

  beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/mock-preview-id');
    global.URL.revokeObjectURL = jest.fn();
    global.Image = MockHTMLImageElement as unknown as typeof Image;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();

    (useMutation as jest.Mock).mockReturnValue([mockExecuteCreate, { loading: false }]);

    (useSupabase as jest.Mock).mockReturnValue({
      storage: {
        from: jest.fn().mockReturnValue({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
        }),
      },
    });

    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://supabase.cdn/previews/mock.webp' } });
    (convertToWebP as jest.Mock).mockResolvedValue(new Blob(['webp-data'], { type: 'image/webp' }));
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(<DeployAssetModal {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders correctly with default fields and respects draft session storage', () => {
    sessionStorage.setItem('draft_isFree', 'true');
    sessionStorage.setItem('draft_newAsset', JSON.stringify({ name: 'Draft Pack', description: 'Pre-saved state desc long', category: 'brushes' }));

    render(<DeployAssetModal {...defaultProps} />);

    expect(screen.getByText('Deploy Asset Manifest')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Draft Pack')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Pre-saved state desc long')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('brushes');
    expect(screen.getByText(/Extra Zero-Value Asset Bypass Active/i)).toBeInTheDocument();
  });

  it('handles toggle between Commercial and Open Source price layouts', async () => {
    const user = userEvent.setup();
    render(<DeployAssetModal {...defaultProps} />);

    const priceInput = screen.getByPlaceholderText('5.00');
    expect(priceInput).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Open Source/i }));
    expect(screen.queryByPlaceholderText('5.00')).not.toBeInTheDocument();
    expect(screen.getByText(/Extra Zero-Value Asset Bypass Active/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Commercial/i }));
    expect(screen.getByPlaceholderText('5.00')).toBeInTheDocument();
  });

  it('switches between Distribution Methods and swaps project vault vs external link inputs', async () => {
    const user = userEvent.setup();
    render(<DeployAssetModal {...defaultProps} />);

    expect(screen.getByText('Secure Project Vault')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('https://...')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /External Link/i }));
    expect(screen.queryByText('Secure Project Vault')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument();
  });

  it('validates file uploads constraints (oversized preview images)', async () => {
    const { container } = render(<DeployAssetModal {...defaultProps} />);

    const oversizedFile = new File([], 'huge.png', { type: 'image/png' });
    Object.defineProperty(oversizedFile, 'size', { value: 11 * 1024 * 1024, configurable: true });
    
    const previewInput = container.querySelector('input[accept="image/*"]');
    if (!previewInput) throw new Error('Gallery image input not found');

    fireEvent.change(previewInput, { target: { files: [oversizedFile] } });

    expect(screen.getByText('Preview images must be under 10 MB.')).toBeInTheDocument();
  });

  it('allows filling the entire form and executing a successful full hosted asset deployment pipeline', async () => {
    const user = userEvent.setup();
    const { container } = render(<DeployAssetModal {...defaultProps} />);

    await user.type(screen.getByPlaceholderText(/Ultra Chrome Gradient Pack/i), 'Cyber Neon Shaders');
    await user.type(
      screen.getByPlaceholderText(/Specify bundle details/i),
      'Detailed specification bundle for cyber shader development. Includes 15 high-fidelity noise matrices and fully procedural parameters for advanced lighting design configurations.'
    );
    
    const priceInput = screen.getByPlaceholderText('5.00');
    fireEvent.change(priceInput, { target: { value: '15.00' } });
    
    await user.selectOptions(screen.getByRole('combobox'), 'graphics');

    const mockImageFile = new File(['dummy-img'], 'preview.png', { type: 'image/png' });
    const imageInput = container.querySelector('input[accept="image/*"]');
    if (!imageInput) throw new Error('Gallery image input not found');
    fireEvent.change(imageInput, { target: { files: [mockImageFile] } });

    await waitFor(() => {
      expect(screen.getByText('Cover')).toBeInTheDocument();
    });

    const mockZipFile = new File(['dummy-zip-archive'], 'assets.zip', { type: 'application/zip' });
    const archiveInput = container.querySelector('input[accept*="zip"]');
    if (!archiveInput) throw new Error('Archive project vault input not found');
    fireEvent.change(archiveInput, { target: { files: [mockZipFile] } });

    expect(screen.getByText('assets.zip')).toBeInTheDocument();

    const rightsCheckbox = screen.getByRole('checkbox');
    await user.click(rightsCheckbox);

    const submitButton = screen.getByRole('button', { name: /Commit Changes & Execute Deployment/i });
    expect(submitButton).not.toBeDisabled();
    await user.click(submitButton);

    await waitFor(() => {
      expect(convertToWebP).toHaveBeenCalledWith(mockImageFile, 1200, 0.82);

      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('graphics/collection-'),
        expect.any(Blob),
        expect.objectContaining({ contentType: 'image/webp' })
      );

      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('graphics/collection-'),
        mockZipFile
      );

      expect(mockExecuteCreate).toHaveBeenCalledWith({
        variables: {
          input: expect.objectContaining({
            name: 'Cyber Neon Shaders',
            price: 15,
            tagIds: ['4'],
            galleryImages: [
              expect.objectContaining({
                fileName: expect.stringContaining('preview-0-'),
                mimeType: 'webp',
                width: 1920,
                height: 1080,
              }),
            ],
            mediaResource: expect.objectContaining({
              fileName: 'assets.zip',
              mimeType: 'zip',
            }),
          }),
        },
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  }, 15000);

  it('triggers error validation rules if price is lower than 5 dollars', async () => {
    const user = userEvent.setup();
    const { container } = render(<DeployAssetModal {...defaultProps} />);

    await user.type(screen.getByPlaceholderText(/Ultra Chrome Gradient Pack/i), 'Valid Name');
    await user.type(
      screen.getByPlaceholderText(/Specify bundle details/i),
      'This description is definitely long enough to clear any core schema validation limits placed onto this form.'
    );
    await user.selectOptions(screen.getByRole('combobox'), 'graphics');

    const priceInput = screen.getByPlaceholderText('5.00');
    fireEvent.change(priceInput, { target: { value: '2.50' } });

    const imageInput = container.querySelector('input[accept="image/*"]');
    if (!imageInput) throw new Error('Gallery image input not found');
    const mockImageFile = new File(['img'], 'preview.png', { type: 'image/png' });
    fireEvent.change(imageInput, { target: { files: [mockImageFile] } });
    
    await user.click(screen.getByRole('checkbox'));

    const form = container.querySelector('form');
    if (!form) throw new Error('Form element not found');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(container.textContent).toContain('Pricing protocol violation: Commercial value must be between $5.00 and $100.00 USD.');
    });
  });

  it('triggers error validation rules if commercial price exceeds 100 dollars', async () => {
    const user = userEvent.setup();
    const { container } = render(<DeployAssetModal {...defaultProps} />);

    await user.type(screen.getByPlaceholderText(/Ultra Chrome Gradient Pack/i), 'Valid Name');
    await user.type(
      screen.getByPlaceholderText(/Specify bundle details/i),
      'This description is definitely long enough to clear any core schema validation limits placed onto this form.'
    );
    await user.selectOptions(screen.getByRole('combobox'), 'graphics');

    const priceInput = screen.getByPlaceholderText('5.00');
    fireEvent.change(priceInput, { target: { value: '101.00' } });
    
    const imageInput = container.querySelector('input[accept="image/*"]');
    if (!imageInput) throw new Error('Gallery image input not found');
    const mockImageFile = new File(['img'], 'preview.png', { type: 'image/png' });
    fireEvent.change(imageInput, { target: { files: [mockImageFile] } });
    
    await user.click(screen.getByRole('checkbox'));

    const form = container.querySelector('form');
    if (!form) throw new Error('Form element not found');
    fireEvent.submit(form);
    
    await waitFor(() => {
      expect(container.textContent).toContain('Pricing protocol violation: Commercial value must be between $5.00 and $100.00 USD.');
    });
  });

  it('triggers error validation rules if archive file size exceeds 300 MB limit', async () => {
    const { container } = render(<DeployAssetModal {...defaultProps} />);

    const oversizedZip = new File([], 'huge-project.zip', { type: 'application/zip' });
    Object.defineProperty(oversizedZip, 'size', { value: 301 * 1024 * 1024, configurable: true });
    
    const archiveInput = container.querySelector('input[accept*="zip"]');
    if (!archiveInput) throw new Error('Archive project vault input not found');

    fireEvent.change(archiveInput, { target: { files: [oversizedZip] } });

    expect(screen.getByText('The project archive exceeds the maximum allowed size of 300 MB.')).toBeInTheDocument();
  });
});
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InventoryItemCard, AuthoredCollection } from './InventoryItemCard';
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { DeleteCollectionDocument } from '@/graphql/generated';

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  );
});

jest.mock('next/image', () => {
  return ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  );
});

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: jest.fn(),
}));

jest.mock('./modals/DeleteConfirmModal', () => ({
  DeleteConfirmModal: ({ isOpen, onConfirm, onClose }: any) =>
    isOpen ? (
      <div data-testid="mock-delete-modal">
        <button onClick={onConfirm}>Confirm Delete Action</button>
        <button onClick={onClose}>Cancel Delete Action</button>
      </div>
    ) : null,
}));

jest.mock('./modals/EditAssetModal', () => ({
  EditAssetModal: ({ isOpen, onSave, onClose }: any) =>
    isOpen ? (
      <div data-testid="mock-edit-modal">
        <button
          onClick={() =>
            onSave('Updated Name', 150.0, 'Updated Description', [
              { filePath: 'https://cdn.io/new.jpg' },
            ])
          }
        >
          Confirm Update Action
        </button>
        <button onClick={onClose}>Cancel Edit Action</button>
      </div>
    ) : null,
}));


const mockCollection: AuthoredCollection = {
  id: 'coll-123',
  name: 'Vanguard Katana',
  price: 49.99,
  description: 'Cyberpunk style weapon container metadata.',
  galleryImages: [
    { filePath: 'https://cdn.io/previews/user_1/assets_2/katana.jpg' },
  ],
};

const defaultProps = {
  collection: mockCollection,
  onRefreshNeeded: jest.fn(),
};


describe('InventoryItemCard Component', () => {
  let mockExecuteDelete: jest.Mock;
  let mockExecuteUpdate: jest.Mock;
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockExecuteDelete = jest.fn().mockResolvedValue({ data: { deleteCollection: true } });
    mockExecuteUpdate = jest.fn().mockResolvedValue({ data: { updateCollection: true } });

    (useMutation as jest.Mock).mockImplementation((document) => {
      if (document === DeleteCollectionDocument) {
        return [mockExecuteDelete, { loading: false }];
      }
      return [mockExecuteUpdate, { loading: false }];
    });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });


  test('renders collection parameters correctly', () => {
    render(<InventoryItemCard {...defaultProps} />);

    expect(screen.getByText('Vanguard Katana')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('Cyberpunk style weapon container metadata.')).toBeInTheDocument();
    expect(screen.getByAltText('Vanguard Katana thumbnail')).toBeInTheDocument();
  });

  test('renders default text when description is missing', () => {
    const propsWithoutDesc = {
      ...defaultProps,
      collection: { ...mockCollection, description: '' },
    };
    render(<InventoryItemCard {...propsWithoutDesc} />);

    expect(screen.getByText('No registry metadata parameters submitted.')).toBeInTheDocument();
  });


  test('successfully executes deletion workflow and extracts folderPath', async () => {
    const user = userEvent.setup();
    render(<InventoryItemCard {...defaultProps} />);

    const deleteBtn = screen.getByTitle('Destroy');
    await user.click(deleteBtn);

    expect(screen.getByTestId('mock-delete-modal')).toBeInTheDocument();

    const confirmBtn = screen.getByText('Confirm Delete Action');
    await user.click(confirmBtn);

    expect(mockExecuteDelete).toHaveBeenCalledWith({
      variables: {
        id: 'coll-123',
        folderPath: 'user_1/assets_2',
      },
    });

    expect(defaultProps.onRefreshNeeded).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Asset successfully destroyed.');
    expect(screen.queryByTestId('mock-delete-modal')).not.toBeInTheDocument();
  });

  test('handles delete mutation errors gracefully', async () => {
    const user = userEvent.setup();
    mockExecuteDelete.mockRejectedValue(new Error('GraphQL Database Error'));

    render(<InventoryItemCard {...defaultProps} />);

    await user.click(screen.getByTitle('Destroy'));
    await user.click(screen.getByText('Confirm Delete Action'));

    expect(toast.error).toHaveBeenCalledWith('GraphQL Database Error');
    expect(defaultProps.onRefreshNeeded).not.toHaveBeenCalled();
  });


  test('successfully executes update workflow', async () => {
    const user = userEvent.setup();
    render(<InventoryItemCard {...defaultProps} />);

    const editBtn = screen.getByTitle('Edit Parameters');
    await user.click(editBtn);

    expect(screen.getByTestId('mock-edit-modal')).toBeInTheDocument();

    const saveBtn = screen.getByText('Confirm Update Action');
    await user.click(saveBtn);

    expect(mockExecuteUpdate).toHaveBeenCalledWith({
      variables: {
        id: 'coll-123',
        input: {
          name: 'Updated Name',
          price: 150.0,
          description: 'Updated Description',
          galleryImages: [{ filePath: 'https://cdn.io/new.jpg' }],
        },
      },
    });

    expect(defaultProps.onRefreshNeeded).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Asset manifest updated successfully.');
    expect(screen.queryByTestId('mock-edit-modal')).not.toBeInTheDocument();
  });

  test('handles update mutation errors gracefully with dynamic error message', async () => {
    const user = userEvent.setup();
    mockExecuteUpdate.mockRejectedValue(new Error('Network Timeout'));

    render(<InventoryItemCard {...defaultProps} />);

    await user.click(screen.getByTitle('Edit Parameters'));
    await user.click(screen.getByText('Confirm Update Action'));

    expect(toast.error).toHaveBeenCalledWith('Network Timeout');
    expect(defaultProps.onRefreshNeeded).not.toHaveBeenCalled();
  });

  test('handles update mutation unknown errors with fallback message', async () => {
    const user = userEvent.setup();
    mockExecuteUpdate.mockRejectedValue('Fatal string error without instance');

    render(<InventoryItemCard {...defaultProps} />);

    await user.click(screen.getByTitle('Edit Parameters'));
    await user.click(screen.getByText('Confirm Update Action'));

    expect(toast.error).toHaveBeenCalledWith('Failed to update asset manifest.');
    expect(defaultProps.onRefreshNeeded).not.toHaveBeenCalled();
  });
});
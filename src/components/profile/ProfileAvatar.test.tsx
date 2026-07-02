import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSupabase } from '@/components/provider/SupabaseProvider'
import { useMutation } from '@apollo/client/react';
import { toast } from 'sonner';
import { convertToWebP } from '@/lib/imageProcessor';
import { validateSocialUrl } from '@/lib/socialLinks';
import { GetUserProfileQuery } from "@/graphql/generated";
import '@testing-library/jest-dom';
import { ProfileAvatar } from './ProfileAvatar';

jest.mock('@/components/provider/SupabaseProvider', () => ({
  useSupabase: jest.fn(),
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: jest.fn(),
}));

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@/lib/imageProcessor', () => ({
  convertToWebP: jest.fn(),
}));

jest.mock('@/lib/socialLinks', () => ({
  ALLOWED_PLATFORMS: [
    { id: 'github', label: 'GitHub', icon: () => null },
    { id: 'twitter', label: 'Twitter', icon: () => null },
  ],
  validateSocialUrl: jest.fn(),
}));

describe('ProfileAvatar Component', () => {
  const mockExecuteUpdateAvatar = jest.fn();
  const mockExecuteUpdateProfile = jest.fn();
  const mockOnUpdate = jest.fn();

  const mockUpload = jest.fn();
  const mockGetPublicUrl = jest.fn();

  const mockUserData = {
    id: 'user-777',
    username: 'neon_hacker',
    email: 'hacker@matrix.io',
    bio: 'Deconstruct code. Build realities.',
    avatarUrl: null, 
    socialLinks: [
      { platform: 'github', url: 'https://github.com/neon_hacker' },
    ],
  } as unknown as GetUserProfileQuery['getUserProfile'];

  beforeEach(() => {
    jest.clearAllMocks();
    (useMutation as jest.Mock).mockImplementation((document) => {
      if (document?.definitions?.[0]?.name?.value === 'UpdateAvatar' || String(document).includes('UpdateAvatar')) {
        return [mockExecuteUpdateAvatar, { loading: false }];
      }
      return [mockExecuteUpdateProfile, { loading: false }];
    });

    (useSupabase as jest.Mock).mockReturnValue({
      storage: {
        from: jest.fn().mockReturnValue({
          upload: mockUpload,
          getPublicUrl: mockGetPublicUrl,
        }),
      },
    });

    (validateSocialUrl as jest.Mock).mockReturnValue(true);
    (convertToWebP as jest.Mock).mockResolvedValue(new Blob(['mock-webp-data'], { type: 'image/webp' }));
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({ data: { publicUrl: 'https://supabase.cdn/avatars/uploaded.webp' } });
  });

  it('renders initial view state with user info, bio, and social links', () => {
    render(<ProfileAvatar userData={mockUserData} onUpdate={mockOnUpdate} />);

    expect(screen.getByText('neon_hacker')).toBeInTheDocument();
    expect(screen.getByText('hacker@matrix.io')).toBeInTheDocument();
    expect(screen.getByText('Deconstruct code. Build realities.')).toBeInTheDocument();
    
    expect(screen.getByRole('link', { name: /GitHub/i })).toHaveAttribute('href', 'https://github.com/neon_hacker');
    expect(screen.getByRole('button', { name: /Edit Identity/i })).toBeInTheDocument();
  });

  it('handles avatar conversion and successful upload via Supabase and GraphQL', async () => {
    render(<ProfileAvatar userData={mockUserData} onUpdate={mockOnUpdate} />);
    
    const file = new File(['dummy content'], 'avatar.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Update Avatar/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(convertToWebP).toHaveBeenCalledWith(file, 500, 0.85);
      
      expect(mockUpload).toHaveBeenCalledWith(
        expect.stringContaining('avatars/user-777-'),
        expect.any(Blob),
        { contentType: 'image/webp', upsert: true }
      );

      expect(mockExecuteUpdateAvatar).toHaveBeenCalledWith({
        variables: {
          input: {
            id: 'user-777',
            avatarUrl: 'https://supabase.cdn/avatars/uploaded.webp',
          },
        },
      });

      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('switches to edit mode, allows editing bio, and saves changes', async () => {
    const user = userEvent.setup();
    render(<ProfileAvatar userData={mockUserData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /Edit Identity/i }));

    const textarea = screen.getByPlaceholderText(/Write a short description/i);
    expect(textarea).toHaveValue('Deconstruct code. Build realities.');

    await user.clear(textarea);
    await user.type(textarea, 'New digital bio state.');

    await user.click(screen.getByRole('button', { name: /Commit/i }));

    await waitFor(() => {
      expect(mockExecuteUpdateProfile).toHaveBeenCalledWith({
        variables: {
          bio: 'New digital bio state.',
          socialLinks: [{ platform: 'github', url: 'https://github.com/neon_hacker' }],
        },
      });
      expect(toast.success).toHaveBeenCalledWith('Profile configuration updated successfully.');
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('validates social networks blocking duplicates and incorrect formats', async () => {
    const user = userEvent.setup();
    render(<ProfileAvatar userData={mockUserData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /Edit Identity/i }));

    await user.click(screen.getByRole('button', { name: /Add Link/i }));

    await user.click(screen.getByRole('button', { name: /Commit/i }));

    expect(toast.error).toHaveBeenCalledWith('You cannot add the same platform more than once');
    expect(mockExecuteUpdateProfile).not.toHaveBeenCalled();

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[1], 'twitter');

    (validateSocialUrl as jest.Mock).mockReturnValueOnce(false); 
    
    const inputs = screen.getAllByPlaceholderText('https://');
    await user.type(inputs[1], 'invalid-link');

    await user.click(screen.getByRole('button', { name: /Commit/i }));

    expect(toast.error).toHaveBeenCalledWith('Please check the link format');
    expect(mockExecuteUpdateProfile).not.toHaveBeenCalled();
  });

  it('allows removing an existing social link from matrix', async () => {
    const user = userEvent.setup();
    render(<ProfileAvatar userData={mockUserData} onUpdate={mockOnUpdate} />);

    await user.click(screen.getByRole('button', { name: /Edit Identity/i }));

    const removeButtons = screen.getAllByRole('button').filter(btn => !btn.textContent);
    await user.click(removeButtons[0]);

    expect(screen.getByText(/No active network links/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Commit/i }));

    await waitFor(() => {
      expect(mockExecuteUpdateProfile).toHaveBeenCalledWith({
        variables: {
          bio: 'Deconstruct code. Build realities.',
          socialLinks: [],
        },
      });
    });
  });
});
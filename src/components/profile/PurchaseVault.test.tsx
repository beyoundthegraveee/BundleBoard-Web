import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PurchasedVault } from './PurchaseVault';

const MOCK_SUPABASE_BASE = 'https://mock-supabase.com/previews';
process.env.NEXT_PUBLIC_SUPABASE_PREVIEWS_BASE = MOCK_SUPABASE_BASE;

describe('PurchasedVault Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when there are no assets allocated', () => {
    render(<PurchasedVault purchases={[]} totalAssetsCount={0} />);

    expect(screen.getByText(/Core Vault Directory/i)).toBeInTheDocument();
    expect(screen.getByText(/0 ASSETS/i)).toBeInTheDocument();
    expect(screen.getByText(/No allocated vault assets/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Open Secure Stash Matrix/i })).not.toBeInTheDocument();
  });

  it('calculates total value and renders up to 3 asset preview items', () => {
    const mockPurchases = [
      {
        amount: 150.50,
        status: 'completed',
        items: [
          { id: 'a1', snapshotPrice: 100, asset: { name: 'Cyber Cyberpunk HUD', galleryImages: [{ filePath: 'hud.png' }] } },
          { id: 'a2', snapshotPrice: 50, asset: { name: 'Sci-Fi Sound FX Pack', galleryImages: [{ filePath: 'http://external.com/sound.png' }] } },
        ],
      },
      {
        amount: 45.00,
        status: 'completed',
        items: [
          { id: 'a3', snapshotPrice: 45, asset: { name: '3D Mech Model' } },
          { id: 'a4', snapshotPrice: 0, asset: { name: 'Hidden Excess Item' } },
        ],
      },
    ];

    render(<PurchasedVault purchases={mockPurchases} totalAssetsCount={4} />);

    expect(screen.getByText(/Total Value: \$195.50/i)).toBeInTheDocument();
    expect(screen.getByText(/4 ASSETS/i)).toBeInTheDocument();

    expect(screen.getByText('Cyber Cyberpunk HUD')).toBeInTheDocument();
    expect(screen.getByText('Sci-Fi Sound FX Pack')).toBeInTheDocument();
    expect(screen.getByText('3D Mech Model')).toBeInTheDocument();
    expect(screen.queryByText('Hidden Excess Item')).not.toBeInTheDocument();

    expect(screen.getAllByText(/\[Standard License\]/i)).toHaveLength(3);

    const stashLink = screen.getByRole('link', { name: /Open Secure Stash Matrix/i });
    expect(stashLink).toHaveAttribute('href', '/stash');
  });

  it('displays "Obtained for Free" badge and "Free License" text when assets cost $0.00', () => {
    const mockFreePurchases = [
      {
        amount: 0,
        status: 'completed',
        items: [
          { id: 'free-1', snapshotPrice: 0, asset: { name: 'Free UI Kit', galleryImages: [] } },
        ],
      },
    ];

    render(<PurchasedVault purchases={mockFreePurchases} totalAssetsCount={1} />);

    expect(screen.getByText(/Total Value: \$0.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Obtained for Free/i)).toBeInTheDocument();
    expect(screen.getByText(/\[Free License\]/i)).toBeInTheDocument();
  });

  it('renders offline alert layout if asset node structure is missing', () => {
    const mockCorruptedPurchases = [
      {
        amount: 20.00,
        status: 'completed',
        items: [
          { id: 'missing-asset-id', snapshotPrice: 20, asset: undefined },
        ],
      },
    ];

    render(<PurchasedVault purchases={mockCorruptedPurchases} totalAssetsCount={1} />);

    expect(screen.getByText(/Offline/i)).toBeInTheDocument();
    expect(screen.queryByText(/Standard License/i)).not.toBeInTheDocument();
  });
});
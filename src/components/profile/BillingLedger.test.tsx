import React from 'react';
import { render, screen } from '@testing-library/react';
import { BillingLedger } from './BillingLedger';

type PurchaseEntry = React.ComponentProps<typeof BillingLedger>['purchases'];


const mockPurchases: PurchaseEntry = [
  {
    id: 'tx-1',
    createdAt: '2026-05-10T12:00:00.000Z',
    status: 'COMPLETED',
    amount: 29.99,
    currency: 'USD',
    items: [{ id: 1 }, { id: 2 }],
  },
  {
    id: 'tx-2',
    createdAt: '2026-06-15T15:30:00.000Z',
    status: 'REFUNDED',
    amount: 0.0,
    currency: 'USD',
    items: [{ id: 3 }],
  },
];


describe('BillingLedger Component', () => {
  

  test('renders the ledger title and table with complete data', () => {
    render(<BillingLedger purchases={mockPurchases} totalSpent="29.99" />);

    expect(screen.getByText('Billing History Ledger')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Status / Details')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();

    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    expect(screen.getByText('2 ASSETS ACQUIRED')).toBeInTheDocument();

    const priceLabels = screen.getAllByText('29.99 USD');
    expect(priceLabels).toHaveLength(2);

    expect(screen.getByText('REFUNDED')).toBeInTheDocument();
    expect(screen.getByText('1 ASSETS ACQUIRED')).toBeInTheDocument();
    expect(screen.getByText('FREE')).toBeInTheDocument();

    expect(screen.getByText('Total Value Processed')).toBeInTheDocument();
  });

  test('renders empty placeholder when purchases array is empty', () => {
    render(<BillingLedger purchases={[]} totalSpent="0.00" />);

    expect(
      screen.getByText('No transactional entries recorded on this account.')
    ).toBeInTheDocument();
    
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  test('renders empty placeholder when purchases is null or undefined', () => {
    const { rerender } = render(<BillingLedger purchases={null} totalSpent="0.00" />);
    expect(screen.getByText('No transactional entries recorded on this account.')).toBeInTheDocument();

    rerender(<BillingLedger purchases={undefined} totalSpent="0.00" />);
    expect(screen.getByText('No transactional entries recorded on this account.')).toBeInTheDocument();
  });

  test('applies fallback values when purchase fields are missing', () => {
    const brokenPurchases: PurchaseEntry = [
      {
        id: 'tx-broken',
        createdAt: undefined,
        status: undefined,
        amount: undefined,
        currency: undefined,
        items: undefined,
      },
    ];

    render(<BillingLedger purchases={brokenPurchases} totalSpent="0.00" />);

    expect(screen.getByText('N/A')).toBeInTheDocument();

    expect(screen.getByText('PROCESSED')).toBeInTheDocument();

    expect(screen.getByText('0 ASSETS ACQUIRED')).toBeInTheDocument();

    const freeLabels = screen.getAllByText('FREE');
    expect(freeLabels.length).toBeGreaterThanOrEqual(1);
  });

  test('renders FREE in total section when totalSpent is "0.00"', () => {
    render(<BillingLedger purchases={mockPurchases} totalSpent="0.00" />);

    const freeElements = screen.getAllByText('FREE');
    expect(freeElements).toHaveLength(2);
  });

  test('uses USD as fallback currency for total value when purchases array is empty or currency missing', () => {
    render(<BillingLedger purchases={null} totalSpent="150.00" />);

    expect(screen.getByText('150.00 USD')).toBeInTheDocument();
  });
});
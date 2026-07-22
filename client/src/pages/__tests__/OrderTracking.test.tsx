import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OrderTracking from '../OrderTracking';

vi.mock('@/hooks/usePageMeta', () => ({
  usePageMeta: vi.fn(),
}));

vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({ notify: vi.fn() }),
}));

// Mock the API response
const mockGet = vi.fn();
vi.mock('@/lib/api', () => ({
  api: { get: (...args: unknown[]) => mockGet(...args) }
}));

describe('OrderTracking Page', () => {
  it('should render the input field and search button', () => {
    render(<OrderTracking />);
    expect(screen.getByPlaceholderText('Order ID')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Track/i })).toBeInTheDocument();
  });

  it('should fetch and display order details on successful track', async () => {
    mockGet.mockResolvedValueOnce({
      success: true,
      tracking: {
        customOrderId: 'ORD-1234',
        orderStatus: 'shipped',
        paymentStatus: 'SUCCESSFUL',
        createdAt: new Date().toISOString(),
        items: [],
      }
    });

    render(<OrderTracking />);
    
    const input = screen.getByPlaceholderText('Order ID');
    const button = screen.getByRole('button', { name: /Track/i });

    fireEvent.change(input, { target: { value: 'ORD-1234' } });
    fireEvent.click(button);

    // Wait for the API to resolve and UI to update
    await waitFor(() => {
      expect(screen.getByText('ORD-1234')).toBeInTheDocument();
      expect(screen.getByText('shipped')).toBeInTheDocument();
      // Since it is shipped, 'Crafting in Progress' and 'Order Placed' should be visible
      expect(screen.getByText('Crafting in Progress')).toBeInTheDocument();
    });
  });
});

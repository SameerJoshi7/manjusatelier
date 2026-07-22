import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Shop from '../Shop';

// Mock the hooks
vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({
    data: {
      products: [
        { _id: '1', name: 'Resin Table', price: 1500, slug: 'resin-table', images: ['/img1.jpg'] },
        { _id: '2', name: 'Clay Pot', price: 500, slug: 'clay-pot', images: ['/img2.jpg'] },
      ],
      total: 2,
      page: 1,
      pages: 1,
    },
    loading: false,
  }),
}));

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: [
      { _id: 'c1', name: 'Furniture', slug: 'furniture', productCount: 1 },
      { _id: 'c2', name: 'Decor', slug: 'decor', productCount: 1 },
    ],
    loading: false,
  }),
}));

// Mock WishlistContext so ProductCard doesn't crash
vi.mock('@/context/WishlistContext', () => ({
  useWishlist: () => ({
    has: vi.fn(),
    toggle: vi.fn(),
    ids: [],
  })
}));

// Mock CartContext so ProductCard doesn't crash
vi.mock('@/context/CartContext', () => ({
  useCart: () => ({
    addItem: vi.fn(),
  })
}));

// Mock useToast
vi.mock('@/components/ui/Toast', () => ({
  useToast: () => ({
    notify: vi.fn(),
  })
}));

describe('Shop Page', () => {
  it('should render the shop page with products and filters', () => {
    render(
      <MemoryRouter initialEntries={['/shop']}>
        <Shop />
      </MemoryRouter>
    );

    // Verify Title
    expect(screen.getByText('Shop the Collection')).toBeInTheDocument();
    
    // Verify Products rendered
    expect(screen.getByText('Resin Table')).toBeInTheDocument();
    expect(screen.getByText('Clay Pot')).toBeInTheDocument();
    
    // Verify Categories rendered
    expect(screen.getByText('Furniture')).toBeInTheDocument();
    expect(screen.getByText('Decor')).toBeInTheDocument();
  });
});

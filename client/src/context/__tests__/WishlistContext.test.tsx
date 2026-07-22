import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { WishlistProvider, useWishlist } from '../WishlistContext';
import React from 'react';

// Mock api
vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn().mockResolvedValue({}),
    get: vi.fn().mockResolvedValue({ data: null }),
  }
}));

// Mock useAuth since WishlistContext depends on it
vi.mock('../AuthContext', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useAuth: () => ({ user: null }),
  };
});

describe('WishlistContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <WishlistProvider>{children}</WishlistProvider>
  );

  it('should initialize with empty wishlist when local storage is empty', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.ids).toEqual([]);
    expect(result.current.has('prod1')).toBe(false);
  });

  it('should initialize from local storage', () => {
    localStorage.setItem('manjus_wishlist', JSON.stringify(['prod1', 'prod2']));
    const { result } = renderHook(() => useWishlist(), { wrapper });
    expect(result.current.ids).toEqual(['prod1', 'prod2']);
    expect(result.current.has('prod1')).toBe(true);
  });

  it('should toggle an item and update local storage', () => {
    const { result } = renderHook(() => useWishlist(), { wrapper });
    
    act(() => {
      result.current.toggle('prod1');
    });
    
    expect(result.current.ids).toEqual(['prod1']);
    expect(localStorage.getItem('manjus_wishlist')).toBe(JSON.stringify(['prod1']));
    
    act(() => {
      result.current.toggle('prod1');
    });
    
    expect(result.current.ids).toEqual([]);
    expect(localStorage.getItem('manjus_wishlist')).toBe(JSON.stringify([]));
  });
});

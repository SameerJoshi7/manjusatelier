import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface ProductModalContextType {
  isOpen: boolean;
  productSlug: string | null;
  openModal: (slug: string) => void;
  closeModal: () => void;
}

const ProductModalContext = createContext<ProductModalContextType | undefined>(undefined);

export function ProductModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [productSlug, setProductSlug] = useState<string | null>(null);

  const openModal = useCallback((slug: string) => {
    setProductSlug(slug);
    setIsOpen(true);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => {
      setProductSlug(null);
    }, 300); // delay clearing slug for exit animation
    // Restore background scrolling
    document.body.style.overflow = '';
  }, []);

  return (
    <ProductModalContext.Provider value={{ isOpen, productSlug, openModal, closeModal }}>
      {children}
    </ProductModalContext.Provider>
  );
}

export function useProductModal() {
  const context = useContext(ProductModalContext);
  if (context === undefined) {
    throw new Error('useProductModal must be used within a ProductModalProvider');
  }
  return context;
}

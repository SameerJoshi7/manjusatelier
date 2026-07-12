import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PageLoader } from '@/components/ui/PageLoader';
import { OfflineBanner } from '@/components/layout/OfflineBanner';
import { useRegisterSW } from 'virtual:pwa-register/react';

const Home = lazy(() => import('@/pages/Home'));
const Shop = lazy(() => import('@/pages/Shop'));
const ProductDetails = lazy(() => import('@/pages/ProductDetails'));
const Categories = lazy(() => import('@/pages/Categories'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const CheckoutSuccess = lazy(() => import('@/pages/CheckoutSuccess'));
const Wishlist = lazy(() => import('@/pages/Wishlist'));
const Login = lazy(() => import('@/pages/Login'));
const Account = lazy(() => import('@/pages/Account'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Admin
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminOverview = lazy(() => import('@/pages/admin/Overview'));
const AdminOrders = lazy(() => import('@/pages/admin/Orders'));
const AdminProducts = lazy(() => import('@/pages/admin/Products'));
const AdminCoupons = lazy(() => import('@/pages/admin/Coupons'));

export default function App() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered: ' + r);
    },
    onRegisterError(error) {
      console.log('SW registration error', error);
    },
  });

  return (
    <Suspense fallback={<PageLoader />}>
      <OfflineBanner />
      {needRefresh && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between bg-gold px-4 py-3 text-brown-dark shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
          <p className="text-sm font-medium">A new version of Manju's Atelier is available.</p>
          <button
            onClick={() => updateServiceWorker(true)}
            className="rounded bg-white px-4 py-1.5 text-xs font-bold transition-transform hover:scale-105"
          >
            Update
          </button>
        </div>
      )}
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success/:id" element={<CheckoutSuccess />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin dashboard — own layout, admin-only */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

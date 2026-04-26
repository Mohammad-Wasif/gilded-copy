import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AnnouncementBar, Navbar } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/AdminProtectedRoute';
import { CartDrawer } from './components/CartDrawer/CartDrawer';
import { DashboardLayout } from './components/DashboardLayout/DashboardLayout';

// Lazy load pages for route-based code splitting
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const Payment = lazy(() => import('./pages/Payment'));
const Auth = lazy(() => import('./pages/Auth'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminAuth = lazy(() => import('./pages/AdminAuth'));
const FaqPage = lazy(() => import('./pages/Faq'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfServicePage = lazy(() => import('./pages/TermsOfService'));
const ShippingReturnsPage = lazy(() => import('./pages/ShippingReturns'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin pages
import { AdminLayout } from './components/AdminLayout/AdminLayout';
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminCustomers = lazy(() => import('./pages/AdminCustomers'));
const AdminCustomerProfile = lazy(() => import('./pages/AdminCustomers/CustomerProfile'));
const AdminCategories = lazy(() => import('./pages/AdminCategories'));
const AdminWholesale = lazy(() => import('./pages/AdminWholesale'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminMisc = lazy(() => import('./pages/AdminMisc'));

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Minimal fallback for page loading
const PageFallback = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Main nested layout wrapped with Header and Footer */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="shop" element={<Shop />} />
              <Route path="product/:slug" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="contact" element={<Contact />} />
              <Route path="faq" element={<FaqPage />} />
              <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="terms-of-service" element={<TermsOfServicePage />} />
              <Route path="shipping-returns" element={<ShippingReturnsPage />} />

              {/* Dashboard / Profile Section */}
              <Route path="dashboard" element={<ProtectedRoute />}>
                <Route element={<DashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="orders" element={<OrderHistory />} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="addresses" element={<div className="p-8">Address Book (Coming Soon)</div>} />
                  <Route path="invoices" element={<div className="p-8">Invoices (Coming Soon)</div>} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Distraction-free layouts: no standard Header/Footer */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/payment" element={<Payment />} />
            </Route>
            <Route path="/login" element={<Auth />} />
            <Route path="/admin/login" element={<AdminAuth />} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<AdminProtectedRoute />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="customers/:id" element={<AdminCustomerProfile />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="wholesale" element={<AdminWholesale />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="misc" element={<AdminMisc />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </CartProvider>
  );
}

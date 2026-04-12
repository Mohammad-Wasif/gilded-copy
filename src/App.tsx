import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AnnouncementBar, Navbar } from './components/Header/Header';
import { Footer } from './components/Footer/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Auth from './pages/Auth';
import Contact from './pages/Contact';
import AdminAuth from './pages/AdminAuth';
import FaqPage from './pages/Faq';
import PrivacyPolicyPage from './pages/PrivacyPolicy';
import TermsOfServicePage from './pages/TermsOfService';
import ShippingReturnsPage from './pages/ShippingReturns';
import NotFound from './pages/NotFound';

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
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
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Distraction-free layouts: no standard Header/Footer */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

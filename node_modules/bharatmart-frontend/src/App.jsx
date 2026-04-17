import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { useShop } from './hooks/useShop';
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { CartFeedback } from './components/layout/CartFeedback';
import { Chatbot, PurchaseToast } from './components/layout/EngagementWidgets';
import { HomePage } from './pages/HomePage';
import { HotDealsPage } from './pages/HotDealsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { FAQPage } from './pages/FAQPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { AboutPage } from './pages/AboutPage';
import { PolicyPage } from './pages/PolicyPage';
import { ThankYouPage } from './pages/ThankYouPage';
import { NotFoundPage } from './pages/NotFoundPage';

function AppShell() {
  const { announcements } = useShop();

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <ScrollToTop />
      <AnnouncementBar items={announcements} />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products/:slug" element={<ProductDetailsPage />} />
          <Route path="/hot-deals" element={<HotDealsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy-policy" element={<PolicyPage type="privacy" />} />
          <Route path="/terms-and-conditions" element={<PolicyPage type="terms" />} />
          <Route path="/return-policy" element={<PolicyPage type="returns" />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <CartFeedback />
      <PurchaseToast />
      <Chatbot />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ShopProvider>
        <AppShell />
      </ShopProvider>
    </BrowserRouter>
  );
}

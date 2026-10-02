import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { GalleryView } from './components/GalleryView';
import { CartScreen } from './components/CartScreen';
import { WishlistScreen } from './components/WishlistScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ArtworkOrderPage } from './components/ArtworkOrderPage';
import { AdminDashboard } from './components/AdminDashboard';
import { PaintingDetailModal } from './components/PaintingDetailModal';
import { InquiryModal } from './components/InquiryModal';
import { AuthModal } from './components/AuthModal';
import { CustomerInquiriesModal } from './components/CustomerInquiriesModal';
import { Footer } from './components/Footer';
import { Painting, Category, Banner } from './types';

const CART_STORAGE_KEY = 'artweb_cart_items';

// Protected Admin Route
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', fontSize: '16px', color: '#71717a' }}>
        Verifying administrator access...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

// Customer Layout with Navigation & Footer
const CustomerLayout: React.FC<{
  cartCount: number;
  cartTotal: number;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenMyInquiries: () => void;
  categories: Category[];
  children: React.ReactNode;
}> = ({ cartCount, cartTotal, onOpenAuth, onOpenMyInquiries, categories, children }) => {
  const scrollToCatalog = () => {
    const el = document.getElementById('gallery-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenAuth={onOpenAuth}
        onOpenMyInquiries={onOpenMyInquiries}
        cartCount={cartCount}
        cartTotal={cartTotal}
        categories={categories}
      />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer categories={categories} onSelectCategory={() => scrollToCatalog()} />
    </div>
  );
};

// Main Routed Application
const MainAppRoutes: React.FC = () => {
  const navigate = useNavigate();

  // Real Database Data
  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  // Load real paintings, categories, and banners from PostgreSQL Database
  const fetchDatabaseData = async () => {
    try {
      const [paintingsData, categoriesData, bannersData] = await Promise.all([
        api.getPaintings(),
        api.getCategories(),
        api.getBanners(),
      ]);
      setPaintings(paintingsData);
      setCategories(categoriesData);
      setBanners(bannersData);
    } catch (err) {
      console.error('Failed to load data from database:', err);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  // Shopping Cart state
  const [cartItems, setCartItems] = useState<Painting[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cartItems]);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  // Add painting to cart and navigate directly to '/cart'
  const handleAddToCart = (painting: Painting) => {
    if (painting.status === 'inactive') {
      alert('This artwork is currently inactive and cannot be purchased.');
      return;
    }
    setCartItems((prev) => {
      const exists = prev.some((item) => item.id === painting.id);
      if (exists) return prev;
      return [...prev, painting];
    });
    navigate('/cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRemoveFromCart = (paintingId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== paintingId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Modals & Navigation
  const [selectedPainting, setSelectedPainting] = useState<Painting | null>(null);
  const [inquiryPainting, setInquiryPainting] = useState<Painting | null>(null);
  const [isMyInquiriesOpen, setIsMyInquiriesOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const location = useLocation();

  // URL-driven Auth state (?auth=login or ?auth=register)
  const authParam = searchParams.get('auth');
  const isAuthOpen = authParam === 'login' || authParam === 'register';
  const authTab: 'login' | 'register' = authParam === 'register' ? 'register' : 'login';

  const handleOpenAuth = (mode?: 'login' | 'register') => {
    const targetMode = mode === 'register' ? 'register' : 'login';
    const params = new URLSearchParams(searchParams);
    params.set('auth', targetMode);
    const searchStr = params.toString();
    navigate(`${location.pathname}${searchStr ? `?${searchStr}` : ''}`);
  };

  const handleAuthTabChange = (mode: 'login' | 'register') => {
    const params = new URLSearchParams(searchParams);
    params.set('auth', mode);
    const searchStr = params.toString();
    navigate(`${location.pathname}${searchStr ? `?${searchStr}` : ''}`, { replace: true });
  };

  const handleCloseAuth = () => {
    if (searchParams.has('auth')) {
      const params = new URLSearchParams(searchParams);
      params.delete('auth');
      const searchStr = params.toString();
      navigate(`${location.pathname}${searchStr ? `?${searchStr}` : ''}`, { replace: true });
    }
  };

  const handleSelectPainting = (p: Painting) => {
    navigate(`/artwork/${p.uuid || p.id}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('gallery-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Routes>
        {/* Customer Store Home Route - Root URL "/" (Industry Production Standard) */}
        <Route
          path="/"
          element={
            <CustomerLayout
              cartCount={cartItems.length}
              cartTotal={cartTotal}
              onOpenAuth={handleOpenAuth}
              onOpenMyInquiries={() => setIsMyInquiriesOpen(true)}
              categories={categories}
            >
              <HeroSection
                banners={banners}
                onExploreClick={scrollToCatalog}
              />
              <GalleryView
                onSelectPainting={handleSelectPainting}
                onInquirePainting={handleAddToCart}
              />
            </CustomerLayout>
          }
        />
        {/* Redirect /home to clean root "/" for production standard */}
        <Route path="/home" element={<Navigate to="/" replace />} />

        {/* Shop / Catalog Screen Route */}
        <Route
          path="/shop"
          element={
            <CustomerLayout
              cartCount={cartItems.length}
              cartTotal={cartTotal}
              onOpenAuth={handleOpenAuth}
              onOpenMyInquiries={() => setIsMyInquiriesOpen(true)}
              categories={categories}
            >
              <div style={{ paddingTop: '24px' }}>
                <GalleryView
                  onSelectPainting={handleSelectPainting}
                  onInquirePainting={handleAddToCart}
                />
              </div>
            </CustomerLayout>
          }
        />

        {/* Collections Route & Individual Collection Routes (Shopify / Industry Standard) */}
        <Route
          path="/collections"
          element={
            <CustomerLayout
              cartCount={cartItems.length}
              cartTotal={cartTotal}
              onOpenAuth={handleOpenAuth}
              onOpenMyInquiries={() => setIsMyInquiriesOpen(true)}
              categories={categories}
            >
              <div style={{ paddingTop: '24px' }}>
                <GalleryView
                  onSelectPainting={handleSelectPainting}
                  onInquirePainting={handleAddToCart}
                />
              </div>
            </CustomerLayout>
          }
        />
        <Route
          path="/collections/:slug"
          element={
            <CustomerLayout
              cartCount={cartItems.length}
              cartTotal={cartTotal}
              onOpenAuth={handleOpenAuth}
              onOpenMyInquiries={() => setIsMyInquiriesOpen(true)}
              categories={categories}
            >
              <div style={{ paddingTop: '24px' }}>
                <GalleryView
                  onSelectPainting={handleSelectPainting}
                  onInquirePainting={handleAddToCart}
                />
              </div>
            </CustomerLayout>
          }
        />
        <Route
          path="/collection/:slug"
          element={
            <CustomerLayout
              cartCount={cartItems.length}
              cartTotal={cartTotal}
              onOpenAuth={handleOpenAuth}
              onOpenMyInquiries={() => setIsMyInquiriesOpen(true)}
              categories={categories}
            >
              <div style={{ paddingTop: '24px' }}>
                <GalleryView
                  onSelectPainting={handleSelectPainting}
                  onInquirePainting={handleAddToCart}
                />
              </div>
            </CustomerLayout>
          }
        />

        {/* Dedicated Artwork Order Page Routes (Global Standard Design) */}
        <Route
          path="/artwork/:id"
          element={
            <CustomerLayout
              cartCount={cartItems.length}
              cartTotal={cartTotal}
              onOpenAuth={handleOpenAuth}
              onOpenMyInquiries={() => setIsMyInquiriesOpen(true)}
              categories={categories}
            >
              <ArtworkOrderPage
                onAddToCart={handleAddToCart}
                onOpenAuth={handleOpenAuth}
                categories={categories}
              />
            </CustomerLayout>
          }
        />
        <Route
          path="/order/:id"
          element={
            <CustomerLayout
              cartCount={cartItems.length}
              cartTotal={cartTotal}
              onOpenAuth={handleOpenAuth}
              onOpenMyInquiries={() => setIsMyInquiriesOpen(true)}
              categories={categories}
            >
              <ArtworkOrderPage
                onAddToCart={handleAddToCart}
                onOpenAuth={handleOpenAuth}
                categories={categories}
              />
            </CustomerLayout>
          }
        />
        <Route
          path="/product/:id"
          element={
            <CustomerLayout
              cartCount={cartItems.length}
              cartTotal={cartTotal}
              onOpenAuth={handleOpenAuth}
              onOpenMyInquiries={() => setIsMyInquiriesOpen(true)}
              categories={categories}
            >
              <ArtworkOrderPage
                onAddToCart={handleAddToCart}
                onOpenAuth={handleOpenAuth}
                categories={categories}
              />
            </CustomerLayout>
          }
        />

        {/* Saved Wishlist Screen Route */}
        <Route
          path="/wishlist"
          element={
            <CustomerLayout
              cartCount={cartItems.length}
              cartTotal={cartTotal}
              onOpenAuth={handleOpenAuth}
              onOpenMyInquiries={() => setIsMyInquiriesOpen(true)}
              categories={categories}
            >
              <WishlistScreen
                onAddToCart={handleAddToCart}
                onSelectPainting={handleSelectPainting}
              />
            </CustomerLayout>
          }
        />

        {/* Shopping Cart Screen Route */}
        <Route
          path="/cart"
          element={
            <CustomerLayout
              cartCount={cartItems.length}
              cartTotal={cartTotal}
              onOpenAuth={handleOpenAuth}
              onOpenMyInquiries={() => setIsMyInquiriesOpen(true)}
              categories={categories}
            >
              <CartScreen
                cartItems={cartItems}
                onRemoveItem={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onContinueShopping={() => {
                  navigate('/shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onOpenAuth={handleOpenAuth}
                onViewMyInquiries={() => setIsMyInquiriesOpen(true)}
              />
            </CustomerLayout>
          }
        />

        {/* Customer Orders Route */}
        <Route
          path="/orders"
          element={
            <CustomerLayout
              cartCount={cartItems.length}
              cartTotal={cartTotal}
              onOpenAuth={handleOpenAuth}
              onOpenMyInquiries={() => setIsMyInquiriesOpen(true)}
              categories={categories}
            >
              <OrdersScreen onOpenAuth={handleOpenAuth} />
            </CustomerLayout>
          }
        />

        {/* Customer Profile & Account Route */}
        <Route
          path="/profile"
          element={
            <CustomerLayout
              cartCount={cartItems.length}
              cartTotal={cartTotal}
              onOpenAuth={handleOpenAuth}
              onOpenMyInquiries={() => setIsMyInquiriesOpen(true)}
              categories={categories}
            >
              <ProfileScreen onOpenAuth={handleOpenAuth} />
            </CustomerLayout>
          }
        />

        {/* Dedicated Admin Dashboard Routes (Protected) */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdminRoute>
              <AdminDashboard onBackToStore={() => navigate('/')} />
            </ProtectedAdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Direct Quick Inquiry Modal */}
      <InquiryModal
        painting={inquiryPainting}
        onClose={() => setInquiryPainting(null)}
        onOpenAuth={handleOpenAuth}
        onViewMyInquiries={() => setIsMyInquiriesOpen(true)}
      />

      {/* Auth Modal for Login & Register with URL sync (?auth=login or ?auth=register) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialTab={authTab}
        onTabChange={handleAuthTabChange}
        onClose={handleCloseAuth}
        onAdminLogin={() => {
          navigate('/admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Customer Tracking Modal */}
      <CustomerInquiriesModal
        isOpen={isMyInquiriesOpen}
        onClose={() => setIsMyInquiriesOpen(false)}
      />
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WishlistProvider>
          <MainAppRoutes />
        </WishlistProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

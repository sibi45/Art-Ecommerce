import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Category, ProductSection, FooterConfig } from '../types';
import { api } from '../services/api';
import {
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  ClipboardList,
  ChevronDown,
  X,
  Package,
  ExternalLink,
  Menu,
  UserCheck
} from 'lucide-react';

const PORTFOLIO_URL = import.meta.env.VITE_PORTFOLIO_URL || 'https://your-portfolio.com';

interface NavbarProps {
  onOpenAuth: () => void;
  onOpenMyInquiries: () => void;
  cartCount?: number;
  cartTotal?: number;
  categories?: Category[];
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  cartCount = 0,
  categories = [],
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(null);

  const accountRef = useRef<HTMLDivElement>(null);

  // Close account popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };
    if (isAccountOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountOpen]);

  useEffect(() => {
    api.getSections().then((data) => setSections(data || [])).catch(() => {});
    api.getFooterConfig().then((data) => setFooterConfig(data || null)).catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsSearchOpen(false);
    }
  };

  const isHome = location.pathname === '/home' || location.pathname === '/';

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: '#ffffff',
      fontFamily: "'Roboto Condensed', sans-serif"
    }}>
      {/* Main Navbar Bar */}
      <div style={{
        borderBottom: '1px solid #e5e7eb',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
        backgroundColor: '#ffffff'
      }}>
        <div
          className="navbar-container"
          style={{
            maxWidth: '1380px',
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px'
          }}
        >
          {/* Left: Brand Logo (Minimog Style with Green Icon) */}
          <Link
            to="/home"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              userSelect: 'none',
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: '#1b3b2b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(27, 59, 43, 0.25)',
            }}>
              <ShoppingBag size={20} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#111827',
                lineHeight: 1,
              }}>
                {footerConfig?.brand_name || 'Minimog'}
              </div>
              <div
                className="brand-subtitle-mobile"
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#6b7280',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  marginTop: '1px',
                  maxWidth: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {footerConfig?.brand_subtitle || 'Curated Store'}
              </div>
            </div>
          </Link>

          {/* Center: Navigation Links (Minimog Style) */}
          <nav className="hide-on-mobile" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
            fontSize: '15px',
            fontWeight: 600,
          }}>
            <Link
              to="/home"
              style={{
                textDecoration: 'none',
                color: isHome ? '#1b3b2b' : '#374151',
                paddingBottom: '4px',
                borderBottom: isHome ? '2px solid #1b3b2b' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              Home
            </Link>

            {/* Shop Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsShopOpen(!isShopOpen)}
                onBlur={() => setTimeout(() => setIsShopOpen(false), 200)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: location.pathname === '/shop' ? '#1b3b2b' : '#374151',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                Shop <ChevronDown size={14} color="#6b7280" style={{ transform: isShopOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>

              {isShopOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  left: 0,
                  width: '210px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
                  padding: '8px 0',
                  zIndex: 200,
                }}>
                  <Link
                    to="/shop"
                    onClick={() => setIsShopOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#111827',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    All Products
                  </Link>

                  {/* Dynamic sections configured from Admin Dashboard */}
                  {sections && sections.filter(s => s.is_active).length > 0 ? (
                    sections.filter(s => s.is_active).map((sec) => (
                      <Link
                        key={sec.id}
                        to={`/shop?section=${sec.slug}`}
                        onClick={() => setIsShopOpen(false)}
                        style={{
                          display: 'block',
                          padding: '8px 16px',
                          fontSize: '13.5px',
                          color: '#4b5563',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                          e.currentTarget.style.color = '#111827';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#4b5563';
                        }}
                      >
                        {sec.name}
                      </Link>
                    ))
                  ) : (
                    /* Dynamic category links if no custom sections created */
                    categories.slice(0, 6).map((cat) => (
                      <Link
                        key={cat.id}
                        to={`/shop?category=${cat.id}`}
                        onClick={() => setIsShopOpen(false)}
                        style={{
                          display: 'block',
                          padding: '8px 16px',
                          fontSize: '13.5px',
                          color: '#4b5563',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                          e.currentTarget.style.color = '#111827';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#4b5563';
                        }}
                      >
                        {cat.name}
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Collections Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsCollectionOpen(!isCollectionOpen)}
                onBlur={() => setTimeout(() => setIsCollectionOpen(false), 200)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: location.pathname === '/collections' ? '#1b3b2b' : '#374151',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                Collections <ChevronDown size={14} color="#6b7280" style={{ transform: isCollectionOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
              </button>

              {isCollectionOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  left: 0,
                  width: '230px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
                  padding: '8px 0',
                  zIndex: 200,
                }}>
                  <div style={{ padding: '6px 16px', fontSize: '11px', fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Collections
                  </div>
                  <Link
                    to="/collections"
                    onClick={() => setIsCollectionOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#111827',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    All Collections
                  </Link>
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/shop?category=${cat.id}`}
                      onClick={() => setIsCollectionOpen(false)}
                      style={{
                        display: 'block',
                        padding: '8px 16px',
                        fontSize: '13.5px',
                        color: '#4b5563',
                        textDecoration: 'none',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                        e.currentTarget.style.color = '#111827';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#4b5563';
                      }}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* My Portfolio Link */}
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: 'none',
                color: '#374151',
                fontSize: '15px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#374151')}
            >
              My Portfolio <ExternalLink size={13} style={{ opacity: 0.7 }} />
            </a>

            <Link
              to="/orders"
              style={{
                textDecoration: 'none',
                color: location.pathname === '/orders' ? '#1b3b2b' : '#374151',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
              onMouseLeave={(e) => (e.currentTarget.style.color = location.pathname === '/orders' ? '#1b3b2b' : '#374151')}
            >
              Orders
            </Link>
          </nav>

          {/* Right: Search, Account, Wishlist, Cart Icons */}
          <div className="navbar-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Search Input / Icon */}
            <div style={{ position: 'relative' }}>
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    style={{
                      width: '180px',
                      height: '34px',
                      padding: '0 10px',
                      border: '1px solid #1b3b2b',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#1b3b2b',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      height: '34px',
                      padding: '0 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Search size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  title="Search products"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#111827',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                  }}
                >
                  <Search size={20} strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              title="Saved Wishlist"
              style={{
                textDecoration: 'none',
                position: 'relative',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
            >
              <Heart size={20} strokeWidth={2} fill={wishlistCount > 0 ? '#1b3b2b' : 'none'} color={wishlistCount > 0 ? '#1b3b2b' : '#111827'} />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-6px',
                    backgroundColor: '#1b3b2b',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 700,
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account Profile Icon (Minimog Style) */}
            <div ref={accountRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => {
                  if (isAuthenticated) {
                    setIsAccountOpen(!isAccountOpen);
                  } else {
                    onOpenAuth();
                  }
                }}
                title={isAuthenticated && user?.full_name ? user.full_name : 'Sign in / Account'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: isAccountOpen ? '#1b3b2b' : '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease',
                }}
              >
                <UserIcon size={20} strokeWidth={2} />
              </button>

              {/* Account Popover */}
              {isAccountOpen && isAuthenticated && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 12px)',
                  right: 0,
                  width: '230px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
                  padding: '8px 0',
                  zIndex: 300,
                  animation: 'fadeIn 0.15s ease-out',
                }}>
                  {/* User Profile Summary Card */}
                  <Link
                    to="/profile"
                    onClick={() => setIsAccountOpen(false)}
                    style={{
                      display: 'block',
                      padding: '10px 16px',
                      borderBottom: '1px solid #f3f4f6',
                      textDecoration: 'none',
                      backgroundColor: '#fbfbfa',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fbfbfa')}
                  >
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#111827' }}>
                      {user?.full_name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.email}
                    </div>
                    <div style={{ fontSize: '11px', color: '#1b3b2b', fontWeight: 700, marginTop: '4px' }}>
                      View & Edit Profile →
                    </div>
                  </Link>

                  {/* My Profile Link */}
                  <Link
                    to="/profile"
                    onClick={() => setIsAccountOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 16px',
                      fontSize: '13px',
                      color: '#374151',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <UserIcon size={15} color="#4b5563" /> My Profile
                  </Link>

                  {/* My Orders Link */}
                  <Link
                    to="/orders"
                    onClick={() => setIsAccountOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 16px',
                      fontSize: '13px',
                      color: '#374151',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <ClipboardList size={15} color="#4b5563" /> My Orders
                  </Link>

                  {/* My Wishlist Link */}
                  <Link
                    to="/wishlist"
                    onClick={() => setIsAccountOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 16px',
                      fontSize: '13px',
                      color: '#374151',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Heart size={15} color="#4b5563" /> My Wishlist
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsAccountOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 16px',
                        fontSize: '13px',
                        color: '#1b3b2b',
                        textDecoration: 'none',
                        fontWeight: 700,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f0fdf4')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LayoutDashboard size={15} color="#1b3b2b" /> Admin Dashboard
                    </Link>
                  )}

                  <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAccountOpen(false);
                        logout();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 16px',
                        fontSize: '13px',
                        color: '#dc2626',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        fontWeight: 600,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LogOut size={15} color="#dc2626" /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Shopping Cart Icon (Minimog Style with Green Badge Count) */}
            <Link
              to="/cart"
              title="Shopping Cart"
              style={{
                textDecoration: 'none',
                position: 'relative',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
            >
              <ShoppingBag size={21} strokeWidth={2} />
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-6px',
                  backgroundColor: '#1b3b2b',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 800,
                  width: '17px',
                  height: '17px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {cartCount}
              </span>
            </Link>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="show-on-mobile"
              style={{
                background: 'none',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                color: '#111827',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer Sheet */}
      {isMobileMenuOpen && (
        <div
          className="show-on-mobile-block"
          style={{
            padding: '16px 20px 24px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e5e7eb',
            boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
          }}
        >
          <form
            onSubmit={(e) => {
              handleSearchSubmit(e);
              setIsMobileMenuOpen(false);
            }}
            style={{ position: 'relative', marginBottom: '16px' }}
          >
            <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '40px',
                paddingLeft: '36px',
                paddingRight: '12px',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
              }}
            />
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Link
              to="/home"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                padding: '10px 14px',
                borderRadius: '4px',
                color: '#111827',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
                backgroundColor: '#f3f4f6',
              }}
            >
              Home
            </Link>

            <Link
              to="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                padding: '10px 14px',
                borderRadius: '4px',
                color: '#111827',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              Shop All Products
            </Link>

            <Link
              to="/collections"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                padding: '10px 14px',
                borderRadius: '4px',
                color: '#111827',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              Collections
            </Link>


            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '4px',
                  color: '#4b5563',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '13px',
                }}
              >
                &mdash; {cat.name}
              </Link>
            ))}

            <Link
              to="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '4px',
                color: '#111827',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              <Package size={16} /> Orders
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '4px',
                color: '#111827',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
              }}
            >
              <Heart size={16} color="#1b3b2b" /> Wishlist ({wishlistCount})
            </Link>

            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '4px',
                color: '#4b5563',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              <ExternalLink size={16} /> My Portfolio
            </a>

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  borderRadius: '4px',
                  color: '#1b3b2b',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  backgroundColor: '#f0fdf4',
                }}
              >
                <LayoutDashboard size={16} /> Admin Dashboard
              </Link>
            )}

            <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }} />

            {isAuthenticated ? (
              <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#111827' }}>{user?.full_name}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{user?.email}</div>
                  </div>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#166534', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '10px', textTransform: 'uppercase' }}>
                    {user?.role === 'admin' ? 'Admin' : 'Customer'}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      color: '#111827',
                      textDecoration: 'none',
                    }}
                  >
                    <UserIcon size={14} /> My Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      padding: '8px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      color: '#111827',
                      textDecoration: 'none',
                    }}
                  >
                    <Package size={14} /> Orders
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    background: '#ffffff',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    padding: '8px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth();
                }}
                style={{
                  width: '100%',
                  padding: '11px',
                  fontSize: '14px',
                  fontWeight: 700,
                  borderRadius: '4px',
                  backgroundColor: '#1b3b2b',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  marginTop: '4px',
                }}
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

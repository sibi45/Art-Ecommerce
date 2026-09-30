import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { Category } from '../types';
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
  Menu
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
  onOpenMyInquiries,
  cartCount = 0,
  cartTotal = 0,
  categories = [],
}) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#ffffff', borderBottom: '1px solid #f1f5f9', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        
        {/* Left: Brand Logo & Collection Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Logo */}
          <Link
            to="/home"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'baseline',
              userSelect: 'none',
            }}
          >
            <span style={{
              fontSize: '25px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: '#09090b',
              fontFamily: "'Playfair Display', Georgia, serif",
              display: 'flex',
              alignItems: 'baseline',
            }}>
              artgallery
              <span style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#e11d48',
                marginLeft: '4px',
              }} />
            </span>
          </Link>

          {/* Collection Dropdown Button (Desktop) */}
          <div className="hide-on-mobile" style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsCollectionOpen(!isCollectionOpen)}
              onBlur={() => setTimeout(() => setIsCollectionOpen(false), 200)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 10px',
                borderRadius: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              Collection <ChevronDown size={14} color="#64748b" style={{ transform: isCollectionOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {/* Collection Dropdown Menu */}
            {isCollectionOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '240px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
                padding: '8px 0',
                zIndex: 200,
                animation: 'fadeIn 0.15s ease',
              }}>
                <div style={{ padding: '6px 16px', fontSize: '11px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Art Collections
                </div>
                <Link
                  to="/shop"
                  onClick={() => setIsCollectionOpen(false)}
                  style={{
                    display: 'block',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#09090b',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  All Artworks
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop?category=${cat.id}`}
                    onClick={() => setIsCollectionOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      fontSize: '13px',
                      color: '#475569',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.color = '#09090b';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#475569';
                    }}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Orders Link (Desktop) */}
          <Link
            to="/orders"
            className="hide-on-mobile"
            style={{
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              color: location.pathname === '/orders' ? '#09090b' : '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
              backgroundColor: location.pathname === '/orders' ? '#f1f5f9' : 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = location.pathname === '/orders' ? '#f1f5f9' : 'transparent'; }}
          >
            <Package size={14} color="#64748b" />
            Orders
          </Link>

          {/* About / Portfolio Link (Desktop) */}
          <a
            href={PORTFOLIO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hide-on-mobile"
            style={{
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
              color: '#334155',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 10px',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f1f5f9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            About
            <ExternalLink size={12} color="#94a3b8" />
          </a>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hide-on-mobile" style={{ flex: 1, maxWidth: '580px' }}>
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            <input
              type="text"
              placeholder="Search for paintings, artists, styles, mediums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '44px',
                paddingRight: searchQuery ? '36px' : '16px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13.5px',
                color: '#0f172a',
                outline: 'none',
                transition: 'all 0.2s ease',
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.borderColor = '#09090b';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(9, 9, 11, 0.05)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = '#f8fafc';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                }}
              >
                <X size={14} />
              </button>
            )}
          </form>
        </div>

        {/* Right: Account, Wishlist, Cart Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Account (Desktop) */}
          <div className="hide-on-mobile" style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  setIsAccountOpen(!isAccountOpen);
                } else {
                  onOpenAuth();
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                cursor: 'pointer',
                color: '#334155',
                padding: '4px',
              }}
            >
              <UserIcon size={20} strokeWidth={1.75} />
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>
                Profile
              </span>
            </button>

            {/* Account Popover */}
            {isAccountOpen && isAuthenticated && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '210px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
                padding: '8px 0',
                zIndex: 200,
              }}>
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>{user?.full_name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{user?.email}</div>
                </div>

                <Link
                  to="/orders"
                  onClick={() => setIsAccountOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px',
                    fontSize: '13px',
                    color: '#334155',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <ClipboardList size={15} /> My Orders & Inquiries
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsAccountOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 16px',
                      fontSize: '13px',
                      color: '#e11d48',
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fff1f2')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LayoutDashboard size={15} /> Admin Portal
                  </Link>
                )}

                <div style={{ borderTop: '1px solid #f1f5f9', marginTop: '4px' }}>
                  <button
                    onClick={() => {
                      setIsAccountOpen(false);
                      logout();
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '9px 16px',
                      fontSize: '13px',
                      color: '#64748b',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={15} /> Log Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: '#334155',
              padding: '4px',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <Heart
                size={20}
                strokeWidth={1.75}
                fill={wishlistCount > 0 ? '#e11d48' : 'none'}
                color={wishlistCount > 0 ? '#e11d48' : '#334155'}
              />
              {wishlistCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-8px',
                    backgroundColor: '#e11d48',
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
                  {wishlistCount}
                </span>
              )}
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Wishlist</span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            style={{
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              color: '#334155',
              padding: '4px',
              position: 'relative',
            }}
          >
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={20} strokeWidth={1.75} />
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-8px',
                  backgroundColor: '#e11d48',
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
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#475569' }}>Cart</span>
          </Link>

          {/* Mobile Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="show-on-mobile"
            style={{
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px',
              cursor: 'pointer',
              color: '#09090b',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Sheet */}
      {isMobileMenuOpen && (
        <div
          className="show-on-mobile-block"
          style={{
            padding: '16px 20px 24px',
            backgroundColor: '#ffffff',
            borderTop: '1px solid #f1f5f9',
            boxShadow: '0 12px 28px rgba(0,0,0,0.08)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {/* Mobile Search Input */}
          <form
            onSubmit={(e) => {
              handleSearchSubmit(e);
              setIsMobileMenuOpen(false);
            }}
            style={{ position: 'relative', marginBottom: '16px' }}
          >
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search paintings, artists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '42px',
                paddingLeft: '40px',
                paddingRight: '14px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </form>

          {/* Mobile Nav Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Link
              to="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                padding: '10px 14px',
                borderRadius: '6px',
                color: '#09090b',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '14px',
                backgroundColor: '#f8fafc',
              }}
            >
              All Artworks & Catalog
            </Link>

            {/* Categories */}
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  color: '#475569',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '13.5px',
                }}
              >
                &mdash; {cat.name}
              </Link>
            ))}

            <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '8px 0' }} />

            <Link
              to="/orders"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '6px',
                color: '#334155',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              <Package size={16} /> My Inquiries & Orders
            </Link>

            <Link
              to="/wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '6px',
                color: '#334155',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              <Heart size={16} color="#e11d48" /> Wishlist ({wishlistCount})
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
                borderRadius: '6px',
                color: '#334155',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              <ExternalLink size={16} /> Artist Portfolio & About
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
                  borderRadius: '6px',
                  color: '#e11d48',
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  backgroundColor: '#fff1f2',
                }}
              >
                <LayoutDashboard size={16} /> Admin Portal
              </Link>
            )}

            <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '8px 0' }} />

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: '#09090b' }}>{user?.full_name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{user?.email}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#dc2626',
                    cursor: 'pointer',
                  }}
                >
                  Log Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  borderRadius: '6px',
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

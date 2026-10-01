import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Painting } from '../types';
import { useWishlist } from '../context/WishlistContext';
import {
  Heart,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Eye,
  Sparkles
} from 'lucide-react';

interface WishlistScreenProps {
  onAddToCart: (painting: Painting) => void;
  onSelectPainting: (painting: Painting) => void;
}

export const WishlistScreen: React.FC<WishlistScreenProps> = ({
  onAddToCart,
  onSelectPainting,
}) => {
  const navigate = useNavigate();
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();

  const formatPrice = (price?: number | null, _currency?: string) => {
    if (price === undefined || price === null) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '85vh', paddingBottom: '80px' }}>
      {/* 1. Breadcrumbs Header */}
      <div style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafaf9' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '14px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <Link to="/home" style={{ color: '#09090b', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
            <ChevronRight size={14} color="#94a3b8" />
            <Link to="/shop" style={{ color: '#09090b', textDecoration: 'none', fontWeight: 500 }}>Collection</Link>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ color: '#e53637', fontWeight: 700 }}>My Wishlist</span>
          </div>

          <button
            onClick={() => navigate('/shop')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={14} /> Back to Gallery
          </button>
        </div>
      </div>

      {/* 2. Main Content Container */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 24px' }}>
        {/* Title & Action Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderBottom: '1px solid #e4e4e7',
          paddingBottom: '20px',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 800,
                color: '#09090b',
                margin: 0,
                fontFamily: "'Roboto Condensed', sans-serif"
              }}>
                My Saved Wishlist
              </h1>
              <span style={{
                backgroundColor: '#ffe4e6',
                color: '#e11d48',
                fontSize: '12px',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '999px',
              }}>
                {wishlistItems.length} {wishlistItems.length === 1 ? 'Artwork' : 'Artworks'}
              </span>
            </div>
            <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
              Curate your personal collection of original authenticated masterworks and enquire whenever you are ready.
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to remove all saved items from your wishlist?')) {
                    clearWishlist();
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  backgroundColor: '#ffffff',
                  color: '#64748b',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.borderColor = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <Trash2 size={14} /> Clear Wishlist
              </button>

              <button
                type="button"
                onClick={() => navigate('/shop')}
                style={{
                  padding: '8px 18px',
                  backgroundColor: '#09090b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                + Add More Artworks
              </button>
            </div>
          )}
        </div>

        {/* 3. Empty State or Items Grid */}
        {wishlistItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#fafaf9', borderRadius: '12px', border: '1px dashed #d4d4d8' }}>
            <div style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              backgroundColor: '#ffe4e6',
              color: '#e11d48',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Heart size={38} strokeWidth={1.75} fill="#e11d48" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#09090b', marginBottom: '8px' }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ color: '#64748b', fontSize: '14.5px', maxWidth: '460px', margin: '0 auto 26px', lineHeight: 1.6 }}>
              You haven&apos;t added any artworks to your wishlist yet. Tap the heart icon on any artwork to save it here for later.
            </p>
            <button
              onClick={() => navigate('/shop')}
              style={{
                padding: '14px 32px',
                backgroundColor: '#09090b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              }}
            >
              Explore Gallery Collection
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px',
          }}>
            {wishlistItems.map((painting) => {
              const hasDiscount = Boolean(painting.mrp && Number(painting.mrp) > Number(painting.price));
              const discountPercent = hasDiscount && painting.mrp
                ? Math.round(((Number(painting.mrp) - Number(painting.price)) / Number(painting.mrp)) * 100)
                : 0;

              return (
                <div
                  key={painting.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e4e4e7',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Artwork Image Container */}
                  <div
                    onClick={() => {
                      onSelectPainting(painting);
                      navigate(`/artwork/${painting.id}`);
                    }}
                    style={{
                      height: '280px',
                      backgroundColor: '#f4f4f5',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                    }}
                  >
                    <img
                      src={painting.image_url}
                      alt={painting.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.35s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.04)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    />

                    {/* Ready to Ship Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      zIndex: 2,
                    }}>
                      <span style={{
                        backgroundColor: '#fffae6',
                        color: '#713f12',
                        fontSize: '9.5px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '3px',
                        letterSpacing: '0.06em',
                        border: '1px solid #fef08a',
                      }}>
                        READY TO SHIP
                      </span>
                      {hasDiscount && (
                        <span style={{
                          backgroundColor: '#e11d48',
                          color: '#ffffff',
                          fontSize: '9.5px',
                          fontWeight: 800,
                          padding: '2.5px 7px',
                          borderRadius: '3px',
                          letterSpacing: '0.06em',
                        }}>
                          {discountPercent}% OFF
                        </span>
                      )}
                    </div>

                    {/* Remove From Wishlist Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(painting.id);
                      }}
                      title="Remove from wishlist"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        zIndex: 3,
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#ffffff',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    >
                      <Heart size={16} fill="#e11d48" color="#e11d48" />
                    </button>
                  </div>

                  {/* Artwork Information */}
                  <div style={{ padding: '18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#e53637',
                      marginBottom: '4px',
                    }}>
                      {painting.artist_name || 'Master Artist'}
                    </div>

                    <h3
                      onClick={() => navigate(`/artwork/${painting.id}`)}
                      style={{
                        fontSize: '16px',
                        fontWeight: 800,
                        color: '#09090b',
                        margin: '0 0 6px 0',
                        cursor: 'pointer',
                        lineHeight: 1.3,
                      }}
                    >
                      {painting.title}
                    </h3>

                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                      {painting.medium || 'Oil on Canvas'} • {painting.dimensions || 'Standard Gallery'}
                    </div>

                    {/* Price Line */}
                    <div style={{ marginTop: 'auto', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 900, color: '#09090b', fontFamily: "'Roboto Condensed', sans-serif" }}>
                          {formatPrice(painting.price, painting.currency)}
                        </span>
                        {hasDiscount && (
                          <span style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'line-through' }}>
                            {formatPrice(painting.mrp, painting.currency)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/artwork/${painting.id}`)}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          backgroundColor: '#f4f4f5',
                          color: '#09090b',
                          border: '1px solid #d4d4d8',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Eye size={14} /> View
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddToCart(painting)}
                        style={{
                          flex: 1.3,
                          padding: '10px 12px',
                          backgroundColor: '#09090b',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <ShoppingBag size={14} /> + Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Assurance Strip */}
        <div className="responsive-3col-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginTop: '60px',
          paddingTop: '32px',
          borderTop: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
            <ShieldCheck size={24} color="#059669" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>100% Certified Authentic</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Includes signed Certificate of Authenticity</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
            <Truck size={24} color="#0284c7" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Free Insured Delivery</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Custom reinforced crates for safe transit</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px' }}>
            <RotateCcw size={24} color="#d97706" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>14-Day Home Trial</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Satisfaction guarantee on all purchases</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

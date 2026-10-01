import React, { useState } from 'react';
import { Painting } from '../types';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

interface PaintingCardProps {
  painting: Painting;
  onViewDetails: (painting: Painting) => void;
  onInquire: (painting: Painting) => void;
}

export const PaintingCard: React.FC<PaintingCardProps> = ({
  painting,
  onViewDetails,
  onInquire,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(painting.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const hasDiscount = Boolean(painting.mrp && Number(painting.mrp) > Number(painting.price));
  const isSale = hasDiscount || painting.featured;
  const isNew = painting.id % 3 === 0;


  return (
    <div
      onClick={() => onViewDetails(painting)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #f3f4f6',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 10px 24px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.02)',
        fontFamily: "'Roboto Condensed', sans-serif",
      }}
    >
      {/* 1. Image Area with Badges & Wishlist (Minimog Style) */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '110%',
        backgroundColor: '#f9fafb',
        overflow: 'hidden',
      }}>
        {/* Top-Left Badges (Minimog Green / Dark Badges) */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {isSale ? (
            <span style={{
              backgroundColor: '#1b3b2b',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2.5px 7px',
              borderRadius: '3px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              Sale
            </span>
          ) : isNew ? (
            <span style={{
              backgroundColor: '#166534',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2.5px 7px',
              borderRadius: '3px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}>
              New
            </span>
          ) : null}
        </div>

        {/* Top-Right: Wishlist Heart Circle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(painting);
          }}
          title={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 3,
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            transition: 'transform 0.15s ease',
          }}
        >
          <Heart size={14} fill={isFavorite ? '#1b3b2b' : 'none'} color={isFavorite ? '#1b3b2b' : '#6b7280'} />
        </button>

        {/* Product Image */}
        <img
          src={painting.image_url}
          alt={painting.title}
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            transition: 'transform 0.4s ease',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
          }}
        />
      </div>

      {/* 2. Card Info Area (Minimog Style) */}
      <div style={{ padding: '12px 14px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Title */}
        <h3 style={{
          fontSize: '14.5px',
          fontWeight: 700,
          color: '#111827',
          margin: '0 0 6px 0',
          lineHeight: 1.3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontFamily: 'inherit',
        }}>
          {painting.title}
        </h3>

        {/* Price & Action Row (Clean, No Hardcoded Ratings) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <span style={{
              fontSize: '15.5px',
              fontWeight: 800,
              color: '#111827',
            }}>
              {formatPrice(painting.price)}
            </span>

            {hasDiscount && painting.mrp && (
              <span style={{
                fontSize: '12px',
                color: '#9ca3af',
                textDecoration: 'line-through',
              }}>
                {formatPrice(painting.mrp)}
              </span>
            )}
          </div>

          {/* Quick Add To Cart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInquire(painting);
            }}
            title="Add to cart / Buy"
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '4px',
              border: '1px solid #e5e7eb',
              backgroundColor: isHovered ? '#1b3b2b' : '#ffffff',
              color: isHovered ? '#ffffff' : '#111827',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <ShoppingBag size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

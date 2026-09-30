import React, { useState } from 'react';
import { Painting } from '../types';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';

interface PaintingCardProps {
  painting: Painting;
  onViewDetails: (painting: Painting) => void;
  onInquire: (painting: Painting) => void;
}

export const PaintingCard: React.FC<PaintingCardProps> = ({
  painting,
  onViewDetails,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = isInWishlist(painting.id);

  const formatPrice = (price: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Use entered MRP for struck-out original price (not auto-calculated)
  const hasDiscount = Boolean(painting.mrp && Number(painting.mrp) > Number(painting.price));
  const discountPercent = hasDiscount && painting.mrp
    ? Math.round(((Number(painting.mrp) - Number(painting.price)) / Number(painting.mrp)) * 100)
    : 0;

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
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 12px 28px rgba(0,0,0,0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
      }}
    >
      {/* 1. Image Area with Badges & Wishlist (Matching Images 3 & 4) */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '125%', // Tall vertical product aspect ratio
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
      }}>
        {/* Top-Left Badges (Matching Images 3 & 4) */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}>
          {/* Badge 1: READY TO SHIP */}
          <span style={{
            backgroundColor: '#fef3c7',
            color: '#854d0e',
            fontSize: '9.5px',
            fontWeight: 800,
            padding: '2.5px 7px',
            borderRadius: '3px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          }}>
            READY TO SHIP
          </span>

          {/* Badge 2: X% OFF only when MRP is provided and greater than selling price */}
          {hasDiscount && (
            <span style={{
              backgroundColor: '#e11d48',
              color: '#ffffff',
              fontSize: '9.5px',
              fontWeight: 800,
              padding: '2.5px 7px',
              borderRadius: '3px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}>
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Top-Right: Wishlist Heart Circle (Matching Images 3 & 4) */}
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
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
            transition: 'transform 0.15s ease',
          }}
        >
          <Heart size={15} fill={isFavorite ? '#e11d48' : 'none'} color={isFavorite ? '#e11d48' : '#64748b'} />
        </button>

        {/* Artwork Image */}
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
            transition: 'transform 0.5s ease',
            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
          }}
        />
      </div>

      {/* 2. Card Info Area (Matching Images 3 & 4) */}
      <div style={{ padding: '14px 14px 16px' }}>
        {/* Atelier / Artist label */}
        <div style={{
          fontSize: '10.5px',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: '4px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          ARTGALLERY ATELIER • {painting.artist_name || 'Master Artist'}
        </div>

        {/* Artwork Title */}
        <h3 style={{
          fontSize: '14px',
          fontWeight: 600,
          color: '#09090b',
          margin: '0 0 8px 0',
          lineHeight: 1.35,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {painting.title}
        </h3>

        {/* Price Row: Bold Price, Strikethrough MRP, Discount % */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#09090b',
            fontFamily: "'Nunito Sans', sans-serif",
          }}>
            {formatPrice(painting.price, painting.currency)}
          </span>

          {hasDiscount && painting.mrp && (
            <>
              <span style={{
                fontSize: '12px',
                color: '#94a3b8',
                textDecoration: 'line-through',
                fontFamily: "'Nunito Sans', sans-serif",
              }}>
                {formatPrice(painting.mrp, painting.currency)}
              </span>

              <span style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#10b981',
              }}>
                {discountPercent}% off
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

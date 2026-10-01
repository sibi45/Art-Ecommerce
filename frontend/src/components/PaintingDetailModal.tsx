import React from 'react';
import { Painting } from '../types';
import { X, MessageSquareText, CheckCircle2, Clock, Ban } from 'lucide-react';

interface PaintingDetailModalProps {
  painting: Painting | null;
  onClose: () => void;
  onInquire: (painting: Painting) => void;
}

export const PaintingDetailModal: React.FC<PaintingDetailModalProps> = ({
  painting,
  onClose,
  onInquire,
}) => {
  if (!painting) return null;

  const formatPrice = (price: number, _currency?: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content modal-flush"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#ffffff',
            border: '1px solid #e5e5e5',
            color: '#111111',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <X size={18} />
        </button>

        <div className="responsive-detail-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '0px',
        }}>
          {/* Artwork Full Image Display */}
          <div style={{
            backgroundColor: '#f3f2ee',
            padding: '24px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRight: '1px solid #e5e5e5',
          }}>
            <div style={{
              boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
              backgroundColor: '#ffffff',
              padding: '12px',
              borderRadius: '2px',
              overflow: 'hidden',
              maxHeight: '480px',
              width: '100%',
              display: 'flex',
            }}>
              <img
                src={painting.image_url}
                alt={painting.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '440px',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>

          {/* Details & Inquire CTA */}
          <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              fontSize: '13px',
              color: '#e53637',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 800,
              marginBottom: '6px',
            }}>
              {painting.artist_name}
            </div>

            <h2 style={{
              fontSize: '1.75rem',
              color: '#111111',
              marginBottom: '14px',
              lineHeight: 1.25,
              fontWeight: 800,
            }}>
              {painting.title}
            </h2>

            {/* Price Box */}
            <div style={{
              backgroundColor: '#f9f9f9',
              padding: '16px 20px',
              border: '1px solid #eeeeee',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div>
                <span style={{ fontSize: '11px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Acquisition Quote
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#111111' }}>
                    {formatPrice(painting.price, painting.currency)}
                  </div>
                  {painting.mrp && Number(painting.mrp) > Number(painting.price) && (
                    <>
                      <span style={{ fontSize: '1.15rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                        {formatPrice(painting.mrp, painting.currency)}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
                        {Math.round(((Number(painting.mrp) - Number(painting.price)) / Number(painting.mrp)) * 100)}% off
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                {painting.status === 'available' && (
                  <span className="badge-available"><CheckCircle2 size={12} /> Available</span>
                )}
                {painting.status === 'reserved' && (
                  <span className="badge-reserved"><Clock size={12} /> In Inquiry</span>
                )}
                {painting.status === 'sold' && (
                  <span className="badge-sold"><Ban size={12} /> Sold</span>
                )}
                {painting.status === 'inactive' && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    backgroundColor: '#f4f4f5',
                    color: '#71717a',
                    border: '1px solid #e4e4e7',
                  }}>
                    <Ban size={12} /> Inactive
                  </span>
                )}
              </div>
            </div>

            {/* Artwork Specifications Table */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                Artwork Specifications
              </div>
              <div className="responsive-2col-grid" style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '13px',
              }}>
                <div style={{ background: '#f5f5f5', padding: '10px 12px', borderRadius: '2px' }}>
                  <span style={{ color: '#777777' }}>Medium: </span>
                  <strong style={{ color: '#111111' }}>{painting.medium}</strong>
                </div>
                <div style={{ background: '#f5f5f5', padding: '10px 12px', borderRadius: '2px' }}>
                  <span style={{ color: '#777777' }}>Dimensions: </span>
                  <strong style={{ color: '#111111' }}>{painting.dimensions}</strong>
                </div>
                <div style={{ background: '#f5f5f5', padding: '10px 12px', borderRadius: '2px' }}>
                  <span style={{ color: '#777777' }}>Framing: </span>
                  <strong style={{ color: '#111111' }}>{painting.is_framed ? 'Custom Frame Included' : 'Unframed'}</strong>
                </div>
                <div style={{ background: '#f5f5f5', padding: '10px 12px', borderRadius: '2px' }}>
                  <span style={{ color: '#777777' }}>Authenticity: </span>
                  <strong style={{ color: '#111111' }}>Signed & Certified</strong>
                </div>
              </div>
            </div>

            {/* Curatorial Description */}
            <div style={{ marginBottom: '24px', flexGrow: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Curatorial Note
              </div>
              <p style={{ fontSize: '14px', color: '#666666', lineHeight: 1.6 }}>
                {painting.description}
              </p>
            </div>

            {/* Inquiry Action */}
            {painting.status !== 'inactive' ? (
              <button
                onClick={() => {
                  onClose();
                  onInquire(painting);
                }}
                disabled={painting.status === 'sold'}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '13px',
                  letterSpacing: '0.12em',
                  opacity: painting.status === 'sold' ? 0.5 : 1,
                }}
              >
                <MessageSquareText size={18} />
                {painting.status === 'sold' ? 'Piece Has Been Sold' : 'Inquire / Add to Cart'}
              </button>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '14px 20px',
                backgroundColor: '#f4f4f5',
                color: '#71717a',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 700,
                border: '1px solid #e4e4e7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}>
                <Ban size={15} /> Artwork Inactive — Buying Option Unavailable
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Inquiry } from '../types';
import { api } from '../services/api';
import { X, CheckCircle2, Clock, Ban, PhoneCall, ShoppingBag } from 'lucide-react';

interface CustomerInquiriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerInquiriesModal: React.FC<CustomerInquiriesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadInquiries();
    }
  }, [isOpen]);

  const loadInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyInquiries();
      setInquiries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return (
          <span className="badge-reserved">
            <Clock size={12} /> Under Review
          </span>
        );
      case 'contacted':
        return (
          <span className="badge-contacted">
            <PhoneCall size={12} /> Curator Contacted
          </span>
        );
      case 'confirmed':
      case 'completed':
        return (
          <span className="badge-available">
            <CheckCircle2 size={12} /> Order Confirmed
          </span>
        );
      case 'cancelled':
        return (
          <span className="badge-sold">
            <Ban size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span className="badge-reserved">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', padding: '32px', backgroundColor: '#ffffff', borderRadius: '4px' }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: '#888888',
            cursor: 'pointer',
            padding: '4px',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: '#e53637', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>
            Collector Portal
          </div>
          <h3 style={{ fontSize: '1.5rem', color: '#111111', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} color="#111111" /> My Purchase Inquiries
          </h3>
          <p style={{ color: '#666666', fontSize: '0.88rem', marginTop: '4px' }}>
            Track the status of your painting acquisition requests and direct curator communications.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888888' }}>
            Loading your acquisition requests...
          </div>
        ) : error ? (
          <div style={{
            background: '#ffebee',
            color: '#c62828',
            padding: '14px',
            borderRadius: '2px',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        ) : inquiries.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            background: '#f9f9f9',
            borderRadius: '2px',
            border: '1px dashed #dddddd',
          }}>
            <p style={{ color: '#666666', marginBottom: '16px' }}>
              You haven't submitted any painting inquiries yet.
            </p>
            <button onClick={onClose} className="btn btn-primary" style={{ fontSize: '0.88rem' }}>
              Explore Available Paintings
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {inquiries.map((inq) => (
              <div
                key={inq.id}
                style={{
                  background: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '2px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {inq.painting?.image_url && (
                      <img
                        src={inq.painting.image_url}
                        alt={inq.painting.title}
                        style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '2px' }}
                      />
                    )}
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#e53637', fontWeight: 800 }}>
                        {inq.inquiry_code}
                      </div>
                      <div style={{ fontWeight: 700, color: '#111111', fontSize: '1.05rem' }}>
                        {inq.painting?.title || 'Fine Art Painting'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#666666' }}>
                        Quoted: <strong style={{ color: '#111111' }}>{formatPrice(inq.quoted_price)}</strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    {getStatusBadge(inq.status)}
                  </div>
                </div>

                <div style={{
                  background: '#f9f9f9',
                  padding: '12px 14px',
                  borderRadius: '2px',
                  fontSize: '0.82rem',
                  color: '#444444',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}>
                  <div>
                    <span style={{ color: '#777777' }}>Contact Method: </span>
                    <strong style={{ color: '#111111', textTransform: 'capitalize' }}>{inq.preferred_contact}</strong> ({inq.customer_phone})
                  </div>
                  <div>
                    <span style={{ color: '#777777' }}>Delivery Destination: </span>
                    <span style={{ color: '#111111' }}>{inq.shipping_address}</span>
                  </div>
                  {inq.admin_notes && (
                    <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #e0e0e0', color: '#e53637' }}>
                      <strong>Curator Update:</strong> {inq.admin_notes}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.72rem', color: '#888888' }}>
                  Submitted on {new Date(inq.created_at).toLocaleDateString()} at {new Date(inq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

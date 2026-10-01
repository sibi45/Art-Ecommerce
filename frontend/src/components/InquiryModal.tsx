import React, { useState } from 'react';
import { Painting, Inquiry } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  Lock,
  CheckCircle,
  Phone,
  MapPin,
  MessageCircle,
  HelpCircle,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

interface InquiryModalProps {
  painting: Painting | null;
  onClose: () => void;
  onOpenAuth: () => void;
  onViewMyInquiries: () => void;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  painting,
  onClose,
  onOpenAuth,
  onViewMyInquiries,
}) => {
  const { user, isAuthenticated } = useAuth();

  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'phone' | 'email'>('whatsapp');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdInquiry, setCreatedInquiry] = useState<Inquiry | null>(null);

  if (!painting) return null;

  const formatPrice = (price: number, _currency?: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (!phone.trim()) {
      setError('Please provide a valid phone number so our curator team can reach you.');
      return;
    }

    if (!address.trim()) {
      setError('Please provide a delivery address for logistics estimation.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api.createInquiry({
        painting_id: painting.id,
        customer_phone: phone.trim(),
        shipping_address: address.trim(),
        preferred_contact: preferredContact,
        message: message.trim() || undefined,
      });
      setCreatedInquiry(result);
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', padding: '32px', backgroundColor: '#ffffff', borderRadius: '4px' }}
      >
        {/* Header Close */}
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

        {/* State 1: Success Confirmation */}
        {createdInquiry ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle size={36} />
            </div>

            <h3 style={{ fontSize: '1.6rem', color: '#111111', marginBottom: '8px', fontWeight: 800 }}>
              Acquisition Inquiry Submitted!
            </h3>
            
            <p style={{ color: '#666666', fontSize: '0.92rem', marginBottom: '20px' }}>
              Your inquiry reference is{' '}
              <strong style={{ color: '#e53637' }}>{createdInquiry.inquiry_code}</strong>.
            </p>

            <div style={{
              background: '#f9f9f9',
              border: '1px solid #e0e0e0',
              borderRadius: '2px',
              padding: '18px',
              textAlign: 'left',
              marginBottom: '24px',
              fontSize: '0.86rem',
              color: '#111111',
            }}>
              <div style={{ fontWeight: 700, color: '#111111', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#e53637" /> Next Steps with Our Curatorial Team:
              </div>
              <ul style={{ paddingLeft: '18px', lineHeight: 1.6, color: '#555555' }}>
                <li>Our art concierge will contact you via <strong>{preferredContact.toUpperCase()}</strong> within 24 hours.</li>
                <li>We will confirm delivery scheduling, insured transit options, and authentication certificates.</li>
                <li>Payment will be arranged directly with the gallery prior to final crating and dispatch.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  onClose();
                  onViewMyInquiries();
                }}
                className="btn btn-primary"
              >
                Track My Inquiries
              </button>
              <button onClick={onClose} className="btn btn-secondary">
                Return to Gallery
              </button>
            </div>
          </div>
        ) : !isAuthenticated ? (
          /* State 2: User Not Logged In */
          <div style={{ textAlign: 'center', padding: '20px 8px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#f3f2ee',
              color: '#111111',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <Lock size={30} />
            </div>

            <h3 style={{ fontSize: '1.5rem', color: '#111111', marginBottom: '12px', fontWeight: 800 }}>
              Collector Sign-In Required
            </h3>

            <p style={{ color: '#666666', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.5 }}>
              To inquire and purchase original art pieces, collectors must first sign in or register an account. This allows our team to securely track your inquiry and contact you directly.
            </p>

            {/* Artwork Preview Card */}
            <div style={{
              background: '#f9f9f9',
              border: '1px solid #eeeeee',
              borderRadius: '2px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              textAlign: 'left',
              marginBottom: '26px',
            }}>
              <img
                src={painting.image_url}
                alt={painting.title}
                style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '2px' }}
              />
              <div>
                <div style={{ fontSize: '0.8rem', color: '#e53637', fontWeight: 700 }}>{painting.artist_name}</div>
                <div style={{ fontWeight: 700, color: '#111111', fontSize: '0.95rem' }}>{painting.title}</div>
                <div style={{ fontSize: '0.85rem', color: '#666666' }}>
                  {formatPrice(painting.price, painting.currency)}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              Sign In or Register Now
            </button>
          </div>
        ) : (
          /* State 3: Authenticated Inquiry Form */
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#e53637', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800 }}>
                Purchase Inquiry
              </div>
              <h3 style={{ fontSize: '1.5rem', color: '#111111', fontWeight: 800 }}>
                Acquisition Request
              </h3>
            </div>

            {/* Painting Brief Header */}
            <div style={{
              background: '#f9f9f9',
              border: '1px solid #eeeeee',
              borderRadius: '2px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img
                  src={painting.image_url}
                  alt={painting.title}
                  style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '2px' }}
                />
                <div>
                  <div style={{ fontWeight: 700, color: '#111111', fontSize: '0.9rem' }}>{painting.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#777777' }}>{painting.medium}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#777777', textTransform: 'uppercase' }}>Price</div>
                <div style={{ fontWeight: 800, color: '#111111', fontSize: '1.1rem' }}>
                  {formatPrice(painting.price, painting.currency)}
                </div>
              </div>
            </div>

            {/* Clarification Notice Banner */}
            <div style={{
              background: '#f3f2ee',
              border: '1px solid #e0ded5',
              borderRadius: '2px',
              padding: '12px 14px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.82rem',
              color: '#555555',
              lineHeight: 1.45,
            }}>
              <ShieldAlert size={18} color="#e53637" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#111111' }}>Direct Gallery Settlement:</strong> We do not take online credit card payments on this website. Once submitted, our dedicated curator will reach out to verify framing, shipping address, and guide payment.
              </div>
            </div>

            {error && (
              <div style={{
                background: '#ffebee',
                color: '#c62828',
                padding: '10px 14px',
                borderRadius: '2px',
                marginBottom: '16px',
                fontSize: '0.85rem',
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Contact Phone / WhatsApp *</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                  <Phone size={16} color="#888" style={{ position: 'absolute', right: '12px', top: '14px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address (City, Region, Postal Code) *</label>
                <div style={{ position: 'relative' }}>
                  <textarea
                    className="form-control"
                    placeholder="Enter your residence or gallery delivery destination for white-glove transit calculation"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                  <MapPin size={16} color="#888" style={{ position: 'absolute', right: '12px', top: '14px' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Communication Channel</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setPreferredContact('whatsapp')}
                    style={{
                      padding: '10px',
                      borderRadius: '2px',
                      border: preferredContact === 'whatsapp' ? '2px solid #25D366' : '1px solid #e0e0e0',
                      background: preferredContact === 'whatsapp' ? '#f0fdf4' : '#ffffff',
                      color: preferredContact === 'whatsapp' ? '#166534' : '#555555',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <MessageCircle size={16} color="#25D366" /> WhatsApp
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreferredContact('phone')}
                    style={{
                      padding: '10px',
                      borderRadius: '2px',
                      border: preferredContact === 'phone' ? '2px solid #111111' : '1px solid #e0e0e0',
                      background: preferredContact === 'phone' ? '#f5f5f5' : '#ffffff',
                      color: '#111111',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Phone size={16} /> Phone
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreferredContact('email')}
                    style={{
                      padding: '10px',
                      borderRadius: '2px',
                      border: preferredContact === 'email' ? '2px solid #111111' : '1px solid #e0e0e0',
                      background: preferredContact === 'email' ? '#f5f5f5' : '#ffffff',
                      color: '#111111',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    Email
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Special Notes or Framing Request (Optional)</label>
                <textarea
                  className="form-control"
                  placeholder="E.g., Inquire about custom walnut framing, insurance certification, or specific delivery dates..."
                  rows={2}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px', marginTop: '10px' }}
              >
                {loading ? 'Submitting to Curator...' : 'Confirm & Request Acquisition'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Painting, Inquiry } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Truck,
  Phone,
  MapPin,
  MessageCircle,
  Sparkles,
  Lock
} from 'lucide-react';

interface CartScreenProps {
  cartItems: Painting[];
  onRemoveItem: (paintingId: number) => void;
  onClearCart: () => void;
  onContinueShopping: () => void;
  onOpenAuth: () => void;
  onViewMyInquiries: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  cartItems,
  onRemoveItem,
  onClearCart,
  onContinueShopping,
  onOpenAuth,
  onViewMyInquiries,
}) => {
  const { user, isAuthenticated } = useAuth();

  // Form states for checkout/inquiry
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'phone' | 'email'>('whatsapp');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedInquiries, setSubmittedInquiries] = useState<Inquiry[]>([]);
  const [orderComplete, setOrderComplete] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!phone.trim()) {
      setError('Please provide your Phone or WhatsApp number so our curator can coordinate delivery.');
      return;
    }

    if (!address.trim()) {
      setError('Please provide a delivery address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const results: Inquiry[] = [];
      // Submit inquiries for all artworks in cart
      for (const item of cartItems) {
        const inq = await api.createInquiry({
          painting_id: item.id,
          customer_phone: phone.trim(),
          shipping_address: address.trim(),
          preferred_contact: preferredContact,
          message: notes.trim() || undefined,
        });
        results.push(inq);
      }

      setSubmittedInquiries(results);
      setOrderComplete(true);
      onClearCart();
    } catch (err: any) {
      setError(err.message || 'Failed to submit cart inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // State 1: Order Confirmation Screen
  if (orderComplete) {
    return (
      <div style={{ backgroundColor: '#ffffff', minHeight: '80vh', padding: '60px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle size={42} />
          </div>

          <div style={{ fontSize: '13px', color: '#e53637', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '8px' }}>
            ACQUISITION REQUEST RECEIVED
          </div>

          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#111111', marginBottom: '16px' }}>
            Thank You for Your Order!
          </h1>

          <p style={{ color: '#666666', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '32px' }}>
            Your cart inquiry has been successfully sent to our master curators. Each artwork is now placed on temporary hold for your verification.
          </p>

          <div style={{
            backgroundColor: '#f9f9f9',
            border: '1px solid #eeeeee',
            padding: '24px',
            textAlign: 'left',
            marginBottom: '36px',
          }}>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#111111', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="#e53637" /> Summary of Inquired Artworks:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {submittedInquiries.map((inq, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eeeeee', paddingBottom: '8px', fontSize: '14px' }}>
                  <div>
                    <strong>{inq.inquiry_code}</strong> • {inq.painting?.title || 'Original Canvas'}
                  </div>
                  <div style={{ fontWeight: 700, color: '#111111' }}>
                    {formatPrice(inq.quoted_price)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '16px', fontSize: '13px', color: '#666666', lineHeight: 1.5 }}>
              Our curator will contact you via <strong>{preferredContact.toUpperCase()}</strong> at <strong>{phone}</strong> to confirm framing options, insured courier delivery, and secure payment.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={onViewMyInquiries} className="btn btn-primary" style={{ padding: '14px 32px' }}>
              Track My Inquiries
            </button>
            <button onClick={onContinueShopping} className="btn btn-secondary" style={{ padding: '14px 32px' }}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '85vh', paddingBottom: '90px' }}>
      {/* 1. Page Breadcrumb Banner (Male Fashion style) */}
      <section style={{
        backgroundColor: '#f3f2ee',
        padding: '40px 24px',
        borderBottom: '1px solid #e5e5e5',
        marginBottom: '60px',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#111111', marginBottom: '8px' }}>
            Shopping Cart
          </h1>
          <div style={{ fontSize: '14px', color: '#777777', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              onClick={onContinueShopping}
              style={{ cursor: 'pointer', color: '#111111', fontWeight: 600 }}
            >
              Home
            </span>
            <span>&gt;</span>
            <span
              onClick={onContinueShopping}
              style={{ cursor: 'pointer', color: '#111111', fontWeight: 600 }}
            >
              Shop
            </span>
            <span>&gt;</span>
            <span style={{ color: '#e53637', fontWeight: 700 }}>Shopping Cart</span>
          </div>
        </div>
      </section>

      {/* 2. Main Cart Layout */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#f3f2ee',
              color: '#888888',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <ShoppingBag size={40} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111111', marginBottom: '10px' }}>
              Your Cart is Empty
            </h2>
            <p style={{ color: '#666666', fontSize: '1rem', maxWidth: '420px', margin: '0 auto 28px' }}>
              Explore our curated fine art catalog and discover authenticated original paintings for your private collection.
            </p>
            <button onClick={onContinueShopping} className="btn btn-primary" style={{ padding: '16px 36px' }}>
              Explore Gallery Catalog
            </button>
          </div>
        ) : (
          /* Cart Content: Items Table + Summary Column */
          <div className="responsive-cart-grid" style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.1fr',
            gap: '48px',
            alignItems: 'start',
          }}>
            {/* Left: Cart Items Table */}
            <div>
              <div style={{
                overflowX: 'auto',
                borderBottom: '1px solid #eeeeee',
                marginBottom: '32px',
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #111111' }}>
                      <th style={{ padding: '14px 0', fontSize: '14px', fontWeight: 800, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        PRODUCT
                      </th>
                      <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 800, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        PRICE
                      </th>
                      <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 800, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        QTY
                      </th>
                      <th style={{ padding: '14px 16px', fontSize: '14px', fontWeight: 800, color: '#111111', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        TOTAL
                      </th>
                      <th style={{ padding: '14px 0', textAlign: 'right' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f2f2f2' }}>
                        {/* Artwork info */}
                        <td style={{ padding: '24px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{
                              width: '80px',
                              height: '80px',
                              backgroundColor: '#f3f2ee',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden',
                            }}>
                              <img
                                src={item.image_url}
                                alt={item.title}
                                style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                              />
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', color: '#e53637', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {item.artist_name}
                              </div>
                              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111111', margin: '2px 0 4px' }}>
                                {item.title}
                              </div>
                              <div style={{ fontSize: '13px', color: '#888888' }}>
                                {item.medium} • {item.dimensions}
                              </div>
                              {item.is_framed && (
                                <div style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 600, marginTop: '2px' }}>
                                  ✓ Custom Framing Included
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td style={{ padding: '24px 16px', fontSize: '16px', fontWeight: 700, color: '#111111', whiteSpace: 'nowrap' }}>
                          {formatPrice(item.price)}
                        </td>

                        {/* Quantity */}
                        <td style={{ padding: '24px 16px', fontSize: '14px', color: '#555555' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            border: '1px solid #e0e0e0',
                            fontWeight: 700,
                            color: '#111111',
                          }}>
                            1
                          </span>
                        </td>

                        {/* Total */}
                        <td style={{ padding: '24px 16px', fontSize: '16px', fontWeight: 800, color: '#111111', whiteSpace: 'nowrap' }}>
                          {formatPrice(item.price)}
                        </td>

                        {/* Action: Remove */}
                        <td style={{ padding: '24px 0', textAlign: 'right' }}>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            title="Remove item"
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#999999',
                              padding: '8px',
                              transition: 'color 0.2s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#e53637')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#999999')}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bottom Table Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <button
                  onClick={onContinueShopping}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <ArrowLeft size={16} /> CONTINUE SHOPPING
                </button>

                <button
                  onClick={onClearCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888888',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#e53637')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                >
                  CLEAR SHOPPING CART
                </button>
              </div>

              {/* Value Props Row */}
              <div className="responsive-2col-grid" style={{
                marginTop: '40px',
                padding: '20px',
                backgroundColor: '#f9f9f9',
                border: '1px solid #eeeeee',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Truck size={24} color="#e53637" />
                  <div style={{ fontSize: '13px', color: '#555555' }}>
                    <strong style={{ color: '#111111' }}>Insured Transit:</strong> Crated & shipped with full insurance across India and globally.
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={24} color="#e53637" />
                  <div style={{ fontSize: '13px', color: '#555555' }}>
                    <strong style={{ color: '#111111' }}>Provenance Certificate:</strong> Signed physical certification accompanying artwork.
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Checkout & Acquisition Form */}
            <div style={{
              backgroundColor: '#f3f2ee',
              padding: '36px 30px',
              border: '1px solid #e5e5e5',
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: 800,
                color: '#111111',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: '24px',
                borderBottom: '2px solid #111111',
                paddingBottom: '12px',
              }}>
                CART TOTAL
              </div>

              {/* Price breakdown */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px', color: '#555555' }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 700, color: '#111111' }}>{formatPrice(subtotal)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', fontSize: '14px', color: '#555555' }}>
                <span>Insured White-Glove Delivery</span>
                <span style={{ fontWeight: 700, color: '#2e7d32' }}>FREE</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px', fontSize: '14px', color: '#555555' }}>
                <span>Certificate of Authenticity</span>
                <span style={{ fontWeight: 700, color: '#2e7d32' }}>INCLUDED</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '16px',
                borderTop: '1px solid #dcdcd5',
                marginBottom: '28px',
                fontSize: '18px',
                fontWeight: 800,
                color: '#111111',
              }}>
                <span>Total</span>
                <span style={{ color: '#e53637', fontSize: '20px' }}>{formatPrice(subtotal)}</span>
              </div>

              {/* Collector Details Form */}
              <form onSubmit={handleCheckout}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#111111',
                  marginBottom: '14px',
                }}>
                  ACQUISITION DETAILS
                </div>

                {!isAuthenticated ? (
                  <div style={{
                    backgroundColor: '#ffffff',
                    padding: '16px',
                    border: '1px solid #e0ded5',
                    marginBottom: '18px',
                    textAlign: 'center',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                      <Lock size={24} color="#111111" />
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111111', marginBottom: '4px' }}>
                      Sign In to Complete Acquisition
                    </div>
                    <p style={{ fontSize: '12px', color: '#777777', marginBottom: '12px' }}>
                      Create an account or login to track this acquisition.
                    </p>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '10px' }}
                    >
                      Sign In / Register
                    </button>
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#2e7d32', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> Signed in as {user?.full_name} ({user?.email})
                  </div>
                )}

                {error && (
                  <div style={{
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    padding: '10px',
                    fontSize: '13px',
                    borderRadius: '2px',
                    marginBottom: '14px',
                  }}>
                    {error}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Phone / WhatsApp Number *</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                    <Phone size={15} color="#888" style={{ position: 'absolute', right: '12px', top: '14px' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Delivery Destination (Address, City, State) *</label>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      className="form-control"
                      placeholder="Enter shipping address for insured art logistics"
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                    <MapPin size={15} color="#888" style={{ position: 'absolute', right: '12px', top: '14px' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '14px' }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Preferred Contact Channel</label>
                  <div className="responsive-2col-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setPreferredContact('whatsapp')}
                      style={{
                        padding: '8px',
                        border: preferredContact === 'whatsapp' ? '2px solid #25D366' : '1px solid #d0d0d0',
                        background: preferredContact === 'whatsapp' ? '#f0fdf4' : '#ffffff',
                        color: preferredContact === 'whatsapp' ? '#166534' : '#444444',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <MessageCircle size={14} color="#25D366" /> WhatsApp
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredContact('phone')}
                      style={{
                        padding: '8px',
                        border: preferredContact === 'phone' ? '2px solid #111111' : '1px solid #d0d0d0',
                        background: preferredContact === 'phone' ? '#ffffff' : '#ffffff',
                        color: '#111111',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <Phone size={14} /> Phone Call
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" style={{ fontSize: '12px' }}>Framing / Custom Notes (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="E.g., custom gold leaf frame, delivery date..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '16px',
                    fontSize: '14px',
                    letterSpacing: '0.12em',
                    fontWeight: 800,
                  }}
                >
                  {loading ? 'Submitting Inquiries...' : 'PROCEED TO CHECKOUT →'}
                </button>
              </form>

              <div style={{ marginTop: '16px', fontSize: '11px', color: '#777777', lineHeight: 1.5, textAlign: 'center' }}>
                Direct gallery settlement. No cold credit card charges. Our curator will verify condition & authenticity certificates directly with you.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

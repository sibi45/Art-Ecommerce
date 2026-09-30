import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Inquiry } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PackageCheck,
  Clock,
  PhoneCall,
  CheckCircle2,
  Ban,
  MapPin,
  MessageCircle,
  Phone,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Lock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Truck,
  Check,
  Filter
} from 'lucide-react';

interface OrdersScreenProps {
  onOpenAuth: () => void;
}

export const OrdersScreen: React.FC<OrdersScreenProps> = ({ onOpenAuth }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTab, setFilterTab] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (isAuthenticated) {
      loadInquiries();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadInquiries = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMyInquiries();
      setInquiries(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your orders');
    } finally {
      setLoading(false);
    }
  };

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
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '999px',
            backgroundColor: '#fef3c7',
            color: '#92400e',
            fontSize: '11.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            <Clock size={12} /> Under Curator Review
          </span>
        );
      case 'contacted':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '999px',
            backgroundColor: '#e0f2fe',
            color: '#0369a1',
            fontSize: '11.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            <PhoneCall size={12} /> Curator Contacted
          </span>
        );
      case 'confirmed':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '999px',
            backgroundColor: '#dcfce7',
            color: '#166534',
            fontSize: '11.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            <CheckCircle2 size={12} /> Order Confirmed
          </span>
        );
      case 'completed':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '999px',
            backgroundColor: '#ecfdf5',
            color: '#065f46',
            fontSize: '11.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            <PackageCheck size={12} /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '999px',
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            fontSize: '11.5px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}>
            <Ban size={12} /> Cancelled
          </span>
        );
      default:
        return (
          <span style={{
            padding: '4px 10px',
            borderRadius: '999px',
            backgroundColor: '#f4f4f5',
            color: '#3f3f46',
            fontSize: '11.5px',
            fontWeight: 700,
          }}>
            {status}
          </span>
        );
    }
  };

  const getActiveStep = (status: string) => {
    switch (status) {
      case 'new': return 1;
      case 'contacted': return 2;
      case 'confirmed': return 3;
      case 'completed': return 4;
      default: return 1;
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (filterTab === 'active') return inq.status === 'new' || inq.status === 'contacted' || inq.status === 'confirmed';
    if (filterTab === 'completed') return inq.status === 'completed' || inq.status === 'cancelled';
    return true;
  });

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '85vh', paddingBottom: '90px' }}>
      {/* 1. Header Banner */}
      <section style={{
        backgroundColor: '#fafaf9',
        padding: '40px 24px',
        borderBottom: '1px solid #e7e5e4',
        marginBottom: '36px',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#09090b', margin: '0 0 6px 0', fontFamily: "'Nunito Sans', sans-serif" }}>
                My Collector Orders & Inquiries
              </h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Live transit tracking, provenance confirmation, and direct curator communications.
              </p>
            </div>

            {isAuthenticated && (
              <button
                onClick={loadInquiries}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d4d4d8',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#09090b',
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={13} /> Refresh Orders
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        {!isAuthenticated ? (
          /* Not Signed In */
          <div style={{
            textAlign: 'center',
            padding: '70px 20px',
            backgroundColor: '#fafafa',
            border: '1px solid #e4e4e7',
            borderRadius: '12px',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              color: '#09090b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Lock size={28} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090b', marginBottom: '8px' }}>
              Sign In to View Your Orders
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '440px', margin: '0 auto 20px', lineHeight: 1.5 }}>
              Please authenticate your collector account to access your full acquisition records, tracking, and invoices.
            </p>
            <button
              onClick={onOpenAuth}
              style={{
                padding: '12px 32px',
                backgroundColor: '#09090b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign In to Collector Account
            </button>
          </div>
        ) : loading ? (
          /* Loading State */
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#71717a' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e4e4e7',
              borderTopColor: '#09090b',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              margin: '0 auto 14px',
            }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#09090b' }}>Loading your orders...</div>
          </div>
        ) : error ? (
          /* Error State */
          <div style={{
            backgroundColor: '#fef2f2',
            color: '#b91c1c',
            padding: '20px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid #fecaca',
          }}>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}>{error}</p>
            <button onClick={loadInquiries} style={{ padding: '8px 18px', backgroundColor: '#b91c1c', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>
              Retry
            </button>
          </div>
        ) : inquiries.length === 0 ? (
          /* Empty Orders */
          <div style={{
            textAlign: 'center',
            padding: '70px 20px',
            backgroundColor: '#fafafa',
            border: '1px solid #e4e4e7',
            borderRadius: '12px',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              border: '1px solid #e4e4e7',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <ShoppingBag size={30} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#09090b', marginBottom: '8px' }}>
              No Orders Found Yet
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '420px', margin: '0 auto 20px' }}>
              You haven't placed any artwork acquisition orders yet. Explore our curated catalog to view and acquire unique original paintings.
            </p>
            <button
              onClick={() => {
                navigate('/shop');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              style={{
                padding: '12px 28px',
                backgroundColor: '#09090b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Explore Gallery Catalog
            </button>
          </div>
        ) : (
          /* Orders List with Global Standard Layout */
          <div>
            {/* Filter Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setFilterTab('all')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: filterTab === 'all' ? '1px solid #09090b' : '1px solid #e4e4e7',
                    backgroundColor: filterTab === 'all' ? '#09090b' : '#ffffff',
                    color: filterTab === 'all' ? '#ffffff' : '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  All Orders ({inquiries.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('active')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: filterTab === 'active' ? '1px solid #09090b' : '1px solid #e4e4e7',
                    backgroundColor: filterTab === 'active' ? '#09090b' : '#ffffff',
                    color: filterTab === 'active' ? '#ffffff' : '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Active Orders ({inquiries.filter(i => i.status !== 'completed' && i.status !== 'cancelled').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTab('completed')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: filterTab === 'completed' ? '1px solid #09090b' : '1px solid #e4e4e7',
                    backgroundColor: filterTab === 'completed' ? '#09090b' : '#ffffff',
                    color: filterTab === 'completed' ? '#ffffff' : '#475569',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Completed ({inquiries.filter(i => i.status === 'completed' || i.status === 'cancelled').length})
                </button>
              </div>

              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Showing <strong>{filteredInquiries.length}</strong> {filteredInquiries.length === 1 ? 'order' : 'orders'}
              </div>
            </div>

            {/* Order Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {filteredInquiries.map((inq) => {
                const currentStep = getActiveStep(inq.status);
                return (
                  <div
                    key={inq.id}
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '24px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Header Bar */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingBottom: '16px',
                      borderBottom: '1px solid #f1f5f9',
                      marginBottom: '20px',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}>
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                          Order Reference
                        </span>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', letterSpacing: '0.02em' }}>
                          {inq.inquiry_code}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          {new Date(inq.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        {getStatusBadge(inq.status)}
                      </div>
                    </div>

                    {/* Global Standard Order Progress Stepper */}
                    {inq.status !== 'cancelled' && (
                      <div style={{
                        backgroundColor: '#fafaf9',
                        borderRadius: '8px',
                        padding: '16px 20px',
                        marginBottom: '20px',
                        border: '1px solid #f1f5f9',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                          {/* Connecting Line */}
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '30px',
                            right: '30px',
                            height: '2px',
                            backgroundColor: '#e2e8f0',
                            zIndex: 0,
                          }} />
                          <div style={{
                            position: 'absolute',
                            top: '12px',
                            left: '30px',
                            width: currentStep === 1 ? '10%' : currentStep === 2 ? '40%' : currentStep === 3 ? '70%' : '100%',
                            height: '2px',
                            backgroundColor: '#10b981',
                            zIndex: 0,
                            transition: 'width 0.4s ease',
                          }} />

                          {/* Step 1 */}
                          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', minWidth: '70px' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: currentStep >= 1 ? '#10b981' : '#ffffff',
                              border: `2px solid ${currentStep >= 1 ? '#10b981' : '#cbd5e1'}`,
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 6px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}>
                              {currentStep > 1 ? <Check size={14} /> : '1'}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: currentStep === 1 ? 700 : 500, color: currentStep >= 1 ? '#0f172a' : '#94a3b8' }}>
                              Received
                            </span>
                          </div>

                          {/* Step 2 */}
                          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', minWidth: '70px' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: currentStep >= 2 ? '#10b981' : '#ffffff',
                              border: `2px solid ${currentStep >= 2 ? '#10b981' : '#cbd5e1'}`,
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 6px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}>
                              {currentStep > 2 ? <Check size={14} /> : '2'}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: currentStep === 2 ? 700 : 500, color: currentStep >= 2 ? '#0f172a' : '#94a3b8' }}>
                              Curator Review
                            </span>
                          </div>

                          {/* Step 3 */}
                          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', minWidth: '70px' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: currentStep >= 3 ? '#10b981' : '#ffffff',
                              border: `2px solid ${currentStep >= 3 ? '#10b981' : '#cbd5e1'}`,
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 6px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}>
                              {currentStep > 3 ? <Check size={14} /> : '3'}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: currentStep === 3 ? 700 : 500, color: currentStep >= 3 ? '#0f172a' : '#94a3b8' }}>
                              Crating & Transit
                            </span>
                          </div>

                          {/* Step 4 */}
                          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', minWidth: '70px' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: currentStep >= 4 ? '#10b981' : '#ffffff',
                              border: `2px solid ${currentStep >= 4 ? '#10b981' : '#cbd5e1'}`,
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 6px',
                              fontSize: '11px',
                              fontWeight: 700,
                            }}>
                              {currentStep === 4 ? <Check size={14} /> : '4'}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: currentStep === 4 ? 700 : 500, color: currentStep >= 4 ? '#0f172a' : '#94a3b8' }}>
                              Delivered
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Artwork Item Row */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '90px 1fr auto',
                      gap: '20px',
                      alignItems: 'center',
                      marginBottom: '20px',
                    }}>
                      <div
                        onClick={() => inq.painting && navigate(`/artwork/${inq.painting.id}`)}
                        style={{
                          width: '90px',
                          height: '90px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#f4f4f5',
                          border: '1px solid #e2e8f0',
                          cursor: inq.painting ? 'pointer' : 'default',
                        }}
                      >
                        {inq.painting?.image_url ? (
                          <img
                            src={inq.painting.image_url}
                            alt={inq.painting.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                            <ShoppingBag size={28} />
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: '11px', color: '#e53637', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {inq.painting?.artist_name || 'Master Artist'}
                        </div>
                        <h4
                          onClick={() => inq.painting && navigate(`/artwork/${inq.painting.id}`)}
                          style={{
                            fontSize: '17px',
                            fontWeight: 700,
                            color: '#09090b',
                            margin: '3px 0 4px',
                            cursor: inq.painting ? 'pointer' : 'default',
                          }}
                        >
                          {inq.painting?.title || 'Original Fine Art Piece'}
                        </h4>
                        <div style={{ fontSize: '13px', color: '#64748b' }}>
                          {inq.painting?.medium} {inq.painting?.dimensions ? `• ${inq.painting.dimensions}` : ''}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                          Order Total
                        </div>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: '#09090b', fontFamily: "'Nunito Sans', sans-serif" }}>
                          {formatPrice(inq.quoted_price)}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Info Bar & Quick Actions */}
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '14px 18px',
                      fontSize: '12.5px',
                      color: '#475569',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '14px',
                      border: '1px solid #f1f5f9',
                    }}>
                      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>SHIPPING TO</span>
                          <span style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={13} color="#e53637" /> {inq.shipping_address}
                          </span>
                        </div>

                        <div>
                          <span style={{ color: '#94a3b8', fontSize: '11px', display: 'block' }}>CONTACT DETAILS</span>
                          <span style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {inq.preferred_contact === 'whatsapp' ? (
                              <MessageCircle size={13} color="#16a34a" />
                            ) : (
                              <Phone size={13} color="#0284c7" />
                            )}
                            {inq.customer_phone}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {inq.painting && (
                          <Link
                            to={`/artwork/${inq.painting.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '6px 14px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: '#0f172a',
                              textDecoration: 'none',
                            }}
                          >
                            <ExternalLink size={12} /> View Artwork Page
                          </Link>
                        )}

                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Hello ArtGallery, I am following up on my order reference ${inq.inquiry_code} for "${inq.painting?.title || 'Artwork'}".`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 14px',
                            backgroundColor: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#15803d',
                            textDecoration: 'none',
                          }}
                        >
                          <MessageCircle size={12} /> WhatsApp Curator
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

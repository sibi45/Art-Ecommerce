import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Painting, Category } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Award,
  CheckCircle2,
  Heart,
  Share2,
  Maximize2,
  Eye,
  ShoppingBag,
  MessageCircle,
  Phone,
  ArrowLeft,
  Sparkles,
  Star,
  Check,
  Lock,
  Layers,
  Calendar,
  MapPin,
  ChevronRight,
  Info
} from 'lucide-react';

interface ArtworkOrderPageProps {
  onAddToCart: (painting: Painting) => void;
  onOpenAuth: () => void;
  categories: Category[];
}

export const ArtworkOrderPage: React.FC<ArtworkOrderPageProps> = ({
  onAddToCart,
  onOpenAuth,
  categories,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [painting, setPainting] = useState<Painting | null>(null);
  const [relatedPaintings, setRelatedPaintings] = useState<Painting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Viewer modes: 'canvas' | 'framed' | 'room'
  const [viewerMode, setViewerMode] = useState<'canvas' | 'framed' | 'room'>('canvas');
  const [isZoomed, setIsZoomed] = useState(false);
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isFavorite = painting ? isInWishlist(painting.id) : false;
  const [copiedLink, setCopiedLink] = useState(false);

  // Active info tab
  const [activeTab, setActiveTab] = useState<'details' | 'authenticity' | 'shipping' | 'curator'>('details');

  // Selected image for multi-image gallery
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Hover magnifier state
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number; panelLeft: number; panelTop: number; panelH: number } | null>(null);
  const imgContainerRef = React.useRef<HTMLDivElement>(null);

  // Instant Order Form State
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [cityPin, setCityPin] = useState('');
  const [preferredContact, setPreferredContact] = useState<'whatsapp' | 'phone' | 'email'>('whatsapp');
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    if (user && !customerName) {
      setCustomerName(user.full_name || '');
    }
  }, [user]);

  useEffect(() => {
    if (id) {
      loadArtwork(Number(id));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [id]);

  const loadArtwork = async (paintingId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPainting(paintingId);
      setPainting(data);
      setSelectedImage(data.image_url); // reset to main image on load

      // Load related artworks
      const all = await api.getPaintings();
      const related = all
        .filter((p) => p.id !== paintingId && (p.category_id === data.category_id || p.artist_name === data.artist_name))
        .slice(0, 4);
      setRelatedPaintings(related.length > 0 ? related : all.filter(p => p.id !== paintingId).slice(0, 4));
    } catch (err: any) {
      setError(err.message || 'Artwork not found or has been unlisted.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleInstantOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!painting) return;

    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (!customerPhone.trim()) {
      alert('Please provide your Contact Phone / WhatsApp number so our team can reach you.');
      return;
    }

    setOrderSubmitting(true);
    try {
      const fullAddress = cityPin.trim()
        ? `${shippingAddress.trim()} (${cityPin.trim()})`
        : (shippingAddress.trim() || 'Location requested on contact');

      const fullMessage = [
        customerName ? `Client Name: ${customerName.trim()}` : '',
        orderNotes ? `Customer Inquiry/Questions: ${orderNotes.trim()}` : '',
        `Product Enquiry for "${painting.title}" (${formatPrice(painting.price)})`
      ].filter(Boolean).join(' | ');

      const response = await api.createInquiry({
        painting_id: painting.id,
        customer_phone: customerPhone.trim(),
        shipping_address: fullAddress,
        preferred_contact: preferredContact,
        message: fullMessage,
      });

      setOrderSuccess(response);
    } catch (err: any) {
      const errMsg = err?.message || '';
      if (
        errMsg.toLowerCase().includes('credential') ||
        errMsg.toLowerCase().includes('401') ||
        errMsg.toLowerCase().includes('not authenticated') ||
        errMsg.toLowerCase().includes('unauthorized')
      ) {
        onOpenAuth();
      } else {
        alert(errMsg || 'Failed to submit your enquiry. Please try again.');
      }
    } finally {
      setOrderSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fcfcfb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '3px solid #e4e4e7',
            borderTopColor: '#09090b',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#71717a', fontSize: '14px', letterSpacing: '0.05em' }}>Loading Artwork Details...</p>
        </div>
      </div>
    );
  }

  if (error || !painting) {
    return (
      <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', padding: '40px 20px' }}>
        <div style={{ maxWidth: '480px', textAlign: 'center', padding: '40px', borderRadius: '12px', border: '1px solid #e4e4e7', background: '#fafafa' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#09090b', marginBottom: '8px' }}>Artwork Unavailable</h2>
          <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '24px' }}>{error || 'This artwork record could not be loaded.'}</p>
          <button
            onClick={() => navigate('/shop')}
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
            Explore Gallery Collection
          </button>
        </div>
      </div>
    );
  }

  const categoryName = categories.find((c) => c.id === painting.category_id)?.name || 'Fine Art';
  const isAvailable = painting.status !== 'sold' && painting.status !== 'inactive';

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#09090b', paddingBottom: '80px' }}>
      {/* 1. Breadcrumbs & Top Bar */}
      <div style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: '#fafaf9' }}>
        <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b' }}>
            <Link to="/home" style={{ color: '#09090b', textDecoration: 'none', fontWeight: 500 }}>Home</Link>
            <ChevronRight size={14} color="#94a3b8" />
            <Link to="/shop" style={{ color: '#09090b', textDecoration: 'none', fontWeight: 500 }}>Collection</Link>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ color: '#64748b' }}>{categoryName}</span>
            <ChevronRight size={14} color="#94a3b8" />
            <span style={{ color: '#09090b', fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {painting.title}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate(-1)}
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
            <span style={{ color: '#cbd5e1' }}>|</span>
            <button
              onClick={handleShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                padding: '5px 12px',
                color: '#1e293b',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Share2 size={13} /> {copiedLink ? 'Link Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Artwork Order & Presentation Showcase */}
      <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '36px 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)', gap: '48px', alignItems: 'start' }}>
          
          {/* LEFT: Master Artwork Viewer & Visualizer */}
          <div>
            {/* Viewer Mode Tabs */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                <button
                  type="button"
                  onClick={() => setViewerMode('canvas')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: viewerMode === 'canvas' ? '#ffffff' : 'transparent',
                    color: viewerMode === 'canvas' ? '#09090b' : '#64748b',
                    boxShadow: viewerMode === 'canvas' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  Gallery View
                </button>
                <button
                  type="button"
                  onClick={() => setViewerMode('framed')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: viewerMode === 'framed' ? '#ffffff' : 'transparent',
                    color: viewerMode === 'framed' ? '#09090b' : '#64748b',
                    boxShadow: viewerMode === 'framed' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  Framed Preview
                </button>
                <button
                  type="button"
                  onClick={() => setViewerMode('room')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: viewerMode === 'room' ? '#ffffff' : 'transparent',
                    color: viewerMode === 'room' ? '#09090b' : '#64748b',
                    boxShadow: viewerMode === 'room' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  }}
                >
                  View in Room
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                <Maximize2 size={13} /> {isZoomed ? 'Standard' : 'Zoom View'}
              </button>
            </div>

            {/* Visualizer Display Box */}
            <div
              style={{
                position: 'relative',
                borderRadius: '12px',
                backgroundColor: viewerMode === 'room' ? '#e2e8f0' : '#f8f8f7',
                border: '1px solid #e4e4e7',
                minHeight: '520px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: viewerMode === 'room' ? '60px 40px 100px' : '40px',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
            >
              {/* Room Background Mockup */}
              {viewerMode === 'room' && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'radial-gradient(ellipse at top, #fafaf9, #e7e5e4)',
                  zIndex: 0,
                }}>
                  {/* Living room floor shadow */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '80px',
                    backgroundColor: '#d6d3d1',
                    borderTop: '2px solid #a8a29e',
                  }} />
                  <div style={{
                    position: 'absolute',
                    bottom: '86px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '320px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.18)',
                    filter: 'blur(8px)',
                  }} />
                </div>
              )}

              {/* Artwork Container */}
              <div
                ref={imgContainerRef}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  padding: viewerMode === 'framed' ? '22px' : '0px',
                  backgroundColor: viewerMode === 'framed' ? '#18181b' : 'transparent',
                  boxShadow: viewerMode === 'framed'
                    ? '0 24px 48px rgba(0,0,0,0.35), inset 0 0 0 3px #3f3f46'
                    : viewerMode === 'room'
                    ? '0 20px 40px rgba(0,0,0,0.25)'
                    : '0 16px 36px rgba(0,0,0,0.1)',
                  borderRadius: viewerMode === 'framed' ? '4px' : '2px',
                  maxWidth: isZoomed ? '100%' : viewerMode === 'room' ? '340px' : '520px',
                  transition: 'all 0.3s ease',
                  cursor: viewerMode === 'canvas' && !isZoomed ? 'crosshair' : isZoomed ? 'zoom-out' : 'zoom-in',
                }}
                onMouseMove={(e) => {
                  if (viewerMode !== 'canvas' || isZoomed) return;
                  const rect = imgContainerRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const y = ((e.clientY - rect.top) / rect.height) * 100;
                  setZoomPos({
                    x: Math.min(Math.max(x, 0), 100),
                    y: Math.min(Math.max(y, 0), 100),
                    panelLeft: rect.right + 16,
                    panelTop: rect.top,
                    panelH: rect.height,
                  });
                }}
                onMouseLeave={() => setZoomPos(null)}
              >
                <img
                  src={selectedImage || painting.image_url}
                  alt={painting.title}
                  style={{
                    display: 'block',
                    width: '100%',
                    height: 'auto',
                    maxHeight: isZoomed ? '680px' : viewerMode === 'room' ? '360px' : '520px',
                    objectFit: 'contain',
                    cursor: isZoomed ? 'zoom-out' : viewerMode === 'canvas' ? 'crosshair' : 'zoom-in',
                    borderRadius: '2px',
                    userSelect: 'none',
                  }}
                  onClick={() => setIsZoomed(!isZoomed)}
                />

                {/* Hover lens overlay */}
                {zoomPos && viewerMode === 'canvas' && !isZoomed && (
                  <div
                    style={{
                      position: 'absolute',
                      width: '120px',
                      height: '120px',
                      border: '2px solid rgba(9,9,11,0.5)',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(0px)',
                      pointerEvents: 'none',
                      transform: 'translate(-50%, -50%)',
                      left: `${zoomPos.x}%`,
                      top: `${zoomPos.y}%`,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.08)',
                      zIndex: 10,
                    }}
                  />
                )}
              </div>

              {/* Zoom Panel — fixed position, escapes overflow:hidden parent */}
              {zoomPos && viewerMode === 'canvas' && !isZoomed && (() => {
                const ZOOM = 2.8;
                // Clamp so panel doesn't go off the right edge of viewport
                const panelW = 420;
                const panelH = Math.max(zoomPos.panelH, 380);
                const safeLeft = Math.min(zoomPos.panelLeft, window.innerWidth - panelW - 8);
                return (
                  <div
                    style={{
                      position: 'fixed',
                      top: zoomPos.panelTop,
                      left: safeLeft,
                      width: `${panelW}px`,
                      height: `${panelH}px`,
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#fff',
                      overflow: 'hidden',
                      boxShadow: '0 16px 40px rgba(0,0,0,0.18)',
                      zIndex: 9999,
                      backgroundImage: `url(${selectedImage || painting.image_url})`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: `${ZOOM * 100}% ${ZOOM * 100}%`,
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                      pointerEvents: 'none',
                    }}
                  />
                );
              })()}

              {/* Badge: Original Work */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '16px',
                zIndex: 2,
                backgroundColor: 'rgba(9, 9, 11, 0.85)',
                backdropFilter: 'blur(6px)',
                color: '#ffffff',
                padding: '5px 12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}>
                <Sparkles size={12} color="#facc15" /> Original 1-of-1 Work
              </div>

              {/* Favorite Action */}
              <button
                type="button"
                onClick={() => painting && toggleWishlist(painting)}
                title={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  zIndex: 2,
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <Heart size={16} fill={isFavorite ? '#e11d48' : 'none'} color={isFavorite ? '#e11d48' : '#64748b'} />
              </button>
            </div>

            {/* Thumbnail Strip — shows all available images */}
            {(() => {
              const allImgs = [
                painting.image_url,
                painting.image_url_2,
                painting.image_url_3,
              ].filter(Boolean) as string[];
              if (allImgs.length <= 1) return null;
              return (
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px', justifyContent: 'center' }}>
                  {allImgs.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      style={{
                        padding: 0,
                        border: (selectedImage || painting.image_url) === img ? '2px solid #09090b' : '2px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: 'none',
                        overflow: 'hidden',
                        transition: 'border-color 0.15s ease',
                        boxShadow: (selectedImage || painting.image_url) === img ? '0 0 0 2px rgba(9,9,11,0.15)' : 'none',
                      }}
                      title={`Image ${idx + 1}`}
                    >
                      <img
                        src={img}
                        alt={`View ${idx + 1}`}
                        style={{ width: '68px', height: '68px', objectFit: 'cover', display: 'block', borderRadius: '6px' }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </button>
                  ))}
                </div>
              );
            })()}

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginTop: '16px',
            }}>
              <div style={{
                padding: '14px',
                border: '1px solid #f1f5f9',
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                textAlign: 'center',
              }}>
                <ShieldCheck size={20} color="#059669" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>100% Authentic</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Certificate included</div>
              </div>

              <div style={{
                padding: '14px',
                border: '1px solid #f1f5f9',
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                textAlign: 'center',
              }}>
                <Truck size={20} color="#0284c7" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>Free Insured Transit</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Reinforced art crating</div>
              </div>

              <div style={{
                padding: '14px',
                border: '1px solid #f1f5f9',
                borderRadius: '8px',
                backgroundColor: '#fafafa',
                textAlign: 'center',
              }}>
                <RotateCcw size={20} color="#d97706" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>14-Day In-Home Trial</div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Satisfaction guarantee</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Global Standard Artwork Details & Direct Order Section */}
          <div>
            {/* Artist Line & Verification */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#e53637',
                }}>
                  {painting.artist_name || 'Master Artist'}
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '11px',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  fontWeight: 600,
                }}>
                  <CheckCircle2 size={11} /> Verified Artist
                </span>
              </div>

              <span style={{
                fontSize: '12px',
                color: '#64748b',
                fontWeight: 500,
              }}>
                Ref #{painting.id.toString().padStart(5, '0')}
              </span>
            </div>

            {/* Artwork Title */}
            <h1 style={{
              fontSize: '32px',
              fontWeight: 800,
              color: '#09090b',
              margin: '0 0 16px 0',
              lineHeight: 1.25,
              fontFamily: "'Nunito Sans', sans-serif",
            }}>
              {painting.title}
            </h1>

            {/* Acquisition Quote Box */}
            <div style={{
              padding: '20px 24px',
              backgroundColor: '#fafaf9',
              border: '1px solid #e7e5e4',
              borderRadius: '10px',
              marginBottom: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716c' }}>
                  Acquisition Quote
                </span>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '12px',
                  fontWeight: 700,
                  color: isAvailable ? '#15803d' : '#b91c1c',
                  backgroundColor: isAvailable ? '#f0fdf4' : '#fef2f2',
                  padding: '3px 10px',
                  borderRadius: '999px',
                  border: `1px solid ${isAvailable ? '#bbf7d0' : '#fecaca'}`,
                }}>
                  {isAvailable ? '● Available in Gallery' : '● Currently Reserved'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '36px', fontWeight: 900, color: '#09090b', fontFamily: "'Nunito Sans', sans-serif" }}>
                  {formatPrice(painting.price, painting.currency)}
                </span>
                {painting.mrp && Number(painting.mrp) > Number(painting.price) && (
                  <>
                    <span style={{ fontSize: '20px', color: '#94a3b8', textDecoration: 'line-through', fontFamily: "'Nunito Sans', sans-serif" }}>
                      {formatPrice(painting.mrp, painting.currency)}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#16a34a', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '4px' }}>
                      {Math.round(((Number(painting.mrp) - Number(painting.price)) / Number(painting.mrp)) * 100)}% OFF
                    </span>
                  </>
                )}
                <span style={{ fontSize: '13px', color: '#78716c' }}>
                  INR (All taxes & insured delivery included)
                </span>
              </div>
            </div>

            {/* Artwork Specifications Matrix */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '26px',
            }}>
              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Medium</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{painting.medium || 'Mixed Media on Canvas'}</span>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Dimensions</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{painting.dimensions || '36 x 48 inches'}</span>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Framing</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                  {painting.is_framed ? 'Custom Museum Frame Included' : 'Gallery Stretched (Ready to Hang)'}
                </span>
              </div>

              <div style={{ padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Authenticity</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Hand-Signed by Artist & Certified</span>
              </div>
            </div>

            {/* Direct Enquiry Actions */}
            {!orderSuccess && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowOrderForm(!showOrderForm)}
                    disabled={!isAvailable}
                    style={{
                      flex: 1,
                      padding: '16px 24px',
                      backgroundColor: isAvailable ? '#09090b' : '#a1a1aa',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                    }}
                  >
                    <MessageCircle size={18} />
                    {showOrderForm ? 'Close Enquiry Form' : 'Enquire About This Product'}
                  </button>

                  <button
                    type="button"
                    onClick={() => onAddToCart(painting)}
                    disabled={!isAvailable}
                    style={{
                      padding: '16px 20px',
                      backgroundColor: '#ffffff',
                      color: '#09090b',
                      border: '1px solid #d4d4d8',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 700,
                      cursor: isAvailable ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                    title="Add to Enquiry List"
                  >
                    + Add to Cart
                  </button>
                </div>

                {/* Direct WhatsApp Concierge CTA */}
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Hello, I am interested in inquiring about the artwork "${painting.title}" by ${painting.artist_name} priced at ${formatPrice(painting.price)}. Reference: ${window.location.href}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#15803d',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  <MessageCircle size={16} /> Direct Inquiry on WhatsApp
                </a>
              </div>
            )}

            {/* Instant Enquiry Form Panel */}
            {showOrderForm && !orderSuccess && (
              <div style={{
                backgroundColor: '#ffffff',
                border: '2px solid #09090b',
                borderRadius: '10px',
                padding: '24px',
                marginBottom: '28px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                animation: 'fadeIn 0.25s ease',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#09090b', margin: 0 }}>
                      Product Enquiry &amp; Assistance
                    </h3>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: '3px 0 0 0' }}>
                      Interested in this piece? Fill out your details and our team will contact you shortly.
                    </p>
                  </div>
                  <span style={{ fontSize: '11px', color: '#16a34a', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Quick Response
                  </span>
                </div>

                {!isAuthenticated && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    backgroundColor: '#fffbeb',
                    border: '1px solid #fef3c7',
                    borderRadius: '8px',
                    marginBottom: '16px',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Lock size={16} color="#d97706" />
                      <span style={{ fontSize: '13px', color: '#92400e', fontWeight: 600 }}>
                        Please sign in or create an account to continue and submit your enquiry.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenAuth}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: '#09090b',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Sign In / Login
                    </button>
                  </div>
                )}

                <form onSubmit={handleInstantOrder}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Rajesh Sharma"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={{ height: '38px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Phone / WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+91 98765 43210"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                        style={{ height: '38px', fontSize: '13px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        City / Location (Optional)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Mumbai, Bengaluru, Chennai"
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        style={{ height: '38px', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        Preferred Contact Mode
                      </label>
                      <select
                        className="form-control"
                        value={preferredContact}
                        onChange={(e: any) => setPreferredContact(e.target.value)}
                        style={{ height: '38px', fontSize: '13px' }}
                      >
                        <option value="whatsapp">WhatsApp Message</option>
                        <option value="phone">Direct Phone Call</option>
                        <option value="email">Email</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      Questions, Sizing, or Custom Framing (Optional)
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g., Is custom sizing available? What is the delivery timeframe?"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      style={{ height: '38px', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      type="submit"
                      disabled={orderSubmitting}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        backgroundColor: '#09090b',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: 700,
                        cursor: orderSubmitting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      {orderSubmitting ? (
                        'Submitting Enquiry...'
                      ) : !isAuthenticated ? (
                        <>
                          <Lock size={15} /> Sign In or Login to Continue
                        </>
                      ) : (
                        'Submit Enquiry'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowOrderForm(false)}
                      style={{
                        padding: '12px 18px',
                        backgroundColor: '#f4f4f5',
                        color: '#09090b',
                        border: '1px solid #d4d4d8',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Enquiry Success Confirmation Banner */}
            {orderSuccess && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '10px',
                padding: '28px 24px',
                marginBottom: '28px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                }}>
                  <CheckCircle2 size={30} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#166534', margin: '0 0 8px 0' }}>
                  Enquiry Submitted Successfully!
                </h3>
                <p style={{ fontSize: '14px', color: '#15803d', maxWidth: '480px', margin: '0 auto 18px', lineHeight: 1.6 }}>
                  Thank you, <strong>{customerName || 'valued client'}</strong>! We have received your inquiry for <strong>&quot;{painting.title}&quot;</strong>. Our team will contact you shortly via <strong>{(orderSuccess.preferred_contact || 'WhatsApp').toUpperCase()}</strong> with all details.
                </p>

                <div style={{
                  display: 'inline-flex',
                  gap: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}>
                  <button
                    onClick={() => navigate('/shop')}
                    style={{
                      padding: '10px 22px',
                      backgroundColor: '#166534',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Browse More Products
                  </button>
                  <button
                    onClick={() => setOrderSuccess(null)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ffffff',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Ask Another Question
                  </button>
                </div>
              </div>
            )}

            {/* Information Tabs */}
            <div style={{ borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '20px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                style={{
                  padding: '10px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'details' ? '2px solid #09090b' : '2px solid transparent',
                  fontWeight: activeTab === 'details' ? 700 : 500,
                  color: activeTab === 'details' ? '#09090b' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Curatorial Note
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('authenticity')}
                style={{
                  padding: '10px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'authenticity' ? '2px solid #09090b' : '2px solid transparent',
                  fontWeight: activeTab === 'authenticity' ? 700 : 500,
                  color: activeTab === 'authenticity' ? '#09090b' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Provenance & COA
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('shipping')}
                style={{
                  padding: '10px 4px',
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === 'shipping' ? '2px solid #09090b' : '2px solid transparent',
                  fontWeight: activeTab === 'shipping' ? 700 : 500,
                  color: activeTab === 'shipping' ? '#09090b' : '#64748b',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                White-Glove Shipping
              </button>
            </div>

            {/* Tab Contents */}
            <div style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.7, minHeight: '80px' }}>
              {activeTab === 'details' && (
                <div>
                  <p style={{ margin: '0 0 10px 0' }}>
                    {painting.description || 'This original fine art piece captures gestural depth and atmospheric harmony. Rendered with archival pigments to ensure lifetime color vibrancy, the composition balances rich texture with architectural tranquility.'}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Category: <strong>{categoryName}</strong> • Medium: <strong>{painting.medium}</strong> • Dimensions: <strong>{painting.dimensions}</strong>
                  </p>
                </div>
              )}

              {activeTab === 'authenticity' && (
                <div>
                  <p style={{ margin: '0 0 8px 0' }}>
                    Every acquisition from our gallery includes a registered, tamper-evident <strong>Certificate of Authenticity (COA)</strong> signed directly by {painting.artist_name || 'the master artist'} and counter-stamped by our Chief Curator.
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px' }}>
                    <li>Official gallery archive serial registration number</li>
                    <li>Archival acid-free cotton certificate backing</li>
                    <li>Guaranteed museum provenance with transfer of ownership</li>
                  </ul>
                </div>
              )}

              {activeTab === 'shipping' && (
                <div>
                  <p style={{ margin: '0 0 8px 0' }}>
                    We ensure museum-grade protective packaging using shock-absorbing archival foam and custom wood casing.
                  </p>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px' }}>
                    <li>Complimentary insured door-to-door courier across India</li>
                    <li>Estimated dispatch: 24 to 48 hours with live tracking</li>
                    <li>Unboxing inspection and 14-day hassle-free returns</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Related Artworks Section */}
        {relatedPaintings.length > 0 && (
          <div style={{ marginTop: '70px', paddingTop: '40px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#09090b', margin: '0 0 4px 0' }}>
                  Recommended From Collection
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                  Curated companion artworks in {categoryName}
                </p>
              </div>
              <button
                onClick={() => navigate('/shop')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#e53637',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View Full Catalog &rarr;
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '24px',
            }}>
              {relatedPaintings.map((rel) => (
                <div
                  key={rel.id}
                  onClick={() => navigate(`/artwork/${rel.id}`)}
                  style={{
                    border: '1px solid #f1f5f9',
                    borderRadius: '8px',
                    padding: '12px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 24px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ height: '220px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f4f4f5', marginBottom: '12px' }}>
                    <img
                      src={rel.image_url}
                      alt={rel.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: '#e53637', fontWeight: 800, textTransform: 'uppercase', marginBottom: '3px' }}>
                    {rel.artist_name}
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#09090b', margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {rel.title}
                  </h4>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#09090b' }}>
                    {formatPrice(rel.price, rel.currency)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Category, FooterConfig } from '../types';
import { api } from '../services/api';
import {
  Mail,
  ShieldCheck,
  Truck,
  RefreshCw,
  Award,
  Sparkles,
  Package,
  Clock,
  Gem,
  CheckCircle2
} from 'lucide-react';

interface FooterProps {
  categories?: Category[];
  onSelectCategory?: (categoryId: number) => void;
  config?: FooterConfig;
}

const DEFAULT_BADGES = [
  {
    icon: 'truck',
    title: 'Free Global Insured Delivery',
    subtitle: 'Climate-controlled custom art crates',
  },
  {
    icon: 'shield',
    title: '100% Authenticity Guarantee',
    subtitle: 'Signed certificate with forensic provenance',
  },
  {
    icon: 'refresh',
    title: '30-Day Curated Return Window',
    subtitle: 'Risk-free visual trial in your residence',
  },
];

const DEFAULT_LINKS = [
  { title: 'Direct WhatsApp Advisory', url: '#' },
  { title: 'Custom Bespoke Framing', url: '#' },
  { title: 'Art Authentication Registry', url: '#' },
  { title: 'White-Glove Courier Setup', url: '#' },
];

export const Footer: React.FC<FooterProps> = ({
  categories = [],
  onSelectCategory,
  config: initialConfig,
}) => {
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(initialConfig || null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setFooterConfig(initialConfig);
    } else {
      api.getFooterConfig()
        .then((data) => setFooterConfig(data))
        .catch((err) => console.error('Error loading footer config:', err));
    }
  }, [initialConfig]);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 5000);
  };

  const renderBadgeIcon = (iconName: string) => {
    const key = (iconName || '').toLowerCase().trim();
    switch (key) {
      case 'truck':
      case 'shipping':
      case 'delivery':
        return <Truck size={32} />;
      case 'shield':
      case 'shieldcheck':
      case 'guarantee':
        return <ShieldCheck size={32} />;
      case 'refresh':
      case 'returns':
      case 'return':
      case 'refreshcw':
        return <RefreshCw size={32} />;
      case 'award':
        return <Award size={32} />;
      case 'sparkles':
        return <Sparkles size={32} />;
      case 'package':
      case 'box':
        return <Package size={32} />;
      case 'clock':
        return <Clock size={32} />;
      case 'gem':
      case 'diamond':
        return <Gem size={32} />;
      default:
        return <Truck size={32} />;
    }
  };

  // Resolve config or fallback values
  const brandName = footerConfig?.brand_name || 'shopbypriya';
  const brandSubtitle = footerConfig?.brand_subtitle || 'HANDCRAFTED SILK & READY-TO-SHIP BLOUSES';
  const brandDescription = footerConfig?.brand_description ||
    'Atelier blouses for sarees. Ready-made and made to measure.';
  const studioLocation = footerConfig?.studio_location || 'Studio: Mumbai & Chennai, India';
  const contactPhone = footerConfig?.contact_phone || '+91 98765 43210';
  const contactEmail = footerConfig?.contact_email || 'hello@shopbypriya.com';
  const showPayment = footerConfig?.show_payment_methods ?? false;
  const paymentImageUrl = footerConfig?.payment_image_url || '';
  
  const badges = footerConfig?.feature_badges?.length ? footerConfig.feature_badges : DEFAULT_BADGES;
  const categoriesTitle = footerConfig?.categories_title || 'CURATED CATEGORIES';
  const maxCategories = footerConfig?.max_categories_to_show ?? 7;
  const displayedCategories = categories.slice(0, maxCategories);

  const customTitle = footerConfig?.custom_column_title || 'CURATION DESK';
  const customLinks = footerConfig?.custom_links?.length ? footerConfig.custom_links : DEFAULT_LINKS;

  const newsletterTitle = footerConfig?.newsletter_title || 'NEWSLETTER';
  const newsletterDesc = footerConfig?.newsletter_description ||
    'Be the first to know about new arrivals, private salon exhibitions & exclusive sales!';
  const newsletterPlaceholder = footerConfig?.newsletter_placeholder || 'Your email';

  const copyrightText = footerConfig?.copyright_text ||
    'Copyright © 2026 All rights reserved | Art Gallery Curations & Studio';

  return (
    <footer id="site-footer" style={{
      backgroundColor: '#111111',
      color: '#b7b7b7',
      padding: '70px 24px 30px',
      fontFamily: "'Nunito Sans', sans-serif",
    }}>
      {/* 1. Value Props Banner (Shipping, Returns, Authenticity) */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto 60px',
        paddingBottom: '40px',
        borderBottom: '1px solid #222222',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '30px',
      }}>
        {badges.map((b, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ color: '#e53637', flexShrink: 0 }}>
              {renderBadgeIcon(b.icon)}
            </div>
            <div>
              <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '15px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {b.title}
              </div>
              <div style={{ fontSize: '13px', color: '#888888', marginTop: '4px' }}>
                {b.subtitle}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Main Footer Columns */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '40px',
        marginBottom: '60px',
      }}>
        {/* Brand Col */}
        <div style={{ maxWidth: '340px' }}>
          <div style={{
            fontSize: '32px',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            marginBottom: '12px',
            lineHeight: 1.15,
          }}>
            {brandName}
          </div>

          {brandSubtitle && (
            <div style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
              lineHeight: 1.4,
            }}>
              {brandSubtitle}
            </div>
          )}

          <p style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: '#9ca3af',
            marginBottom: '20px',
            fontWeight: 400,
          }}>
            {brandDescription}
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '11px',
            fontSize: '13.5px',
            color: '#e5e7eb',
          }}>
            {studioLocation && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '15px', lineHeight: 1 }}>📍</span>
                <span style={{ color: '#d1d5db' }}>{studioLocation}</span>
              </div>
            )}

            {contactPhone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '15px', lineHeight: 1 }}>📞</span>
                <span style={{ color: '#d1d5db' }}>
                  {contactPhone.startsWith('Concierge:') ? contactPhone : `Concierge: ${contactPhone}`}
                </span>
              </div>
            )}

            {contactEmail && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '15px', lineHeight: 1 }}>✉️</span>
                <span style={{ color: '#d1d5db' }}>
                  {contactEmail.startsWith('Email:') ? (
                    contactEmail
                  ) : (
                    <>Email: <a href={`mailto:${contactEmail}`} style={{ color: 'inherit', textDecoration: 'none' }}>{contactEmail}</a></>
                  )}
                </span>
              </div>
            )}
          </div>

          {showPayment && paymentImageUrl && (
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <img
                src={paymentImageUrl}
                alt="Payment methods"
                style={{ maxHeight: '26px', opacity: 0.8 }}
                onError={(e) => (e.currentTarget.style.display = 'none')}
              />
            </div>
          )}
        </div>

        {/* Dynamic Categories from Database */}
        <div>
          <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
            {categoriesTitle}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {displayedCategories.length > 0 ? (
              displayedCategories.map((cat) => (
                <li key={cat.id}>
                  <a
                    href="#gallery-catalog"
                    onClick={(e) => {
                      if (onSelectCategory) {
                        e.preventDefault();
                        onSelectCategory(cat.id);
                      }
                    }}
                    style={{ color: '#888888', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                  >
                    {cat.name}
                  </a>
                </li>
              ))
            ) : (
              <>
                <li><a href="#gallery-catalog" style={{ color: '#888888', textDecoration: 'none' }}>Original Paintings</a></li>
                <li><a href="#gallery-catalog" style={{ color: '#888888', textDecoration: 'none' }}>Fine Art Curations</a></li>
              </>
            )}
          </ul>
        </div>

        {/* Customer Care / Custom Column */}
        <div>
          <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
            {customTitle}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {customLinks.map((link, idx) => (
              <li key={idx}>
                {link.url && link.url !== '#' ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#888888', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                  >
                    {link.title}
                  </a>
                ) : (
                  <span
                    style={{ color: '#888888', cursor: 'default', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#888888')}
                  >
                    {link.title}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <div style={{ color: '#ffffff', fontWeight: 800, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
            {newsletterTitle}
          </div>
          <p style={{ fontSize: '14px', color: '#888888', marginBottom: '16px', lineHeight: 1.6 }}>
            {newsletterDesc}
          </p>

          {newsletterSubscribed ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              backgroundColor: 'rgba(22, 101, 52, 0.2)',
              border: '1px solid #166534',
              borderRadius: '6px',
              color: '#4ade80',
              fontSize: '13px',
              fontWeight: 600
            }}>
              <CheckCircle2 size={16} /> Thank you for subscribing!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', borderBottom: '2px solid #333333' }}>
              <input
                type="email"
                required
                placeholder={newsletterPlaceholder}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  outline: 'none',
                  color: '#ffffff',
                  padding: '12px 0',
                  fontSize: '14px',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              />
              <button
                type="submit"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  padding: '0 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Subscribe"
              >
                <Mail size={18} color="#e53637" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 3. Copyright bottom */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '25px',
        borderTop: '1px solid #222222',
        textAlign: 'center',
        fontSize: '13px',
        color: '#666666',
      }}>
        {copyrightText}
      </div>
    </footer>
  );
};

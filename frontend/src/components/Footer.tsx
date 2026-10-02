import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Category, FooterConfig } from '../types';
import { api } from '../services/api';
import {
  ShoppingBag,
  Mail,
  CheckCircle2,
  MapPin,
  Phone
} from 'lucide-react';

interface FooterProps {
  categories?: Category[];
  onSelectCategory?: (categoryId: number) => void;
  config?: FooterConfig;
}

const getWhatsAppUrl = (val?: string) => {
  if (!val) return 'https://wa.me/';
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  const cleanNumber = val.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanNumber}`;
};

export const Footer: React.FC<FooterProps> = ({
  categories = [],
  onSelectCategory,
  config: initialConfig,
}) => {
  const [footerConfig, setFooterConfig] = useState<FooterConfig | null>(() => {
    if (initialConfig) return initialConfig;
    try {
      const cached = localStorage.getItem('artweb_footer_config');
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return null;
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setFooterConfig(initialConfig);
    } else {
      api.getFooterConfig()
        .then((data) => {
          if (data) {
            setFooterConfig(data);
            try {
              localStorage.setItem('artweb_footer_config', JSON.stringify(data));
            } catch (e) {}
          }
        })
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

  const brandName = footerConfig?.brand_name || '';
  const brandSubtitle = footerConfig?.brand_subtitle || '';
  const brandDescription = footerConfig?.brand_description || '';
  const studioLocation = footerConfig?.studio_location || '';
  const contactPhone = footerConfig?.contact_phone || '';
  const contactEmail = footerConfig?.contact_email || '';
  const copyrightText = footerConfig?.copyright_text ||
    (brandName ? `© ${new Date().getFullYear()} ${brandName}. All rights reserved.` : '');

  const maxCategories = footerConfig?.max_categories_to_show ?? 6;
  const displayedCategories = categories.slice(0, maxCategories);

  return (
    <footer id="site-footer" style={{
      backgroundColor: '#f3f2ee',
      color: '#4b5563',
      borderTop: '1px solid #e5e3dc',
      padding: '64px 24px 32px',
      fontFamily: "'Roboto Condensed', sans-serif",
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '40px',
        marginBottom: '48px',
      }}>
        {/* Brand Column */}
        <div style={{ maxWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            {footerConfig?.brand_logo_url ? (
              <img
                src={footerConfig.brand_logo_url}
                alt={brandName || 'Brand Logo'}
                style={{
                  height: '42px',
                  maxHeight: '48px',
                  maxWidth: '220px',
                  objectFit: 'contain',
                  borderRadius: '2px',
                  display: 'block',
                  flexShrink: 0,
                }}
              />
            ) : (
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#1b3b2b',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0,
              }}>
                <ShoppingBag size={18} />
              </div>
            )}
            <div>
              <div style={{
                fontSize: '20px',
                fontWeight: 800,
                color: '#111827',
                letterSpacing: '-0.02em',
                lineHeight: 1,
              }}>
                {brandName}
              </div>
              {brandSubtitle && (
                <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500, letterSpacing: '0.02em', marginTop: '2px' }}>
                  {brandSubtitle}
                </div>
              )}
            </div>
          </div>

          <p style={{
            fontSize: '13.5px',
            lineHeight: 1.6,
            color: '#6b7280',
            marginBottom: '20px',
          }}>
            {brandDescription}
          </p>

          {(studioLocation || contactPhone || contactEmail) && (
            <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
              {studioLocation && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#1b3b2b" /> <span>{studioLocation}</span>
                </div>
              )}
              {contactPhone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={14} color="#1b3b2b" /> <span>{contactPhone}</span>
                </div>
              )}
              {contactEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="#1b3b2b" /> <span>{contactEmail}</span>
                </div>
              )}
            </div>
          )}

          {/* Social Links */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a
              href={footerConfig?.social_links?.facebook || 'https://facebook.com'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e5e3dc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1b3b2b'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#1b3b2b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = '#e5e3dc'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a
              href={footerConfig?.social_links?.instagram || 'https://instagram.com'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e5e3dc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1b3b2b'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#1b3b2b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = '#e5e3dc'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
            <a
              href={footerConfig?.social_links?.twitter || 'https://twitter.com'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e5e3dc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1b3b2b'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#1b3b2b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = '#e5e3dc'; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
            </a>
            <a
              href={getWhatsAppUrl(footerConfig?.social_links?.whatsapp || footerConfig?.contact_phone)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#ffffff', border: '1px solid #e5e3dc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', textDecoration: 'none', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1b3b2b'; e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = '#1b3b2b'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#4b5563'; e.currentTarget.style.borderColor = '#e5e3dc'; }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            </a>
          </div>
        </div>

        {/* Shop / Curated Links Column */}
        <div>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
            {footerConfig?.custom_column_title || 'Shop'}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {footerConfig?.custom_links && footerConfig.custom_links.length > 0 ? (
              footerConfig.custom_links.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.url || '#gallery-catalog'}
                    style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                  >
                    {link.title}
                  </a>
                </li>
              ))
            ) : (
              <>
                <li>
                  <a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                     onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                    All Artworks
                  </a>
                </li>
                <li>
                  <a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                     onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                    Best Sellers
                  </a>
                </li>
                <li>
                  <a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                     onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                    New Arrivals
                  </a>
                </li>
                <li>
                  <a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                     onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                    Featured Collection
                  </a>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Collections Column */}
        <div>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
            {footerConfig?.categories_title || 'Collections'}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayedCategories.length > 0 ? (
              displayedCategories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/collections/${cat.slug || cat.id}`}
                    onClick={() => {
                      if (onSelectCategory) {
                        onSelectCategory(cat.id);
                      }
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{ color: '#4b5563', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li><a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none' }}>Oil Paintings</a></li>
                <li><a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none' }}>Canvas Art</a></li>
                <li><a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none' }}>Modern & Abstract</a></li>
                <li><a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none' }}>Portraits</a></li>
                <li><a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none' }}>Fine Art Prints</a></li>
              </>
            )}
          </ul>
        </div>

        {/* Connect With Us / Social Media Column (Replaces Customer Service & Company) */}
        <div>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
            {footerConfig?.social_links?.section_title || 'Connect With Us'}
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Follow our studio for latest artwork releases, bespoke exhibitions, and creative updates.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Instagram */}
            <a
              href={footerConfig?.social_links?.instagram || 'https://instagram.com'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                padding: '7px 12px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e3dc',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1b3b2b';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#1b3b2b';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.borderColor = '#e5e3dc';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </span>
              <span>Instagram</span>
            </a>

            {/* Facebook */}
            <a
              href={footerConfig?.social_links?.facebook || 'https://facebook.com'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                padding: '7px 12px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e3dc',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1b3b2b';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#1b3b2b';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.borderColor = '#e5e3dc';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </span>
              <span>Facebook</span>
            </a>

            {/* WhatsApp */}
            <a
              href={getWhatsAppUrl(footerConfig?.social_links?.whatsapp || footerConfig?.contact_phone)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                padding: '7px 12px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e3dc',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1b3b2b';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#1b3b2b';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.borderColor = '#e5e3dc';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </span>
              <span>WhatsApp Concierge</span>
            </a>

            {/* Twitter / X */}
            <a
              href={footerConfig?.social_links?.twitter || 'https://twitter.com'}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                padding: '7px 12px',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                border: '1px solid #e5e3dc',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1b3b2b';
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.borderColor = '#1b3b2b';
                e.currentTarget.style.transform = 'translateX(4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
                e.currentTarget.style.color = '#374151';
                e.currentTarget.style.borderColor = '#e5e3dc';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </span>
              <span>Twitter / X</span>
            </a>

            {/* YouTube */}
            {Boolean(footerConfig?.social_links?.youtube) && (
              <a
                href={footerConfig?.social_links?.youtube || 'https://youtube.com'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#374151',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '7px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e3dc',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1b3b2b';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#1b3b2b';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#374151';
                  e.currentTarget.style.borderColor = '#e5e3dc';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px' }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                    <polygon points="10 15 15 12 10 9 10 15" fill="currentColor"/>
                  </svg>
                </span>
                <span>YouTube</span>
              </a>
            )}
          </div>
        </div>

        {/* Newsletter Column */}
        <div>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '12px' }}>
            {footerConfig?.newsletter_title || 'Subscribe for 10% Off'}
          </div>
          <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            {footerConfig?.newsletter_description || 'Subscribe for special artwork previews, curated collections, and exclusive private offers.'}
          </p>
          {newsletterSubscribed ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>
              <CheckCircle2 size={15} /> Subscribed successfully!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', maxWidth: '280px' }}>
              <input
                type="email"
                required
                placeholder={footerConfig?.newsletter_placeholder || 'Enter your email'}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '13px',
                  border: '1px solid #d5d3cb',
                  borderRight: 'none',
                  borderRadius: '4px 0 0 4px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  backgroundColor: '#ffffff',
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: '#1b3b2b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: '13px',
                  borderRadius: '0 4px 4px 0',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontFamily: 'inherit',
                }}
              >
                Join
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Copyright row */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '24px',
        borderTop: '1px solid #e5e3dc',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '12px',
        fontSize: '13px',
        color: '#9ca3af',
      }}>
        <div>{copyrightText}</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <a href="#privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
          <a href="#sitemap" style={{ color: 'inherit', textDecoration: 'none' }}>Sitemap</a>
        </div>
      </div>
    </footer>
  );
};

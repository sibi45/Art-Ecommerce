import React, { useState, useEffect } from 'react';
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

  const brandName = footerConfig?.brand_name || 'Minimog';
  const brandSubtitle = footerConfig?.brand_subtitle || 'Shopify Store';
  const brandDescription = footerConfig?.brand_description ||
    'Quality products, unmatched style, and exceptional customer service. Transforming modern lifestyle spaces one curated piece at a time.';
  const studioLocation = footerConfig?.studio_location || '';
  const contactPhone = footerConfig?.contact_phone || '';
  const contactEmail = footerConfig?.contact_email || '';
  const copyrightText = footerConfig?.copyright_text ||
    `© ${new Date().getFullYear()} Minimog Store. Powered by Minimog Shopify. All rights reserved.`;

  const maxCategories = footerConfig?.max_categories_to_show ?? 6;
  const displayedCategories = categories.slice(0, maxCategories);

  return (
    <footer id="site-footer" style={{
      backgroundColor: '#ffffff',
      color: '#4b5563',
      borderTop: '1px solid #e5e7eb',
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
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#1b3b2b',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}>
              <ShoppingBag size={18} />
            </div>
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
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a href="#facebook" aria-label="Facebook" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', textDecoration: 'none', transition: 'all 0.2s' }}
               onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1b3b2b'; e.currentTarget.style.color = '#ffffff'; }}
               onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#4b5563'; }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
            <a href="#instagram" aria-label="Instagram" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', textDecoration: 'none', transition: 'all 0.2s' }}
               onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1b3b2b'; e.currentTarget.style.color = '#ffffff'; }}
               onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#4b5563'; }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
            </a>
            <a href="#twitter" aria-label="Twitter" style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4b5563', textDecoration: 'none', transition: 'all 0.2s' }}
               onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1b3b2b'; e.currentTarget.style.color = '#ffffff'; }}
               onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; e.currentTarget.style.color = '#4b5563'; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
            </a>
          </div>
        </div>

        {/* Shop Column */}
        <div>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
            Shop
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                All Products
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
                Gift Cards
              </a>
            </li>
          </ul>
        </div>

        {/* Collections Column */}
        <div>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
            Collections
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                    style={{ color: '#4b5563', textDecoration: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}
                  >
                    {cat.name}
                  </a>
                </li>
              ))
            ) : (
              <>
                <li><a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none' }}>Men's Fashion</a></li>
                <li><a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none' }}>Women's Fashion</a></li>
                <li><a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none' }}>Footwear</a></li>
                <li><a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none' }}>Accessories</a></li>
                <li><a href="#gallery-catalog" style={{ color: '#4b5563', textDecoration: 'none' }}>Home & Living</a></li>
              </>
            )}
          </ul>
        </div>

        {/* Customer Service Column */}
        <div>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
            Customer Service
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <a href="#contact" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                Contact Us
              </a>
            </li>
            <li>
              <a href="#faq" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                FAQs
              </a>
            </li>
            <li>
              <a href="#shipping" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                Shipping Policy
              </a>
            </li>
            <li>
              <a href="#returns" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                Return Policy
              </a>
            </li>
            <li>
              <a href="#track-order" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                Track Your Order
              </a>
            </li>
          </ul>
        </div>

        {/* Company Column */}
        <div>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
            Company
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li>
              <a href="#about" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                About Us
              </a>
            </li>
            <li>
              <a href="#blog" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                Our Blog
              </a>
            </li>
            <li>
              <a href="#careers" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                Careers
              </a>
            </li>
            <li>
              <a href="#privacy" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                Privacy Policy
              </a>
            </li>
            <li>
              <a href="#terms" style={{ color: '#4b5563', textDecoration: 'none', transition: 'color 0.2s' }}
                 onMouseEnter={(e) => (e.currentTarget.style.color = '#1b3b2b')}
                 onMouseLeave={(e) => (e.currentTarget.style.color = '#4b5563')}>
                Terms of Service
              </a>
            </li>
          </ul>
        </div>

        {/* Payment Methods */}
        <div>
          <div style={{ color: '#111827', fontWeight: 700, fontSize: '15px', marginBottom: '16px' }}>
            Payment Methods
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
            <span style={{ padding: '4px 10px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '12px', fontWeight: 700, color: '#1e3a8a', border: '1px solid #e5e7eb' }}>
              VISA
            </span>
            <span style={{ padding: '4px 10px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '12px', fontWeight: 700, color: '#ea580c', border: '1px solid #e5e7eb' }}>
              Mastercard
            </span>
            <span style={{ padding: '4px 10px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '12px', fontWeight: 700, color: '#0284c7', border: '1px solid #e5e7eb' }}>
              PayPal
            </span>
            <span style={{ padding: '4px 10px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '12px', fontWeight: 700, color: '#111827', border: '1px solid #e5e7eb' }}>
               Pay
            </span>
            <span style={{ padding: '4px 10px', backgroundColor: '#f3f4f6', borderRadius: '4px', fontSize: '12px', fontWeight: 700, color: '#059669', border: '1px solid #e5e7eb' }}>
              UPI / NetBanking
            </span>
          </div>

          {/* Quick Newsletter in footer */}
          <div style={{ marginTop: '24px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              Subscribe for 10% Off
            </div>
            {newsletterSubscribed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> Subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', maxWidth: '240px' }}>
                <input
                  type="email"
                  required
                  placeholder="Enter email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    fontSize: '12px',
                    border: '1px solid #d1d5db',
                    borderRight: 'none',
                    borderRadius: '4px 0 0 4px',
                    outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#1b3b2b',
                    color: '#ffffff',
                    border: 'none',
                    padding: '6px 12px',
                    fontSize: '12px',
                    borderRadius: '0 4px 4px 0',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Copyright row */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        paddingTop: '24px',
        borderTop: '1px solid #f3f4f6',
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

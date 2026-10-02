import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import { Painting, Category, ProductSection, Testimonial, Banner, ShowcaseItem } from '../types';
import { api, getImageUrl } from '../services/api';
import { PaintingCard } from './PaintingCard';
import {
  Truck,
  ShieldCheck,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Mail,
  Lock,
} from 'lucide-react';

interface GalleryViewProps {
  onSelectPainting: (painting: Painting) => void;
  onInquirePainting: (painting: Painting) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  onSelectPainting,
  onInquirePainting,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get('section');
  const categoryParam = searchParams.get('category');
  const searchUrlParam = searchParams.get('search');

  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showcaseItems, setShowcaseItems] = useState<ShowcaseItem[]>([]);
  const testimonialScrollRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Newsletter state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);



  const scrollTestimonials = (direction: 'left' | 'right') => {
    if (testimonialScrollRef.current) {
      const scrollAmount = 340;
      testimonialScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Sync URL search params and collection slug
  useEffect(() => {
    if (searchUrlParam !== null) {
      setSearch(searchUrlParam);
    }
    if (slug) {
      if (categories.length > 0) {
        const matched = categories.find(
          (c) => c.slug?.toLowerCase() === slug.toLowerCase() || String(c.id) === slug
        );
        if (matched) {
          setSelectedCategoryId(matched.id);
        }
      }
    } else if (categoryParam !== null) {
      const catId = parseInt(categoryParam);
      if (!isNaN(catId)) {
        setSelectedCategoryId(catId);
      }
    } else {
      if (location.pathname === '/collections' || location.pathname === '/shop' || location.pathname === '/') {
        setSelectedCategoryId(null);
      }
    }
  }, [searchUrlParam, categoryParam, slug, categories, location.pathname]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [paintingsData, categoriesData, sectionsData, testimonialsData, bannersData, showcaseData] = await Promise.all([
        api.getPaintings(),
        api.getCategories(),
        api.getSections().catch(() => []),
        api.getTestimonials().catch(() => []),
        api.getBanners().catch(() => []),
        api.getShowcaseItems().catch(() => []),
      ]);
      setPaintings(paintingsData);
      setCategories(categoriesData);
      setSections(sectionsData);
      setTestimonials(testimonialsData);
      setBanners(bannersData || []);
      setShowcaseItems(showcaseData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
    setTimeout(() => setNewsletterSubscribed(false), 5000);
  };

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', backgroundColor: '#ffffff', fontFamily: "'Roboto Condensed', sans-serif" }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid #e5e7eb',
          borderTopColor: '#1b3b2b',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ fontSize: '15px', color: '#6b7280', fontWeight: 600 }}>Loading Catalog...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', backgroundColor: '#ffffff', fontFamily: "'Roboto Condensed', sans-serif" }}>
        <p style={{ fontSize: '15px', color: '#e11d48', fontWeight: 600, marginBottom: '12px' }}>{error}</p>
        <button
          onClick={loadData}
          style={{
            padding: '8px 22px',
            backgroundColor: '#1b3b2b',
            color: '#ffffff',
            borderRadius: '4px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Active section from URL param
  const activeSection = sectionParam
    ? sections.find((s) => s.id.toString() === sectionParam || s.slug === sectionParam)
    : null;
  const selectedCategory = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)
    : null;

  // Filter helper
  const filterPainting = (p: Painting): boolean => {
    if (activeSection && p.section_id !== activeSection.id) return false;
    if (selectedCategoryId && p.category_id !== selectedCategoryId) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchArtist = p.artist_name.toLowerCase().includes(q);
      const matchMedium = p.medium.toLowerCase().includes(q);
      if (!matchTitle && !matchArtist && !matchMedium) return false;
    }
    return true;
  };

  const isFiltering = !!search.trim() || selectedCategoryId !== null || !!activeSection;
  const filteredPaintings = paintings.filter(filterPainting);

  // Continuous horizontal scrolling showcase images from dedicated Admin Showcase Items (100% dynamic)
  const activeShowcases = showcaseItems.filter((s) => s.is_active && Boolean(s.image_url));
  const promoImages = activeShowcases;

  const repeatedPromoImages = (() => {
    if (promoImages.length === 0) return [];
    let items = [...promoImages];
    while (items.length < 6) {
      items = [...items, ...promoImages];
    }
    return [...items, ...items];
  })();

  return (
    <div id="gallery-catalog" style={{
      backgroundColor: '#ffffff',
      paddingBottom: '60px',
      fontFamily: "'Roboto Condensed', sans-serif"
    }}>
      {/* 1. Shop by Category Section (Minimog Style) */}
      <section style={{ maxWidth: '1380px', margin: '0 auto', padding: '40px 24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <h2 style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#111827',
              margin: 0,
              letterSpacing: '-0.01em',
            }}>
              Collection
            </h2>
            {selectedCategory && (
              <span style={{ fontSize: '15px', color: '#1b3b2b', fontWeight: 700 }}>
                / {selectedCategory.name}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedCategoryId(null);
              navigate('/collections');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#111827',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontFamily: 'inherit',
            }}
          >
            View all collections <ArrowRight size={14} />
          </button>
        </div>

        {/* Categories Horizontal Grid (Round Circular Cards) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '8px',
          justifyItems: 'center',
        }}>
          {categories.map((cat) => {
            const samplePainting = paintings.find((p) => p.category_id === cat.id);
            const isSelected = selectedCategoryId === cat.id;
            const imgSrc = getImageUrl(cat.image_url) || getImageUrl(samplePainting?.image_url) || 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300';

            return (
              <div
                key={cat.id}
                onClick={() => {
                  if (isSelected) {
                    navigate('/collections');
                  } else {
                    navigate(`/collections/${cat.slug || cat.id}`);
                  }
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  transition: 'transform 0.2s ease',
                  maxWidth: '120px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {/* Round Circular Category Card Container */}
                <div style={{
                  width: '96px',
                  height: '96px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '50%',
                  border: isSelected ? '2.5px solid #1b3b2b' : '1.5px solid #e5e7eb',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '3px',
                  boxShadow: isSelected ? '0 0 0 3px rgba(27,59,43,0.18)' : '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                }}>
                  <img
                    src={imgSrc}
                    alt={cat.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%',
                      transition: 'transform 0.3s ease',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300';
                    }}
                  />
                </div>

                <span style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isSelected ? '#1b3b2b' : '#111827',
                  marginTop: '10px',
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}>
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Scrolling Showcase Marquee */}
      {!isFiltering && repeatedPromoImages.length > 0 && (
        <section style={{ maxWidth: '1380px', margin: '48px auto 60px', padding: '0 24px' }}>
          <div
            className="promo-scroll-container"
            style={{
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#f3f4f6',
              border: '1px solid #e5e7eb',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div className="promo-scroll-track">
              {repeatedPromoImages.map((promo, idx) => (
                <div
                  key={`scroll-promo-${promo.id}-${idx}`}
                  className="promo-scroll-card"
                >
                  <img
                    src={getImageUrl(promo.image_url)}
                    alt={promo.title || 'Promotional Banner'}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.3s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />

                  {/* Tag badge */}
                  {promo.tag && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      backgroundColor: 'rgba(27, 59, 43, 0.9)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backdropFilter: 'blur(4px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      zIndex: 2,
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#4ade80', display: 'inline-block' }} />
                      {promo.tag}
                    </div>
                  )}

                  {/* Bottom Gradient with Title / Description (No Product Price) */}
                  {(promo.title || promo.description) && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '16px 14px 10px',
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                      color: '#ffffff',
                      zIndex: 2,
                    }}>
                      {promo.title && (
                        <div style={{ fontSize: '13.5px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {promo.title}
                        </div>
                      )}
                      {promo.description && (
                        <div style={{ fontSize: '11px', opacity: 0.9, color: '#e5e7eb', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                          {promo.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Product Catalog & Sections */}
      <div id="trending-products-section" style={{ maxWidth: '1380px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* If filtering by search/category/section */}
        {isFiltering ? (
          <section style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>
                  {activeSection ? activeSection.name : (selectedCategory ? selectedCategory.name : (search.trim() ? `Search Results: "${search}"` : 'Curated Products'))}
                </h2>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                  Showing {filteredPaintings.length} product{filteredPaintings.length === 1 ? '' : 's'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSearch('');
                  setSearchParams({});
                  if (location.pathname.startsWith('/collections') || location.pathname.startsWith('/collection')) {
                    navigate('/collections');
                  } else if (location.pathname === '/shop') {
                    navigate('/shop');
                  } else {
                    navigate('/');
                  }
                }}
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  color: '#111827',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                }}
              >
                Clear Filter &times;
              </button>
            </div>

            {filteredPaintings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                <p style={{ color: '#111827', fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0' }}>
                  No products found for this selection.
                </p>
                <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 16px 0' }}>
                  Try exploring other categories or clearing your search filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setSearch('');
                    setSearchParams({});
                    navigate('/collections');
                  }}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: '#1b3b2b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '20px',
              }}>
                {filteredPaintings.map((painting) => (
                  <PaintingCard
                    key={painting.id}
                    painting={painting}
                    onViewDetails={onSelectPainting}
                    onInquire={onInquirePainting}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Normal Dynamic Sections */
          <>
            {/* Dedicated "Trending Products" Section (Configurable via Admin -> Sections) */}
            {(() => {
              const trendingSection = sections.find((s) =>
                s.is_active && (
                  s.slug === 'trending-products' ||
                  s.slug === 'trending' ||
                  s.name.toLowerCase().includes('trending')
                )
              );

              const trendingPaintings = trendingSection
                ? paintings.filter((p) => p.section_id === trendingSection.id)
                : [];

              const displayTrending = trendingPaintings.length > 0
                ? trendingPaintings
                : (trendingSection ? [] : paintings.slice(0, 10));

              return (
                <>
                  {displayTrending.length > 0 && (
                    <section style={{ marginBottom: '44px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: 0 }}>
                            {trendingSection ? trendingSection.name : 'Trending Products'}
                          </h2>
                          {trendingSection?.description && (
                            <p style={{ fontSize: '13px', color: '#6b7280', margin: '4px 0 0' }}>
                              {trendingSection.description}
                            </p>
                          )}
                        </div>

                        <span
                          onClick={() => {
                            navigate(trendingSection ? `/shop?section=${trendingSection.id}` : '/shop');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          style={{
                            color: '#111827',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          View all products <ArrowRight size={14} />
                        </span>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                        gap: '18px',
                      }}>
                        {displayTrending.map((painting) => (
                          <PaintingCard
                            key={painting.id}
                            painting={painting}
                            onViewDetails={onSelectPainting}
                            onInquire={onInquirePainting}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Configured Admin Sections (excluding Trending Products to avoid duplication) */}
                  {sections
                    .filter((s) => s.is_active && s.id !== trendingSection?.id)
                    .map((section) => {
                      const secPaintings = paintings.filter((p) => p.section_id === section.id);
                      if (secPaintings.length === 0) return null;

                      return (
                        <section key={section.id} style={{ marginBottom: '44px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div>
                              <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827', margin: '0 0 2px 0' }}>
                                {section.name}
                              </h2>
                              {section.description && (
                                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                                  {section.description}
                                </p>
                              )}
                            </div>

                            <span
                              onClick={() => {
                                navigate('/shop?section=' + section.id);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              style={{
                                color: '#111827',
                                fontSize: '13px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              View all <ArrowRight size={14} />
                            </span>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                            gap: '18px',
                          }}>
                            {secPaintings.slice(0, 5).map((painting) => (
                              <PaintingCard
                                key={painting.id}
                                painting={painting}
                                onViewDetails={onSelectPainting}
                                onInquire={onInquirePainting}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                </>
              );
            })()}
          </>
        )}

        {/* 4. Social Proof Trust Banner ("Trusted by 10,000+ Happy Customers") */}
        <section style={{ margin: '30px 0 24px' }}>
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '24px 20px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: '13.5px',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '20px',
              letterSpacing: '0.02em',
              textTransform: 'uppercase',
            }}>
              Trusted by 10,000+ Happy Customers
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Star size={18} fill="#1b3b2b" color="#1b3b2b" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>4.8/5 Average Rating</div>
                  <div style={{ fontSize: '11.5px', color: '#6b7280' }}>From 10,000+ Reviews</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Truck size={18} color="#1b3b2b" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>Fast & Free Shipping</div>
                  <div style={{ fontSize: '11.5px', color: '#6b7280' }}>On orders over ₹999</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <ShieldCheck size={18} color="#1b3b2b" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>30-Day Money Back</div>
                  <div style={{ fontSize: '11.5px', color: '#6b7280' }}>No questions asked</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Lock size={18} color="#1b3b2b" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>Secure & Safe Checkout</div>
                  <div style={{ fontSize: '11.5px', color: '#6b7280' }}>Your data is protected</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Clean Newsletter Subscribe Bar (Minimog Style) */}
        {/* <section style={{ marginBottom: '40px' }}>
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#111827',
              }}>
                <Mail size={18} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Sign up for our newsletter</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>Receive exclusive offers and new collection releases</div>
              </div>
            </div>

            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '440px' }}>
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                style={{
                  flex: 1,
                  height: '38px',
                  padding: '0 12px',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  height: '38px',
                  padding: '0 20px',
                  backgroundColor: '#1b3b2b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                {newsletterSubscribed ? 'Subscribed!' : 'Subscribe'}
              </button>
            </form>
          </div>
        </section> */}

        {/* 6. What Our Patrons Say (Customer Reviews) */}
        {testimonials.length > 0 && (
          <section style={{ marginBottom: '30px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
            }}>
              <h2 style={{
                fontSize: '22px',
                fontWeight: 800,
                color: '#111827',
                margin: 0,
              }}>
                What Our Customers Say
              </h2>

              {testimonials.length > 3 && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => scrollTestimonials('left')}
                    aria-label="Previous Reviews"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#111827',
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollTestimonials('right')}
                    aria-label="Next Reviews"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#111827',
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>

            <div
              ref={testimonialScrollRef}
              style={{
                display: 'flex',
                flexWrap: 'nowrap',
                gap: '16px',
                overflowX: 'auto',
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                paddingBottom: '8px',
              }}
            >
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  style={{
                    flex: '0 0 280px',
                    minWidth: '260px',
                    scrollSnapAlign: 'start',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '10px' }}>
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} size={13} fill="#fbbf24" color="#fbbf24" />
                      ))}
                    </div>
                    <p style={{
                      fontSize: '13px',
                      color: '#374151',
                      lineHeight: 1.5,
                      margin: 0,
                    }}>
                      “{t.quote}”
                    </p>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {t.avatar_url && (
                      <img
                        src={t.avatar_url}
                        alt={t.name}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t.name}</div>
                      {t.location && (
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{t.location}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

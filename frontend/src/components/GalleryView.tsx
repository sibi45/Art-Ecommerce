import { useNavigate, useSearchParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Painting, Category, ProductSection, Testimonial } from '../types';
import { api } from '../services/api';
import { PaintingCard } from './PaintingCard';
import {
  Sparkles,
  Truck,
  ShieldCheck,
  Star,
  Scissors,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Search
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
  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get('section');
  const categoryParam = searchParams.get('category');
  const searchUrlParam = searchParams.get('search');

  const [paintings, setPaintings] = useState<Painting[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sections, setSections] = useState<ProductSection[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Sync URL search params
  useEffect(() => {
    if (searchUrlParam !== null) {
      setSearch(searchUrlParam);
    }
    if (categoryParam !== null) {
      const catId = parseInt(categoryParam);
      if (!isNaN(catId)) {
        setSelectedCategoryId(catId);
      }
    }
  }, [searchUrlParam, categoryParam]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [paintingsData, categoriesData, sectionsData, testimonialsData] = await Promise.all([
        api.getPaintings(),
        api.getCategories(),
        api.getSections(),
        api.getTestimonials(),
      ]);
      setPaintings(paintingsData);
      setCategories(categoriesData);
      setSections(sectionsData);
      setTestimonials(testimonialsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  const pastelColors = [
    { bg: '#fef3c7', text: '#92400e' }, // Warm Gold
    { bg: '#fee2e2', text: '#991b1b' }, // Soft Rose
    { bg: '#ffedd5', text: '#9a3412' }, // Soft Peach
    { bg: '#e0f2fe', text: '#075985' }, // Soft Sky
    { bg: '#f3e8ff', text: '#6b21a8' }, // Soft Lavender
    { bg: '#dcfce7', text: '#166534' }, // Soft Mint
  ];

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', backgroundColor: '#ffffff' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e4e4e7',
          borderTopColor: '#09090b',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 16px',
        }} />
        <p style={{ fontSize: '14px', color: '#64748b' }}>Curating Gallery Collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', backgroundColor: '#ffffff' }}>
        <p style={{ fontSize: '15px', color: '#e11d48', fontWeight: 600, marginBottom: '12px' }}>{error}</p>
        <button
          onClick={loadData}
          style={{
            padding: '8px 22px',
            backgroundColor: '#09090b',
            color: '#ffffff',
            borderRadius: '6px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Retry Loading Gallery
        </button>
      </div>
    );
  }

  // Active section from URL param (by id or slug)
  const activeSection = sectionParam
    ? sections.find((s) => s.id.toString() === sectionParam || s.slug === sectionParam)
    : null;
  const selectedCategory = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)
    : null;

  // Filter helper
  const filterPainting = (p: Painting): boolean => {
    if (activeSection && p.section_id !== activeSection.id) {
      return false;
    }
    if (selectedCategoryId && p.category_id !== selectedCategoryId) {
      return false;
    }
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

  return (
    <div id="gallery-catalog" style={{ backgroundColor: '#ffffff', paddingBottom: '90px' }}>
      
      {/* 1. Shop by Category Section (Matching Reference Image 2) */}
      <section style={{ maxWidth: '1380px', margin: '0 auto', padding: '48px 28px 36px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <h2 style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#09090b',
            margin: 0,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            Shop by Category
          </h2>

          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#e11d48',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            View All <span>&rarr;</span>
          </button>
        </div>

        {/* Circular Category Avatars with Soft Pastel Pills (Matching Image 2) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '32px',
          overflowX: 'auto',
          paddingBottom: '12px',
          scrollbarWidth: 'none',
        }}>
          {categories.map((cat, idx) => {
            const color = pastelColors[idx % pastelColors.length];
            const samplePainting = paintings.find((p) => p.category_id === cat.id);
            const isSelected = selectedCategoryId === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => setSelectedCategoryId(isSelected ? null : cat.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  minWidth: '110px',
                  userSelect: 'none',
                }}
              >
                {/* Circular Artwork Avatar */}
                <div style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  backgroundColor: '#f1f5f9',
                  border: isSelected ? '3px solid #e11d48' : '2px solid #ffffff',
                  boxShadow: isSelected ? '0 0 0 2px #e11d48' : '0 4px 14px rgba(0,0,0,0.08)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}>
                  {cat.image_url || samplePainting?.image_url ? (
                    <img
                      src={cat.image_url || samplePainting?.image_url}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: color.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.text, fontWeight: 700, fontSize: '18px' }}>
                      {cat.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Soft Pastel Badge / Pill (Matching Image 2) */}
                <span style={{
                  padding: '5px 14px',
                  borderRadius: '999px',
                  backgroundColor: color.bg,
                  color: color.text,
                  fontSize: '12px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  transition: 'opacity 0.2s ease',
                  opacity: isSelected ? 1 : 0.9,
                }}>
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Curated Themes Grid (Dynamic Store Sections configured from Admin) */}
      {!isFiltering && sections.filter((s) => s.is_active).length > 0 && (
        <section style={{ maxWidth: '1380px', margin: '0 auto', padding: '20px 28px 50px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#09090b',
                margin: '0 0 4px 0',
                fontFamily: "'Playfair Display', Georgia, serif",
              }}>
                Styles to Celebrate In
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Curated handcrafted silhouettes designed for living spaces, galleries & architectural grace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId(null);
                setSearch('');
                setSearchParams({});
                navigate('/shop');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#e11d48',
                fontSize: '12.5px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              EXPLORE ALL &rarr;
            </button>
          </div>

          {/* Dynamic Curated Feature Cards (Configured from Admin Store Sections) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '18px',
          }}>
            {sections
              .filter((s) => s.is_active)
              .map((section, idx) => {
                const themePresets = [
                  { bg: '#fefce8', border: '#fef08a', badgeBg: '#fef08a', badgeColor: '#854d0e', textColor: '#713f12' },
                  { bg: '#fff1f2', border: '#fecdd3', badgeBg: '#fecdd3', badgeColor: '#9f1239', textColor: '#881337' },
                  { bg: '#fffbeb', border: '#fde68a', badgeBg: '#fde68a', badgeColor: '#92400e', textColor: '#78350f' },
                  { bg: '#f0fdfa', border: '#99f6e4', badgeBg: '#99f6e4', badgeColor: '#115e59', textColor: '#134e4a' },
                  { bg: '#f5f3ff', border: '#ddd6fe', badgeBg: '#ddd6fe', badgeColor: '#5b21b6', textColor: '#4c1d95' },
                ];
                const theme = themePresets[idx % themePresets.length];
                const assignedCount = paintings.filter((p) => p.section_id === section.id).length;

                return (
                  <div
                    key={section.id}
                    onClick={() => {
                      navigate('/shop?section=' + section.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      backgroundColor: theme.bg,
                      border: `1px solid ${theme.border}`,
                      borderRadius: '10px',
                      padding: '24px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: section.image_url ? '270px' : '190px',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                      overflow: 'hidden',
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
                    <div>
                      {/* Section Cover Image if uploaded */}
                      {section.image_url && (
                        <div style={{
                          height: '140px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          marginBottom: '14px',
                          backgroundColor: '#ffffff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        }}>
                          <img
                            src={section.image_url}
                            alt={section.name}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      )}

                      <span style={{
                        display: 'inline-block',
                        backgroundColor: theme.badgeBg,
                        color: theme.badgeColor,
                        fontSize: '9.5px',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        padding: '3px 8px',
                        borderRadius: '3px',
                        marginBottom: '12px',
                      }}>
                        {section.name.toUpperCase()}
                      </span>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        color: '#09090b',
                        margin: '0 0 6px 0',
                        fontFamily: "'Playfair Display', Georgia, serif"
                      }}>
                        {section.name}
                      </h3>
                      <p style={{ fontSize: '12.5px', color: theme.textColor, margin: 0, lineHeight: 1.5 }}>
                        {section.description || (assignedCount > 0 ? `Curated collection with ${assignedCount} original artwork${assignedCount === 1 ? '' : 's'}.` : 'Curated handcrafted art pieces designed for living spaces.')}
                      </p>
                    </div>

                    <div style={{ marginTop: '18px' }}>
                      <span style={{
                        fontSize: '12.5px',
                        fontWeight: 700,
                        color: '#09090b',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        Shop {section.name} &rarr;
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* 3. Product Sections (Featured, Best Sellers, etc., Matching Images 3 & 4) */}
      <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '0 28px' }}>
        
        {/* If user is filtering by section, category or search, show dedicated filtered section */}
        {isFiltering ? (
          <section style={{ marginBottom: '50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  {activeSection && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      padding: '3px 10px',
                      borderRadius: '999px',
                    }}>
                      Store Section
                    </span>
                  )}
                  {selectedCategory && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      backgroundColor: '#e0f2fe',
                      color: '#075985',
                      padding: '3px 10px',
                      borderRadius: '999px',
                    }}>
                      Category
                    </span>
                  )}
                </div>
                <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#09090b', margin: '0 0 4px 0', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {activeSection ? activeSection.name : (selectedCategory ? selectedCategory.name : (search.trim() ? `Search: "${search}"` : 'Curated Collection'))}
                </h2>
                <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0 }}>
                  {activeSection?.description ? `${activeSection.description} · ` : ''}
                  Showing all {filteredPaintings.length} {filteredPaintings.length === 1 ? 'artwork' : 'artworks'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedCategoryId(null);
                  setSearch('');
                  setSearchParams({});
                  navigate('/shop');
                }}
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#e11d48',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Clear Section Filter &times;
              </button>
            </div>

            {filteredPaintings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#334155', fontSize: '15px', fontWeight: 600, margin: '0 0 8px 0' }}>
                  No artworks currently found in {activeSection ? `"${activeSection.name}"` : 'this selection'}.
                </p>
                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 18px 0' }}>
                  Assign artworks to this section from the Admin panel to display them here.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setSearch('');
                    setSearchParams({});
                    navigate('/shop');
                  }}
                  style={{ padding: '8px 20px', backgroundColor: '#09090b', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  View All Sections
                </button>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '24px',
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
          /* 100% Dynamic Store Sections configured from Admin Panel */
          <>
            {sections.map((section) => {
              const sectionPaintings = paintings.filter((p) => p.section_id === section.id);
              if (sectionPaintings.length === 0) return null;

              return (
                <section key={section.id} style={{ marginBottom: '60px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                    <div>
                      <h2 style={{
                        fontSize: '26px',
                        fontWeight: 700,
                        color: '#09090b',
                        margin: '0 0 4px 0',
                        fontFamily: "'Playfair Display', Georgia, serif",
                      }}>
                        {section.name}
                      </h2>
                      {section.description && (
                        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
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
                        color: '#e11d48',
                        fontSize: '12.5px',
                        fontWeight: 800,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                      }}
                    >
                      VIEW ALL &rarr;
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '24px',
                  }}>
                    {sectionPaintings.slice(0, 4).map((painting) => (
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

            {/* If no sections have artworks, display the collection artworks so page is never empty */}
            {sections.every((s) => paintings.filter((p) => p.section_id === s.id).length === 0) && paintings.length > 0 && (
              <section style={{ marginBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                  <div>
                    <h2 style={{
                      fontSize: '26px',
                      fontWeight: 700,
                      color: '#09090b',
                      margin: '0 0 4px 0',
                      fontFamily: "'Playfair Display', Georgia, serif",
                    }}>
                      All Artworks
                    </h2>
                    <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                      Explore original handcrafted works from verified artists
                    </p>
                  </div>
                  <span
                    onClick={() => {
                      navigate('/shop');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      color: '#e11d48',
                      fontSize: '12.5px',
                      fontWeight: 800,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                  >
                    VIEW ALL &rarr;
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '24px',
                }}>
                  {paintings.slice(0, 8).map((painting) => (
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
          </>
        )}
      </div>

      {/* 4. Brand Trust / Value Proposition Strip (Matching Reference Image 5) */}
      <section style={{ maxWidth: '1380px', margin: '20px auto 70px', padding: '0 28px' }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #f1f5f9',
          borderRadius: '12px',
          padding: '36px 32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '28px',
        }}>
          {/* Pillar 1: Pure Silk / 100% Original */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              minWidth: '46px',
              borderRadius: '50%',
              backgroundColor: '#fdf2f8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#db2777',
            }}>
              <Sparkles size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#09090b', marginBottom: '2px' }}>
                100% PURE SILK & ART
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                Certified handloom weaves & originals
              </div>
            </div>
          </div>

          {/* Pillar 2: Perfect Fit / Museum Framing */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              minWidth: '46px',
              borderRadius: '50%',
              backgroundColor: '#fefce8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ca8a04',
            }}>
              <Scissors size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#09090b', marginBottom: '2px' }}>
                PERFECT FIT & FRAMING
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                Expert standard tailoring & crating
              </div>
            </div>
          </div>

          {/* Pillar 3: Insured Delivery */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              minWidth: '46px',
              borderRadius: '50%',
              backgroundColor: '#f0fdf4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#16a34a',
            }}>
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#09090b', marginBottom: '2px' }}>
                INSURED DELIVERY
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                Safe doorstep crated delivery
              </div>
            </div>
          </div>

          {/* Pillar 4: Authentic Karigari / Provenance */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              minWidth: '46px',
              borderRadius: '50%',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#09090b', marginBottom: '2px' }}>
                AUTHENTIC KARIGARI
              </div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                Hand-embroidered zardozi & provenance
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. What Our Patrons Say (Matching Reference Image 5) */}
      {testimonials.length > 0 && (
        <section style={{ maxWidth: '1380px', margin: '0 auto', padding: '0 28px 48px' }}>
          <h2 style={{
            fontSize: '26px',
            fontWeight: 700,
            color: '#09090b',
            margin: '0 0 28px 0',
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            What Our Patrons Say
          </h2>

          {/* Dynamic Review Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}>
            {testimonials.map((t) => (
              <div
                key={t.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #f1f5f9',
                  borderRadius: '10px',
                  padding: '28px 24px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '190px',
                }}
              >
                <div>
                  {/* Rating Stars */}
                  <div style={{ display: 'flex', gap: '3px', marginBottom: '16px', color: '#f59e0b' }}>
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} size={15} fill="#f59e0b" strokeWidth={0} />
                    ))}
                  </div>
                  <p style={{
                    fontSize: '13.5px',
                    fontStyle: 'italic',
                    color: '#334155',
                    lineHeight: 1.6,
                    margin: 0,
                  }}>
                    “{t.quote}”
                  </p>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {t.avatar_url && (
                    <img
                      src={t.avatar_url}
                      alt={t.name}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  )}
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#09090b' }}>{t.name}</div>
                    {t.location && (
                      <div style={{ fontSize: '11.5px', color: '#94a3b8' }}>{t.location}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

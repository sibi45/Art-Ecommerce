import React, { useState, useEffect } from 'react';
import { Banner } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSectionProps {
  banners?: Banner[];
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  banners = [],
  onExploreClick,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [prevSlideIndex, setPrevSlideIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = banners?.length || 0;

  const goToSlide = (newIndex: number, forcedDir?: 'next' | 'prev') => {
    if (newIndex === currentSlideIndex || isTransitioning || totalSlides <= 1) return;
    const dir = forcedDir || (newIndex > currentSlideIndex ? 'next' : 'prev');
    setIsTransitioning(true);
    setPrevSlideIndex(currentSlideIndex);
    setDirection(dir);
    setCurrentSlideIndex(newIndex);

    setTimeout(() => {
      setIsTransitioning(false);
      setPrevSlideIndex(null);
    }, 750);
  };

  const handlePrev = () => {
    const nextIdx = currentSlideIndex === 0 ? totalSlides - 1 : currentSlideIndex - 1;
    goToSlide(nextIdx, 'prev');
  };

  const handleNext = () => {
    const nextIdx = currentSlideIndex === totalSlides - 1 ? 0 : currentSlideIndex + 1;
    goToSlide(nextIdx, 'next');
  };

  // Smooth automatic rotation every 5 seconds
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      const nextIdx = currentSlideIndex === totalSlides - 1 ? 0 : currentSlideIndex + 1;
      goToSlide(nextIdx, 'next');
    }, 5000);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused, currentSlideIndex, isTransitioning]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const activeBanner = banners[currentSlideIndex] || banners[0];
  const bannerBg = activeBanner?.bg_color || '#0062d2';
  const textColor = activeBanner?.text_color || '#ffffff';

  const isDarkText = ['#111111', '#09090b', '#000000', '#1c1917', '#27272a', '#1e293b', '#334155']
    .includes(textColor.toLowerCase());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price || 0);
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: 'relative',
        backgroundColor: bannerBg,
        background: `radial-gradient(circle at 75% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 60%), linear-gradient(135deg, ${bannerBg} 0%, ${bannerBg} 100%)`,
        transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
        minHeight: '520px',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        color: textColor,
      }}
    >
      <div style={{
        maxWidth: '1380px',
        width: '100%',
        margin: '0 auto',
        padding: '54px 32px',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
          alignItems: 'center',
          gap: '48px',
        }}>
          {/* Left Side: Typography, CTA & Slide Controls */}
          <div>
            {/* Tag / Category */}
            {activeBanner.tag && (
              <div style={{
                color: textColor,
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                marginBottom: '14px',
                opacity: 0.9,
              }}>
                {activeBanner.tag}
              </div>
            )}

            {/* Main Headline (Editorial Serif Typography) */}
            <h1 style={{
              fontSize: 'clamp(2.4rem, 4.4vw, 3.6rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              color: textColor,
              marginBottom: '18px',
              letterSpacing: '-0.01em',
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              {activeBanner.title || 'Masterpieces, considered.'}
            </h1>

            {/* Subtitle Description */}
            <p style={{
              fontSize: '15px',
              lineHeight: 1.65,
              color: textColor,
              opacity: 0.85,
              marginBottom: '32px',
              maxWidth: '520px',
              fontWeight: 400,
            }}>
              {activeBanner.description || 'Original handcrafted artworks in oil, acrylic, and mixed media fine art created by verified master artists.'}
            </p>

            {/* CTA Button */}
            <div style={{ marginBottom: '36px' }}>
              <button
                type="button"
                onClick={onExploreClick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isDarkText ? '#09090b' : '#ffffff',
                  color: isDarkText ? '#ffffff' : (bannerBg.toLowerCase() === '#ffffff' ? '#09090b' : bannerBg),
                  border: 'none',
                  borderRadius: '6px',
                  padding: '14px 28px',
                  fontSize: '13px',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.28)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
                }}
              >
                {activeBanner.button_text || 'SHOP NOW'} <span>&rarr;</span>
              </button>
            </div>

            {/* Slide Pagination & Navigation Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              {/* Active Pill Indicator & Dots */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    style={{
                      height: '5px',
                      width: idx === currentSlideIndex ? '28px' : '6px',
                      borderRadius: '4px',
                      backgroundColor: idx === currentSlideIndex 
                        ? (isDarkText ? '#09090b' : '#f59e0b') 
                        : (isDarkText ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.4)'),
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>

              {/* Counter: 01 / 03 */}
              <div style={{
                fontSize: '12px',
                fontWeight: 700,
                color: textColor,
                opacity: 0.9,
                letterSpacing: '0.08em',
                fontFamily: 'monospace',
              }}>
                {(currentSlideIndex + 1).toString().padStart(2, '0')} / {totalSlides.toString().padStart(2, '0')}
              </div>

              {/* Navigation Arrows < > */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handlePrev}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isDarkText ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)',
                    border: isDarkText ? '1px solid rgba(0, 0, 0, 0.15)' : '1px solid rgba(255, 255, 255, 0.25)',
                    color: textColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkText ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.28)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDarkText ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)')}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: isDarkText ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)',
                    border: isDarkText ? '1px solid rgba(0, 0, 0, 0.15)' : '1px solid rgba(255, 255, 255, 0.25)',
                    color: textColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isDarkText ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.28)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isDarkText ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.15)')}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Artwork Card with Backdrop Circle (Matching Gallery Signature Design) */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            minHeight: '440px',
          }}>
            {/* Backdrop Circle */}
            <div style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              borderRadius: '50%',
              backgroundColor: activeBanner.circle_color || '#ea580c',
              transition: 'background-color 0.5s ease',
            }} />

            {/* Floating Artwork Museum Card */}
            <div
              onClick={onExploreClick}
              style={{
                position: 'relative',
                zIndex: 2,
                width: '270px',
                backgroundColor: '#ffffff',
                border: '5px solid #ffffff',
                boxShadow: '0 20px 48px rgba(0,0,0,0.25)',
                borderRadius: '4px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 28px 60px rgba(0,0,0,0.32)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 20px 48px rgba(0,0,0,0.25)';
              }}
            >
              <img
                src={activeBanner.image_url}
                alt={activeBanner.title}
                style={{
                  width: '100%',
                  height: '270px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div style={{
                padding: '12px 14px',
                backgroundColor: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div style={{ maxWidth: '150px' }}>
                  <div style={{
                    fontSize: '10px',
                    color: '#71717a',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {activeBanner.artist_name || 'Master Artist'}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: 800,
                    color: '#09090b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {activeBanner.title}
                  </div>
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 800,
                  color: '#e11d48',
                }}>
                  {formatPrice(activeBanner.price)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

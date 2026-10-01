import React, { useState, useEffect } from 'react';
import { Banner } from '../types';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

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
    }, 600);
  };

  const handlePrev = () => {
    const nextIdx = currentSlideIndex === 0 ? totalSlides - 1 : currentSlideIndex - 1;
    goToSlide(nextIdx, 'prev');
  };

  const handleNext = () => {
    const nextIdx = currentSlideIndex === totalSlides - 1 ? 0 : currentSlideIndex + 1;
    goToSlide(nextIdx, 'next');
  };

  // Smooth automatic rotation every 6 seconds
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      const nextIdx = currentSlideIndex === totalSlides - 1 ? 0 : currentSlideIndex + 1;
      goToSlide(nextIdx, 'next');
    }, 6000);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused, currentSlideIndex, isTransitioning]);

  if (!banners || banners.length === 0) {
    return null;
  }

  const activeBanner = banners[currentSlideIndex] || banners[0];
  if (!activeBanner) return null;

  const displayTitle = activeBanner.title || '';
  const displayTag = activeBanner.tag || '';
  const displayDesc = activeBanner.description || '';

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        backgroundColor: '#f3f2ee',
        fontFamily: "'Roboto Condensed', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #e5e7eb',
      }}
    >
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '50px 24px 36px',
      }}>
        {/* Main Hero Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 1fr)',
          alignItems: 'center',
          gap: '40px',
        }} className="responsive-hero-grid">

          {/* Left Column: Minimog Style Copy & CTAs */}
          <div>
            {/* Pill Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '20px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#374151',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <span>✨</span> {displayTag}
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(2.4rem, 4.2vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.1,
              color: '#111827',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
              fontFamily: "'Roboto Condensed', sans-serif",
            }}>
              {displayTitle}
            </h1>

            {/* Subheading */}
            <p style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: '#4b5563',
              marginBottom: '28px',
              maxWidth: '520px',
              fontWeight: 400,
            }}>
              {displayDesc}
            </p>

            {/* Action Buttons (Minimog Green + Outline) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '38px' }}>
              <button
                type="button"
                onClick={onExploreClick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#1b3b2b',
                  color: '#ffffff',
                  fontSize: '15px',
                  fontWeight: 700,
                  padding: '13px 28px',
                  borderRadius: '4px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(27, 59, 43, 0.25)',
                  transition: 'background-color 0.15s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#132a1e')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1b3b2b')}
              >
                {activeBanner.button_text || 'Shop Now'} <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={onExploreClick}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  color: '#111827',
                  fontSize: '15px',
                  fontWeight: 700,
                  padding: '12px 26px',
                  borderRadius: '4px',
                  border: '1px solid #111827',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#111827';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.color = '#111827';
                }}
              >
                Explore Collections
              </button>
            </div>
          </div>

          {/* Right Column: Visual Showcase */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

            {/* Main Product/Banner Image */}
            <div style={{
              width: '100%',
              maxWidth: '480px',
              height: '420px',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
              backgroundColor: '#ffffff',
              position: 'relative',
            }}>
              {activeBanner.image_url && (
                <img
                  src={activeBanner.image_url}
                  alt={activeBanner.title || 'Curated Artwork'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.4s ease',
                  }}
                />
              )}
            </div>

            {/* Slider arrows if multiple banners */}
            {totalSlides > 1 && (
              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '24px',
                display: 'flex',
                gap: '8px',
                zIndex: 10,
              }}>
                <button
                  type="button"
                  onClick={handlePrev}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#111827',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                  title="Previous slide"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#111827',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  }}
                  title="Next slide"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>


      </div>
    </section>
  );
};

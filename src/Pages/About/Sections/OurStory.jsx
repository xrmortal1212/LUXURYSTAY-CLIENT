import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/OurStory.css';

gsap.registerPlugin(ScrollTrigger);

const storyData = [
  {
    year: '2020',
    title: 'Groundbreaking Vision',
    desc: 'Conceived as an exclusive eco-luxury sanctuary, breaking ground along the pristine coastline.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  },
  {
    year: '2021',
    title: 'Architectural Mastery',
    desc: 'Collaborated with world-renowned architects to design sustainable private villas with private pools.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    year: '2022',
    title: 'The Grand Opening',
    desc: 'Welcomed our first VIP guests, launching 50 oceanfront luxury suites and signature fine dining.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    year: '2023',
    title: 'Michelin Recognition',
    desc: 'Awarded top international culinary honors for our rooftop fine dining experience.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    year: '2024',
    title: 'Holistic Spa Pavilion',
    desc: 'Unveiled our 15,000 sq.ft. hydrotherapy spa, thermal saunas, and cliffside infinity pools.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
  },
  {
    year: '2025',
    title: 'Zero-Carbon Distinction',
    desc: 'Certified 100% solar-powered luxury stay with zero single-use plastic across all operations.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    year: '2026',
    title: 'The Modern Era',
    desc: 'Pioneering AI-driven in-room concierge, private yacht charters, and bespoke 24/7 personal butler service.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  },
];

function OurStory() {
  const sectionRef = useRef(null);
  const imageCardsRef = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = imageCardsRef.current;
      const totalSlides = storyData.length;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${totalSlides * 100}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(
              totalSlides - 1,
              Math.floor(self.progress * totalSlides)
            );
            setActiveIndex(idx);
          },
        },
      });

      cards.forEach((card, index) => {
        if (index > 0) {
          tl.fromTo(
            card,
            { yPercent: 100 },
            { yPercent: 0, ease: 'none' },
            `step-${index}`
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="story" ref={sectionRef} className="ourstory-section">
      <div className="ourstory-main-container">
        
        {/* Left Column: Stacked Image Showcase */}
        <div className="ourstory-left-col">
          <div className="ourstory-img-wrapper">
            {storyData.map((item, idx) => (
              <div
                key={item.year}
                ref={(el) => (imageCardsRef.current[idx] = el)}
                className="stacked-img-card"
                style={{ zIndex: idx + 1 }}
              >
                <img src={item.image} alt={item.title} className="ourstory-img" />
              </div>
            ))}

            {/* Floating Index / Year Badge */}
            <div className="ourstory-index-badge">
              <span className="current-year">{storyData[activeIndex].year}</span>
              <span className="slide-divider"> / </span>
              <span className="total-years">2026</span>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Year List */}
        <div className="ourstory-right-col">
          <div className="ourstory-sublabel">
            <span className="sublabel-dash">—</span> OUR STORY
          </div>

          <h2 className="ourstory-heading">
            OUR<br />JOURNEY
          </h2>

          <p className="ourstory-desc">
            {storyData[activeIndex].desc}
          </p>

          {/* List of Years */}
          <div className="ourstory-list">
            {storyData.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={item.year}
                  className={`ourstory-item ${isActive ? 'active' : ''}`}
                >
                  <span className="story-title">{item.title}</span>
                  <span className="story-year">{item.year}</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}

export default OurStory;
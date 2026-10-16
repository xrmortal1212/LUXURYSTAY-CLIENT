import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/WorkThat.css';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const suites = [
  {
    id: '01',
    tags: ['PRESIDENTIAL', 'OCEAN VIEW', 'PRIVATE POOL'],
    title: 'The Royal Presidential Suite',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '02',
    tags: ['PENTHOUSE', 'SKYLINE VIEW', 'JACUZZI'],
    title: 'Grand Horizon Penthouse',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '03',
    tags: ['EXECUTIVE', 'BALCONY', 'KING BED'],
    title: 'Executive Skylight Suite',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '04',
    tags: ['VILLA', 'GARDEN ACCESS', 'BUTLER SERVICE'],
    title: 'Luxury Garden Sanctuary',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: '05',
    tags: ['SIGNATURE', 'PANORAMIC VIEW', 'LOUNGE'],
    title: 'Signature Diplomatic Suite',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  },
];

function WorkThat() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(1);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const track = trackRef.current;
      const totalScrollWidth = track.scrollWidth - window.innerWidth + 120;

      // Horizontal Scroll Animation with Section Pinning
      gsap.to(track, {
        x: -totalScrollWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: () => `+=${totalScrollWidth}`,
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(
              suites.length,
              Math.floor(self.progress * suites.length) + 1
            );
            setCurrentIndex(idx);
          },
        },
      });

      // Animated Pulsing Dot Icon in Title
      gsap.to('.work-glow-icon', {
        scale: 1.35,
        opacity: 0.7,
        duration: 1,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="workthat-section">
      {/* Top Section Header */}
      <div className="workthat-header">
        <div className="workthat-title-group" data-cursor-text="SUITES">
          <h2 className="workthat-heading">LUXURY SUITES</h2>
          <div className="workthat-sub-row">
            <span className="workthat-subheading">crafted for perfection</span>
            <i className="fa-solid fa-circle-dot work-glow-icon green-icon"></i>
          </div>
        </div>

        {/* Live Pagination Counter */}
        <div className="workthat-counter" data-cursor-text="SLIDES">
          <span className="counter-current">
            {String(currentIndex).padStart(2, '0')}
          </span>
          <span className="counter-divider"> / </span>
          <span className="counter-total">
            {String(suites.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Horizontal Cards Track Wrapper */}
      <div className="workthat-track-wrapper">
        <Link to={'/work'} ref={trackRef} className="workthat-track">
          {suites.map((item) => (
            <div
              key={item.id}
              className="workthat-card"
              data-cursor-text="EXPLORE"
            >
              {/* Card Image Container */}
              <div className="workthat-img-box">
                <img src={item.image} alt={item.title} className="workthat-img" />
                <div className="card-hover-overlay">
                  <i className="fa-solid fa-arrow-up-right-from-square hover-icon"></i>
                </div>
              </div>

              {/* Meta info & Title */}
              <div className="workthat-card-info">
                <div className="workthat-card-meta">
                  <span className="workthat-tags">
                    {item.tags.map((tag, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <span className="tag-dot">•</span>}
                        <span>{tag}</span>
                      </React.Fragment>
                    ))}
                  </span>
                  <span className="workthat-card-num">{item.id}</span>
                </div>
                <h3 className="workthat-card-title">{item.title}</h3>
              </div>
            </div>
          ))}
        </Link>
      </div>
    </section>
  );
}

export default WorkThat;
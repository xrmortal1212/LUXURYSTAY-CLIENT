import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/CaseStudies.css';

gsap.registerPlugin(ScrollTrigger);

const suitesData = [
  {
    id: 1,
    tag: 'PRESIDENTIAL / OCEAN VIEW / PRIVATE POOL',
    title: 'Presidential Penthouse',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    tag: 'EXECUTIVE / SKYLINE VIEW / SMART ROOM',
    title: 'Executive Skylight Suite',
    image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    tag: 'ROYAL / PANORAMIC / PERSONAL BUTLER',
    title: 'Royal Horizon Suite',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    tag: 'VILLA / PRIVATE GARDEN / DUPLEX',
    title: 'Grand Heritage Villa',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    tag: 'PLATINUM / WELLNESS / JACUZZI',
    title: 'Platinum Sanctuary Suite',
    image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    tag: 'IMPERIAL / TOP FLOOR / HELIPAD ACCESS',
    title: 'Crown Imperial Suite',
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 7,
    tag: 'SUITE / SUNSET VIEW / PRIVATE TERRACE',
    title: 'Horizon Sunset Suite',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 8,
    tag: 'VILLA / BOTANICAL / PLUNGE POOL',
    title: 'Garden Villa Retreat',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 9,
    tag: 'MASTER / COASTAL VIEW / SPA ACCESS',
    title: 'Oasis Master Suite',
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 10,
    tag: 'SIGNATURE / DUAL ASPECT / BAR LOUNGE',
    title: 'Signature Corner Suite',
    image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
  }
];

function CaseStudies() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Header Text Fade In & Slide Up
      gsap.fromTo(
        headerRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
          },
        }
      );

      // 2. Grid Cards Staggered Scroll Animation
      const cards = gridRef.current.querySelectorAll('.cs-card');
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="suites-grid" ref={sectionRef} className="cs-section">
      <div className="cs-container">
        
        {/* Section Header */}
        <div ref={headerRef} className="cs-header-grid">
          <div className="cs-title-col">
            <span className="cs-badge">— LUXURY COLLECTION</span>
            <h2 className="cs-main-heading">
              FEATURED <br />
              SUITES
            </h2>
          </div>
          <div className="cs-desc-col">
            <p className="cs-desc-text">
              Every suite at LuxuryStay is an architectural masterpiece designed to harmonize timeless luxury aesthetics with advanced AI smart controls and personalized guest services.
            </p>
          </div>
        </div>

        {/* 2-Column Projects Grid */}
        <div ref={gridRef} className="cs-grid">
          {suitesData.map((project) => (
            <div key={project.id} className="cs-card">
              <div className="cs-image-wrapper">
                <img
                  src={project.image}
                  alt={project.title}
                  className="cs-image"
                  loading="lazy"
                />
                <div className="cs-image-overlay"></div>
              </div>
              <div className="cs-card-info">
                <span className="cs-project-tag">{project.tag}</span>
                <h3 className="cs-project-title">{project.title}</h3>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default CaseStudies;
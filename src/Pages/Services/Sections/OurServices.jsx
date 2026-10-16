import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/OurServices.css';
import { Link } from 'react-router-dom';

gsap.registerPlugin(ScrollTrigger);

const servicesData = [
  {
    id: 1,
    category: 'spa',
    title: 'Spa & Wellness',
    count: '15 experiences',
    icon: '✦',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    category: 'dining',
    title: 'Fine Dining & Bars',
    count: '8 venues',
    icon: '✕',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    category: 'transfers',
    title: 'Concierge & Transfers',
    count: '10 services',
    icon: '✦',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
  },
];

function OurServices() {
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef([]);
  const btnRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          },
        }
      );

      gsap.fromTo(
        cardsRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
          },
        }
      );

      gsap.fromTo(
        btnRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          delay: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 70%',
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id='ourservices' ref={containerRef} className="os-section">
      <div className="os-container">

        {/* Section Header */}
        <div className="os-header-grid">
          <div className="os-title-col">
            <span className="os-badge">— HOTEL SERVICES</span>
            <h2 className="os-main-heading">
              OUR <br />
              SERVICES
            </h2>
          </div>
          <div className="os-desc-col">
            <p className="os-desc-text">
              Immerse yourself in world-class amenities designed to give you an effortless blend of comfort, luxury, and personalized attention during your stay.
            </p>
          </div>
        </div>

        {/* Services Cards Grid */}
        <div className="os-grid">
          {servicesData.map((service, index) => (
            <Link
              to="/InspectServices"
              state={{ category: service.category }}
              key={service.id}
              ref={(el) => (cardsRef.current[index] = el)}
              className="os-card"
            >
              <div className="os-card-image-wrapper">
                <img
                  src={service.image}
                  alt={service.title}
                  className="os-card-img"
                />
                <div className="os-card-overlay" />

                <div className="os-card-content">
                  <div className="os-card-info">
                    <p className="os-card-count">{service.count}</p>
                    <h3 className="os-card-title">{service.title}</h3>
                  </div>
                  <span className="os-card-icon">{service.icon}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div ref={btnRef} className="os-btn-wrapper">
          <Link to={'/AllServices'} className="os-view-all-btn">
            View All Services
          </Link>
        </div>

      </div>
    </section>
  );
}

export default OurServices;
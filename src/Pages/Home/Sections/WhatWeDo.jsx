import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import '../Styles/WhatWeDo.css';

const services = [
  {
    id: '1',
    title: 'AI Concierge & Smart Room Care',
    image: 'https://i.pinimg.com/1200x/cf/b7/ac/cfb7ac8fecc606ea835474bd5a9fb510.jpg',
  },
  {
    id: '2',
    title: 'Gourmet Fine Dining & Bars',
    image: 'https://i.pinimg.com/1200x/ec/13/36/ec1336989860aa75141f4aaccc2b21b6.jpg',
  },
  {
    id: '3',
    title: 'Luxury Wellness Spa & Pool',
    image: 'https://i.pinimg.com/736x/59/d9/a7/59d9a7bcbc808617155422ced7e27fc3.jpg',
  },
  {
    id: '4',
    title: 'Chauffeur & Valet Transfers',
    image: 'https://i.pinimg.com/736x/a3/bd/04/a3bd04092707f648a74b1d06017cefab.jpg',
  },
  {
    id: '5',
    title: 'Private Events & Celebrations',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
  },
];

function WhatWeDo() {
  const sectionRef = useRef(null);
  const previewImgRef = useRef(null);
  const [activeService, setActiveService] = useState(null);

  useEffect(() => {
    // Smooth 60fps cursor tracking for floating card preview
    const xTo = gsap.quickTo(previewImgRef.current, 'x', { duration: 0.35, ease: 'power3.out' });
    const yTo = gsap.quickTo(previewImgRef.current, 'y', { duration: 0.35, ease: 'power3.out' });

    const handleMouseMove = (e) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      xTo(e.clientX - rect.left);
      yTo(e.clientY - rect.top);
    };

    const currentSection = sectionRef.current;
    if (currentSection) {
      currentSection.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (currentSection) {
        currentSection.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  const handleMouseEnter = (item) => {
    setActiveService(item);
    
    // Id 2 & 4 ke liye rotation 6deg, baaki ke liye -6deg
    const rotationAngle = item.id === '2' || item.id === '4' ? 6 : -6;

    gsap.to(previewImgRef.current, {
      scale: 1,
      opacity: 1,
      rotation: rotationAngle,
      duration: 0.35,
      ease: 'back.out(1.5)',
    });
  };

  const handleMouseLeave = () => {
    setActiveService(null);
    gsap.to(previewImgRef.current, {
      scale: 0.7,
      opacity: 0,
      rotation: 0,
      duration: 0.25,
      ease: 'power2.in',
    });
  };

  return (
    <section ref={sectionRef} className="whatwedo-section">
      {/* Top Header */}
      <div className="whatwedo-header">
        <div className="whatwedo-sublabel">
          <span className="sublabel-dash">—</span> WHAT WE OFFER
        </div>
        <h2 className="whatwedo-title">
          SERVICES THAT<br />
          ELEVATE YOUR STAY
        </h2>
      </div>

      {/* Services Accordion / List */}
      <div className="whatwedo-list">
        {services.map((item) => (
          <div
            key={item.id}
            className={`whatwedo-item ${activeService?.id === item.id ? 'active' : ''}`}
            onMouseEnter={() => handleMouseEnter(item)}
            onMouseLeave={handleMouseLeave}
            data-cursor-text="EXPLORE"
          >
            <div className="item-number-badge">{item.id}</div>
            <h3 className="item-title">{item.title}</h3>
            <i className="fa-solid fa-arrow-right item-arrow"></i>
          </div>
        ))}
      </div>

      {/* Floating Hover Card Following Mouse */}
      <div ref={previewImgRef} className="whatwedo-preview-card">
        {activeService && (
          <img
            src={activeService.image}
            alt={activeService.title}
            className="preview-img"
          />
        )}
      </div>
    </section>
  );
}

export default WhatWeDo;
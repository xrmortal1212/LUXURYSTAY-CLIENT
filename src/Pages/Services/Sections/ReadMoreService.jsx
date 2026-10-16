import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/ReadMoreService.css';

gsap.registerPlugin(ScrollTrigger);

function ReadMoreService() {
  const containerRef = useRef(null);

  // Slot Refs
  const slot1Ref = useRef(null);
  const slot2Ref = useRef(null);
  const slot3Ref = useRef(null);

  // Bracket Refs
  const brackets1Ref = useRef([]);
  const brackets2Ref = useRef([]);
  const brackets3Ref = useRef([]);

  // Text / Icon Refs
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);
  const text3Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const slots = [
        { wrapper: slot1Ref.current, brackets: brackets1Ref.current, text: text1Ref.current },
        { wrapper: slot2Ref.current, brackets: brackets2Ref.current, text: text2Ref.current },
        { wrapper: slot3Ref.current, brackets: brackets3Ref.current, text: text3Ref.current },
      ];

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 100%',
          end: 'bottom 50%',
          scrub: 1,
        },
      });

      slots.forEach((slot) => {
        if (!slot.wrapper) return;

        const targetWidth = slot.wrapper.scrollWidth;

        tl.fromTo(
          slot.wrapper,
          { width: 0, marginLeft: 0, marginRight: 0 },
          {
            width: targetWidth,
            marginLeft: '0.3em',
            marginRight: '0.3em',
            duration: 1,
            ease: 'power2.inOut',
          },
          0
        )
          .fromTo(
            slot.brackets,
            { opacity: 0, scale: 0.3 },
            { opacity: 1, scale: 1, duration: 0.4, ease: 'power2.out' },
            0.3
          )
          .fromTo(
            slot.text,
            { opacity: 0, scale: 0.5, y: 5 },
            { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'power2.out' },
            0.6
          );
      });

      ScrollTrigger.refresh();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="rms-outer-wrapper">
      <div className="rms-container">
        
        {/* Left Column Box */}
        <div className="rms-left-box">
          <div className="rms-top-content">
            <span className="rms-badge">— WORLD-CLASS HOSPITALITY</span>

            <div className="rms-headline-group">
              {/* Line 1 */}
              <h1 className="rms-line">
                <span>WE</span>
                <div ref={slot1Ref} className="rms-expand-slot">
                  <span ref={(el) => (brackets1Ref.current[0] = el)} className="rms-bracket">&#123;</span>
                  <span ref={text1Ref} className="rms-inner-text">CURATE</span>
                  <span ref={(el) => (brackets1Ref.current[1] = el)} className="rms-bracket">&#125;</span>
                </div>
                <span>UNFORGETTABLE</span>
              </h1>

              {/* Line 2 */}
              <h1 className="rms-line">
                <span>MOMENTS OF LUXURY</span>
              </h1>

              {/* Line 3 */}
              <h1 className="rms-line">
                <span>FOR YOU</span>
                <div ref={slot2Ref} className="rms-expand-slot">
                  <span ref={(el) => (brackets2Ref.current[0] = el)} className="rms-bracket">&#123;</span>
                  <span ref={text2Ref} className="rms-inner-text"><i className="fas fa-clock fa-sm"></i></span>
                  <span ref={(el) => (brackets2Ref.current[1] = el)} className="rms-bracket">&#125;</span>
                </div>
                <span>AND</span>
              </h1>

              {/* Line 4 */}
              <h1 className="rms-line">
                <span>YOUR STAY</span>
                <div ref={slot3Ref} className="rms-expand-slot">
                  <span ref={(el) => (brackets3Ref.current[0] = el)} className="rms-bracket">&#123;</span>
                  <span ref={text3Ref} className="rms-inner-text">
                    <svg viewBox="0 0 24 24" className="rms-spiral-svg" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 3a9 9 0 1 0 9 9c0-3.5-2.5-6.5-6-6.5s-5.5 2.5-5.5 5.5 2 4 4 4 3-1.5 3-3-1-2-2-2" />
                    </svg>
                  </span>
                  <span ref={(el) => (brackets3Ref.current[1] = el)} className="rms-bracket">&#125;</span>
                </div>
              </h1>
            </div>
          </div>

          {/* Subtitle & CTA */}
          <div className="rms-body-group">
            <p className="rms-description">
              LuxuryStay offers a refined sanctuary designed for discerning travelers. Enjoy holistic wellness treatments, infinity pool relaxation, gourmet dining, and personalized care delivered seamlessly by our dedicated team.
            </p>
            <a href="#ourservices" className="rms-cta-btn">
              Discover Services
            </a>
          </div>
        </div>

        {/* Right Column Image */}
        <div className="rms-right-box">
          <img 
            src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80" 
            alt="Luxury Stay Spa & Wellness" 
            className="rms-right-img" 
          />
        </div>

      </div>
    </section>
  );
}

export default ReadMoreService;
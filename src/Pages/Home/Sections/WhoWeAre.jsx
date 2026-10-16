import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/WhoWeAre.css';

gsap.registerPlugin(ScrollTrigger);

const tags = [
  'WORLD-CLASS',
  'AI-POWERED',
  'BESPOKE SERVICE',
  'EXCLUSIVE LUXURY',
  '5-STAR RATED',
];

function WhoWeAre() {
  const sectionRef = useRef(null);
  const imageBoxRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image reveal on scroll
      gsap.fromTo(
        imageBoxRef.current,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
          },
        }
      );

      // Text elements stagger animation
      gsap.fromTo(
        '.whoweare-anim',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="whoweare-section" data-cursor-text="ABOUT">
      <div className="whoweare-container">
        {/* Left Image Column */}
        <div ref={imageBoxRef} className="whoweare-image-col">
          <div className="whoweare-img-wrapper">
            <img
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
              alt="LuxuryStay Grand Hotel Exterior"
              className="whoweare-img"
            />
            {/* Green Counter Badge */}
            <div className="whoweare-badge">
              <span className="badge-number">50+</span>
              <span className="badge-text">LUXURY SUITES</span>
            </div>
          </div>
        </div>

        {/* Right Content Column */}
        <div ref={contentRef} className="whoweare-content-col">
          {/* Sublabel */}
          <div className="whoweare-sublabel whoweare-anim">
            <span className="sublabel-dash">—</span> WHO WE ARE
          </div>

          {/* Main Heading */}
          <h2 className="whoweare-heading whoweare-anim">
            WE ARE<br />
            LUXURYSTAY.
          </h2>

          {/* Key Statement Paragraph */}
          <p className="whoweare-intro whoweare-anim">
            <strong>LuxuryStay Hospitality</strong> is a premier luxury destination crafted for guests who demand unparalleled comfort and intuitive, smart service.
          </p>

          {/* Descriptive Body Paragraphs */}
          <p className="whoweare-body whoweare-anim">
            We blend architectural elegance, AI-powered concierge care, and personalized guest experiences to elevate every single stay into a memorable journey.
          </p>

          <p className="whoweare-body whoweare-anim">
            From seamless express check-ins to tailored room preferences, our dedicated hospitality team and next-gen system ensure perfection at every touchpoint.
          </p>

          {/* Upgraded Tag Pills Container */}
          <div className="whoweare-tags whoweare-anim">
            {tags.map((tag, index) => (
              <span key={index} className="whoweare-tag-pill">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhoWeAre;
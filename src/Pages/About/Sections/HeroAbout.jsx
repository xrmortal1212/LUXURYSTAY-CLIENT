import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/HeroAbout.css';
import logoImg from '../../../assets/Images/LogoNew.png';


gsap.registerPlugin(ScrollTrigger);

function HeroAbout() {
  const sectionRef = useRef(null);
  const topBarRef = useRef(null);
  const bgRef = useRef(null);
  const badgeRef = useRef(null);
  const headingRef = useRef(null);
  const btnRef = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1 },
      });

      // 1. Top Bar Reveal
      tl.fromTo(
        topBarRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 }
      );

      // 2. Badge Reveal
      tl.fromTo(
        badgeRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        '-=0.4'
      );

      // 3. Staggered Line-by-Line Heading Reveal
      const lines = headingRef.current.querySelectorAll('.heading-line');
      tl.fromTo(
        lines,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
        '-=0.4'
      );

      // 4. CTA Button & Description Staggered Reveal
      tl.fromTo(
        btnRef.current,
        { y: 30, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.7 },
        '-=0.5'
      );

      tl.fromTo(
        descRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.6'
      );

      // Smooth Parallax Scroll Effect on Background Image
      gsap.to(bgRef.current, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="ha-section">
      {/* Background Parallax Image */}
      <div ref={bgRef} className="ha-bg-image"></div>
      <div className="ha-dark-overlay"></div>

      {/* Top Navigation / Header Bar */}
      <div ref={topBarRef} className="ha-top-bar">
        <a href="/" className="hero-brand-logo" data-cursor-text="HOME">
          <img src={logoImg} alt="LuxuryStay Hospitality Logo" className="hero-logo-img" />
        </a>

        <a href="#team" className="ha-top-cta" data-cursor-text="TEAM">
          MEET OUR LEADERSHIP
        </a>
      </div>

      {/* Main Content Layout */}
      <div className="ha-container">
        <div className="ha-content-grid">

          {/* Left Column: Badge, Line-Masked Heading & Button */}
          <div className="ha-left-col">
            <span ref={badgeRef} className="ha-badge">— ABOUT LUXURYSTAY</span>

            <h1 ref={headingRef} className="ha-heading">
              <span className="heading-line-wrap">
                <span className="heading-line">CRAFTING LUXURY</span>
              </span>
              <span className="heading-line-wrap">
                <span className="heading-line ha-green-text">EXPERIENCES THAT</span>
              </span>
              <span className="heading-line-wrap">
                <span className="heading-line ha-green-text">ENDURE.</span>
              </span>
            </h1>

            <a ref={btnRef} href="#story" className="ha-btn">
              EXPLORE OUR JOURNEY
            </a>
          </div>

          {/* Right Column: Narrative / Ethos */}
          <div className="ha-right-col">
            <p ref={descRef} className="ha-description">
              LuxuryStay was born out of a passion for refined elegance, uncompromised comfort, and timeless hospitality. We offer a sanctuary of world-class accommodations, Michelin-starred culinary craft, and holistic wellness rituals tailored for discerning travelers.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

export default HeroAbout;
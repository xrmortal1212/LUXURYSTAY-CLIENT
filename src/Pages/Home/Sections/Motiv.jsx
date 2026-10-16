import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/Motiv.css';

gsap.registerPlugin(ScrollTrigger);

function Motiv() {
  const sectionRef = useRef(null);
  const row1Ref = useRef(null);
  const row2Ref = useRef(null);
  const row3Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Line 1: Scroll down -> Left to Right (-120px to +120px)
      gsap.fromTo(
        row1Ref.current,
        { x: -120 },
        {
          x: 120,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      // Line 2: Scroll down -> Right to Left (+120px to -120px) [Opposite]
      gsap.fromTo(
        row2Ref.current,
        { x: 120 },
        {
          x: -120,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      // Line 3: Scroll down -> Left to Right (-120px to +120px) [Same as Line 1]
      gsap.fromTo(
        row3Ref.current,
        { x: -120 },
        {
          x: 120,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        }
      );

      // Continuous FontAwesome Icon Animations
      gsap.to('.motiv-icon-spin', {
        rotate: 360,
        duration: 8,
        repeat: -1,
        ease: 'none',
      });

      gsap.to('.motiv-icon-pulse', {
        scale: 1.3,
        duration: 1.2,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="motiv-section">
      <div className="motiv-container">
        {/* Line 1: Left to Right */}
        <div ref={row1Ref} className="motiv-row row-1" data-cursor-text="CREATIVE">
          <div className="motiv-label-box">
            <i className="fa-solid fa-asterisk motiv-icon-spin green-icon"></i>
            <span className="motiv-sublabel">INDEPENDENT</span>
          </div>
          <h2 className="motiv-title motiv-black">CREATIVE</h2>
        </div>

        {/* Line 2: Right to Left (Opposite) */}
        <div ref={row2Ref} className="motiv-row row-2" data-cursor-text="STUDIO">
          <h2 className="motiv-title motiv-green-italic">Studio</h2>
          <div className="motiv-label-box">
            <span className="motiv-sublabel">BUILT</span>
            <i className="fa-solid fa-layer-group motiv-icon-pulse green-icon"></i>
          </div>
        </div>

        {/* Line 3: Left to Right */}
        <div ref={row3Ref} className="motiv-row row-3" data-cursor-text="CLARITY">
          <div className="motiv-label-box">
            <i className="fa-solid fa-bolt motiv-icon-pulse green-icon"></i>
            <span className="motiv-sublabel">WITH</span>
          </div>
          <h2 className="motiv-title motiv-outline">CLARITY</h2>
        </div>
      </div>
    </section>
  );
}

export default Motiv;
import React, { useEffect } from 'react';
import Lenis from 'lenis';
import HeroWork from './Sections/HeroWork';
import CaseStudies from './Sections/CaseStudies';
import Impact from './Sections/Impact';


function Work() {
  useEffect(() => {
    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <main className="main-content">
      <HeroWork />
      <CaseStudies />
      <Impact />
    </main>
  );
}

export default Work;
import React, { useEffect } from 'react';
import Lenis from 'lenis';
import HeroService from './Sections/HeroService';
import ReadMoreService from './Sections/ReadMoreService';
import OurServices from './Sections/OurServices';


function Services() {
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
      <HeroService />
      <ReadMoreService />
      <OurServices />
      <hr className='bg-black text-zinc-800' />
    </main>
  );
}

export default Services;
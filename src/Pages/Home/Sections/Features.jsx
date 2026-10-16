import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/Features.css';

gsap.registerPlugin(ScrollTrigger);

const projectsData = [
    {
        id: '01',
        category: 'Luxury Accommodations',
        title: 'Presidential & Executive Suites',
        image: 'https://i.pinimg.com/1200x/24/50/aa/2450aa8df8db49a26a56d1e237c9744b.jpg',
    },
    {
        id: '02',
        category: 'Smart Guest Experience',
        title: 'AI Concierge & Room Controls',
        image: 'https://i.pinimg.com/736x/6d/9c/1a/6d9c1a06bd9697ae0459d71d1620cad8.jpg',
    },
    {
        id: '03',
        category: 'Wellness & Gastronomy',
        title: '5-Star Fine Dining & Spa Retreat',
        image: 'https://i.pinimg.com/1200x/05/08/31/050831cd30aba995452a32dc2a64c44f.jpg',
    },
    {
        id: '04',
        category: 'Seamless Operations',
        title: 'Express Check-In & Keyless Access',
        image: 'https://i.pinimg.com/1200x/f7/f4/2d/f7f42d73479801312c21d73f4bcee61e.jpg',
    },
];

function Features() {
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    cardsRef.current = cardsRef.current.slice(0, projectsData.length);

    const ctx = gsap.context(() => {
      const cards = cardsRef.current;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${cards.length * 100}%`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
        },
      });

      cards.forEach((card, index) => {
        if (index > 0) {
          tl.fromTo(
            card,
            { yPercent: 100 },
            { yPercent: 0, ease: 'none' },
            `card-${index}`
          );

          tl.to(
            cards[index - 1],
            {
              scale: 0.94,
              opacity: 0.4,
              ease: 'none',
            },
            `card-${index}`
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="features-section">
      <div className="cards-stack-container">
        {projectsData.map((project, index) => (
          <div
            key={project.id}
            ref={(el) => (cardsRef.current[index] = el)}
            className="project-card"
            style={{ zIndex: index + 1 }}
            data-cursor-text="EXPLORE"
          >
            {/* Image Container */}
            <div className="project-image-box">
              <img
                src={project.image}
                alt={project.title}
                className="project-img"
              />
              <div className="project-overlay" />
            </div>

            {/* Content Labels */}
            <div className="project-info">
              <div className="project-category">
                <span className="project-num">{project.id}</span>
                <span className="project-dot">•</span>
                <span className="category-title">{project.category}</span>
              </div>
              <h3 className="project-title">{project.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
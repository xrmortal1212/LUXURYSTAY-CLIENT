import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/Collaborators.css';

gsap.registerPlugin(ScrollTrigger);

const partnersData = [
    {
        id: 1,
        name: 'Gourmet Culinary Guild',
        category: 'Michelin Star Dining',
        image: 'https://i.pinimg.com/736x/b4/49/5b/b4495bcf146bf3ec2e1d49c7f32ea9a5.jpg',
    },
    {
        id: 2,
        name: 'Serenity Spa & Wellness',
        category: 'Holistic Care & Retreat',
        image: 'https://i.pinimg.com/736x/c8/cd/cf/c8cdcff31df2926c4b53fada99554869.jpg',
    },
    {
        id: 3,
        name: 'Prestige Valet & Mobility',
        category: 'Luxury Chauffeur Service',
        image: 'https://i.pinimg.com/736x/4f/63/e3/4f63e38dc81f7395a5157b807d1a37c7.jpg',
    },
    {
        id: 4,
        name: 'Groq AI Systems',
        category: 'Smart Room Automation',
        image: 'https://i.pinimg.com/736x/8f/37/60/8f376042d48691d2ab8494c56e658041.jpg',
    },
    {
        id: 5,
        name: 'Aviation Direct Concierge',
        category: 'VIP Jet Charters',
        image: 'https://i.pinimg.com/736x/72/31/4b/72314b172a3e10cf218b2cb819cdb016.jpg',
    },
];

const statsData = [
    { target: 99, suffix: '%', label: 'GUEST SATISFACTION' },
    { target: 50, suffix: '+', label: 'LUXURY SUITES' },
    { target: 24, suffix: '/7', label: 'AI CONCIERGE CARE' },
    { target: 100, suffix: '%', label: 'TAILORED EXPERIENCE' },
];

function Collaborators() {
    const sectionRef = useRef(null);
    const imageCardsRef = useRef([]);
    const statRefs = useRef([]);
    const [activePartnerIndex, setActivePartnerIndex] = useState(0);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const cards = imageCardsRef.current;
            const totalSlides = partnersData.length;

            // Pin section & control scroll-driven image stacking + active list item
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: `+=${totalSlides * 100}%`,
                    pin: true,
                    scrub: 0.6,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        // Update active partner based on scroll progress
                        const idx = Math.min(
                            totalSlides - 1,
                            Math.floor(self.progress * totalSlides)
                        );
                        setActivePartnerIndex(idx);
                    },
                },
            });

            // Animate stacked cards coming up one over another
            cards.forEach((card, index) => {
                if (index > 0) {
                    tl.fromTo(
                        card,
                        { yPercent: 100 },
                        { yPercent: 0, ease: 'none' },
                        `step-${index}`
                    );
                }
            });

            // Stats Count-up Trigger
            statRefs.current.forEach((el, idx) => {
                if (!el) return;
                const target = statsData[idx].target;
                const obj = { val: 0 };

                gsap.to(obj, {
                    val: target,
                    duration: 1.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: '.collaborators-stats-bar',
                        start: 'top 90%',
                    },
                    onUpdate: () => {
                        el.innerText = `${Math.floor(obj.val)}${statsData[idx].suffix}`;
                    },
                });
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="collaborators-section">
            <div className="collaborators-main-container">
                {/* Left Info Column */}
                <div className="collaborators-left-col">
                    <div className="collaborators-sublabel">
                        <span className="sublabel-dash">—</span> GLOBAL ALLIANCES
                    </div>

                    <h2 className="collaborators-heading">
                        CURATED<br />PARTNERS
                    </h2>

                    <p className="collaborators-desc">
                        Unforgettable hospitality is built through passion, precision, and world-class craftsmanship. We partner with premier global brands to deliver an unparalleled level of comfort, luxury, and seamless smart guest experiences.
                    </p>

                    {/* List of Partners (Active State updates automatically on Scroll) */}
                    <div className="collaborators-list">
                        {partnersData.map((item, idx) => {
                            const isActive = idx === activePartnerIndex;
                            return (
                                <div
                                    key={item.id}
                                    className={`collaborator-item ${isActive ? 'active' : ''}`}
                                >
                                    <span className="partner-name">{item.name}</span>
                                    <span className="partner-category">{item.category}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Stacked Image Showcase */}
                <div className="collaborators-right-col">
                    <div className="collaborator-img-wrapper">
                        {partnersData.map((item, idx) => (
                            <div
                                key={item.id}
                                ref={(el) => (imageCardsRef.current[idx] = el)}
                                className="stacked-img-card"
                                style={{ zIndex: idx + 1 }}
                            >
                                <img src={item.image} alt={item.name} className="collaborator-img" />
                            </div>
                        ))}

                        {/* Floating Index Counter */}
                        <div className="collaborator-index-badge">
                            <span className="current-slide">{activePartnerIndex + 1}</span>
                            <span className="slide-divider"> / </span>
                            <span className="total-slides">{partnersData.length}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Live Stats Bar */}
            <div className="collaborators-stats-bar text-white">
                {statsData.map((stat, idx) => (
                    <div key={idx} className="collaborator-stat-item text-white">
                        <span
                            ref={(el) => (statRefs.current[idx] = el)}
                            className="stat-number text-white"
                        >
                            0{stat.suffix}
                        </span>
                        <span className="stat-label text-white">{stat.label}</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Collaborators;
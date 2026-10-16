import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/HeroWork.css';
import logoImg from '../../../assets/Images/LogoNew.png';


gsap.registerPlugin(ScrollTrigger);

function HeroWork() {
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

            // 3. Staggered Line-by-Line Heading Text Reveal
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

            // Smooth Background Parallax Effect on Scroll
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
        <section ref={sectionRef} className="hw-section">
            {/* Background Image Container with GSAP Parallax */}
            <div ref={bgRef} className="hw-bg-image"></div>
            <div className="hw-dark-overlay"></div>

            {/* Top Navigation Bar inside Hero */}
            <div ref={topBarRef} className="hw-top-bar">
                <a href="/" className="hero-brand-logo" data-cursor-text="HOME">
                    <img src={logoImg} alt="LuxuryStay Hospitality Logo" className="hero-logo-img" />
                </a>

                <a href="#impact" className="hw-top-cta" data-cursor-text="SUITES">
                    OUR STANDARDS
                </a>
            </div>

            {/* Main Content Grid */}
            <div className="hw-container">
                <div className="hw-content-grid">

                    {/* Left Column: Badge, Heading & Wide CTA Button */}
                    <div className="hw-left-col">
                        <span ref={badgeRef} className="hw-badge">— EXCLUSIVE ACCOMMODATIONS</span>

                        <h1 ref={headingRef} className="hw-heading">
                            <span className="heading-line-wrap">
                                <span className="heading-line">SUITES DESIGNED</span>
                            </span>
                            <span className="heading-line-wrap">
                                <span className="heading-line hw-green-text">FOR UNRIVALED</span>
                            </span>
                            <span className="heading-line-wrap">
                                <span className="heading-line hw-green-text">ELEGANCE.</span>
                            </span>
                        </h1>

                        <a ref={btnRef} href="#suites-grid" className="hw-btn">
                            EXPLORE SUITES
                        </a>
                    </div>

                    {/* Right Column: Narrative Description */}
                    <div className="hw-right-col">
                        <p ref={descRef} className="hw-description">
                            Discover our curated collection of luxury suites and penthouses, equipped with smart room automation, private infinity views, bespoke interior finishes, and integrated 24/7 AI Concierge care.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default HeroWork;
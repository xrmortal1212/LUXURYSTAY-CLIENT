import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/HeroService.css';
import logoImg from '../../../assets/Images/LogoNew.png';



gsap.registerPlugin(ScrollTrigger);

function HeroService() {
    const heroRef = useRef(null);
    const bgRef = useRef(null);
    const topBarRef = useRef(null);
    const badgeRef = useRef(null);
    const titleRef = useRef(null);
    const ctaRef = useRef(null);
    const descRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } });

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

            // 3. Line-by-Line Title Reveal
            const lines = titleRef.current.querySelectorAll('.heading-line');
            tl.fromTo(
                lines,
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
                '-=0.4'
            );

            // 4. CTA Button & Description Reveal
            tl.fromTo(
                ctaRef.current,
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

            // Background Parallax Effect
            gsap.to(bgRef.current, {
                yPercent: 18,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={heroRef} className="hs-hero">
            {/* Background Image with GSAP Parallax */}
            <div ref={bgRef} className="hs-bg-image"></div>
            <div className="hs-dark-overlay"></div>

            {/* Top Navigation Bar */}
            <div ref={topBarRef} className="hs-top-bar">
                <a href="/" className="hero-brand-logo" data-cursor-text="HOME">
                    <img src={logoImg} alt="LuxuryStay Hospitality Logo" className="hero-logo-img" />
                </a>


                <a href="#ourservices" className="hs-top-cta" data-cursor-text="SERVICES">
                    BESPOKE EXPERIENCES
                </a>
            </div>

            {/* Main Content Grid Layout */}
            <div className="hs-container">
                <div className="hs-content-grid">

                    {/* Left Column */}
                    <div className="hs-left-col">
                        <span ref={badgeRef} className="hs-badge">— LUXURY HOSPITALITY</span>

                        <h1 ref={titleRef} className="hs-main-title">
                            <span className="heading-line-wrap">
                                <span className="heading-line">
                                    EVERYTHING FOR
                                </span>
                            </span>
                            <span className="heading-line-wrap">
                                <span className="heading-line hs-green-text">AN EXTRAORDINARY<br />STAY.</span>
                            </span>
                        </h1>

                        <a ref={ctaRef} href="#ourservices" className="hs-btn">
                            EXPLORE ALL SERVICES
                        </a>
                    </div>

                    {/* Right Column */}
                    <div className="hs-right-col">
                        <p ref={descRef} className="hs-description">
                            From Michelin-inspired fine dining and holistic wellness spa rituals to VIP airport transfers and 24/7 personal butler care, we curate unmatched moments tailored for your stay.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}

export default HeroService;
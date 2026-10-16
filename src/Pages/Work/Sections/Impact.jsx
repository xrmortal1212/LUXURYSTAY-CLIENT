import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/Impact.css';

gsap.registerPlugin(ScrollTrigger);

const impactStats = [
    {
        number: '50+',
        title: 'LUXURY SUITES & VILLAS',
    },
    {
        number: '100%',
        title: 'SMART ROOM CONTROL',
    },
    {
        number: '24/7',
        title: 'AI CONCIERGE ASSIST',
    },
    {
        number: '5-STAR',
        title: 'BESPOKE SERVICES',
    },
];

function Impact() {
    const wrapperRef = useRef(null);
    const badgeRef = useRef(null);
    const headingRef = useRef(null);
    const descRef = useRef(null);
    const statsRef = useRef(null);
    const ctaRef = useRef(null);
    const ctaTextRef = useRef(null);
    const ctaBtnRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // 1. Impact Section Animation Timeline
            const impactTl = gsap.timeline({
                scrollTrigger: {
                    trigger: wrapperRef.current,
                    start: 'top 75%',
                },
            });

            impactTl
                .fromTo(
                    badgeRef.current,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
                )
                .fromTo(
                    headingRef.current,
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
                    '-=0.4'
                )
                .fromTo(
                    descRef.current,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
                    '-=0.6'
                )
                .fromTo(
                    statsRef.current.querySelectorAll('.imp-stat-box'),
                    { y: 40, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' },
                    '-=0.4'
                );

            // 2. Green CTA Banner Animation Timeline
            const ctaTl = gsap.timeline({
                scrollTrigger: {
                    trigger: ctaRef.current,
                    start: 'top 80%',
                },
            });

            ctaTl
                .fromTo(
                    ctaTextRef.current.querySelectorAll('.cta-line'),
                    { y: 60, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, ease: 'power3.out' }
                )
                .fromTo(
                    ctaBtnRef.current,
                    { x: 30, opacity: 0 },
                    { x: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
                    '-=0.5'
                );
        }, wrapperRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={wrapperRef} className="imp-wrapper">

            {/* Upper White Impact Section */}
            <section id='impact' className="imp-section">
                <div className="imp-container">

                    {/* Header Grid */}
                    <div className="imp-header-grid">
                        <div className="imp-left-col">
                            <div ref={badgeRef} className="imp-badge">
                                <span className="imp-badge-line"></span>
                                EXCELLENCE
                            </div>

                            <h2 ref={headingRef} className="imp-heading">
                                CRAFTED FOR <br />
                                UNCOMPROMISED <br />
                                LUXURY.
                            </h2>
                        </div>

                        <div className="imp-right-col">
                            <p ref={descRef} className="imp-description">
                               Every detail of our luxury suites is crafted for an unforgettable stay.
                            </p>
                        </div>
                    </div>

                    {/* 4-Column Interactive Stats Grid */}
                    <div ref={statsRef} className="imp-stats-grid">
                        {impactStats.map((item, index) => (
                            <div key={index} className="imp-stat-box">
                                <span className="imp-stat-number">{item.number}</span>
                                <h4 className="imp-stat-title">{item.title}</h4>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* Bottom Green CTA Banner Section */}
            <section ref={ctaRef} className="imp-cta-section">
                <div className="imp-container cta-container">

                    <h2 ref={ctaTextRef} className="imp-cta-heading">
                        <span className="cta-line-wrap"><span className="cta-line">READY TO EXPERIENCE<br /> LUXURYSTAY?</span></span>
                    </h2>

                    <div ref={ctaBtnRef} className="imp-cta-btn-wrapper">
                        <a href="#contact" className="imp-cta-btn">
                            <span>RESERVE YOUR SUITE</span>
                            <span className="cta-arrow">→</span>
                        </a>
                    </div>

                </div>
            </section>

        </div>
    );
}

export default Impact;
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/Stats.css';

gsap.registerPlugin(ScrollTrigger);

const statsData = [
    { target: 50, suffix: '+', label: 'LUXURY SUITES' },
    { target: 99, suffix: '%', label: 'GUEST SATISFACTION' },
    { target: 24, suffix: '/7', label: 'AI CONCIERGE CARE' },
    { target: 100, suffix: '%', label: 'TAILORED COMFORT' },
];

function Stats() {
    const sectionRef = useRef(null);
    const statRefs = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animated Numbers Count Up on Scroll
            statRefs.current.forEach((el, idx) => {
                if (!el) return;
                const target = statsData[idx].target;
                const obj = { val: 0 };

                gsap.to(obj, {
                    val: target,
                    duration: 1.8,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 85%',
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
        <section ref={sectionRef} className="stats-section">
            <div className="stats-bar">
                {statsData.map((stat, idx) => (
                    <div key={idx} className="stat-card">
                        <div
                            ref={(el) => (statRefs.current[idx] = el)}
                            className="stat-number"
                        >
                            0{stat.suffix}
                        </div>
                        <div className="stat-label">{stat.label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Stats;
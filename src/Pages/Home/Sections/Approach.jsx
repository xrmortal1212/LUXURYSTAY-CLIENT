import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/Approach.css';

gsap.registerPlugin(ScrollTrigger);

function Approach() {
    const sectionRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Scroll-triggered opacity reveal for normal text
            gsap.fromTo(
                '.reveal-word:not(.text-green-highlight)',
                { opacity: 0.15 },
                {
                    opacity: 1,
                    stagger: 0.05,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top 70%',
                        end: 'bottom 40%',
                        scrub: 0.8,
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const textParagraph = [
        { text: 'A ', isGreen: false },
        { text: 'luxurious ', isGreen: false },
        { text: 'stay ', isGreen: false },
        { text: 'means ', isGreen: false },
        { text: 'very ', isGreen: false },
        { text: 'little ', isGreen: false },
        { text: 'if ', isGreen: false },
        { text: 'it ', isGreen: false },
        { text: 'does ', isGreen: false },
        { text: 'not ', isGreen: false },
        { text: 'make ', isGreen: false },
        { text: 'you ', isGreen: false },
        { text: 'feel ', isGreen: false },
        { text: 'truly ', isGreen: false },
        { text: 'valued. ', isGreen: false },
        { text: 'HOSPITALITY ', isGreen: true },
        { text: 'IS ', isGreen: true },
        { text: 'NOT ', isGreen: true },
        { text: 'JUST ', isGreen: true },
        { text: 'SERVICE. ', isGreen: true },
        { text: 'We ', isGreen: false },
        { text: 'combine ', isGreen: false },
        { text: 'world-class ', isGreen: false },
        { text: 'comfort, ', isGreen: false },
        { text: 'smart ', isGreen: false },
        { text: 'automation ', isGreen: false },
        { text: 'and ', isGreen: false },
        { text: 'personalized ', isGreen: false },
        { text: 'care ', isGreen: false },
        { text: 'around ', isGreen: false },
        { text: 'one ', isGreen: false },
        { text: 'seamless ', isGreen: false },
        { text: 'experience, ', isGreen: false },
        { text: 'elevating ', isGreen: false },
        { text: 'every ', isGreen: false },
        { text: 'moment ', isGreen: false },
        { text: 'so ', isGreen: false },
        { text: 'your ', isGreen: false },
        { text: 'stay ', isGreen: false },
        { text: 'feels ', isGreen: false },
        { text: 'effortless, ', isGreen: false },
        { text: 'exclusive ', isGreen: false },
        { text: 'and ', isGreen: false },
        { text: 'unforgettable.', isGreen: false },
    ];

    return (
        <section ref={sectionRef} className="approach-section">
            <div className="approach-container">
                {/* Header Labels */}
                <div className="approach-header">
                    <span className="approach-label">OUR PHILOSOPHY</span>
                    <span className="approach-sublabel">WHAT DRIVES LUXURYSTAY</span>
                </div>

                {/* Main Content */}
                <div className="approach-body">
                    <h2 className="approach-text">
                        {textParagraph.map((item, index) => (
                            <span
                                key={index}
                                className={`reveal-word ${item.isGreen ? 'text-green-highlight' : ''}`}
                            >
                                {item.text}
                            </span>
                        ))}
                    </h2>
                </div>
            </div>
        </section>
    );
}

export default Approach;
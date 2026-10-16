import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/OurTeam.css';

gsap.registerPlugin(ScrollTrigger);

const teamMembers = [
    {
        id: '01',
        name: 'Mehdi Abbas Mosani',
        role: 'GENERAL MANAGER',
        tags: ['HOSPITALITY', 'OPERATIONS'],
        desc: 'Over 12 years directing world-class luxury resorts and ensuring impeccable bespoke guest service standards.',
        location: 'Karachi, PK',
        experience: '12+ Years',
        expertise: [
            { title: 'Resort Management', desc: 'Overseeing multi-departmental 5-star operations.' },
            { title: 'VIP Relations', desc: 'Curating personalized itineraries for high-net-worth guests.' }
        ],
        imageMain: 'https://i.pinimg.com/736x/8c/27/b5/8c27b5317bdf37ce2d703489a087148e.jpg',
        imageHover: 'https://i.pinimg.com/736x/c2/ed/f1/c2edf114a1637d911e2143dcbd8546f6.jpg',
        socials: { linkedin: '#', instagram: '#', whatsapp: '#' },
    },
    {
        id: '02',
        name: 'Raman .',
        role: 'EXECUTIVE CULINARY DIRECTOR',
        tags: ['FINE DINING', 'MICHELIN'],
        desc: 'Leading our rooftop & oceanfront restaurants with Michelin-star standard farm-to-table tasting menus.',
        location: 'Mumbai, IN',
        experience: '15+ Years',
        expertise: [
            { title: 'Gourmet Gastronomy', desc: 'Designing seasonal menus with locally sourced ingredients.' },
            { title: 'Sommelier Pairings', desc: 'Curating world-class rare wine cellar collections.' }
        ],
        imageMain: 'https://i.pinimg.com/1200x/65/78/64/657864774184d29c4c3606640b3ec3fa.jpg',
        imageHover: 'https://i.pinimg.com/736x/32/45/2a/32452a58ddb42f9dfd20e466cd2cae20.jpg',
        socials: { linkedin: '#', instagram: '#', whatsapp: '#' },
    },
    {
        id: '03',
        name: 'Sooraj Kumar',
        role: 'HEAD OF SPA & WELLNESS',
        tags: ['WELLNESS', 'HOLISTIC'],
        desc: 'Crafting signature Swedish therapies, hydrotherapy circuits, and restorative retreat programs.',
        location: 'Lahore, PK',
        experience: '9+ Years',
        expertise: [
            { title: 'Holistic Therapies', desc: 'Integrating ancient Ayurvedic & modern spa practices.' },
            { title: 'Hydrotherapy & Sauna', desc: 'Managing state-of-the-art thermal bath facilities.' }
        ],
        imageMain: 'https://i.pinimg.com/1200x/45/d1/a4/45d1a4f0c5dd55b1d3632179e9ba770e.jpg',
        imageHover: 'https://i.pinimg.com/736x/93/6a/12/936a12f189136d28b7a382bf863df56a.jpg',
        socials: { linkedin: '#', instagram: '#', whatsapp: '#' },
    },
    {
        id: '04',
        name: 'Abdul Wasay Khan',
        role: 'HEAD CONCIERGE & CHAUFFEUR',
        tags: ['BUTLER', 'VIP TRANSFERS'],
        desc: 'Ensuring seamless private transfers, yacht charters, and round-the-clock dedicated butler care.',
        location: 'Islamabad, PK',
        experience: '8+ Years',
        expertise: [
            { title: 'Private Logistics', desc: 'Coordinating private jets, luxury sedans, and coastal yachts.' },
            { title: 'Bespoke Services', desc: 'Managing 24/7 in-suite butler concierge teams.' }
        ],
        imageMain: 'https://i.pinimg.com/736x/a9/c7/af/a9c7afccabdfd2ea84f7123a35bc84b0.jpg',
        imageHover: 'https://i.pinimg.com/1200x/0b/d2/87/0bd287d94edf106e21db949c4eeffd2d.jpg',
        socials: { linkedin: '#', instagram: '#', whatsapp: '#' },
    },
    {
        id: '05',
        isUpcoming: true,
        title: 'More Specialists Joining Soon',
        desc: 'We are expanding our global team of master mixologists, wellness coaches, and luxury specialists.',
    },
];

function OurTeam() {
    const sectionRef = useRef(null);
    const trackRef = useRef(null);
    const iconRef = useRef(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [activeModalMember, setActiveModalMember] = useState(null);
    const modalOverlayRef = useRef(null);
    const modalBoxRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const track = trackRef.current;
            const totalScrollWidth = track.scrollWidth - window.innerWidth + 120;

            gsap.to(track, {
                x: -totalScrollWidth,
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: () => `+=${totalScrollWidth}`,
                    pin: true,
                    scrub: 0.8,
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        const idx = Math.min(
                            teamMembers.length - 1,
                            Math.floor(self.progress * teamMembers.length)
                        );
                        setCurrentIndex(idx);

                        if (iconRef.current) {
                            gsap.set(iconRef.current, {
                                rotation: self.progress * 720,
                            });
                        }
                    },
                },
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const openModal = (member) => {
        if (!member.isUpcoming) {
            setActiveModalMember(member);
        }
    };

    useEffect(() => {
        if (activeModalMember && modalBoxRef.current) {
            gsap.fromTo(
                modalOverlayRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: 'power2.out' }
            );
            gsap.fromTo(
                modalBoxRef.current,
                { opacity: 0, scale: 0.88, y: 35 },
                { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(1.3)' }
            );
        }
    }, [activeModalMember]);

    const closeModal = () => {
        if (modalOverlayRef.current && modalBoxRef.current) {
            gsap.to(modalBoxRef.current, {
                opacity: 0,
                scale: 0.9,
                y: 20,
                duration: 0.25,
            });
            gsap.to(modalOverlayRef.current, {
                opacity: 0,
                duration: 0.25,
                onComplete: () => setActiveModalMember(null),
            });
        } else {
            setActiveModalMember(null);
        }
    };

    return (
        <section id='team' ref={sectionRef} className="ourteam-section">
            {/* Top Header Section */}
            <div className="ourteam-header">
                <div className="ourteam-title-group">
                    <div className="ourteam-badge">
                        <span className="badge-dash">—</span> LEADERSHIP TEAM
                    </div>

                    <div className="ourteam-heading-row">
                        <h2 className="ourteam-heading">MEET OUR TEAM</h2>

                        <div className="ourteam-icon-wrapper">
                            <img
                                ref={iconRef}
                                src="https://i.pinimg.com/736x/00/25/db/0025db8abe92b8189b1fe78f19727e6e.jpg"
                                alt="Rotating Badge"
                                className="ourteam-custom-icon"
                            />
                        </div>
                    </div>

                    <p className="ourteam-dynamic-desc">
                        {teamMembers[currentIndex].desc}
                    </p>
                </div>

                <div className="ourteam-counter">
                    <span className="counter-current">
                        {String(currentIndex + 1).padStart(2, '0')}
                    </span>
                    <span className="counter-divider"> / </span>
                    <span className="counter-total">
                        {String(teamMembers.length).padStart(2, '0')}
                    </span>
                </div>
            </div>

            {/* Horizontal Scroll Track Wrapper */}
            <div className="ourteam-track-wrapper">
                <div ref={trackRef} className="ourteam-track">
                    {teamMembers.map((item, idx) => {
                        if (item.isUpcoming) {
                            return (
                                <div key={idx} className="ourteam-card upcoming-card">
                                    <div className="upcoming-box">
                                        <span className="upcoming-badge">EXPANDING</span>
                                        <h3 className="upcoming-title">{item.title}</h3>
                                        <p className="upcoming-desc">{item.desc}</p>
                                        <div className="upcoming-plus-icon">+</div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={item.id}
                                className="ourteam-card"
                                onClick={() => openModal(item)}
                            >
                                <div className="ourteam-img-box">
                                    <img
                                        src={item.imageMain}
                                        alt={item.name}
                                        className="ourteam-img img-primary"
                                    />
                                    <img
                                        src={item.imageHover}
                                        alt={`${item.name} hover`}
                                        className="ourteam-img img-secondary"
                                    />

                                    <div className="card-social-overlay">
                                        <div className="social-icons-row">
                                            <a href={item.socials.linkedin} target="_blank" rel="noreferrer" className="social-btn" onClick={(e) => e.stopPropagation()}>
                                                <i className="fa-brands fa-linkedin-in text-white"></i>
                                            </a>
                                            <a href={item.socials.instagram} target="_blank" rel="noreferrer" className="social-btn" onClick={(e) => e.stopPropagation()}>
                                                <i className="fa-brands fa-instagram  text-white"></i>
                                            </a>
                                            <a href={item.socials.whatsapp} target="_blank" rel="noreferrer" className="social-btn" onClick={(e) => e.stopPropagation()}>
                                                <i className="fa-brands fa-whatsapp  text-white"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                <div className="ourteam-card-info">
                                    <div className="ourteam-card-meta">
                                        <span className="ourteam-tags">
                                            {item.tags.map((tag, i) => (
                                                <React.Fragment key={i}>
                                                    {i > 0 && <span className="tag-dot">•</span>}
                                                    <span>{tag}</span>
                                                </React.Fragment>
                                            ))}
                                        </span>
                                        <span className="ourteam-card-num">{item.id}</span>
                                    </div>
                                    <h3 className="ourteam-card-name">{item.name}</h3>
                                    <span className="ourteam-card-role">{item.role}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal Detail Window */}
            {activeModalMember && (
                <div ref={modalOverlayRef} className="ourteam-modal-overlay" onClick={closeModal}>
                    <div ref={modalBoxRef} className="ourteam-modal-box" onClick={(e) => e.stopPropagation()}>
                        <button className="ourteam-modal-close" onClick={closeModal}>✕</button>

                        <div className="ourteam-modal-left">
                            <div className="ourteam-modal-img-frame">
                                <img src={activeModalMember.imageMain} alt={activeModalMember.name} />
                            </div>
                            <div className="ourteam-modal-img-frame">
                                <img src={activeModalMember.imageHover} alt={activeModalMember.name} />
                            </div>
                        </div>

                        <div className="ourteam-modal-right">
                            <div className="ourteam-modal-tag-badge">
                                {activeModalMember.tags.join(' • ')}
                            </div>

                            <h2 className="ourteam-modal-title">{activeModalMember.name}</h2>

                            <div className="ourteam-modal-meta">
                                <span className="ourteam-modal-role-badge">{activeModalMember.role}</span>
                                <span className="ourteam-modal-num">{activeModalMember.id}</span>
                            </div>

                            <p className="ourteam-modal-desc">{activeModalMember.desc}</p>

                            <div className="ourteam-modal-section">
                                <span className="ourteam-modal-label">EXPERIENCE & LOCATION:</span>
                                <p className="ourteam-modal-val">
                                    {activeModalMember.experience} | {activeModalMember.location}
                                </p>
                            </div>

                            <div className="ourteam-modal-section">
                                <span className="ourteam-modal-label">KEY EXPERTISE:</span>
                                <ul className="ourteam-modal-list">
                                    {activeModalMember.expertise.map((exp, idx) => (
                                        <li key={idx} className="ourteam-modal-li">
                                            <strong>• {exp.title}</strong>
                                            <span>{exp.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="ourteam-modal-actions">
                                <a href={activeModalMember.socials.linkedin} target="_blank" rel="noreferrer" className="ourteam-modal-btn">
                                    Connect with Executive
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default OurTeam;
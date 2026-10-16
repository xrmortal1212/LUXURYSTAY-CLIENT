import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/InspectServices.css';
import { Link, useLocation } from 'react-router-dom';
import { Clock3, Search, Sparkles, Star } from 'lucide-react';
import logoImg from '../../../assets/Images/LogoNew.png';



gsap.registerPlugin(ScrollTrigger);

// Category Tabs Data
const categoryTabs = [
    { id: 'all', title: 'EVERYTHING', bgImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
    { id: 'spa', title: 'SPA & WELLNESS', bgImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80' },
    { id: 'dining', title: 'DINING', bgImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80' },
    { id: 'transfers', title: 'CHAUFFEUR & TOURS', bgImage: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80' },
    { id: 'concierge', title: 'CONCIERGE', bgImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
    { id: 'events', title: 'CELEBRATIONS', bgImage: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80' },
];

// Service Cards List Data
const serviceItems = [
    {
        id: 1,
        category: 'spa',
        categoryLabel: 'Spa & wellness',
        title: 'SIGNATURE SWEDISH MASSAGE',
        price: '$220',
        duration: '90min',
        description: 'Full-body deep relaxation massage utilizing essential oils to release deep tension and restore balance.',
        rating: '5.0',
        idealFor: 'Stress relief, muscle recovery, and overall rejuvenation',
        involved: [
            { step: 'Aromatherapy Selection', desc: 'Custom oil blend chosen based on your body needs.' },
            { step: 'Full-Body Therapy', desc: 'Gentle, therapeutic strokes target deep tissue tightness.' },
            { step: 'Herbal Tea Refreshment', desc: 'Relax in our tranquil lounge post-massage.' },
        ],
        img1: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
        img2: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80',
    },
    {
        id: 2,
        category: 'dining',
        categoryLabel: 'Dining',
        title: 'PRIVATE ROOFTOP DINING',
        price: '$350',
        duration: '120min',
        description: 'Exclusive multi-course gourmet dinner curated by our executive Michelin-star chef with panoramic ocean views.',
        rating: '4.9',
        idealFor: 'Anniversaries, celebrations, and intimate dinners',
        involved: [
            { step: '5-Course Tasting Menu', desc: 'Prepared live by your personal chef.' },
            { step: 'Sommelier Wine Pairing', desc: 'Handpicked rare vintages tailored to each dish.' }
        ],
        img1: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        img2: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80',
    },
    {
        id: 3,
        category: 'transfers',
        categoryLabel: 'Chauffeur & tours',
        title: 'VIP AIRPORT TRANSFERS',
        price: '$150',
        duration: '45min',
        description: 'Private luxury sedan ride with professional chauffeur, bottled water, and high-speed Wi-Fi.',
        rating: '4.9',
        idealFor: 'Effortless, punctual airport pickup and drop-off',
        involved: [
            { step: 'Meet & Greet', desc: 'Chauffeur assists with luggage right at arrival.' },
            { step: 'Luxury Vehicle Comfort', desc: 'Temperature pre-set to your preference.' }
        ],
        img1: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
        img2: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    },
    {
        id: 4,
        category: 'concierge',
        categoryLabel: 'Concierge',
        title: '24/7 PERSONAL BUTLER SERVICE',
        price: '$200',
        duration: '24 Hours',
        description: 'Dedicated butler for packing, unpacking, meal reservations, and personal errands during your stay.',
        rating: '5.0',
        idealFor: 'Seamless luxury stay management and maximum convenience',
        involved: [
            { step: 'Wardrobe Care', desc: 'Garment pressing and unpacking upon arrival.' },
            { step: 'Priority Reservations', desc: 'Guaranteed entry to top city spots and in-house restaurants.' }
        ],
        img1: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        img2: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    },
    {
        id: 5,
        category: 'transfers',
        categoryLabel: 'Chauffeur & tours',
        title: 'PRIVATE YACHT CHARTER',
        price: '$850',
        duration: '180min',
        description: 'Sunset coastal cruise with skipper, champagne lounge, and water sports equipment provided.',
        rating: '5.0',
        idealFor: 'Coastal excursions and private group experiences',
        involved: [
            { step: 'Captain & Crew', desc: 'Full-service hospitality crew on board.' },
            { step: 'Gourmet Refreshments', desc: 'Chilled champagne and fresh seafood platters.' }
        ],
        img1: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80',
        img2: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
    },
    {
        id: 6,
        category: 'spa',
        categoryLabel: 'Spa & wellness',
        title: 'HYDROTHERAPY & SAUNA',
        price: '$120',
        duration: '60min',
        description: 'Contrast plunge pools, cedarwood sauna, and steam room session designed for deep detox.',
        rating: '4.8',
        idealFor: 'Circulation boost, muscle relaxation, and detoxification',
        involved: [
            { step: 'Thermal Pool Circuit', desc: 'Guided transition from hot sauna to cool plunge.' },
            { step: 'Infused Hydration', desc: 'Detox waters and herbal tonics included.' }
        ],
        img1: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
        img2: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80',
    },
    {
        id: 7,
        category: 'dining',
        categoryLabel: 'Dining',
        title: 'IN-SUITE GOURMET BREAKFAST',
        price: '$85',
        duration: '45min',
        description: 'Freshly baked pastries, organic juices, and hot gourmet dishes served directly to your terrace.',
        rating: '4.9',
        idealFor: 'Relaxed morning dining with private balcony views',
        involved: [
            { step: 'Custom Menu Order', desc: 'Selected via your room AI concierge tablet.' },
            { step: 'White-Glove Delivery', desc: 'Served warm at your requested time.' }
        ],
        img1: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80',
        img2: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    },
    {
        id: 8,
        category: 'events',
        categoryLabel: 'Events & celebrations',
        title: 'GRAND BALLROOM CELEBRATIONS',
        price: 'By request',
        duration: 'Tailored to your event',
        description: 'A private ballroom celebration planned around your occasion, with thoughtful service and flexible event arrangements.',
        rating: '5.0',
        idealFor: 'Weddings, milestone celebrations, and private gatherings',
        involved: [
            { step: 'Personal Event Planning', desc: 'Coordinate your preferred date, guest count, and event style with our team.' },
            { step: 'Tailored Hospitality', desc: 'Discuss dining, room setup, and guest support for your celebration.' }
        ],
        img1: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        img2: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    },
];

function InspectServices() {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.category || 'spa');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeModalItem, setActiveModalItem] = useState(() =>
        serviceItems.find(item => item.id === location.state?.serviceId) || null
    );

    const containerRef = useRef(null);
    const cardsGridRef = useRef(null);
    const detailRef = useRef(null);
    const matrixRef = useRef(null);

    const modalOverlayRef = useRef(null);
    const modalBoxRef = useRef(null);
    const filteredItems = useMemo(() => serviceItems.filter(item => {
        const matchesCategory = activeTab === 'all' || item.category === activeTab;
        const query = searchQuery.trim().toLowerCase();
        const matchesSearch = !query || `${item.title} ${item.description} ${item.categoryLabel}`.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    }), [activeTab, searchQuery]);
    const activeCategory = categoryTabs.find(category => category.id === activeTab) || categoryTabs[0];

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (cardsGridRef.current) {
                gsap.fromTo(
                    cardsGridRef.current.children,
                    { opacity: 0, y: 35 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        stagger: 0.12,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: cardsGridRef.current,
                            start: 'top 85%',
                        },
                    }
                );
            }

            if (detailRef.current) {
                gsap.fromTo(
                    detailRef.current,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.9,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: detailRef.current,
                            start: 'top 85%',
                        },
                    }
                );
            }

            if (matrixRef.current) {
                gsap.fromTo(
                    matrixRef.current.children,
                    { opacity: 0, y: 40, scale: 0.96 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.7,
                        stagger: 0.1,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: matrixRef.current,
                            start: 'top 80%',
                        },
                    }
                );
            }

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const openModal = (item) => {
        setActiveModalItem(item);
    };

    useEffect(() => {
        if (activeModalItem && modalBoxRef.current) {
            const previousOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
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

            const handleKeyDown = event => {
                if (event.key === 'Escape') setActiveModalItem(null);
            };
            document.addEventListener('keydown', handleKeyDown);
            return () => {
                document.body.style.overflow = previousOverflow;
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
        return undefined;
    }, [activeModalItem]);

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
                onComplete: () => setActiveModalItem(null),
            });
        } else {
            setActiveModalItem(null);
        }
    };

    const renderServiceCard = item => (
        <article key={item.id} className="is-item-card">
            <img className="is-item-image" src={item.img1} alt="" loading="lazy" />
            <div className="is-item-card-content">
                <div className="is-item-card-topline">
                    <span className="is-item-category">{item.categoryLabel}</span>
                    <span className="is-item-rating"><Star size={13} fill="currentColor" /> {item.rating}</span>
                </div>
                <h3 className="is-item-title">{item.title}</h3>
                <p className="is-item-desc">{item.description}</p>
                <div className="is-item-card-footer">
                    <div><strong className="is-item-price">{item.price}</strong><span className="is-item-duration"><Clock3 size={14} /> {item.duration}</span></div>
                    <button className="is-btn-learn" type="button" onClick={() => openModal(item)}>Explore <span aria-hidden="true">→</span></button>
                </div>
            </div>
        </article>
    );

    return (
        <section ref={containerRef} className="is-section">
            <div className="is-container">

                {/* Top Navigation Bar */}
                <div className="hero-top-bar">
                    <a href="/" className="hero-brand-logo" data-cursor-text="HOME">
                        <img src={logoImg} alt="LuxuryStay Hospitality Logo" className="hero-logo-img" />
                    </a>

                    <a href="#contact" className="hero-top-cta" data-cursor-text="TALK">
                        GUEST ASSISTANCE
                    </a>
                </div>

                <Link to="/services" className="as-badge">← Back to services</Link>

                <header className="is-page-intro">
                    <span className="is-page-eyebrow"><Sparkles size={15} /> THE ART OF A BETTER STAY</span>
                    <h1 className="is-header-title">A LITTLE MORE <span>EXTRAORDINARY.</span></h1>
                    <p>Thoughtful experiences, made personal. Find the right moment for your stay.</p>
                </header>

                <div ref={cardsGridRef} className="is-cards-grid" role="group" aria-label="Filter experiences by category">
                    {categoryTabs.map(tab => {
                        const count = tab.id === 'all' ? serviceItems.length : serviceItems.filter(item => item.category === tab.id).length;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`is-card ${isActive ? 'is-card-active' : ''}`}
                                aria-pressed={isActive}
                            >
                                <div className="is-card-bg-wrapper">
                                    <img src={tab.bgImage} alt={tab.title} className="is-card-bg-img" />
                                    <div className="is-card-overlay" />
                                </div>
                                <div className="is-card-content">
                                    <div className="is-card-info">
                                        <h3 className="is-card-title">{tab.title}</h3>
                                        <p className="is-card-count">{count} {count === 1 ? 'experience' : 'experiences'}</p>
                                    </div>
                                    <span className="is-card-icon" aria-hidden="true">{isActive ? '✓' : '↗'}</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div ref={detailRef} className="is-detail-wrapper">
                    <div><span className="is-detail-kicker">CURATED FOR YOU</span><h2 className="is-detail-title">{activeCategory.title}</h2></div>
                    <p className="is-detail-p">Explore a considered collection of experiences, each designed to make your time with us feel effortless and memorable.</p>
                </div>

                <div className="is-results-toolbar">
                    <label className="is-search-field">
                        <Search size={17} />
                        <input value={searchQuery} onChange={event => setSearchQuery(event.currentTarget.value)} placeholder="Search experiences" aria-label="Search experiences" />
                        {searchQuery && <button type="button" onClick={() => setSearchQuery('')}>Clear</button>}
                    </label>
                    <span>{filteredItems.length} {filteredItems.length === 1 ? 'experience' : 'experiences'}</span>
                </div>

                <div ref={matrixRef} className="is-services-matrix">
                    {filteredItems.map(renderServiceCard)}
                    {filteredItems.length === 0 && (
                        <div className="is-empty-results">
                            <Search size={24} />
                            <h3>No experiences found</h3>
                            <p>Try another search or browse all of our experiences.</p>
                            <button type="button" onClick={() => { setSearchQuery(''); setActiveTab('all'); }}>Show all experiences</button>
                        </div>
                    )}
                </div>

                <div className="is-concierge-cta">
                    <div><span>NEED A HAND?</span><h2>Let our concierge make it yours.</h2><p>Tell us what you have in mind and we’ll help plan the details.</p></div>
                    <Link to="/contact">Talk to our concierge <span aria-hidden="true">→</span></Link>
                </div>

            </div>

            {/* Modal Popup */}
            {activeModalItem && (
                <div ref={modalOverlayRef} className="is-modal-overlay" onClick={closeModal}>
                    <div
                        ref={modalBoxRef}
                        className="is-modal-box"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="is-modal-title"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button className="is-modal-close" type="button" aria-label="Close experience details" onClick={closeModal}>✕</button>

                        <div className="is-modal-left">
                            <div className="is-modal-img-frame">
                                <img src={activeModalItem.img1} alt={activeModalItem.title} />
                            </div>
                            <div className="is-modal-img-frame">
                                <img src={activeModalItem.img2} alt={activeModalItem.title} />
                            </div>
                        </div>

                        <div className="is-modal-right">
                            <div className="is-modal-rating">★ ★ ★ ★ ★ {activeModalItem.rating}</div>

                            <h2 className="is-modal-title" id="is-modal-title">{activeModalItem.title}</h2>

                            <div className="is-modal-meta">
                                <span className="is-modal-price">{activeModalItem.price}</span>
                                <span className="is-modal-time">⏱ {activeModalItem.duration}</span>
                            </div>

                            <p className="is-modal-desc">{activeModalItem.description}</p>

                            <div className="is-modal-section">
                                <span className="is-modal-label">IDEAL FOR:</span>
                                <p className="is-modal-val">{activeModalItem.idealFor}</p>
                            </div>

                            <div className="is-modal-section">
                                <span className="is-modal-label">WHAT'S INVOLVED:</span>
                                <ul className="is-modal-list">
                                    {activeModalItem.involved.map((inv, idx) => (
                                        <li key={idx} className="is-modal-li">
                                            <strong>• {inv.step}</strong>
                                            <span>{inv.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link
                                className="is-modal-btn"
                                to="/contact"
                                state={{ serviceType: activeModalItem.title, message: `I'm interested in ${activeModalItem.title}.` }}
                            >
                                Request this experience <span aria-hidden="true">→</span>
                            </Link>
                        </div>

                    </div>
                </div>
            )}
        </section>
    );
}

export default InspectServices;
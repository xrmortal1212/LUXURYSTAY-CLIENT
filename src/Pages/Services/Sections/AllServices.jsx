import React, { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import '../Styles/AllServices.css';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const servicesData = [
  {
    id: 1,
    category: 'spa',
    serviceId: 1,
    tag: 'SPA / WELLNESS / MASSAGE',
    title: 'Signature Swedish Therapy',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 2,
    category: 'dining',
    serviceId: 2,
    tag: 'DINING / MICHELIN / ROOFTOP',
    title: 'Private Rooftop Tasting',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 3,
    category: 'transfers',
    serviceId: 3,
    tag: 'TRANSFERS / CHAUFFEUR / LUXURY',
    title: 'VIP Airport Chauffeur',
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 4,
    category: 'concierge',
    serviceId: 4,
    tag: 'CONCIERGE / BUTLER / 24/7',
    title: 'Personal Butler Service',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 5,
    category: 'transfers',
    serviceId: 5,
    tag: 'CRUISE / YACHT / SUNSET',
    title: 'Private Coastal Yacht Charter',
    image: 'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 6,
    category: 'spa',
    serviceId: 6,
    tag: 'HYDROTHERAPY / SAUNA / DETOX',
    title: 'Thermal Sauna & Plunge Pool',
    image: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 7,
    category: 'dining',
    serviceId: 7,
    tag: 'DINING / IN-SUITE / BREAKFAST',
    title: 'Terrace Gourmet Breakfast',
    image: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 8,
    category: 'events',
    serviceId: 4,
    tag: 'EVENTS / WEDDINGS / GALA',
    title: 'Grand Ballroom Celebrations',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 9,
    category: 'spa',
    serviceId: 6,
    tag: 'FITNESS / PERSONAL TRAINER / YOGA',
    title: 'Private Oceanfront Yoga',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 10,
    category: 'concierge',
    serviceId: 4,
    tag: 'LOUNGE / VIP / COCKTAILS',
    title: 'Executive Platinum Lounge',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
  }
];

function AllServices() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const categories = [
    { id: 'all', label: 'All experiences' },
    { id: 'spa', label: 'Spa & wellness' },
    { id: 'dining', label: 'Dining' },
    { id: 'transfers', label: 'Transfers & tours' },
    { id: 'concierge', label: 'Concierge' },
    { id: 'events', label: 'Events' }
  ];
  const filteredServices = useMemo(() => servicesData.filter(service => {
    const matchesCategory = activeCategory === 'all' || service.category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || `${service.title} ${service.tag}`.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  }), [activeCategory, searchQuery]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current.children,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 80%',
          },
        }
      );

      const cards = gridRef.current.querySelectorAll('.as-card');
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="as-section">
      <div className="as-container">
        
        {/* Section Header */}
        <div ref={headerRef} className="as-header-grid">
          <div className="as-title-col">
            <Link to="/services" className="as-badge">← Back to services</Link>
            <h2 className="as-main-heading">
              ALL <br />
              SERVICES
            </h2>
          </div>
          <div className="as-desc-col">
            <p className="as-desc-text">
              Find your next favourite moment. Browse our experiences, then reach out to the concierge to make it yours.
            </p>
          </div>
        </div>

        <div className="as-discovery-tools">
          <label className="as-search-field">
            <Search size={17} />
            <input value={searchQuery} onChange={event => setSearchQuery(event.currentTarget.value)} placeholder="Search experiences" aria-label="Search all services" />
            {searchQuery && <button type="button" onClick={() => setSearchQuery('')}>Clear</button>}
          </label>
          <div className="as-category-filters" role="group" aria-label="Filter services by category">
            {categories.map(category => (
              <button
                key={category.id}
                type="button"
                className={activeCategory === category.id ? 'active' : ''}
                aria-pressed={activeCategory === category.id}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
          <p className="as-results-count">{filteredServices.length} {filteredServices.length === 1 ? 'experience' : 'experiences'} to explore</p>
        </div>

        <div ref={gridRef} className="as-grid">
          {filteredServices.map((service) => (
            <Link
              key={service.id}
              className="as-card"
              to="/InspectServices"
              state={{
                category: service.category,
                serviceId: service.id <= 8 ? service.serviceId : undefined
              }}
            >
              <div className="as-image-wrapper">
                <img
                  src={service.image}
                  alt={service.title}
                  className="as-image"
                  loading="lazy"
                />
                <div className="as-image-overlay"><span>Explore experience <ArrowUpRight size={17} /></span></div>
              </div>
              <div className="as-card-info">
                <span className="as-project-tag">{service.tag}</span>
                <h3 className="as-project-title">{service.title}</h3>
              </div>
            </Link>
          ))}
          {filteredServices.length === 0 && (
            <div className="as-empty-state">
              <Search size={24} />
              <h3>No experiences found</h3>
              <p>Try a different search or choose another category.</p>
              <button type="button" onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}>Show all experiences</button>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

export default AllServices;
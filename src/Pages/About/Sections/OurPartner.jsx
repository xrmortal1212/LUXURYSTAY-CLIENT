import React from 'react';
import '../Styles/OurPartner.css';

const row1Partners = [
    { name: 'Michelin Guide', icon: 'https://cdn.simpleicons.org/tripadvisor/34E0A1', category: 'Culinary Distinction' },
    // { name: 'Forbes Travel', icon: 'https://cdn.simpleicons.org/star/FFD700', category: '5-Star Hospitality' },
    { name: 'Virtuoso Travel', icon: 'https://cdn.simpleicons.org/americanexpress/006FCF', category: 'VIP Travel Network' },
    { name: 'Relais & Châteaux', icon: 'https://cdn.simpleicons.org/bookingdotcom/003580', category: 'Exquisite Stays' },
    { name: 'Tesla Chauffeur', icon: 'https://cdn.simpleicons.org/tesla/E82127', category: 'Eco VIP Mobility' },
    { name: 'Technogym', icon: 'https://cdn.simpleicons.org/apple/ffffff', category: 'Wellness & Fitness' },
    { name: 'Perrier-Jouët', icon: 'https://cdn.simpleicons.org/glassdoor/00A261', category: 'Fine Champagne' },
];

const row2Partners = [
    { name: 'Amex Fine Hotels', icon: 'https://cdn.simpleicons.org/americanexpress/ffffff', category: 'Global Luxury' },
    { name: 'Natura Bissé', icon: 'https://cdn.simpleicons.org/sparkfun/E15119', category: 'Spa & Skincare' },
    { name: 'Mastercard Black', icon: 'https://cdn.simpleicons.org/mastercard/EB001B', category: 'VIP Concierge' },
    { name: 'Bang & Olufsen', icon: 'https://cdn.simpleicons.org/spotify/1DB954', category: 'In-Suite Audio' },
    // { name: 'Rolex Escapes', icon: 'https://cdn.simpleicons.org/rolex/006039', category: 'Heritage Timekeeping' },
    { name: 'Uber Black', icon: 'https://cdn.simpleicons.org/uber/ffffff', category: 'Chauffeur On-Demand' },
    { name: 'Airbnb Luxe', icon: 'https://cdn.simpleicons.org/airbnb/FF5A5F', category: 'Private Retreats' },
];

function OurPartner() {
    const duplicatedRow1 = [...row1Partners, ...row1Partners, ...row1Partners];
    const duplicatedRow2 = [...row2Partners, ...row2Partners, ...row2Partners];

    return (
        <section className="ourpartner-section">
            {/* Header Content Section */}
            <div className="ourpartner-header">
                <div className="ourpartner-badge">
                    <span className="badge-dash">—</span> GLOBAL AFFILIATIONS
                </div>

                <h2 className="ourpartner-heading">
                    Partnered with the world’s finest luxury brands.
                </h2>

                <p className="ourpartner-subheading">
                    Michelin gastronomy, Forbes 5-star standards, luxury chauffeur networks, fine wines, and bespoke wellness brands.{' '}
                    <span className="ourpartner-highlight">Excellence guaranteed.</span>
                </p>
            </div>

            {/* Infinite Marquees Container */}
            <div className="ourpartner-marquees-container">
                {/* Upper Marquee */}
                <div className="marquee-wrapper fade-edges">
                    <div className="marquee-track marquee-left-to-right">
                        {duplicatedRow1.map((item, idx) => (
                            <div key={`row1-${idx}`} className="partner-card">
                                <div className="partner-icon-wrapper">
                                    <img src={item.icon} alt={item.name} className="partner-icon" />
                                </div>
                                <span className="partner-name">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lower Marquee */}
                <div className="marquee-wrapper fade-edges">
                    <div className="marquee-track marquee-right-to-left">
                        {duplicatedRow2.map((item, idx) => (
                            <div key={`row2-${idx}`} className="partner-card">
                                <div className="partner-icon-wrapper">
                                    <img src={item.icon} alt={item.name} className="partner-icon" />
                                </div>
                                <span className="partner-name">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default OurPartner;
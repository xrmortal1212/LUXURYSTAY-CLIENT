import React, { useState } from 'react';
import '../Styles/Question.css';

const faqData = [
  {
    id: 1,
    question: 'What makes LuxuryStay different from traditional hotels?',
    answer:
      'LuxuryStay seamlessly integrates 5-star bespoke hospitality with state-of-the-art AI Concierge care, offering personalized room settings, instant guest assistance, and ultra-smooth express check-in.',
  },
  {
    id: 2,
    question: 'How does the AI Concierge & Smart Room Care work?',
    answer:
      'Our AI Concierge is available 24/7 via your smartphone or suite console. It allows you to customize climate, lighting, order gourmet dining, schedule spa treatments, or request butler service instantly.',
  },
  {
    id: 3,
    question: 'What are the standard check-in and check-out timings?',
    answer:
      'Standard check-in starts at 3:00 PM and check-out is at 12:00 PM. Flexible early check-in and late check-out options are automatically managed for our suite guests upon request.',
  },
  {
    id: 4,
    question: 'Can I arrange private airport transfers or chauffeur services?',
    answer:
      'Yes, LuxuryStay provides premium chauffeur-driven transfers, luxury fleet options, and private jet charter arrangements for seamless travel to and from the property.',
  },
  {
    id: 5,
    question: 'Are high-end dining and spa treatments available for non-staying guests?',
    answer:
      'Our Michelin-starred dining venues and holistic wellness spas welcome both resident and non-resident guests, subject to advance reservation.',
  },
  {
    id: 6,
    question: 'Do you cater to international and GCC guests with special preferences?',
    answer:
      'Absolutely. We offer tailored luxury services including multi-lingual staff, halal-certified gourmet dining, private family villas, and dedicated personal butler care for our global guests.',
  },
  {
    id: 7,
    question: 'How can I reserve top suites or host private events?',
    answer:
      'You can reserve our Presidential Suites, Penthouses, or private event spaces directly through our smart booking portal or by contacting our dedicated VIP Guest Relations team.',
  },
];

function Question() {
  const [openIndex, setOpenIndex] = useState(0); // Default pehla accordion open rahega

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="questions-section">
      <div className="questions-container">
        {/* Left Side Header */}
        <div className="questions-left">
          <span className="questions-sublabel">— FREQUENTLY ASKED</span>
          <h2 className="questions-heading">
            WHAT<br />
            GUESTS<br />
            ASK FIRST
          </h2>
        </div>

        {/* Right Side Accordion List */}
        <div className="questions-right">
          <div className="accordion-list">
            {faqData.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={item.id}
                  className={`accordion-item ${isOpen ? 'is-open' : ''}`}
                  onClick={() => toggleAccordion(index)}
                >
                  <div className="accordion-header">
                    <h3 className="accordion-question">{item.question}</h3>
                    <button
                      className={`accordion-toggle-btn ${isOpen ? 'active' : ''}`}
                      aria-label="Toggle answer"
                    >
                      <span className="icon-line line-horizontal"></span>
                      <span className="icon-line line-vertical"></span>
                    </button>
                  </div>

                  <div className="accordion-body">
                    <div className="accordion-content">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Question;
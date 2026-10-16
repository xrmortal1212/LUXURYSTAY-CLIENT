import React, { useState } from 'react';
import '../Styles/GetInTouch.css';

function GetInTouch() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'General Inquiry',
    category: 'Guest Experience',
    details: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (value) => {
    setFormData((prev) => ({ ...prev, category: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Feedback/Inquiry Submitted:', formData);
  };

  return (
    <section id='contact' className="git-section">
      {/* Background Top Header */}
      <div className="git-top-header">
        <span className="git-sublabel">— GUEST FEEDBACK & SUPPORT</span>
        <h1 className="git-main-title">GET IN TOUCH</h1>
      </div>

      {/* Main Grid Section */}
      <div className="git-container">

        {/* Left Column Card */}
        <div className="git-left-card">
          <span className="git-card-tag">— CONTACT US</span>

          <h2 className="git-card-heading">
            WE VALUE <br />
            YOUR <br />
            FEEDBACK <br />
            <span className="git-green-text">& THOUGHTS.</span>
          </h2>

          <div className="git-info-list">
            <div className="git-info-item">
              <span className="git-num-badge">01</span>
              <div className="git-info-text">
                <span className="git-info-label">EMAIL</span>
                <a href="mailto:support@luxurystay.com" className="git-info-val">support@luxurystay.com</a>
              </div>
            </div>
            <hr className='text-zinc-800' />
            <div className="git-info-item">
              <span className="git-num-badge">02</span>
              <div className="git-info-text">
                <span className="git-info-label">GUEST RELATIONS</span>
                <span className="git-info-val">+1 (800) 555-LUXURY</span>
              </div>
            </div>
            <hr className='text-zinc-800' />
            <div className="git-info-item">
              <span className="git-num-badge">03</span>
              <div className="git-info-text">
                <span className="git-info-label">HEADQUARTERS</span>
                <span className="git-info-val">Paradise Bay Coastal Estate</span>
              </div>
            </div>
            <hr className='text-zinc-800' />
            <div className="git-info-item">
              <span className="git-num-badge">04</span>
              <div className="git-info-text">
                <span className="git-info-label">SUPPORT HOURS</span>
                <span className="git-info-val">24/7 AI & Desk Support</span>
              </div>
            </div>
          </div>

          {/* Social Icons Bar */}
          <div className="git-socials-row">
            <a href="#instagram" className="git-social-btn" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#facebook" className="git-social-btn" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#x" className="git-social-btn" aria-label="X">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
            <a href="#linkedin" className="git-social-btn" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
            </a>
          </div>
        </div>

        {/* Right Column Form */}
        <div className="git-right-card">
          <form onSubmit={handleSubmit} className="git-form">

            {/* Input Row: Name & Email */}
            <div className="git-form-row">
              <div className="git-field-wrap">
                <label className="git-label">YOUR NAME</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="git-input"
                />
              </div>

              <div className="git-field-wrap">
                <label className="git-label">EMAIL ADDRESS</label>
                <input
                  type="email"
                  name="email"
                  placeholder="guest@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="git-input"
                />
              </div>
            </div>

            {/* Field: Topic Select */}
            <div className="git-field-wrap">
              <label className="git-label">HOW CAN WE HELP?</label>
              <div className="git-select-wrap">
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  className="git-select"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Stay Experience Feedback">Stay Experience Feedback</option>
                  <option value="AI Concierge Support">AI Concierge Support</option>
                  <option value="Partnerships & Media">Partnerships & Media</option>
                </select>
                <span className="git-arrow">▾</span>
              </div>
            </div>

            {/* Field: Category Selector */}
            <div className="git-field-wrap">
              <label className="git-label">FEEDBACK CATEGORY</label>
              <div className="git-budget-row">
                {['Guest Experience', 'Service Quality', 'General Query'].map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={`git-budget-btn ${formData.category === item ? 'active' : ''}`}
                    onClick={() => handleCategorySelect(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Field: Message / Details */}
            <div className="git-field-wrap">
              <label className="git-label">YOUR MESSAGE / FEEDBACK</label>
              <textarea
                name="details"
                rows="4"
                placeholder="Share your thoughts, suggestions, recent stay experience, or general queries with us..."
                value={formData.details}
                onChange={handleInputChange}
                className="git-textarea"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button type="submit" className="git-submit-btn">
              + SUBMIT FEEDBACK &rarr;
            </button>

          </form>
        </div>

      </div>
    </section>
  );
}

export default GetInTouch;
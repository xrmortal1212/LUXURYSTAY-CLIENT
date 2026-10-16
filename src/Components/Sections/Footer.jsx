import { ArrowRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../Styles/Footer.css';

const Footer = () => (
  <footer className="ft-section">
    <div className="ft-container">
      <div className="ft-top-banner ft-hover-effect">
        <div className="ft-blob-wrapper" aria-hidden="true">
          <div className="ft-blob ft-blob-1" />
          <div className="ft-blob ft-blob-2" />
          <div className="ft-blob ft-blob-3" />
        </div>
        <div className="ft-top-content">
          <p className="ft-sub-text">Thoughtful hospitality, seamless operations, and stays that feel like yours.</p>
        </div>
      </div>

      <Link to="/contact" className="ft-cta-bar">
        <span className="ft-cta-title">Plan your next stay</span>
        <span className="ft-cta-arrow"><ArrowRight size={24} aria-hidden="true" /></span>
      </Link>

      <div className="ft-main-box ft-hover-effect">
        <div className="ft-brand-col">
          <Link to="/" className="ft-logo">
            <span className="ft-logo-icon"><Building2 size={28} aria-hidden="true" /></span>
            <span className="ft-logo-text">LuxuryStay<small>HOSPITALITY</small></span>
          </Link>
          <p className="ft-brand-description">A more considered way to experience hospitality and manage every stay.</p>
        </div>

        <div className="ft-links-grid">
          <div className="ft-col">
            <h4 className="ft-col-title">Explore</h4>
            <ul className="ft-link-list">
              <li><Link to="/work">SUITES</Link></li>
              <li><Link to="/services">SERVICES</Link></li>
              <li><Link to="/About">OUR STORY</Link></li>
              <li><Link to="/blog">JOURNAL</Link></li>
            </ul>
          </div>
          <div className="ft-col">
            <h4 className="ft-col-title">Guest services</h4>
            <ul className="ft-link-list">
              <li><Link to="/AllServices">ALL SERVICES</Link></li>
              <li><Link to="/InspectServices">SERVICE DETAILS</Link></li>
              <li><Link to="/contact">CONTACT US</Link></li>
            </ul>
          </div>
          <div className="ft-col">
            <h4 className="ft-col-title">Your account</h4>
            <ul className="ft-link-list">
              <li><Link to="/profile">PROFILE</Link></li>
              <li><Link to="/login">SIGN IN</Link></li>
              <li><Link to="/register">CREATE ACCOUNT</Link></li>
            </ul>
          </div>
          <div className="ft-col">
            <h4 className="ft-col-title">Stay in touch</h4>
            <ul className="ft-link-list">
              <li><Link to="/contact">GET IN TOUCH</Link></li>
              <li><Link to="/">LUXURYSTAY HOSPITALITY</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="ft-bottom-bar">
        <p className="ft-copyright">© {new Date().getFullYear()} LuxuryStay Hospitality. All rights reserved.</p>
        <p className="ft-disclaimer">Reservations, guest services, and property operations brought together in one considered experience.</p>
      </div>
    </div>
  </footer>
);

export default Footer;

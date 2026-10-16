import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { getApiErrorMessage } from '../../Config/api';
import { useAuth } from '../../Core/AuthHooks';
import '../Styles/Header.css';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');

  const pillRef = useRef(null);
  const menuRef = useRef(null);
  const profileRef = useRef(null);
  const linksRef = useRef([]);

  // GSAP: Expand Pill (Overflow visible set kiya taaki dropdown dikhe)
  const handleMouseEnter = () => {
    setIsHovered(true);
    gsap.to(pillRef.current, {
      width: 'min(380px, 90vw)',
      borderRadius: '28px',
      duration: 0.4,
      ease: 'power3.out',
      onComplete: () => {
        if (pillRef.current) {
          pillRef.current.style.overflow = 'visible';
        }
      },
    });
  };

  // GSAP: Collapse Pill
  const handleMouseLeave = () => {
    if (!isMenuOpen && !isProfileOpen) {
      setIsHovered(false);
      if (pillRef.current) {
        pillRef.current.style.overflow = 'hidden';
      }
      gsap.to(pillRef.current, {
        width: '56px',
        borderRadius: '28px',
        duration: 0.4,
        ease: 'power3.inOut',
      });
    }
  };

  // Helper: Close Nav Menu
  const closeMenu = () => {
    if (!menuRef.current) return;
    gsap.to(menuRef.current, {
      opacity: 0,
      y: -20,
      scale: 0.95,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(menuRef.current, { display: 'none' });
        setIsMenuOpen(false);
      },
    });
  };

  // Helper: Open Nav Menu
  const openMenu = () => {
    setIsMenuOpen(true);
    gsap.to(menuRef.current, {
      display: 'flex',
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(1.2)',
    });
    gsap.fromTo(
      linksRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, delay: 0.1, ease: 'power2.out' }
    );
  };

  // Helper: Close Profile Dropdown
  const closeProfile = () => {
    if (!profileRef.current) return;
    gsap.to(profileRef.current, {
      opacity: 0,
      y: -15,
      scale: 0.95,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(profileRef.current, { display: 'none' });
        setIsProfileOpen(false);
        if (pillRef.current && !isHovered) {
          pillRef.current.style.overflow = 'hidden';
        }
      },
    });
  };

  // Helper: Open Profile Dropdown
  const openProfile = () => {
    setIsProfileOpen(true);
    if (pillRef.current) {
      pillRef.current.style.overflow = 'visible';
    }
    gsap.to(profileRef.current, {
      display: 'flex',
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.35,
      ease: 'back.out(1.2)',
    });
  };

  // Toggle Nav Menu
  const toggleMenu = (e) => {
    e.stopPropagation();
    if (isMenuOpen) {
      closeMenu();
    } else {
      if (isProfileOpen) closeProfile();
      openMenu();
    }
  };

  // Toggle Profile Dropdown
  const toggleProfile = (e) => {
    e.stopPropagation();
    if (isProfileOpen) {
      closeProfile();
    } else {
      if (isMenuOpen) closeMenu();
      openProfile();
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Suites', path: '/work' },
    { name: 'Services', path: '/services' },
    { name: 'Our story', path: '/About' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' }
  ];

  const signOut = async () => {
    setLogoutError('');
    try {
      await logout();
      closeProfile();
      navigate('/login');
    } catch (error) {
      setLogoutError(getApiErrorMessage(error, 'Could not sign out. Please try again.'));
    }
  };

  return (
    <div className="header-wrapper">
      {/* Floating Compact Bar */}
      <div
        ref={pillRef}
        className={`floating-pill ${isHovered || isMenuOpen || isProfileOpen ? 'expanded' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Hamburger Icon */}
        <button className="hamburger-btn" onClick={toggleMenu} aria-label="Toggle Menu">
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
        </button>

        {/* Search & Profile */}
        <div className="pill-content">
          <h6 className="middle-text">Menu</h6>

          <div className="profile-container">
            <button className="profile-btn" onClick={toggleProfile}>
              <span className="avatar" aria-label={user ? user.name : 'Account'}>
                {user?.profilePicture
                  ? <img src={user.profilePicture} alt="" />
                  : user?.name?.slice(0, 1).toUpperCase() || 'L'}
              </span>
            </button>

            {/* Profile Dropdown */}
            <div ref={profileRef} className="profile-dropdown">
              <div className="user-info">
                <p className="user-name">{user?.name || 'Welcome to LuxuryStay'}</p>
                <p className="user-email">{user?.email || 'Your hospitality, elevated.'}</p>
              </div>
              <hr />
              {user ? <>
                <Link to="/profile" className="dropdown-item" onClick={closeProfile}>Profile</Link>
                <Link to="/app" className="dropdown-item" onClick={closeProfile}>Dashboard</Link>
                <button type="button" className="dropdown-item logout" onClick={signOut}>Sign out</button>
              </> : <>
                <Link to="/login" className="dropdown-item" onClick={closeProfile}>Sign in</Link>
                <Link to="/register" className="dropdown-item" onClick={closeProfile}>Create an account</Link>
              </>}
              {logoutError && <p className="header-auth-error" role="alert">{logoutError}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Green Nav Dropdown Menu */}
      <div ref={menuRef} className="green-menu-panel">
        <div className="menu-links-container">
          {navLinks.map((item, index) => (
            <div
              key={item.name}
              ref={(el) => (linksRef.current[index] = el)}
              className="menu-item-wrapper"
            >
              <Link to={item.path} className="green-menu-link" onClick={closeMenu}>
                <span className="link-text">{item.name}</span>
                <i className="fa-solid fa-arrow-right link-arrow"></i>
              </Link>
            </div>
          ))}
        </div>

        <div className="menu-footer">
          <div className="menu-brand">
            <span className="brand-title">LuxuryStay .</span>
          </div>
         
        </div>
      </div>
    </div>
  );
}

export default Header;
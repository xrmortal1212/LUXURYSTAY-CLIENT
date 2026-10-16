import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import { dashboardPathForRole, startOAuth } from '../../../Config/auth';
import { getApiErrorMessage } from '../../../Config/api';
import { useAuth } from '../../../Core/AuthHooks';
import '../Styles/Login.css';

const sliderData = [
  {
    step: "1",
    title: "Welcome Back to LUXURYSTAY",
    desc: "Log in to access your customized professional dashboard and resume your work seamlessly.",
    image: "https://images.pexels.com/photos/33803734/pexels-photo-33803734.jpeg"
  },
  {
    step: "2",
    title: "Set Up Your Workspace",
    desc: "Tailor your virtual professional dashboard exactly how you like it.",
    image: "https://images.pexels.com/photos/34496713/pexels-photo-34496713.jpeg?cs=srgb&dl=pexels-chrislyn-dsouza-424969149-34496713.jpg&fm=jpg"
  },
  {
    step: "3",
    title: "Perfect Your Profile",
    desc: "Add your customized headline and profile picture to stand out instantly.",
    image: "https://images.pexels.com/photos/38624798/pexels-photo-38624798.jpeg?cs=srgb&dl=pexels-caner-aylikci-2157570437-38624798.jpg&fm=jpg"
  }
];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const navigate = useNavigate();
  const { login } = useAuth();

  // GSAP REFS
  const rightPanelRef = useRef(null);
  const formContainerRef = useRef(null);
  const slideTextRef = useRef(null);

  // GSAP ENTRANCE ANIMATION
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Right Slider Panel Entrance
      gsap.fromTo(rightPanelRef.current,
        { opacity: 0, x: 40 },
        { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }
      );

      // Form Container Entrance
      gsap.fromTo(formContainerRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' }
      );

      // Form Elements Stagger Animation
      gsap.fromTo('.gsap-login-item',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, delay: 0.3, ease: 'power2.out' }
      );
    });

    return () => ctx.revert();
  }, []);

  // GSAP SLIDE TEXT ANIMATION ON CHANGE
  useEffect(() => {
    if (slideTextRef.current) {
      gsap.fromTo(slideTextRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }
      );
    }
  }, [activeSlide]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login({ email, password });
      toast.success('Welcome back!');
      navigate(dashboardPathForRole(user.role), { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Unable to sign in'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    startOAuth(provider.toLowerCase());
  };

  return (
    <div className="login-page">
      {/* LEFT FORM PANEL */}
      <div className="login-left">
        <div ref={formContainerRef} className="login-form-card">
          <div className="gsap-login-item">
            <h2 className="login-heading">
              Welcome Back <span className="green-accent">Genius</span> .
            </h2>
            <p className="login-subheading">Enter your personal data to access your account.</p>
          </div>

          {/* Social Logins */}
          <div className="social-row gsap-login-item">
            <button
              type="button"
              onClick={() => handleSocialLogin('Google')}
              disabled={isLoading}
              className="social-btn"
              aria-label="Continue with Google"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('GitHub')}
              disabled={isLoading}
              className="social-btn"
              aria-label="Continue with GitHub"
            >
              <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="invert-icon" alt="GitHub" />
            </button>
          </div>

          <div className="divider gsap-login-item">
            <span>OR</span>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="login-form">
            <div className="field-group gsap-login-item">
              <label className="field-label">Email Address</label>
              <input
                type="email"
                className="custom-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field-group gsap-login-item">
              <label className="field-label">Password</label>
              <input
                type="password"
                className="custom-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn gsap-login-item"
            >
              {isLoading ? 'Authenticating... ⏳' : 'Sign In'}
            </button>
          </form>

          <p className="register-link-text gsap-login-item">
            <Link to="/forgot-password" className="register-link">Forgot password?</Link>
            <br />
            Don't have an account?{' '}
            <Link to="/register" className="register-link">Create one now</Link>
          </p>
        </div>
      </div>

      {/* RIGHT SLIDER PANEL */}
      <div ref={rightPanelRef} className="login-right">
        <div
          className="login-bg-img"
          style={{ backgroundImage: `url(${sliderData[activeSlide].image})` }}
        />
        <div className="login-overlay" />

        <div className="login-brand">
          LUXURYSTAY <span className="green-accent">.</span>
        </div>

        <div ref={slideTextRef} className="login-slide-box">
          <h1 className="login-slide-title">
            {sliderData[activeSlide].title} <span className="green-accent">.</span>
          </h1>
          <p className="login-slide-desc">{sliderData[activeSlide].desc}</p>
        </div>

        <div className="login-steps-grid">
          {sliderData.map((slide, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveSlide(index)}
              className={`step-btn ${activeSlide === index ? 'active' : ''}`}
            >
              <span className="step-num">{slide.step}</span>
              <div className="step-content">
                <span className="step-tag">Step 0{slide.step}</span>
                <span className="step-title">
                  {index === 0 ? "Account" : index === 1 ? "Workspace" : "Profile"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Login;
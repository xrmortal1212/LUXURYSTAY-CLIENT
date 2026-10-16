import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { gsap } from 'gsap';
import { startOAuth } from '../../../Config/auth';
import { api, getApiErrorMessage } from '../../../Config/api';
import '../Styles/Register.css'; // Apne folder structure ke hisaab se path adjust kar lein

const sliderData = [
    {
        step: "1",
        title: "Get Started with Us",
        desc: "Complete these easy steps to register your account and explore the platform.",
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

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [verificationPending, setVerificationPending] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeSlide, setActiveSlide] = useState(0);

    const navigate = useNavigate();

    // GSAP REFS
    const leftPanelRef = useRef(null);
    const formContainerRef = useRef(null);
    const slideTextRef = useRef(null);

    // GSAP ENTRANCE ANIMATIONS
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Left Panel Entrance
            gsap.fromTo(leftPanelRef.current,
                { opacity: 0, x: -40 },
                { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' }
            );

            // Form Container Entrance
            gsap.fromTo(formContainerRef.current,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' }
            );

            // Form Items Stagger Animation
            gsap.fromTo('.gsap-item',
                { opacity: 0, y: 15 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, delay: 0.3, ease: 'power2.out' }
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

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/register', { name, email, phone, password });
            setVerificationPending(true);
            toast.success('Verification code sent to your email.');
        } catch (error) {
            if (error.response?.data?.message?.startsWith('Account created but verification email')) {
                setVerificationPending(true);
            }
            toast.error(getApiErrorMessage(error, 'Account could not be created.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/auth/verify-email', { email, otp });
            toast.success('Email verified. You can sign in now.');
            navigate('/login', { replace: true, state: { email } });
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'That verification code is invalid or expired.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setIsLoading(true);
        try {
            await api.post('/auth/resend-verification', { email });
            toast.success('If verification is still needed, a new code has been sent.');
        } catch (error) {
            toast.error(getApiErrorMessage(error, 'Could not resend the code.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        setIsLoading(true);
        startOAuth(provider.toLowerCase());
    };

    return (
        <div className="register-page">
            {/* LEFT PANEL */}
            <div ref={leftPanelRef} className="register-left">
                <div
                    className="register-bg-img"
                    style={{ backgroundImage: `url(${sliderData[activeSlide].image})` }}
                />
                <div className="register-overlay" />

                <div className="register-brand">
                    LUXURYSTAY <span className="green-accent">.</span>
                </div>

                <div ref={slideTextRef} className="register-slide-box">
                    <h1 className="register-slide-title">{sliderData[activeSlide].title}</h1>
                    <p className="register-slide-desc">{sliderData[activeSlide].desc}</p>
                </div>

                <div className="register-steps-grid">
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

            {/* RIGHT FORM PANEL */}
            <div className="register-right">
                <div ref={formContainerRef} className="register-form-card">
                    <div className="gsap-item">
                        <h2 className="form-heading">
                            Welcome to LUXURYSTAY <span className="green-accent">.</span>
                        </h2>
                        <p className="form-subheading">{verificationPending ? `Enter the six-digit code sent to ${email}.` : 'Create a guest account for your stay.'}</p>
                    </div>

                    {verificationPending ? (
                        <form onSubmit={handleVerifyEmail} className="register-form">
                            <label className="field-group gsap-item">
                                <span className="field-label">Verification code</span>
                                <input className="custom-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} required />
                            </label>
                            <button className="submit-btn gsap-item" type="submit" disabled={isLoading}>{isLoading ? 'Verifying…' : 'Verify email'}</button>
                            <button className="login-link gsap-item" type="button" onClick={handleResendVerification} disabled={isLoading}>Resend code</button>
                        </form>
                    ) : (
                        <>
                            <div className="social-row gsap-item">
                                <button type="button" onClick={() => handleSocialLogin('Google')} disabled={isLoading} className="social-btn" aria-label="Continue with Google">
                                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                                </button>
                                <button type="button" onClick={() => handleSocialLogin('GitHub')} disabled={isLoading} className="social-btn" aria-label="Continue with GitHub">
                                    <img src="https://www.svgrepo.com/show/512317/github-142.svg" className="invert-icon" alt="GitHub" />
                                </button>
                            </div>
                            <div className="divider gsap-item"><span>OR</span></div>
                            <form onSubmit={handleRegister} className="register-form">
                                <div className="form-grid gsap-item">
                                    <label className="field-group">
                                        <span className="field-label">Full name</span>
                                        <input type="text" className="custom-input" autoComplete="name" value={name} onChange={event => setName(event.target.value)} required />
                                    </label>
                                    <label className="field-group">
                                        <span className="field-label">Email</span>
                                        <input type="email" className="custom-input" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
                                    </label>
                                </div>
                                <label className="field-group gsap-item">
                                    <span className="field-label">Phone</span>
                                    <input type="tel" className="custom-input" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} />
                                </label>
                                <label className="field-group gsap-item">
                                    <span className="field-label">Password</span>
                                    <input type="password" className="custom-input" autoComplete="new-password" minLength={8} value={password} onChange={event => setPassword(event.target.value)} required />
                                    <span className="field-note">Use at least 8 characters.</span>
                                </label>
                                <button type="submit" disabled={isLoading} className="submit-btn gsap-item">{isLoading ? 'Creating account…' : 'Create guest account'}</button>
                            </form>
                        </>
                    )}

                    <p className="login-link-text gsap-item">
                        Already have an account?{' '}
                        <Link to="/login" className="login-link">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
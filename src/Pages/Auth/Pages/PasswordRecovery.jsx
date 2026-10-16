import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api, getApiErrorMessage } from '../../../Config/api';
import '../Styles/Login.css';

const PasswordRecovery = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const resetToken = searchParams.get('token') || '';
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async event => {
    event.preventDefault();
    setIsLoading(true);
    try {
      if (resetToken) {
        await api.post('/auth/reset-password', { resetToken, newPassword });
        toast.success('Password updated. Sign in with your new password.');
        navigate('/login', { replace: true });
      } else {
        const { data } = await api.post('/auth/forgot-password', { email });
        toast.success(data.message || 'If an account exists, reset instructions were sent.');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Password recovery could not be completed.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-left">
        <div className="login-form-card">
          <h1 className="login-heading">{resetToken ? 'Choose a new password' : 'Reset your password'}</h1>
          <p className="login-subheading">
            {resetToken ? 'Use a new password with at least eight characters.' : 'We will email you a secure password reset link if the account exists.'}
          </p>
          <form onSubmit={handleSubmit} className="login-form">
            {resetToken ? (
              <label className="field-group">
                <span className="field-label">New password</span>
                <input className="custom-input" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={event => setNewPassword(event.target.value)} required />
              </label>
            ) : (
              <label className="field-group">
                <span className="field-label">Email address</span>
                <input className="custom-input" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
              </label>
            )}
            <button className="submit-btn" type="submit" disabled={isLoading}>{isLoading ? 'Please wait…' : resetToken ? 'Update password' : 'Send reset link'}</button>
          </form>
          <p className="register-link-text"><Link to="/login" className="register-link">Return to sign in</Link></p>
        </div>
      </section>
    </main>
  );
};

export default PasswordRecovery;
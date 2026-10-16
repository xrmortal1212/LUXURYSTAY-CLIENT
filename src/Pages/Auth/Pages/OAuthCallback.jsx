import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../Core/AuthHooks';
import { dashboardPathForRole } from '../../../Config/auth';
import '../Styles/Login.css';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [succeeded, setSucceeded] = useState(searchParams.get('status') === 'success');
  const [isRestoring, setIsRestoring] = useState(succeeded);
  const { refreshSession } = useAuth();

  useEffect(() => {
    if (!succeeded) return undefined;
    let mounted = true;
    refreshSession()
      .then(user => { if (mounted) navigate(dashboardPathForRole(user.role), { replace: true }); })
      .catch(() => { if (mounted) setSucceeded(false); })
      .finally(() => { if (mounted) setIsRestoring(false); });
    return () => { mounted = false; };
  }, [navigate, refreshSession, succeeded]);

  return (
    <main className="login-page">
      <section className="login-left">
        <div className="login-form-card" role="status" aria-live="polite">
          <h1 className="login-heading">{succeeded ? 'You are signed in.' : 'Sign-in could not be completed.'}</h1>
          <p className="login-subheading">
            {succeeded && isRestoring ? 'Restoring your session...' : 'Please try again or use another sign-in method.'}
          </p>
          {!succeeded && <Link to="/login" className="register-link">Return to sign in</Link>}
        </div>
      </section>
    </main>
  );
};

export default OAuthCallback;
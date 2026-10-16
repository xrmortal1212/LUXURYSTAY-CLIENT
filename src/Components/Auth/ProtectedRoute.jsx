import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../Core/AuthHooks';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <main role="status" aria-live="polite">Restoring your session...</main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;

  return children || <Outlet />;
};

export default ProtectedRoute;
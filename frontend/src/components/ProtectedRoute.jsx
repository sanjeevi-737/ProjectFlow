import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const redirected = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !redirected.current) {
      redirected.current = true;
      navigate('/login', { state: { from: pathname }, replace: true });
    } else if (roles && user && !roles.includes(user.role) && !redirected.current) {
      redirected.current = true;
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, user, roles, navigate, pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated || (roles && user && !roles.includes(user.role))) {
    return null;
  }

  return children;
};

import { useEffect, useRef } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiOutlineMail } from 'react-icons/hi';

export const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, isLoading, user, error } = useSelector((state) => state.auth);
  const { pathname } = useLocation();
  const redirected = useRef(false);

  useEffect(() => {
    redirected.current = false;
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (error === 'Please verify your email first') {
      return (
        <div className="flex h-screen items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="card">
              <div className="h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto mb-4">
                <HiOutlineMail className="text-yellow-600 dark:text-yellow-400" size={32} />
              </div>
              <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">
                Verify your email
              </h2>
              <p className="text-dark-500 mb-6">
                Please check your inbox and verify your email address to continue.
              </p>
              <Link to="/login" className="btn-primary inline-flex">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" state={{ from: pathname }} replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    if (!redirected.current) {
      redirected.current = true;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

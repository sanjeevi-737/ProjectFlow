import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmailThunk } from '../redux/slices/authSlice';
import { HiOutlineCheckCircle, HiOutlineXCircle } from 'react-icons/hi';

export const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [status, setStatus] = useState('verifying');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    dispatch(verifyEmailThunk(token))
      .unwrap()
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token, dispatch]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === 'verifying' && (
          <div className="card">
            <div className="h-16 w-16 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            </div>
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">Verifying your email</h2>
            <p className="text-dark-500">Please wait while we verify your email address...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="card">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <HiOutlineCheckCircle className="text-green-600 dark:text-green-400" size={32} />
            </div>
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">Email verified!</h2>
            <p className="text-dark-500 mb-6">Your email has been successfully verified. You can now access all features.</p>
            <Link to="/login" className="btn-primary inline-flex">Go to Login</Link>
          </div>
        )}

        {(status === 'error' || status === 'invalid') && (
          <div className="card">
            <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <HiOutlineXCircle className="text-red-600 dark:text-red-400" size={32} />
            </div>
            <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">Verification failed</h2>
            <p className="text-dark-500 mb-2">{error || 'Invalid or expired verification link.'}</p>
            <p className="text-dark-400 text-sm mb-6">Please try registering again or contact support.</p>
            <Link to="/login" className="btn-primary inline-flex">Back to Login</Link>
          </div>
        )}
      </div>
    </div>
  );
};

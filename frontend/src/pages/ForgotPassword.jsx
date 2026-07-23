import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPasswordThunk } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineArrowLeft } from 'react-icons/hi';

export const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(forgotPasswordThunk(email)).unwrap();
      setSent(true);
      toast.success('Reset link sent if account exists');
    } catch (err) {
      toast.error(err || 'Something went wrong');
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md w-full text-center card">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <HiOutlineMail className="text-green-600 dark:text-green-400" size={28} />
          </div>
          <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">Check your email</h2>
          <p className="text-dark-500 mb-6">
            If an account exists for <strong className="text-dark-700 dark:text-dark-300">{email}</strong>,
            you&apos;ll receive a password reset link shortly.
          </p>
          <Link to="/login" className="btn-primary inline-flex">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Link to="/login" className="inline-flex items-center gap-1 text-sm text-dark-500 hover:text-dark-700 dark:hover:text-dark-300 mb-8">
          <HiOutlineArrowLeft size={16} /> Back to login
        </Link>
        <div className="card">
          <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">Forgot password?</h2>
          <p className="text-dark-500 text-sm mb-6">Enter your email and we&apos;ll send you a reset link.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Email</label>
              <div className="relative">
                <HiOutlineMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            <button type="submit" disabled={isLoading || !email} className="btn-primary w-full h-11">
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { resetPasswordThunk } from '../redux/slices/authSlice';
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineCheckCircle } from 'react-icons/hi';

const resetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/\d/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const token = searchParams.get('token');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Invalid reset link');
      return;
    }
    try {
      await dispatch(resetPasswordThunk({ token, password: data.password })).unwrap();
      setSuccess(true);
      toast.success('Password reset successfully');
    } catch (err) {
      toast.error(err || 'Failed to reset password');
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md w-full text-center card">
          <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">Invalid Link</h2>
          <p className="text-dark-500 mb-6">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="btn-primary inline-flex">Request New Link</Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md w-full text-center card">
          <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <HiOutlineCheckCircle className="text-green-600 dark:text-green-400" size={32} />
          </div>
          <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">Password Reset!</h2>
          <p className="text-dark-500 mb-6">Your password has been successfully reset.</p>
          <Link to="/login" className="btn-primary inline-flex">Sign in with new password</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="card">
          <h2 className="text-xl font-bold text-dark-900 dark:text-dark-100 mb-2">Set new password</h2>
          <p className="text-dark-500 text-sm mb-6">Enter your new password below.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">New Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
                  {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={18} />
                <input {...register('confirmPassword')} type="password" className="input-field pl-10" placeholder="Confirm new password" />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full h-11">
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : 'Reset Password'}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-dark-500">
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

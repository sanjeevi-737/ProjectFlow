import { useSelector, useDispatch } from 'react-redux';
import { loginUser, registerUser, logout, clearError } from '../redux/slices/authSlice';
import { authApi } from '../services/authApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);

  const login = (credentials) => dispatch(loginUser(credentials));
  const register = (userData) => dispatch(registerUser(userData));
  const logoutUser = async () => {
    try {
      await authApi.logout();
    } catch {
    } finally {
      dispatch(logout());
    }
  };
  const resetError = () => dispatch(clearError());

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logoutUser,
    resetError,
  };
};

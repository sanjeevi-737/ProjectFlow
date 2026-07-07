import { describe, it, expect, vi } from 'vitest';
import authReducer, {
  setCredentials,
  logout,
  clearError,
  setLoading,
} from '../authSlice';

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

describe('authSlice', () => {
  describe('reducers', () => {
    it('should return initial state', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it('should set credentials', () => {
      const state = authReducer(
        initialState,
        setCredentials({
          user: { name: 'Test' },
          accessToken: 'abc',
          refreshToken: 'def',
        })
      );
      expect(state.user).toEqual({ name: 'Test' });
      expect(state.accessToken).toBe('abc');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should logout', () => {
      const loggedInState = {
        ...initialState,
        user: { name: 'Test' },
        accessToken: 'abc',
        isAuthenticated: true,
      };

      const state = authReducer(loggedInState, logout());
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear error', () => {
      const stateWithError = { ...initialState, error: 'Something went wrong' };
      const state = authReducer(stateWithError, clearError());
      expect(state.error).toBeNull();
    });

    it('should set loading', () => {
      const state = authReducer(initialState, setLoading(true));
      expect(state.isLoading).toBe(true);
    });
  });
});

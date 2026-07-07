import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAuth } from '../useAuth';

vi.mock('../../services/authApi', () => ({
  authApi: {
    logout: vi.fn().mockResolvedValue({}),
  },
}));

const createMockStore = (authState) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false, isLoading: false, error: null }, action) => {
        if (action.type === 'auth/setState') return { ...state, ...action.payload };
        if (action.type === 'auth/logout') return { user: null, isAuthenticated: false, isLoading: false, error: null };
        if (action.type === 'auth/clearError') return { ...state, error: null };
        return state;
      },
    },
    preloadedState: { auth: authState },
  });
};

const wrapper = (store) => {
  return function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };
};

describe('useAuth', () => {
  it('should return unauthenticated state', () => {
    const store = createMockStore({ user: null, isAuthenticated: false, isLoading: false, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return authenticated state', () => {
    const store = createMockStore({
      user: { name: 'Admin', role: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      error: null,
    });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({ name: 'Admin', role: 'admin' });
  });

  it('should reset error', () => {
    const store = createMockStore({ user: null, isAuthenticated: false, isLoading: false, error: 'Bad login' });
    const { result } = renderHook(() => useAuth(), { wrapper: wrapper(store) });

    result.current.resetError();
    const state = store.getState().auth;
    expect(state.error).toBeNull();
  });
});

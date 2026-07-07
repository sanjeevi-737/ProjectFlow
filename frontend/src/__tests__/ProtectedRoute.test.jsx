import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ProtectedRoute } from '../components/ProtectedRoute';

const createMockStore = (authState) => {
  return configureStore({
    reducer: {
      auth: (state = { user: null, isAuthenticated: false, isLoading: false }, action) => {
        if (action.type === 'auth/setState') return { ...state, ...action.payload };
        return state;
      },
    },
    preloadedState: { auth: authState },
  });
};

describe('ProtectedRoute', () => {
  it('shows loading spinner when auth is loading', () => {
    const store = createMockStore({ isAuthenticated: false, isLoading: true, user: null });
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter>
          <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('redirects to login when not authenticated', () => {
    const store = createMockStore({ isAuthenticated: false, isLoading: false, user: null });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.queryByText('Protected Content')).toBeNull();
  });

  it('renders children when authenticated', () => {
    const store = createMockStore({ isAuthenticated: true, isLoading: false, user: { name: 'Test', role: 'admin' } });
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
        </MemoryRouter>
      </Provider>
    );
    expect(screen.getByText('Protected Content')).toBeTruthy();
  });
});

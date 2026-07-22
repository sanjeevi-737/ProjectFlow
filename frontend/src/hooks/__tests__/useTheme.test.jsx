import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import uiReducer, { setTheme } from '../../redux/slices/uiSlice';
import { useTheme } from '../useTheme';

const createMockStore = (preloadedState) => {
  return configureStore({
    reducer: { ui: uiReducer },
    preloadedState: { ui: preloadedState },
  });
};

const createWrapper = (store) => {
  return function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };
};

describe('useTheme', () => {
  let localStorageMock;

  beforeEach(() => {
    localStorageMock = {
      getItem: vi.fn(() => 'light'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    vi.stubGlobal('localStorage', localStorageMock);
    document.documentElement.className = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns current theme from store', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    const store = createMockStore({ sidebarOpen: true, theme: 'dark', modal: null, modalData: null });
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper(store) });

    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('returns isDark false for light theme', () => {
    const store = createMockStore({ sidebarOpen: true, theme: 'light', modal: null, modalData: null });
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper(store) });

    expect(result.current.isDark).toBe(false);
  });

  it('adds dark class to document when dark theme', () => {
    localStorageMock.getItem.mockReturnValue('dark');
    const store = createMockStore({ sidebarOpen: true, theme: 'dark', modal: null, modalData: null });
    renderHook(() => useTheme(), { wrapper: createWrapper(store) });

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class from document when light theme', () => {
    document.documentElement.classList.add('dark');
    const store = createMockStore({ sidebarOpen: true, theme: 'light', modal: null, modalData: null });
    renderHook(() => useTheme(), { wrapper: createWrapper(store) });

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggle dispatches toggleTheme action', () => {
    const store = createMockStore({ sidebarOpen: true, theme: 'light', modal: null, modalData: null });
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper(store) });

    act(() => {
      result.current.toggle();
    });

    expect(store.getState().ui.theme).toBe('dark');
  });

  it('setTheme dispatches setTheme action', () => {
    const store = createMockStore({ sidebarOpen: true, theme: 'light', modal: null, modalData: null });
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper(store) });

    act(() => {
      result.current.setTheme('dark');
    });

    expect(store.getState().ui.theme).toBe('dark');
  });
});

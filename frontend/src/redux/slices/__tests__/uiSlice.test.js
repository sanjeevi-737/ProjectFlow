import { describe, it, expect } from 'vitest';
import uiReducer, {
  toggleSidebar,
  setSidebarOpen,
  toggleTheme,
  setTheme,
  openModal,
  closeModal,
} from '../uiSlice';

const initialState = {
  sidebarOpen: true,
  theme: 'light',
  modal: null,
  modalData: null,
};

describe('uiSlice', () => {
  describe('reducers', () => {
    it('should return initial state', () => {
      const state = uiReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should toggle sidebar from open to closed', () => {
      const state = uiReducer(initialState, toggleSidebar());
      expect(state.sidebarOpen).toBe(false);
    });

    it('should toggle sidebar from closed to open', () => {
      const closedState = { ...initialState, sidebarOpen: false };
      const state = uiReducer(closedState, toggleSidebar());
      expect(state.sidebarOpen).toBe(true);
    });

    it('should set sidebar open to true', () => {
      const closedState = { ...initialState, sidebarOpen: false };
      const state = uiReducer(closedState, setSidebarOpen(true));
      expect(state.sidebarOpen).toBe(true);
    });

    it('should set sidebar open to false', () => {
      const state = uiReducer(initialState, setSidebarOpen(false));
      expect(state.sidebarOpen).toBe(false);
    });

    it('should toggle theme from light to dark', () => {
      const state = uiReducer(initialState, toggleTheme());
      expect(state.theme).toBe('dark');
    });

    it('should toggle theme from dark to light', () => {
      const darkState = { ...initialState, theme: 'dark' };
      const state = uiReducer(darkState, toggleTheme());
      expect(state.theme).toBe('light');
    });

    it('should set theme explicitly', () => {
      const state = uiReducer(initialState, setTheme('dark'));
      expect(state.theme).toBe('dark');
    });

    it('should open modal with type only', () => {
      const state = uiReducer(initialState, openModal({ type: 'invite' }));
      expect(state.modal).toBe('invite');
      expect(state.modalData).toBeNull();
    });

    it('should open modal with type and data', () => {
      const data = { workspaceId: '123', name: 'Test' };
      const state = uiReducer(initialState, openModal({ type: 'createProject', data }));
      expect(state.modal).toBe('createProject');
      expect(state.modalData).toEqual(data);
    });

    it('should close modal and clear data', () => {
      const openState = { ...initialState, modal: 'invite', modalData: { id: 1 } };
      const state = uiReducer(openState, closeModal());
      expect(state.modal).toBeNull();
      expect(state.modalData).toBeNull();
    });
  });
});

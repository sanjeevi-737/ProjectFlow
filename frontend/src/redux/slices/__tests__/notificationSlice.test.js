import { describe, it, expect, vi, beforeEach } from 'vitest';
import notificationReducer, {
  setUnreadCount,
  incrementUnread,
  decrementUnread,
  prependNotification,
  fetchUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../notificationSlice';

vi.mock('../../services/notificationApi', () => ({
  notificationApi: {
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  },
}));

const initialState = {
  unreadCount: 0,
  items: [],
  loading: false,
};

describe('notificationSlice', () => {
  describe('reducers', () => {
    it('should return initial state', () => {
      const state = notificationReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });

    it('should set unread count', () => {
      const state = notificationReducer(initialState, setUnreadCount(5));
      expect(state.unreadCount).toBe(5);
    });

    it('should increment unread count', () => {
      const stateWithCount = { ...initialState, unreadCount: 3 };
      const state = notificationReducer(stateWithCount, incrementUnread());
      expect(state.unreadCount).toBe(4);
    });

    it('should increment from zero', () => {
      const state = notificationReducer(initialState, incrementUnread());
      expect(state.unreadCount).toBe(1);
    });

    it('should decrement unread count', () => {
      const stateWithCount = { ...initialState, unreadCount: 5 };
      const state = notificationReducer(stateWithCount, decrementUnread());
      expect(state.unreadCount).toBe(4);
    });

    it('should not decrement below zero', () => {
      const state = notificationReducer(initialState, decrementUnread());
      expect(state.unreadCount).toBe(0);
    });

    it('should prepend notification to items', () => {
      const notification = { _id: '1', title: 'New Task', isRead: false };
      const state = notificationReducer(initialState, prependNotification(notification));
      expect(state.items).toHaveLength(1);
      expect(state.items[0].title).toBe('New Task');
    });

    it('should prepend to existing items', () => {
      const existing = { _id: '0', title: 'Old', isRead: true };
      const newNotif = { _id: '1', title: 'New', isRead: false };
      const stateWithItems = { ...initialState, items: [existing] };
      const state = notificationReducer(stateWithItems, prependNotification(newNotif));
      expect(state.items).toHaveLength(2);
      expect(state.items[0].title).toBe('New');
      expect(state.items[1].title).toBe('Old');
    });
  });

  describe('extraReducers (async thunks)', () => {
    it('should handle fetchUnreadCount.fulfilled', () => {
      const action = { type: fetchUnreadCount.fulfilled.type, payload: 10 };
      const state = notificationReducer(initialState, action);
      expect(state.unreadCount).toBe(10);
    });

    it('should handle markAsRead.fulfilled', () => {
      const items = [
        { _id: '1', isRead: false },
        { _id: '2', isRead: false },
      ];
      const stateWithItems = { ...initialState, items, unreadCount: 2 };
      const action = { type: markAsRead.fulfilled.type, payload: '1' };
      const state = notificationReducer(stateWithItems, action);
      expect(state.items[0].isRead).toBe(true);
      expect(state.items[1].isRead).toBe(false);
      expect(state.unreadCount).toBe(1);
    });

    it('should handle markAsRead.fulfilled when item not found', () => {
      const items = [{ _id: '1', isRead: false }];
      const stateWithItems = { ...initialState, items, unreadCount: 1 };
      const action = { type: markAsRead.fulfilled.type, payload: '999' };
      const state = notificationReducer(stateWithItems, action);
      expect(state.unreadCount).toBe(0);
    });

    it('should handle markAllAsRead.fulfilled', () => {
      const items = [
        { _id: '1', isRead: false },
        { _id: '2', isRead: false },
      ];
      const stateWithItems = { ...initialState, items, unreadCount: 2 };
      const action = { type: markAllAsRead.fulfilled.type };
      const state = notificationReducer(stateWithItems, action);
      expect(state.items.every((n) => n.isRead)).toBe(true);
      expect(state.unreadCount).toBe(0);
    });
  });
});

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationApi } from '../../services/notificationApi';

export const fetchUnreadCount = createAsyncThunk('notifications/fetchUnreadCount', async () => {
  const { data } = await notificationApi.getUnreadCount();
  return data.data.count;
});

export const markAsRead = createAsyncThunk('notifications/markAsRead', async (id) => {
  await notificationApi.markAsRead(id);
  return id;
});

export const markAllAsRead = createAsyncThunk('notifications/markAllAsRead', async () => {
  await notificationApi.markAllAsRead();
});

const initialState = {
  unreadCount: 0,
  items: [],
  loading: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUnreadCount: (state, action) => {
      state.unreadCount = action.payload;
    },
    incrementUnread: (state) => {
      state.unreadCount += 1;
    },
    decrementUnread: (state) => {
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    prependNotification: (state, action) => {
      state.items.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const item = state.items.find((n) => n._id === action.payload);
        if (item) item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      });
  },
});

export const { setUnreadCount, incrementUnread, decrementUnread, prependNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

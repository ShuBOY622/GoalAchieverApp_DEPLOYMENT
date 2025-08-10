import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import goalSlice from './goalSlice';
import notificationSlice from './notificationSlice';
import uiSlice from './uiSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    goals: goalSlice,
    notifications: notificationSlice,
    ui: uiSlice,
  },
});

// Export these types for proper typing
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

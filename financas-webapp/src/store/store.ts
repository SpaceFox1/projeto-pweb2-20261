import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import transactionsReducer from './slices/transactionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { configureStore } from '@reduxjs/toolkit';
import { render, type RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import authReducer from '../store/slices/authSlice';
import categoriesReducer from '../store/slices/categoriesSlice';
import goalsReducer from '../store/slices/goalsSlice';
import spendingLimitsReducer from '../store/slices/spendingLimitsSlice';
import transactionsReducer from '../store/slices/transactionsSlice';
import type { RootState } from '../store/store';

export function createTestStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: {
      auth: authReducer,
      goals: goalsReducer,
      categories: categoriesReducer,
      transactions: transactionsReducer,
      spendingLimits: spendingLimitsReducer,
    },
    preloadedState,
  });
}

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: ReturnType<typeof createTestStore>;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState, store = createTestStore(preloadedState), ...renderOptions }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

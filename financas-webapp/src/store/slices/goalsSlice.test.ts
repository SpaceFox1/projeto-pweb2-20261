import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import goalsReducer, { createGoal, fetchGoals, selectGoalProgress } from './goalsSlice.ts';
import transactionsReducer from './transactionsSlice';
import type { Goal } from './goalsSlice.ts';

const server = setupServer(
  http.get('http://localhost:8080/goals', () => {
    return HttpResponse.json([
      { id: 1, name: 'Viagem', targetAmount: 1000, startDate: '2026-01-01', deadline: '2026-12-31', categoryId: 1, categoryName: 'Lazer' },
    ]);
  }),
  http.post('http://localhost:8080/goals', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      id: 2,
      ...(body as Record<string, unknown>),
      categoryName: 'Lazer',
    }, { status: 201 });
  }),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const createTestStore = () => configureStore({
  reducer: {
    goals: goalsReducer,
    transactions: transactionsReducer,
  },
});

const makeGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 1,
  name: 'Viagem',
  targetAmount: 1000,
  startDate: '2026-01-01',
  deadline: '2026-12-31',
  categoryId: 1,
  categoryName: 'Lazer',
  ...overrides,
});

describe('goals slice', () => {
  it('should initialize with an empty state', () => {
    const store = createTestStore();

    expect(store.getState().goals.items).toEqual([]);
    expect(store.getState().goals.loading).toBe(false);
  });

  it('should fetch goals and store them', async () => {
    const store = createTestStore();

    await store.dispatch(fetchGoals());

    expect(store.getState().goals.items).toHaveLength(1);
    expect(store.getState().goals.items[0].name).toBe('Viagem');
  });

  it('should create a new goal', async () => {
    const store = createTestStore();

    const result = await store.dispatch(createGoal({
      name: 'Reserva',
      targetAmount: 500,
      deadline: '2026-06-30',
      categoryId: 1,
    }));

    expect(createGoal.fulfilled.match(result)).toBe(true);
    expect(store.getState().goals.items).toHaveLength(1);
    expect(store.getState().goals.items[0].name).toBe('Reserva');
  });
});

describe('selectGoalProgress', () => {
  it('returns 0% when there are no income transactions', () => {
    const state = {
      goals: {
        items: [makeGoal()],
        loading: false,
        error: null,
      },
      transactions: {
        items: [{ id: 1, amount: 0, type: 'EXPENSE', categoryId: 1, categoryName: 'Lazer', date: '2026-01-10', description: 'Mercado' }],
        loading: false,
        error: null,
      },
    };

    expect(selectGoalProgress(1)(state)).toBe(0);
  });

  it('returns partial progress for income transactions', () => {
    const state = {
      goals: {
        items: [makeGoal()],
        loading: false,
        error: null,
      },
      transactions: {
        items: [{ id: 1, amount: 500, type: 'INCOME', categoryId: 1, categoryName: 'Salário', date: '2026-01-10', description: 'Salário' }],
        loading: false,
        error: null,
      },
    };

    expect(selectGoalProgress(1)(state)).toBe(50);
  });

  it('caps progress at 100%', () => {
    const state = {
      goals: {
        items: [makeGoal()],
        loading: false,
        error: null,
      },
      transactions: {
        items: [{ id: 1, amount: 5000, type: 'INCOME', categoryId: 1, categoryName: 'Salário', date: '2026-01-10', description: 'Salário' }],
        loading: false,
        error: null,
      },
    };

    expect(selectGoalProgress(1)(state)).toBe(100);
  });
});

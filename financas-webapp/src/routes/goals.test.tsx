import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { GoalsPage } from './goals';
import { renderWithProviders } from '../test/test-utils';

const fixtureGoals = [
  {
    id: 1,
    name: 'Viagem',
    targetAmount: 1000,
    startDate: '2026-01-01',
    deadline: '2026-12-31',
    categoryId: 1,
    categoryName: 'Lazer',
  },
  {
    id: 2,
    name: 'Reserva',
    targetAmount: 500,
    startDate: '2026-01-01',
    deadline: '2026-06-30',
    categoryId: null,
    categoryName: null,
  },
];

const server = setupServer(
  http.get('http://localhost:8080/goals', () => HttpResponse.json(fixtureGoals)),
  http.get('http://localhost:8080/transactions', () => HttpResponse.json([])),
  http.get('http://localhost:8080/categories', () => HttpResponse.json([])),
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('GoalsPage list', () => {
  it('renders goals from fixture with progress bars', async () => {
    renderWithProviders(<GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('Viagem')).toBeInTheDocument();
    });

    expect(screen.getByText('Reserva')).toBeInTheDocument();
    expect(screen.getAllByText('0%')).toHaveLength(2);
    expect(screen.getByLabelText('Progresso da meta Viagem')).toBeInTheDocument();
  });
});

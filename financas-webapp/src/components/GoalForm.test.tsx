import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/test-utils';
import { GoalForm } from './GoalForm';

describe('GoalForm', () => {
  it('shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GoalForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /salvar meta/i }));

    expect(screen.getByText(/nome da meta é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/valor alvo é obrigatório/i)).toBeInTheDocument();
    expect(screen.getByText(/data limite é obrigatória/i)).toBeInTheDocument();
  });

  it('submits the form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<GoalForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/nome da meta/i), 'Reserva de emergência');
    await user.type(screen.getByLabelText(/valor alvo/i), '1500');
    await user.type(screen.getByLabelText(/data limite/i), '2026-12-31');

    await user.click(screen.getByRole('button', { name: /salvar meta/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Reserva de emergência',
      targetAmount: 1500,
      deadline: '2026-12-31',
      categoryId: undefined,
    });
  });
});
